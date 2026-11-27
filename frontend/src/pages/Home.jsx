import React, { useEffect, useState } from "react";
import { getTrending } from "../api.js";
import TrackCard from "../components/TrackCard.jsx";
import { TrendingUp } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getTrending().then(setTracks).finally(()=>setLoading(false)); }, []);

  return (
    <div>
      <div style={{marginBottom:"32px",
        backgroundImage:"linear-gradient(135deg,rgba(124,58,237,0.12),transparent)",
        padding:"24px",borderRadius:"16px",border:"1px solid rgba(124,58,237,0.1)"}}>
        <h1 style={{fontFamily:"Outfit,sans-serif",fontSize:"30px",fontWeight:700,
          color:"var(--text-primary)",marginBottom:"6px"}}>{greeting()} 👋</h1>
        <p style={{color:"var(--text-secondary)",fontSize:"14px"}}>What would you like to listen to?</p>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
        <TrendingUp size={18} color="var(--accent)"/>
        <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:"18px",fontWeight:700,color:"var(--text-primary)"}}>
          Trending Now
        </h2>
      </div>

      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"16px"}}>
          {[...Array(10)].map((_,i)=>(
            <div key={i} style={{background:"var(--bg-card)",borderRadius:"12px",padding:"16px",
              border:"1px solid var(--border)"}}>
              <div style={{width:"100%",aspectRatio:"1/1",background:"var(--bg-hover)",borderRadius:"8px",marginBottom:"12px"}}/>
              <div style={{height:"14px",background:"var(--bg-hover)",borderRadius:"4px",marginBottom:"8px"}}/>
              <div style={{height:"11px",background:"var(--bg-hover)",borderRadius:"4px",width:"60%"}}/>
            </div>
          ))}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"16px"}}>
          {tracks.map((t,i)=><TrackCard key={t.id+i} track={t} queue={tracks} index={i}/>)}
        </div>
      )}
    </div>
  );
}
