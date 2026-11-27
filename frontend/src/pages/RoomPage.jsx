import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Plus, LogIn, Copy, Check } from "lucide-react";
import { createRoom, joinRoom } from "../api.js";

export default function RoomPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const doCreate = async () => {
    setLoading(true); setError("");
    try {
      const room = await createRoom();
      navigate(`/room/${room.code}`);
    } catch(e) {
      setError(e.response?.data?.detail || "failed to create room");
    } finally { setLoading(false); }
  };

  const doJoin = async e => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true); setError("");
    try {
      await joinRoom(joinCode.trim().toUpperCase());
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    } catch(e) {
      setError(e.response?.data?.detail || "room not found");
    } finally { setLoading(false); }
  };

  const card = {
    background:"var(--bg-card)",borderRadius:"14px",
    padding:"28px",border:"1px solid var(--border)",
    flex:1
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
        <Radio size={22} color="var(--accent)" />
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:700,color:"var(--text-primary)"}}>
          Rooms
        </h1>
      </div>
      <p style={{color:"var(--text-secondary)",fontSize:"13px",marginBottom:"32px"}}>
        Listen together in real-time. Chat while the music plays.
      </p>

      {error && (
        <div style={{
          padding:"12px 16px",background:"rgba(224,85,85,0.1)",
          borderRadius:"8px",color:"#e05555",fontSize:"13px",marginBottom:"20px",
          border:"1px solid rgba(224,85,85,0.2)"
        }}>{error}</div>
      )}

      <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
        <div style={card}>
          <h2 style={{color:"var(--text-primary)",fontWeight:600,fontSize:"16px",marginBottom:"8px"}}>
            Create a Room
          </h2>
          <p style={{color:"var(--text-secondary)",fontSize:"13px",marginBottom:"24px"}}>
            Get a room code and share it with friends
          </p>
          <button onClick={doCreate} disabled={loading} style={{
            display:"flex",alignItems:"center",gap:"8px",
            padding:"12px 20px",background:"var(--accent)",
            color:"#1a0f07",border:"none",borderRadius:"10px",
            fontSize:"14px",fontWeight:700,cursor:"pointer",transition:"all 0.2s"
          }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--accent-light)"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--accent)"}
          >
            <Plus size={18}/> Create Room
          </button>
        </div>

        <div style={card}>
          <h2 style={{color:"var(--text-primary)",fontWeight:600,fontSize:"16px",marginBottom:"8px"}}>
            Join a Room
          </h2>
          <p style={{color:"var(--text-secondary)",fontSize:"13px",marginBottom:"20px"}}>
            Enter the 6-character room code
          </p>
          <form onSubmit={doJoin} style={{display:"flex",gap:"10px"}}>
            <input
              type="text" value={joinCode} placeholder="ROOM CODE"
              onChange={e=>setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                flex:1,background:"var(--bg-hover)",color:"var(--text-primary)",
                padding:"12px 16px",borderRadius:"10px",fontSize:"15px",
                border:"1px solid var(--border)",outline:"none",
                letterSpacing:"4px",fontWeight:700,textTransform:"uppercase"
              }}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <button type="submit" disabled={loading} style={{
              display:"flex",alignItems:"center",gap:"6px",
              padding:"12px 18px",background:"var(--accent)",
              color:"#1a0f07",border:"none",borderRadius:"10px",
              fontSize:"14px",fontWeight:700,cursor:"pointer"
            }}>
              <LogIn size={16}/> Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
