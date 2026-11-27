import React, { useState } from "react";
import { Play, Heart, Plus } from "lucide-react";
import { usePlayerStore } from "../store.js";
import AddToPlaylistModal from "./AddToPlaylistModal.jsx";

function fmt(s) { if(!s) return "--:--"; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`; }

export default function TrackCard({ track, queue=[], index=0 }) {
  const { playTrack, currentTrack, isPlaying, toggleLike, isLiked } = usePlayerStore();
  const [showAdd, setShowAdd] = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = currentTrack?.id === track.id;
  const liked = isLiked(track.id);
  const A = "var(--accent)"; const AL = "var(--accent-light)";

  return (
    <>
      {showAdd && <AddToPlaylistModal track={track} onClose={()=>setShowAdd(false)}/>}
      <div onClick={()=>playTrack(track,queue,index)}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          background:active?"rgba(124,58,237,0.12)":"var(--bg-card)",
          borderRadius:"14px",padding:"14px",cursor:"pointer",transition:"all 0.2s",
          border:`1px solid ${active?"var(--accent)":"var(--border)"}`,
          boxShadow:active?`0 0 20px var(--accent-glow)`:"none",
          transform:hovered&&!active?"translateY(-2px)":"none"
        }}>
        <div style={{position:"relative",marginBottom:"12px"}}>
          <img src={track.thumbnail||`https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
            alt={track.title}
            style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:"10px",display:"block"}}
            onError={e=>{e.target.src=`https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;}}
          />
          <div style={{
            position:"absolute",inset:0,borderRadius:"10px",
            background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)",
            opacity:hovered||active?1:0,transition:"opacity 0.2s"
          }}/>
          {(hovered||active) && (
            <div style={{position:"absolute",bottom:"8px",right:"8px",display:"flex",gap:"6px"}}>
              <button onClick={e=>{e.stopPropagation();setShowAdd(true);}} style={{
                width:"30px",height:"30px",borderRadius:"50%",
                background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",
                border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"
              }}><Plus size={13} color="white"/></button>
              <button onClick={e=>{e.stopPropagation();playTrack(track,queue,index);}} style={{
                width:"36px",height:"36px",borderRadius:"50%",
                background:"linear-gradient(135deg,var(--accent),#4f46e5)",
                border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 14px var(--accent-glow)"
              }}><Play size={15} fill="white" color="white" style={{marginLeft:"2px"}}/></button>
            </div>
          )}
        </div>
        <p style={{color:active?AL:"var(--text-primary)",fontWeight:600,fontSize:"13px",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:"4px"}}>{track.title}</p>
        <p style={{color:"var(--text-secondary)",fontSize:"12px",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.artist}</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px"}}>
          <span style={{color:"var(--text-muted)",fontSize:"11px"}}>{fmt(track.duration)}</span>
          <button onClick={e=>{e.stopPropagation();toggleLike(track);}} style={{background:"none",border:"none",cursor:"pointer",padding:"2px"}}>
            <Heart size={14} fill={liked?A:"none"} color={liked?A:"var(--text-muted)"}/>
          </button>
        </div>
      </div>
    </>
  );
}
