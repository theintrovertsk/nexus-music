import React from "react";
import { X, Music2 } from "lucide-react";
import { usePlayerStore } from "../store.js";

function fmt(s) { if(!s) return "--:--"; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`; }

export default function QueuePanel({ onClose }) {
  const { queue, currentIndex, currentTrack, playTrack } = usePlayerStore();
  const upcoming = queue.slice(currentIndex+1);
  const A = "var(--accent)"; const AL = "var(--accent-light)";
  return (
    <div style={{position:"fixed",right:0,bottom:"90px",top:0,width:"300px",
      background:"var(--bg-secondary)",borderLeft:"1px solid var(--border)",
      zIndex:100,display:"flex",flexDirection:"column",boxShadow:"-8px 0 24px rgba(0,0,0,0.5)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
        <span style={{fontFamily:"Outfit,sans-serif",fontSize:"16px",fontWeight:700,color:"var(--text-primary)"}}>Queue</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>
          <X size={18}/>
        </button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"16px"}}>
        {currentTrack && (
          <>
            <p style={{fontSize:"11px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Now Playing</p>
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px",
              background:"rgba(124,58,237,0.1)",borderRadius:"10px",
              border:"1px solid rgba(124,58,237,0.2)",marginBottom:"16px"}}>
              <img src={currentTrack.thumbnail||""} alt="" style={{width:"40px",height:"40px",borderRadius:"6px",objectFit:"cover"}}
                onError={e=>{e.target.src=`https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;}}/>
              <div style={{overflow:"hidden"}}>
                <p style={{fontSize:"13px",fontWeight:600,color:AL,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentTrack.title}</p>
                <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{currentTrack.artist}</p>
              </div>
            </div>
          </>
        )}
        {upcoming.length>0 ? (
          <>
            <p style={{fontSize:"11px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>
              Next Up ({upcoming.length})
            </p>
            {upcoming.map((t,i)=>(
              <div key={t.id+i} onClick={()=>playTrack(t,queue,currentIndex+1+i)}
                style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px",
                  borderRadius:"8px",cursor:"pointer",marginBottom:"4px",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <span style={{color:"var(--text-muted)",fontSize:"12px",width:"20px"}}>{i+1}</span>
                <img src={t.thumbnail||""} alt="" style={{width:"36px",height:"36px",borderRadius:"6px",objectFit:"cover"}}
                  onError={e=>{e.target.src=`https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;}}/>
                <div style={{overflow:"hidden",flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:500,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</p>
                  <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{t.artist}</p>
                </div>
                <span style={{fontSize:"11px",color:"var(--text-muted)",flexShrink:0}}>{fmt(t.duration)}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{textAlign:"center",padding:"32px 16px"}}>
            <Music2 size={32} color="var(--text-muted)" style={{marginBottom:"10px"}}/>
            <p style={{color:"var(--text-muted)",fontSize:"13px"}}>Queue empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
