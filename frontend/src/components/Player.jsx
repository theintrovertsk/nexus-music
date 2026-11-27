import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
         Shuffle, Repeat, Heart, List, Timer, Plus } from "lucide-react";
import { usePlayerStore } from "../store.js";
import { streamUrl } from "../api.js";
import { useKeyboard } from "../hooks/useKeyboard.js";
import QueuePanel from "./QueuePanel.jsx";
import SleepTimerModal from "./SleepTimerModal.jsx";
import AddToPlaylistModal from "./AddToPlaylistModal.jsx";

function fmt(s) {
  if (!s||isNaN(s)) return "0:00";
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
}

export default function Player() {
  const {
    currentTrack, isPlaying, volume, progress, duration,
    togglePlay, setVolume, setProgress, setDuration,
    next, prev, queue, showQueue, toggleQueue,
    toggleLike, isLiked, shuffle, repeat, toggleShuffle, toggleRepeat, sleepTimer
  } = usePlayerStore();

  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [showSleep, setShowSleep] = useState(false);
  const [showAddPl, setShowAddPl] = useState(false);
  const pct = duration ? (progress/duration)*100 : 0;
  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  useKeyboard(audioRef);

  useEffect(() => {
    if (!audioRef.current||!currentTrack) return;
    audioRef.current.src = streamUrl(currentTrack.id);
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(()=>{});
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(()=>{}) : audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const A = "var(--accent)";
  const AL = "var(--accent-light)";
  const TM = "var(--text-muted)";
  const TS = "var(--text-secondary)";

  if (!currentTrack) return (
    <>
      {showQueue && <QueuePanel onClose={toggleQueue}/>}
      <div style={{height:"80px",background:"var(--bg-sidebar)",
        borderTop:"1px solid var(--border)",
        display:"flex",alignItems:"center",justifyContent:"center",gap:"16px"}}>
        <span style={{color:TM,fontSize:"13px"}}>
          Select a track · Space = play · ← → seek · ↑ ↓ volume · N next · P prev
        </span>
      </div>
    </>
  );

  return (
    <>
      {showQueue && <QueuePanel onClose={toggleQueue}/>}
      {showSleep && <SleepTimerModal onClose={()=>setShowSleep(false)}/>}
      {showAddPl && <AddToPlaylistModal track={currentTrack} onClose={()=>setShowAddPl(false)}/>}

      <div style={{height:"90px",background:"var(--bg-sidebar)",
        borderTop:"1px solid var(--border)",
        display:"flex",alignItems:"center",padding:"0 20px",gap:"16px"}}>
        <audio ref={audioRef}
          onTimeUpdate={e=>setProgress(e.target.currentTime)}
          onDurationChange={e=>setDuration(e.target.duration)}
          onEnded={()=>{ if(repeat&&audioRef.current){audioRef.current.currentTime=0;audioRef.current.play();} else next(); }}
        />

        <div style={{display:"flex",alignItems:"center",gap:"12px",width:"240px",flexShrink:0}}>
          <img src={currentTrack.thumbnail||""} alt=""
            style={{width:"52px",height:"52px",borderRadius:"10px",objectFit:"cover",
              border:`2px solid ${A}`,flexShrink:0,
              boxShadow:`0 0 12px var(--accent-glow)`}}
            onError={e=>{e.target.src=`https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;}}
          />
          <div style={{overflow:"hidden",flex:1}}>
            <p style={{color:"var(--text-primary)",fontSize:"13px",fontWeight:600,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentTrack.title}</p>
            <p style={{color:TS,fontSize:"11px",marginTop:"2px",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentTrack.artist}</p>
          </div>
          <div style={{display:"flex",gap:"4px",flexShrink:0}}>
            <button onClick={()=>toggleLike(currentTrack)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}>
              <Heart size={15} fill={liked?A:"none"} color={liked?A:TM}/>
            </button>
            <button onClick={()=>setShowAddPl(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px"}}>
              <Plus size={15} color={TM}/>
            </button>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
            <button onClick={toggleShuffle} style={{background:"none",border:"none",cursor:"pointer",
              color:shuffle?AL:TM,transition:"color 0.2s"}}><Shuffle size={15}/></button>
            <button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",color:TS}}
              onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"}
              onMouseLeave={e=>e.currentTarget.style.color=TS}
            ><SkipBack size={20} fill="currentColor"/></button>
            <button onClick={togglePlay} style={{
              width:"38px",height:"38px",borderRadius:"50%",
              background:`linear-gradient(135deg, ${A}, #4f46e5)`,
              border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 0 20px var(--accent-glow)`,transition:"all 0.2s"
            }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
            >
              {isPlaying
                ? <Pause size={16} fill="white" color="white"/>
                : <Play size={16} fill="white" color="white" style={{marginLeft:"2px"}}/>}
            </button>
            <button onClick={next} style={{background:"none",border:"none",cursor:"pointer",color:TS}}
              onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"}
              onMouseLeave={e=>e.currentTarget.style.color=TS}
            ><SkipForward size={20} fill="currentColor"/></button>
            <button onClick={toggleRepeat} style={{background:"none",border:"none",cursor:"pointer",
              color:repeat?AL:TM,transition:"color 0.2s"}}><Repeat size={15}/></button>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",maxWidth:"520px"}}>
            <span style={{color:TM,fontSize:"11px",width:"36px",textAlign:"right"}}>{fmt(progress)}</span>
            <div style={{flex:1,height:"4px",background:"var(--progress-bg)",
              borderRadius:"2px",cursor:"pointer",position:"relative"}}
              onClick={e=>{
                const rect=e.currentTarget.getBoundingClientRect();
                if(audioRef.current) audioRef.current.currentTime=((e.clientX-rect.left)/rect.width)*duration;
              }}>
              <div style={{
                height:"100%",borderRadius:"2px",
                background:`linear-gradient(90deg, ${A} ${pct}%, transparent ${pct}%)`
              }}/>
            </div>
            <span style={{color:TM,fontSize:"11px",width:"36px"}}>{fmt(duration)}</span>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"10px",width:"220px",justifyContent:"flex-end"}}>
          {sleepTimer && (
            <span style={{fontSize:"10px",color:AL,background:"rgba(124,58,237,0.1)",
              padding:"3px 8px",borderRadius:"10px",border:`1px solid ${A}`}}>⏱ {sleepTimer}m</span>
          )}
          <button onClick={()=>setShowSleep(true)} style={{background:"none",border:"none",cursor:"pointer",color:TM}}>
            <Timer size={16}/>
          </button>
          <button onClick={toggleQueue} style={{background:"none",border:"none",cursor:"pointer",
            color:showQueue?AL:TM}}><List size={16}/></button>
          <button onClick={()=>setMuted(!muted)} style={{background:"none",border:"none",cursor:"pointer",color:TM}}>
            {muted||volume===0?<VolumeX size={17}/>:<Volume2 size={17}/>}
          </button>
          <input type="range" min={0} max={1} step={0.01}
            value={muted?0:volume}
            onChange={e=>{setVolume(parseFloat(e.target.value));setMuted(false);}}
            style={{width:"80px"}}/>
        </div>
      </div>
    </>
  );
}
