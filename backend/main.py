from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import yt_dlp, httpx, asyncio, re, random, string, json
from datetime import datetime, timedelta
from collections import defaultdict

app = FastAPI(title="Nexus Music API", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = "nexus-music-secret-2024-xk92"
ALGORITHM  = "HS256"
pwd_ctx    = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer     = HTTPBearer(auto_error=False)

users: dict = {}
rooms: dict = {}
room_sockets: dict = defaultdict(list)

def hash_pw(pw): return pwd_ctx.hash(pw)
def verify_pw(pw, h): return pwd_ctx.verify(pw, h)
def create_token(username):
    exp = datetime.utcnow() + timedelta(hours=72)
    return jwt.encode({"sub": username, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)
def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except: return None
def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds: raise HTTPException(401, "not authenticated")
    username = decode_token(creds.credentials)
    if not username or username not in users: raise HTTPException(401, "invalid token")
    return username

def gen_code():
    while True:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms: return code

def thumb(video_id):
    return f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"

class AuthBody(BaseModel):
    username: str
    password: str

@app.post("/auth/register")
async def register(body: AuthBody):
    u = body.username.strip().lower()
    if len(u) < 3: raise HTTPException(400, "username too short")
    if len(body.password) < 4: raise HTTPException(400, "password too short")
    if u in users: raise HTTPException(409, "username taken")
    users[u] = {"password_hash": hash_pw(body.password)}
    return {"token": create_token(u), "username": u}

@app.post("/auth/login")
async def login(body: AuthBody):
    u = body.username.strip().lower()
    if u not in users or not verify_pw(body.password, users[u]["password_hash"]):
        raise HTTPException(401, "invalid credentials")
    return {"token": create_token(u), "username": u}

@app.get("/auth/me")
async def me(username: str = Depends(current_user)):
    return {"username": username}

YDL_BASE   = {"quiet":True,"no_warnings":True,"format":"bestaudio/best","noplaylist":True}
YDL_SEARCH = {"quiet":True,"no_warnings":True,"extract_flat":True,"noplaylist":True}

def sanitize(t): return re.sub(r"[^\w\s\-\.]","",t).strip()

@app.get("/search")
async def search(q: str = Query(..., min_length=1), limit: int = 20):
    query = sanitize(q)
    if not query: raise HTTPException(400, "empty query")
    def _s():
        with yt_dlp.YoutubeDL(YDL_SEARCH) as ydl:
            r = ydl.extract_info(f"ytsearch{limit}:{query}", download=False)
            return [{"id":e.get("id"),"title":e.get("title"),
                     "artist":e.get("uploader") or e.get("channel") or "Unknown",
                     "duration":e.get("duration"),
                     "thumbnail": thumb(e.get("id")),
                     "url":f"https://youtube.com/watch?v={e.get('id')}"}
                    for e in r.get("entries",[]) if e and e.get("id")]
    loop = asyncio.get_event_loop()
    return JSONResponse({"results": await loop.run_in_executor(None,_s), "query": query})

@app.get("/related/{video_id}")
async def related(video_id: str):
    def _r():
        with yt_dlp.YoutubeDL(YDL_SEARCH) as ydl:
            info = ydl.extract_info(f"https://youtube.com/watch?v={video_id}", download=False)
            title = info.get("title","") if info else ""
            artist = info.get("uploader","") if info else ""
            query = f"{artist} {title.split('|')[0][:30]}".strip()
        with yt_dlp.YoutubeDL(YDL_SEARCH) as ydl:
            r = ydl.extract_info(f"ytsearch10:{query}", download=False)
            entries = [e for e in r.get("entries",[]) if e and e.get("id") and e.get("id") != video_id]
            random.shuffle(entries)
            return [{"id":e.get("id"),"title":e.get("title"),
                     "artist":e.get("uploader") or "Unknown",
                     "duration":e.get("duration"),
                     "thumbnail": thumb(e.get("id"))}
                    for e in entries[:8]]
    loop = asyncio.get_event_loop()
    try:
        tracks = await loop.run_in_executor(None, _r)
        return JSONResponse({"results": tracks})
    except: return JSONResponse({"results": []})

@app.get("/track/{video_id}")
async def track_info(video_id: str):
    def _i():
        with yt_dlp.YoutubeDL(YDL_BASE) as ydl:
            info = ydl.extract_info(f"https://youtube.com/watch?v={video_id}", download=False)
            return {"id":info.get("id"),"title":info.get("title"),
                    "artist":info.get("uploader") or "Unknown",
                    "duration":info.get("duration"),
                    "thumbnail": thumb(video_id)}
    loop = asyncio.get_event_loop()
    try: return JSONResponse(await loop.run_in_executor(None,_i))
    except Exception as e: raise HTTPException(404, str(e))

@app.get("/stream/{video_id}")
async def stream(video_id: str):
    def _u():
        with yt_dlp.YoutubeDL(YDL_BASE) as ydl:
            info = ydl.extract_info(f"https://youtube.com/watch?v={video_id}", download=False)
            audio = [f for f in info.get("formats",[]) if f.get("acodec")!="none" and f.get("url")]
            if audio:
                best = max(audio, key=lambda x: x.get("abr") or 0)
                return best["url"], best.get("ext","webm")
            return info["url"], "webm"
    loop = asyncio.get_event_loop()
    try: stream_url, ext = await loop.run_in_executor(None,_u)
    except Exception as e: raise HTTPException(404, str(e))
    async def gen():
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as c:
            async with c.stream("GET", stream_url) as r:
                async for chunk in r.aiter_bytes(65536): yield chunk
    return StreamingResponse(gen(),
        media_type="audio/webm" if ext=="webm" else "audio/mpeg",
        headers={"Accept-Ranges":"bytes"})

@app.get("/trending")
async def trending():
    def _t():
        with yt_dlp.YoutubeDL(YDL_SEARCH) as ydl:
            r = ydl.extract_info("ytsearch20:top hindi songs 2024", download=False)
            return [{"id":e.get("id"),"title":e.get("title"),
                     "artist":e.get("uploader") or "Unknown",
                     "duration":e.get("duration"),
                     "thumbnail": thumb(e.get("id"))}
                    for e in r.get("entries",[]) if e and e.get("id")]
    loop = asyncio.get_event_loop()
    return JSONResponse({"results": await loop.run_in_executor(None,_t)})

@app.get("/health")
async def health(): return {"status":"alive","version":"3.0.0"}

@app.post("/rooms/create")
async def create_room(username: str = Depends(current_user)):
    code = gen_code()
    rooms[code] = {"code":code,"host":username,"members":[username],
                   "current_track":None,"is_playing":False,"progress":0,
                   "queue":[],"messages":[],"created_at":datetime.utcnow().isoformat()}
    return rooms[code]

@app.get("/rooms/{code}")
async def get_room(code: str, username: str = Depends(current_user)):
    code = code.upper()
    if code not in rooms: raise HTTPException(404, "room not found")
    return rooms[code]

@app.post("/rooms/{code}/join")
async def join_room(code: str, username: str = Depends(current_user)):
    code = code.upper()
    if code not in rooms: raise HTTPException(404, "room not found")
    room = rooms[code]
    if username not in room["members"]: room["members"].append(username)
    await broadcast(code, {"type":"member_join","username":username,"members":room["members"]})
    return room

@app.post("/rooms/{code}/leave")
async def leave_room(code: str, username: str = Depends(current_user)):
    code = code.upper()
    if code not in rooms: return {"ok":True}
    room = rooms[code]
    if username in room["members"]: room["members"].remove(username)
    if not room["members"]: del rooms[code]
    else:
        if room["host"] == username: room["host"] = room["members"][0]
        await broadcast(code, {"type":"member_leave","username":username,"members":room["members"]})
    return {"ok":True}

async def broadcast(code, msg, exclude=None):
    dead = []
    for ws in room_sockets[code]:
        if ws == exclude: continue
        try: await ws.send_text(json.dumps(msg))
        except: dead.append(ws)
    for d in dead:
        if d in room_sockets[code]: room_sockets[code].remove(d)

@app.websocket("/ws/room/{code}")
async def room_ws(websocket: WebSocket, code: str):
    code = code.upper()
    await websocket.accept()
    try:
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=10)
        data = json.loads(auth_msg)
        token = data.get("token","")
    except:
        await websocket.close(1008); return
    username = decode_token(token)
    if not username:
        await websocket.send_text(json.dumps({"type":"error","msg":"invalid token"}))
        await websocket.close(1008); return
    if code not in rooms:
        await websocket.send_text(json.dumps({"type":"error","msg":"room not found"}))
        await websocket.close(1008); return
    room = rooms[code]
    if username not in room["members"]: room["members"].append(username)
    room_sockets[code].append(websocket)
    await websocket.send_text(json.dumps({"type":"room_state","room":room,"username":username}))
    await broadcast(code, {"type":"member_join","username":username,"members":room["members"]}, exclude=websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            mtype = msg.get("type")
            if mtype == "chat":
                chat_msg = {"type":"chat","username":username,
                            "text":msg.get("text","")[:300],
                            "timestamp":datetime.utcnow().isoformat()}
                room["messages"].append(chat_msg)
                if len(room["messages"]) > 100: room["messages"] = room["messages"][-100:]
                await broadcast(code, chat_msg)
            elif mtype == "play_track" and room["host"] == username:
                room["current_track"] = msg.get("track")
                room["is_playing"] = True; room["progress"] = 0
                await broadcast(code, {"type":"play_track","track":room["current_track"],"progress":0})
            elif mtype == "toggle_play" and room["host"] == username:
                room["is_playing"] = not room["is_playing"]
                await broadcast(code, {"type":"playback","is_playing":room["is_playing"],
                                       "progress":msg.get("progress",room["progress"])})
            elif mtype == "seek" and room["host"] == username:
                room["progress"] = msg.get("progress",0)
                await broadcast(code, {"type":"seek","progress":room["progress"]})
            elif mtype == "ping":
                await websocket.send_text(json.dumps({"type":"pong"}))
    except WebSocketDisconnect: pass
    finally:
        if websocket in room_sockets[code]: room_sockets[code].remove(websocket)
        if username in room.get("members",[]): room["members"].remove(username)
        if not room.get("members") and code in rooms: del rooms[code]
        elif code in rooms:
            if room.get("host") == username and room.get("members"):
                room["host"] = room["members"][0]
            await broadcast(code, {"type":"member_leave","username":username,
                                   "members":room.get("members",[])})
