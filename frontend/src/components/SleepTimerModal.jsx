import React from "react";
import { X, Timer } from "lucide-react";
import { usePlayerStore } from "../store.js";
const OPTIONS = [5,10,15,30,45,60];
export default function SleepTimerModal({ onClose }) {
  const { setSleepTimer, sleepTimer } = usePlayerStore();
  const A = "var(--accent)"; const AL = "var(--accent-light)";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"var(--bg-secondary)",borderRadius:"16px",padding:"28px",
        border:"1px solid var(--border)",width:"280px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <Timer size={18} color={A}/>
            <span style={{fontFamily:"Outfit,sans-serif",fontWeight:700,color:"var(--text-primary)",fontSize:"16px"}}>Sleep Timer</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>
            <X size={16}/>
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"16px"}}>
          {OPTIONS.map(m=>(
            <button key={m} onClick={()=>{setSleepTimer(m);onClose();}} style={{
              padding:"12px 8px",
              background:sleepTimer===m?"linear-gradient(135deg,var(--accent),#4f46e5)":"var(--bg-hover)",
              color:sleepTimer===m?"white":"var(--text-primary)",
              border:`1px solid ${sleepTimer===m?A:"var(--border)"}`,
              borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:600,fontFamily:"Outfit,sans-serif"
            }}>{m}m</button>
          ))}
        </div>
        {sleepTimer && (
          <button onClick={()=>{setSleepTimer(null);onClose();}} style={{
            width:"100%",padding:"10px",background:"rgba(248,113,113,0.1)",
            color:"#f87171",border:"1px solid rgba(248,113,113,0.2)",
            borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:600,fontFamily:"Outfit,sans-serif"
          }}>Cancel Timer ({sleepTimer}m)</button>
        )}
      </div>
    </div>
  );
}
