import React, { useState } from "react";
import { Heart, Music2, Clock, Trash2, Play, Plus } from "lucide-react";
import { usePlayerStore } from "../store.js";

function fmt(s) { if (!s) return "--:--"; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`; }

const TAB_STYLE = (active) => ({
  padding:"8px 18px", borderRadius:"20px", border:"none", cursor:"pointer",
  fontSize:"13px", fontWeight:600, transition:"all 0.2s",
  background: active ? "var(--accent)" : "var(--bg-card)",
  color: active ? "#1a0f07" : "var(--text-secondary)",
});

export default function Library() {
  const {
    liked, history, playlists,
    playTrack, toggleLike, isLiked,
    deletePlaylist, createPlaylist
  } = usePlayerStore();
  const [tab, setTab] = useState("liked");
  const [newPl, setNewPl] = useState("");
  const [selPl, setSelPl] = useState(null);

  const selectedPlaylist = playlists.find(p => p.id === selPl);

  return (
    <div>
      <h1 style={{fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:700,
        color:"var(--text-primary)", marginBottom:"20px"}}>Your Library</h1>

      <div style={{display:"flex", gap:"8px", marginBottom:"24px"}}>
        {["liked","playlists","history"].map(t => (
          <button key={t} style={TAB_STYLE(tab===t)} onClick={() => { setTab(t); setSelPl(null); }}>
            {t === "liked" ? "❤️ Liked Songs" : t === "playlists" ? "📋 Playlists" : "🕐 History"}
          </button>
        ))}
      </div>

      {/* Liked */}
      {tab === "liked" && (
        <div>
          {liked.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px", color:"var(--text-muted)"}}>
              <Heart size={44} style={{marginBottom:"12px"}} />
              <p style={{fontSize:"15px"}}>No liked songs yet</p>
              <p style={{fontSize:"13px", marginTop:"6px"}}>Hit the heart on any track</p>
            </div>
          ) : (
            <>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px"}}>
                <p style={{color:"var(--text-secondary)", fontSize:"13px"}}>{liked.length} songs</p>
                <button onClick={() => playTrack(liked[0], liked, 0)} style={{
                  display:"flex", alignItems:"center", gap:"8px",
                  padding:"10px 20px", background:"var(--accent)", color:"#1a0f07",
                  border:"none", borderRadius:"20px", cursor:"pointer", fontWeight:700, fontSize:"13px"
                }}><Play size={15} fill="#1a0f07" /> Play All</button>
              </div>
              {liked.map((t, i) => (
                <div key={t.id} onClick={() => playTrack(t, liked, i)} style={{
                  display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px",
                  borderRadius:"8px", cursor:"pointer", transition:"background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img src={t.thumbnail || ""} alt="" style={{width:"40px", height:"40px", borderRadius:"6px", objectFit:"cover"}}
                    onError={e => { e.target.src = "https://via.placeholder.com/40/2a1810/c8864a?text=♪"; }} />
                  <div style={{flex:1, overflow:"hidden"}}>
                    <p style={{fontSize:"14px", fontWeight:500, color:"var(--text-primary)",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{t.title}</p>
                    <p style={{fontSize:"12px", color:"var(--text-muted)"}}>{t.artist} · {fmt(t.duration)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleLike(t); }} style={{background:"none", border:"none", cursor:"pointer"}}>
                    <Heart size={16} fill="var(--accent)" color="var(--accent)" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === "playlists" && !selPl && (
        <div>
          <form onSubmit={e => { e.preventDefault(); if (newPl.trim()) { createPlaylist(newPl.trim()); setNewPl(""); } }} style={{display:"flex", gap:"10px", marginBottom:"20px"}}>
            <input type="text" value={newPl} onChange={e => setNewPl(e.target.value)} placeholder="New playlist name..."
              style={{flex:1, background:"var(--bg-card)", color:"var(--text-primary)", padding:"11px 16px",
                borderRadius:"10px", fontSize:"14px", border:"1px solid var(--border)", outline:"none", maxWidth:"320px"}}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button type="submit" style={{
              padding:"11px 20px", background:"var(--accent)", color:"#1a0f07",
              border:"none", borderRadius:"10px", cursor:"pointer", fontWeight:700, fontSize:"13px",
              display:"flex", alignItems:"center", gap:"6px"
            }}><Plus size={16}/> Create</button>
          </form>

          {playlists.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px", color:"var(--text-muted)"}}>
              <Music2 size={44} style={{marginBottom:"12px"}} />
              <p style={{fontSize:"15px"}}>No playlists yet</p>
            </div>
          ) : (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"16px"}}>
              {playlists.map(pl => (
                <div key={pl.id} onClick={() => setSelPl(pl.id)} style={{
                  background:"var(--bg-card)", borderRadius:"12px", padding:"16px",
                  cursor:"pointer", border:"1px solid var(--border)", transition:"all 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
                >
                  <div style={{
                    width:"100%", aspectRatio:"1/1", background:"var(--bg-hover)",
                    borderRadius:"8px", marginBottom:"12px", display:"flex",
                    alignItems:"center", justifyContent:"center"
                  }}>
                    <Music2 size={36} color="var(--accent)" />
                  </div>
                  <p style={{fontSize:"14px", fontWeight:600, color:"var(--text-primary)", marginBottom:"4px"}}>{pl.name}</p>
                  <p style={{fontSize:"12px", color:"var(--text-muted)"}}>{pl.tracks.length} tracks</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlist detail */}
      {tab === "playlists" && selPl && selectedPlaylist && (
        <div>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px"}}>
            <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
              <button onClick={() => setSelPl(null)} style={{
                background:"var(--bg-card)", border:"1px solid var(--border)",
                color:"var(--text-secondary)", padding:"8px 14px", borderRadius:"8px",
                cursor:"pointer", fontSize:"13px"
              }}>← Back</button>
              <div>
                <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:"var(--text-primary)"}}>
                  {selectedPlaylist.name}
                </h2>
                <p style={{color:"var(--text-muted)", fontSize:"13px"}}>{selectedPlaylist.tracks.length} tracks</p>
              </div>
            </div>
            <div style={{display:"flex", gap:"10px"}}>
              {selectedPlaylist.tracks.length > 0 && (
                <button onClick={() => playTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks, 0)} style={{
                  display:"flex", alignItems:"center", gap:"8px",
                  padding:"10px 20px", background:"var(--accent)", color:"#1a0f07",
                  border:"none", borderRadius:"20px", cursor:"pointer", fontWeight:700, fontSize:"13px"
                }}><Play size={15} fill="#1a0f07" /> Play All</button>
              )}
              <button onClick={() => { deletePlaylist(selPl); setSelPl(null); }} style={{
                display:"flex", alignItems:"center", gap:"6px",
                padding:"10px 16px", background:"rgba(224,85,85,0.1)", color:"#e05555",
                border:"1px solid rgba(224,85,85,0.2)", borderRadius:"20px",
                cursor:"pointer", fontSize:"13px", fontWeight:600
              }}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
          {selectedPlaylist.tracks.length === 0 ? (
            <p style={{color:"var(--text-muted)", fontSize:"14px", textAlign:"center", padding:"40px"}}>Playlist is empty. Add songs from search.</p>
          ) : (
            selectedPlaylist.tracks.map((t, i) => (
              <div key={t.id + i} onClick={() => playTrack(t, selectedPlaylist.tracks, i)} style={{
                display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px",
                borderRadius:"8px", cursor:"pointer", transition:"background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{color:"var(--text-muted)", fontSize:"12px", width:"20px"}}>{i+1}</span>
                <img src={t.thumbnail || ""} alt="" style={{width:"40px", height:"40px", borderRadius:"6px", objectFit:"cover"}}
                  onError={e => { e.target.src = "https://via.placeholder.com/40/2a1810/c8864a?text=♪"; }} />
                <div style={{flex:1, overflow:"hidden"}}>
                  <p style={{fontSize:"14px", fontWeight:500, color:"var(--text-primary)",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{t.title}</p>
                  <p style={{fontSize:"12px", color:"var(--text-muted)"}}>{t.artist} · {fmt(t.duration)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div>
          {history.length === 0 ? (
            <div style={{textAlign:"center", padding:"60px", color:"var(--text-muted)"}}>
              <Clock size={44} style={{marginBottom:"12px"}} />
              <p style={{fontSize:"15px"}}>No history yet</p>
            </div>
          ) : (
            <>
              <p style={{color:"var(--text-secondary)", fontSize:"13px", marginBottom:"16px"}}>{history.length} recently played</p>
              {history.map((t, i) => (
                <div key={t.id + i} onClick={() => playTrack(t, history, i)} style={{
                  display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px",
                  borderRadius:"8px", cursor:"pointer", transition:"background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{color:"var(--text-muted)", fontSize:"12px", width:"20px"}}>{i+1}</span>
                  <img src={t.thumbnail || ""} alt="" style={{width:"40px", height:"40px", borderRadius:"6px", objectFit:"cover"}}
                    onError={e => { e.target.src = "https://via.placeholder.com/40/2a1810/c8864a?text=♪"; }} />
                  <div style={{flex:1, overflow:"hidden"}}>
                    <p style={{fontSize:"14px", fontWeight:500, color:"var(--text-primary)",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{t.title}</p>
                    <p style={{fontSize:"12px", color:"var(--text-muted)"}}>{t.artist} · {fmt(t.duration)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
