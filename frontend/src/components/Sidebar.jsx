import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Library, Radio, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const nav = [
  { to:"/",        icon:Home,    label:"Home"        },
  { to:"/search",  icon:Search,  label:"Search"      },
  { to:"/library", icon:Library, label:"Your Library"},
  { to:"/rooms",   icon:Radio,   label:"Rooms"       },
];

const A = "var(--accent)";
const AL = "var(--accent-light)";
const TM = "var(--text-muted)";
const TS = "var(--text-secondary)";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={{
      width:"220px", background:"var(--bg-sidebar)", display:"flex",
      flexDirection:"column", padding:"20px 14px", gap:"20px",
      flexShrink:0, borderRight:"1px solid var(--border)"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",paddingLeft:"4px"}}>
        <Logo size={34}/>
        <span style={{fontFamily:"Outfit,sans-serif",fontWeight:700,
          fontSize:"17px",color:"var(--text-primary)",letterSpacing:"0.3px"}}>
          Nexus Music
        </span>
      </div>

      <nav style={{display:"flex",flexDirection:"column",gap:"2px"}}>
        {nav.map(({to,icon:Icon,label})=>(
          <NavLink key={to} to={to} style={({isActive})=>({
            display:"flex",alignItems:"center",gap:"12px",
            padding:"10px 12px",borderRadius:"10px",
            fontSize:"13px",fontWeight:500,textDecoration:"none",
            transition:"all 0.15s",
            background:isActive?"rgba(124,58,237,0.15)":"transparent",
            color:isActive?AL:TS,
            boxShadow:isActive?`inset 2px 0 0 ${A}`:"none"
          })}>
            {({isActive})=><><Icon size={18} color={isActive?A:TM}/>{label}</>}
          </NavLink>
        ))}
      </nav>

      <div style={{marginTop:"auto",display:"flex",flexDirection:"column",gap:"8px"}}>
        <div style={{
          padding:"10px 12px",background:"rgba(124,58,237,0.08)",
          borderRadius:"10px",border:"1px solid rgba(124,58,237,0.2)"
        }}>
          <p style={{fontSize:"11px",color:TM,marginBottom:"2px"}}>Signed in as</p>
          <p style={{fontSize:"13px",fontWeight:600,color:AL}}>@{user}</p>
        </div>
        <button onClick={()=>{logout();navigate("/");}} style={{
          display:"flex",alignItems:"center",gap:"10px",
          padding:"10px 12px",background:"none",border:"none",
          color:TM,fontSize:"13px",fontWeight:500,
          cursor:"pointer",borderRadius:"10px",width:"100%",transition:"all 0.15s"
        }}
          onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.background="rgba(248,113,113,0.08)"}}
          onMouseLeave={e=>{e.currentTarget.style.color=TM;e.currentTarget.style.background="none"}}
        >
          <LogOut size={16}/> Logout
        </button>
      </div>
    </aside>
  );
}
