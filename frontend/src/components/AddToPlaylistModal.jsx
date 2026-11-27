import React, { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { usePlayerStore } from "../store.js";
export default function AddToPlaylistModal({ track, onClose }) {
  const { playlists, addToPlaylist, createPlaylist } = usePlayerStore();
  const [newName, setNewName] = useState("");
  const [added, setAdded] = useState({});
  const A = "var(--accent)";
  const doAdd = plId => { addToPlaylist(plId,track); setAdded(a=>({...a,[plId]:true})); };
  const doCreate = e => {
    e.preventDefault(); if(!newName.trim()) return;
    const pl = createPlaylist(newName.trim());
    addToPlaylist(pl.id,track); setAdded(a=>({...a,[pl.id]:true})); setNewName("");
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"var(--bg-secondary)",borderRadius:"16px",padding:"24px",
        border:"1px solid var(--border)",width:"300px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <span style={{fontFamily:"Outfit,sans-serif",fontWeight:700,color:"var(--text-primary)",fontSize:"16px"}}>Add to Playlist</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>
            <X size={16}/>
          </button>
        </div>
        <form onSubmit={doCreate} style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
          <input type="text" value={newName} onChange={e=>setNewName(e.target.value)}
            placeholder="New playlist..."
            style={{flex:1,background:"var(--bg-hover)",color:"var(--text-primary)",
              padding:"10px 12px",borderRadius:"8px",fontSize:"13px",
              border:"1px solid var(--border)",outline:"none",fontFamily:"Outfit,sans-serif"}}
            onFocus={e=>e.target.style.borderColor=A}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
          <button type="submit" style={{padding:"10px 12px",background:A,color:"white",
            border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700}}>
            <Plus size={16}/>
          </button>
        </form>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",maxHeight:"200px",overflowY:"auto"}}>
          {playlists.length===0 && (
            <p style={{color:"var(--text-muted)",fontSize:"13px",textAlign:"center",padding:"16px"}}>No playlists yet.</p>
          )}
          {playlists.map(pl=>(
            <div key={pl.id} onClick={()=>doAdd(pl.id)} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 12px",background:"var(--bg-hover)",borderRadius:"8px",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--bg-card)"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--bg-hover)"}
            >
              <div>
                <p style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{pl.name}</p>
                <p style={{fontSize:"11px",color:"var(--text-muted)"}}>{pl.tracks.length} tracks</p>
              </div>
              {added[pl.id] && <Check size={16} color={A}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
