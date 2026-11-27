import React, { useState } from "react";
import { Clock, Heart, Play, Plus, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "../store.js";
import AddToPlaylistModal from "./AddToPlaylistModal.jsx";

function fmt(s) { if(!s) return "--:--"; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`; }

export default function TrackList({ tracks }) {
  const { playTrack, currentTrack, isPlaying, toggleLike, isLiked, addToQueue } = usePlayerStore();
  const [showAdd, setShowAdd] = useState(null);
  const A = "var(--accent)"; const AL = "var(--accent-light)";

  return (
    <div style={{width:"100%"}}>
      {showAdd && <AddToPlaylistModal track={showAdd} onClose={()=>setShowAdd(null)}/>}
      <div style={{display:"grid",gridTemplateColumns:"32px 4fr 2fr 60px 80px",
        gap:"16px",padding:"8px 16px 10px",color:"var(--text-muted)",
        fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px",
        borderBottom:"1px solid var(--border)",marginBottom:"6px"}}>
        <span>#</span><span>Title</span><span>Artist</span>
        <span style={{display:"flex",justifyContent:"flex-end"}}><Clock size={13}/></span>
        <span></span>
      </div>
      {tracks.map((track,i)=>{
        const active = currentTrack?.id===track.id;
        const liked = isLiked(track.id);
        return (
          <div key={track.id+i} onClick={()=>playTrack(track,tracks,i)}
            style={{display:"grid",gridTemplateColumns:"32px 4fr 2fr 60px 80px",
              gap:"16px",padding:"9px 16px",borderRadius:"10px",cursor:"pointer",
              transition:"background 0.15s",marginBottom:"2px",
              background:active?"rgba(124,58,237,0.1)":"transparent",
              border:active?"1px solid rgba(124,58,237,0.2)":"1px solid transparent"}}
            onMouseEnter={e=>{
              if(!active) e.currentTarget.style.background="var(--bg-hover)";
              e.currentTarget.querySelector(".ra").style.opacity="1";
            }}
            onMouseLeave={e=>{
              if(!active) e.currentTarget.style.background="transparent";
              e.currentTarget.querySelector(".ra").style.opacity="0";
            }}
          >
            <span style={{display:"flex",alignItems:"center",fontSize:"13px",color:active?A:"var(--text-muted)"}}>
              {active&&isPlaying?<Play size={13} fill={A} color={A}/>:i+1}
            </span>
            <div style={{display:"flex",alignItems:"center",gap:"12px",overflow:"hidden"}}>
              <img src={track.thumbnail||`https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`} alt=""
                style={{width:"40px",height:"40px",borderRadius:"8px",objectFit:"cover",flexShrink:0,border:"1px solid var(--border)"}}
                onError={e=>{e.target.src=`https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;}}
              />
              <span style={{fontSize:"14px",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                color:active?AL:"var(--text-primary)"}}>{track.title}</span>
            </div>
            <span style={{color:"var(--text-secondary)",fontSize:"13px",display:"flex",alignItems:"center",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.artist}</span>
            <span style={{color:"var(--text-muted)",fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              {fmt(track.duration)}
            </span>
            <div className="ra" style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"4px",opacity:0,transition:"opacity 0.15s"}}>
              <button onClick={e=>{e.stopPropagation();addToQueue(track);}} title="Add to queue"
                style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}>
                <Plus size={14} color="var(--text-muted)"/>
              </button>
              <button onClick={e=>{e.stopPropagation();toggleLike(track);}}
                style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}>
                <Heart size={14} fill={liked?A:"none"} color={liked?A:"var(--text-muted)"}/>
              </button>
              <button onClick={e=>{e.stopPropagation();setShowAdd(track);}}
                style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}>
                <MoreHorizontal size={14} color="var(--text-muted)"/>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
