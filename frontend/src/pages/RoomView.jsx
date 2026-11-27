import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, LogOut, Users, Copy, Check, Send,
  Music2, Crown, Search as SearchIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayerStore } from "../store.js";
import { wsUrl, streamUrl, search as apiSearch } from "../api.js";

function fmt(s) {
  if (!s||isNaN(s)) return "0:00";
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
}

export default function RoomView() {
  const { code } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { volume, setVolume, setProgress, setDuration, progress, duration } = usePlayerStore();

  const ws = useRef(null);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [connected, setConnected] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const pct = localDuration ? (localProgress/localDuration)*100 : 0;

  const send = useCallback((msg) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    const socket = new WebSocket(wsUrl(code));
    ws.current = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ token }));
      setConnected(true);
    };
    socket.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.type === "room_state") {
        setRoom(msg.room);
        setMembers(msg.room.members);
        setMessages(msg.room.messages || []);
        setIsHost(msg.room.host === user);
        if (msg.room.current_track) {
          setCurrentTrack(msg.room.current_track);
          setIsPlaying(msg.room.is_playing);
        }
      } else if (msg.type === "chat") {
        setMessages(m => [...m, msg]);
      } else if (msg.type === "play_track") {
        setCurrentTrack(msg.track);
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.src = streamUrl(msg.track.id);
          audioRef.current.load();
          audioRef.current.play().catch(()=>{});
        }
      } else if (msg.type === "playback") {
        setIsPlaying(msg.is_playing);
        if (audioRef.current) {
          if (msg.is_playing) audioRef.current.play().catch(()=>{});
          else audioRef.current.pause();
          if (Math.abs(audioRef.current.currentTime - msg.progress) > 2)
            audioRef.current.currentTime = msg.progress;
        }
      } else if (msg.type === "seek") {
        if (audioRef.current) audioRef.current.currentTime = msg.progress;
      } else if (msg.type === "member_join" || msg.type === "member_leave") {
        setMembers(msg.members);
      }
    };
    socket.onclose = () => setConnected(false);
    return () => { socket.close(); };
  }, [code, token, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const sendChat = e => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    send({ type:"chat", text: chatInput.trim() });
    setChatInput("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const doSearch = async e => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true);
    try { setSearchResults(await apiSearch(searchQ)); }
    finally { setSearching(false); }
  };

  const playTrack = track => {
    if (!isHost) return;
    send({ type:"play_track", track });
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = streamUrl(track.id);
      audioRef.current.load();
      audioRef.current.play().catch(()=>{});
    }
  };

  const togglePlay = () => {
    if (!isHost) return;
    send({ type:"toggle_play", progress: audioRef.current?.currentTime || 0 });
    const next = !isPlaying;
    setIsPlaying(next);
    if (audioRef.current) {
      next ? audioRef.current.play().catch(()=>{}) : audioRef.current.pause();
    }
  };

  const doLeave = async () => {
    send({ type:"leave" });
    ws.current?.close();
    navigate("/rooms");
  };

  const s = {
    root: {
      height:"100vh",background:"var(--bg-primary)",
      display:"flex",flexDirection:"column",overflow:"hidden"
    },
    header: {
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"14px 20px",background:"var(--bg-sidebar)",
      borderBottom:"1px solid var(--border)"
    },
    body: { display:"flex",flex:1,overflow:"hidden" },
    left: { flex:1,display:"flex",flexDirection:"column",overflow:"hidden" },
    right: {
      width:"300px",background:"var(--bg-sidebar)",
      borderLeft:"1px solid var(--border)",
      display:"flex",flexDirection:"column"
    },
    player: {
      background:"var(--bg-secondary)",borderTop:"1px solid var(--border)",
      padding:"16px 20px"
    }
  };

  return (
    <div style={s.root}>
      <audio
        ref={audioRef}
        onTimeUpdate={e=>setLocalProgress(e.target.currentTime)}
        onDurationChange={e=>setLocalDuration(e.target.duration)}
        onEnded={()=>{ if(repeat&&audioRef.current){audioRef.current.currentTime=0;audioRef.current.play();} }}
      />

      {/* Header */}
      <div style={s.header}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <Music2 size={20} color="var(--accent)" />
          <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:"var(--text-primary)",fontSize:"16px"}}>
            Nexus Music
          </span>
          <span style={{color:"var(--text-muted)",fontSize:"13px"}}>/ Room</span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{
            display:"flex",alignItems:"center",gap:"8px",
            background:"var(--bg-card)",padding:"8px 14px",
            borderRadius:"8px",border:"1px solid var(--border)"
          }}>
            <span style={{color:"var(--text-muted)",fontSize:"12px"}}>CODE</span>
            <span style={{color:"var(--accent-light)",fontWeight:700,fontSize:"16px",letterSpacing:"3px"}}>{code}</span>
            <button onClick={copyCode} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>
              {copied ? <Check size={15} color="var(--accent)"/> : <Copy size={15}/>}
            </button>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:"6px",color:"var(--text-muted)",fontSize:"13px"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:connected?"#4caf50":"#e05555"}}/>
            {connected ? "Live" : "Connecting..."}
          </div>

          <button onClick={doLeave} style={{
            display:"flex",alignItems:"center",gap:"6px",
            padding:"8px 14px",background:"rgba(224,85,85,0.1)",
            border:"1px solid rgba(224,85,85,0.2)",borderRadius:"8px",
            color:"#e05555",fontSize:"13px",fontWeight:600,cursor:"pointer"
          }}>
            <LogOut size={15}/> Leave
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Left — search + now playing */}
        <div style={s.left}>
          {/* Search toggle */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
            <button onClick={()=>setShowSearch(!showSearch)} style={{
              display:"flex",alignItems:"center",gap:"8px",
              padding:"9px 16px",background:"var(--bg-card)",
              border:"1px solid var(--border)",borderRadius:"8px",
              color:"var(--text-secondary)",fontSize:"13px",cursor:"pointer"
            }}>
              <SearchIcon size={15}/> {showSearch ? "Hide search" : "Search & add songs"}
              {!isHost && <span style={{fontSize:"11px",color:"var(--text-muted)"}}>(host only)</span>}
            </button>
          </div>

          {showSearch && (
            <div style={{padding:"0 20px 16px",borderBottom:"1px solid var(--border)"}}>
              <form onSubmit={doSearch} style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
                <input
                  type="text" value={searchQ} placeholder="Search songs..."
                  onChange={e=>setSearchQ(e.target.value)}
                  style={{
                    flex:1,background:"var(--bg-hover)",color:"var(--text-primary)",
                    padding:"10px 14px",borderRadius:"8px",fontSize:"13px",
                    border:"1px solid var(--border)",outline:"none"
                  }}
                  onFocus={e=>e.target.style.borderColor="var(--accent)"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"}
                />
                <button type="submit" style={{
                  padding:"10px 16px",background:"var(--accent)",
                  color:"#1a0f07",border:"none",borderRadius:"8px",
                  fontSize:"13px",fontWeight:700,cursor:"pointer"
                }}>Go</button>
              </form>
              <div style={{maxHeight:"220px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"4px"}}>
                {searching && <p style={{color:"var(--text-muted)",fontSize:"13px",padding:"8px"}}>Searching...</p>}
                {searchResults.map(t => (
                  <div key={t.id} onClick={()=>isHost&&playTrack(t)} style={{
                    display:"flex",alignItems:"center",gap:"10px",
                    padding:"8px 10px",borderRadius:"6px",
                    cursor:isHost?"pointer":"default",
                    transition:"background 0.15s",background:"var(--bg-card)"
                  }}
                    onMouseEnter={e=>{if(isHost)e.currentTarget.style.background="var(--bg-hover)"}}
                    onMouseLeave={e=>e.currentTarget.style.background="var(--bg-card)"}
                  >
                    <img src={t.thumbnail||""} alt="" style={{width:"36px",height:"36px",borderRadius:"4px",objectFit:"cover"}}
                      onError={e=>{e.target.src="https://via.placeholder.com/36x36/2a1810/c8864a?text=♪"}}/>
                    <div style={{overflow:"hidden",flex:1}}>
                      <p style={{fontSize:"13px",fontWeight:500,color:"var(--text-primary)",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</p>
                      <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{t.artist}</p>
                    </div>
                    {isHost && <Play size={14} color="var(--accent)"/>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Now playing center */}
          <div style={{
            flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",padding:"32px 20px"
          }}>
            {currentTrack ? (
              <>
                <img src={currentTrack.thumbnail||""} alt="" style={{
                  width:"200px",height:"200px",borderRadius:"12px",objectFit:"cover",
                  border:"3px solid var(--accent)",marginBottom:"20px",
                  boxShadow:"0 0 40px rgba(200,134,74,0.3)"
                }}
                  onError={e=>{e.target.src="https://via.placeholder.com/200x200/2a1810/c8864a?text=♪"}}/>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:700,
                  color:"var(--text-primary)",textAlign:"center",marginBottom:"6px",maxWidth:"280px"}}>{currentTrack.title}</p>
                <p style={{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"4px"}}>{currentTrack.artist}</p>
                {!isHost && (
                  <p style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"8px"}}>
                    🎵 Synced with host
                  </p>
                )}
              </>
            ) : (
              <div style={{textAlign:"center"}}>
                <Music2 size={48} color="var(--text-muted)" style={{marginBottom:"12px"}}/>
                <p style={{color:"var(--text-secondary)",fontSize:"15px"}}>No track playing</p>
                {isHost && <p style={{color:"var(--text-muted)",fontSize:"13px",marginTop:"6px"}}>Search a song above to start</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right — members + chat */}
        <div style={s.right}>
          {/* Members */}
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
              <Users size={15} color="var(--accent)"/>
              <span style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>
                Members ({members.length})
              </span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {members.map(m => (
                <div key={m} style={{
                  display:"flex",alignItems:"center",gap:"8px",
                  padding:"6px 10px",borderRadius:"6px",
                  background: m===user ? "rgba(200,134,74,0.08)" : "transparent"
                }}>
                  <div style={{
                    width:"28px",height:"28px",borderRadius:"50%",
                    background:"var(--bg-hover)",display:"flex",
                    alignItems:"center",justifyContent:"center",
                    fontSize:"12px",fontWeight:700,color:"var(--accent)",flexShrink:0
                  }}>
                    {m[0].toUpperCase()}
                  </div>
                  <span style={{fontSize:"13px",color: m===user?"var(--accent-light)":"var(--text-secondary)",flex:1}}>
                    {m}{m===user?" (you)":""}
                  </span>
                  {room?.host===m && <Crown size={13} color="var(--accent)"/>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{
            flex:1,overflowY:"auto",padding:"12px 16px",
            display:"flex",flexDirection:"column",gap:"8px"
          }}>
            {messages.length===0 && (
              <p style={{color:"var(--text-muted)",fontSize:"12px",textAlign:"center",marginTop:"20px"}}>
                No messages yet. Say hi!
              </p>
            )}
            {messages.map((msg,i) => (
              <div key={i} style={{
                display:"flex",flexDirection:"column",
                alignItems: msg.username===user ? "flex-end" : "flex-start"
              }}>
                <span style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"3px"}}>
                  {msg.username===user ? "you" : msg.username}
                </span>
                <div style={{
                  padding:"8px 12px",borderRadius:"10px",
                  background: msg.username===user ? "var(--accent)" : "var(--bg-hover)",
                  color: msg.username===user ? "#1a0f07" : "var(--text-primary)",
                  fontSize:"13px",maxWidth:"200px",wordBreak:"break-word",
                  borderRadius: msg.username===user ? "10px 10px 2px 10px" : "10px 10px 10px 2px"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>

          {/* Chat input */}
          <form onSubmit={sendChat} style={{
            padding:"12px 16px",borderTop:"1px solid var(--border)",
            display:"flex",gap:"8px"
          }}>
            <input
              type="text" value={chatInput} placeholder="Message..."
              onChange={e=>setChatInput(e.target.value)}
              style={{
                flex:1,background:"var(--bg-hover)",color:"var(--text-primary)",
                padding:"9px 12px",borderRadius:"8px",fontSize:"13px",
                border:"1px solid var(--border)",outline:"none"
              }}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <button type="submit" style={{
              width:"36px",height:"36px",background:"var(--accent)",
              border:"none",borderRadius:"8px",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
            }}>
              <Send size={15} color="#1a0f07"/>
            </button>
          </form>
        </div>
      </div>

      {/* Player */}
      <div style={s.player}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          {/* Track info */}
          <div style={{width:"200px",flexShrink:0,display:"flex",alignItems:"center",gap:"10px"}}>
            {currentTrack && (
              <>
                <img src={currentTrack.thumbnail||""} alt="" style={{
                  width:"40px",height:"40px",borderRadius:"6px",objectFit:"cover",
                  border:"1px solid var(--accent)"
                }} onError={e=>{e.target.src="https://via.placeholder.com/40x40/2a1810/c8864a?text=♪"}}/>
                <div style={{overflow:"hidden"}}>
                  <p style={{fontSize:"12px",fontWeight:600,color:"var(--text-primary)",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"130px"}}>
                    {currentTrack.title}
                  </p>
                  <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{currentTrack.artist}</p>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
              <button onClick={()=>setShuffle(!shuffle)} style={{
                background:"none",border:"none",cursor: isHost?"pointer":"default",
                color:shuffle?"var(--accent)":"var(--text-muted)",opacity:isHost?1:0.4
              }}><Shuffle size={15}/></button>

              <button style={{background:"none",border:"none",cursor:"default",color:"var(--text-muted)",opacity:0.4}}>
                <SkipBack size={18} fill="currentColor"/>
              </button>

              <button onClick={togglePlay} disabled={!isHost} style={{
                width:"36px",height:"36px",borderRadius:"50%",
                background: isHost ? "var(--accent)" : "var(--bg-card)",
                border:"none",cursor:isHost?"pointer":"default",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:isHost?"0 0 14px rgba(200,134,74,0.4)":"none",
                opacity:isHost?1:0.6
              }}>
                {isPlaying
                  ? <Pause size={15} fill="#1a0f07" color="#1a0f07"/>
                  : <Play size={15} fill="#1a0f07" color="#1a0f07" style={{marginLeft:"2px"}}/>
                }
              </button>

              <button style={{background:"none",border:"none",cursor:"default",color:"var(--text-muted)",opacity:0.4}}>
                <SkipForward size={18} fill="currentColor"/>
              </button>

              <button onClick={()=>setRepeat(!repeat)} style={{
                background:"none",border:"none",cursor: isHost?"pointer":"default",
                color:repeat?"var(--accent)":"var(--text-muted)",opacity:isHost?1:0.4
              }}><Repeat size={15}/></button>
            </div>

            {/* Progress */}
            <div style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",maxWidth:"400px"}}>
              <span style={{color:"var(--text-muted)",fontSize:"11px",width:"32px",textAlign:"right"}}>
                {fmt(localProgress)}
              </span>
              <div style={{
                flex:1,height:"4px",background:"var(--progress-bg)",
                borderRadius:"2px",cursor:isHost?"pointer":"default"
              }}
                onClick={e=>{
                  if (!isHost||!audioRef.current||!localDuration) return;
                  const rect=e.currentTarget.getBoundingClientRect();
                  const p=((e.clientX-rect.left)/rect.width)*localDuration;
                  audioRef.current.currentTime=p;
                  send({type:"seek",progress:p});
                }}
              >
                <div style={{
                  height:"100%",
                  background:`linear-gradient(90deg, var(--accent) ${pct}%, transparent ${pct}%)`,
                  borderRadius:"2px"
                }}/>
              </div>
              <span style={{color:"var(--text-muted)",fontSize:"11px",width:"32px"}}>
                {fmt(localDuration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div style={{width:"160px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px"}}>
            {!isHost && (
              <span style={{fontSize:"11px",color:"var(--text-muted)"}}>👑 host controls</span>
            )}
            <button onClick={()=>setMuted(!muted)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>
              {muted||volume===0?<VolumeX size={16}/>:<Volume2 size={16}/>}
            </button>
            <input type="range" min={0} max={1} step={0.01}
              value={muted?0:volume}
              onChange={e=>{setVolume(parseFloat(e.target.value));setMuted(false);}}
              style={{width:"70px"}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
