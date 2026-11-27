import React, { useState, useCallback } from "react";
import { search } from "../api.js";
import TrackList from "../components/TrackList.jsx";
import TrackCard from "../components/TrackCard.jsx";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [view, setView] = useState("list");

  const handleSearch = useCallback(async e => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try { setResults(await search(query)); }
    finally { setLoading(false); }
  }, [query]);

  return (
    <div>
      <h1 style={{fontFamily:"Outfit,sans-serif",fontSize:"28px",fontWeight:700,
        color:"var(--text-primary)",marginBottom:"24px"}}>Search</h1>

      <form onSubmit={handleSearch} style={{marginBottom:"32px"}}>
        <div style={{position:"relative",maxWidth:"460px"}}>
          <SearchIcon size={17} style={{position:"absolute",left:"16px",top:"50%",
            transform:"translateY(-50%)",color:"var(--text-muted)",pointerEvents:"none"}}/>
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Artists, songs, anything..."
            style={{width:"100%",background:"var(--bg-card)",color:"var(--text-primary)",
              paddingLeft:"44px",paddingRight:"16px",paddingTop:"13px",paddingBottom:"13px",
              borderRadius:"24px",fontSize:"14px",border:"1px solid var(--border)",
              outline:"none",transition:"border-color 0.2s",fontFamily:"Outfit,sans-serif"}}
            onFocus={e=>e.target.style.borderColor="var(--accent)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
        </div>
      </form>

      {loading && <p style={{color:"var(--text-secondary)",fontSize:"14px"}}>Searching...</p>}
      {!loading && searched && results.length===0 && (
        <p style={{color:"var(--text-muted)",fontSize:"14px"}}>No results for "{query}"</p>
      )}

      {!loading && results.length>0 && (
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
            <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:"18px",fontWeight:700,color:"var(--text-primary)"}}>
              Results for "{query}"
            </h2>
            <div style={{display:"flex",gap:"6px"}}>
              {["list","grid"].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{
                  padding:"6px 14px",borderRadius:"20px",
                  background:view===v?"var(--accent)":"var(--bg-card)",
                  color:view===v?"white":"var(--text-secondary)",
                  border:`1px solid ${view===v?"var(--accent)":"var(--border)"}`,
                  fontSize:"12px",fontWeight:600,cursor:"pointer",
                  transition:"all 0.2s",textTransform:"capitalize",fontFamily:"Outfit,sans-serif"
                }}>{v}</button>
              ))}
            </div>
          </div>
          {view==="list"
            ? <TrackList tracks={results}/>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"16px"}}>
                {results.map((t,i)=><TrackCard key={t.id+i} track={t} queue={results} index={i}/>)}
              </div>
          }
        </div>
      )}
    </div>
  );
}
