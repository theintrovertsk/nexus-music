import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { login as apiLogin, register as apiRegister } from "../api.js";
import Logo from "../components/Logo.jsx";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const fn = mode==="login" ? apiLogin : apiRegister;
      const data = await fn(username.trim(), password);
      login(data.username, data.token);
    } catch(err) {
      setError(err.response?.data?.detail || "something went wrong");
    } finally { setLoading(false); }
  };

  const inp = {
    width:"100%",background:"var(--bg-hover)",color:"var(--text-primary)",
    padding:"13px 16px",borderRadius:"10px",fontSize:"14px",
    border:"1px solid var(--border)",outline:"none",marginBottom:"12px",
    transition:"border-color 0.2s",fontFamily:"Outfit,sans-serif"
  };

  return (
    <div style={{
      minHeight:"100vh",background:"var(--bg-primary)",
      display:"flex",alignItems:"center",justifyContent:"center",
      backgroundImage:"radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)"
    }}>
      <div style={{
        width:"380px",background:"var(--bg-secondary)",
        borderRadius:"20px",padding:"40px",
        border:"1px solid var(--border)",
        boxShadow:"0 25px 60px rgba(0,0,0,0.6)"
      }}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"14px"}}>
            <Logo size={52}/>
          </div>
          <h1 style={{fontFamily:"Outfit,sans-serif",fontSize:"24px",fontWeight:700,
            color:"var(--text-primary)",marginBottom:"6px"}}>Nexus Music</h1>
          <p style={{color:"var(--text-muted)",fontSize:"13px"}}>
            {mode==="login"?"Welcome back":"Create your account"}
          </p>
        </div>

        <form onSubmit={submit}>
          <input type="text" placeholder="Username" value={username}
            onChange={e=>setUsername(e.target.value)} style={inp} required
            onFocus={e=>e.target.style.borderColor="var(--accent)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
          <input type="password" placeholder="Password" value={password}
            onChange={e=>setPassword(e.target.value)} style={{...inp,marginBottom:"6px"}} required
            onFocus={e=>e.target.style.borderColor="var(--accent)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}
          />

          {error && (
            <p style={{color:"#f87171",fontSize:"12px",marginBottom:"12px",padding:"8px 12px",
              background:"rgba(248,113,113,0.08)",borderRadius:"8px",border:"1px solid rgba(248,113,113,0.2)"}}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width:"100%",padding:"13px",
            background:"linear-gradient(135deg, var(--accent), #4f46e5)",
            color:"white",border:"none",borderRadius:"10px",
            fontSize:"15px",fontWeight:700,cursor:"pointer",
            transition:"all 0.2s",marginTop:"8px",
            boxShadow:"0 4px 20px var(--accent-glow)",
            opacity:loading?0.7:1,fontFamily:"Outfit,sans-serif"
          }}
            onMouseEnter={e=>{if(!loading)e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}
          >
            {loading?"..." : mode==="login"?"Sign In":"Create Account"}
          </button>
        </form>

        <p style={{textAlign:"center",marginTop:"20px",fontSize:"13px",color:"var(--text-muted)"}}>
          {mode==="login"?"No account? ":"Have an account? "}
          <button onClick={()=>{setMode(m=>m==="login"?"register":"login");setError("");}} style={{
            background:"none",border:"none",color:"var(--accent-light)",
            cursor:"pointer",fontSize:"13px",fontWeight:600
          }}>
            {mode==="login"?"Sign up":"Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
