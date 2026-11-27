import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Player from "./components/Player.jsx";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import Library from "./pages/Library.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import RoomView from "./pages/RoomView.jsx";

function Layout({ children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"var(--bg-primary)",overflow:"hidden"}}>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <Sidebar />
        <main style={{flex:1,overflowY:"auto",background:"linear-gradient(180deg,#2a1408 0%,var(--bg-primary) 40%)",padding:"24px"}}>
          {children}
        </main>
      </div>
      <Player />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{height:"100vh",background:"var(--bg-primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"var(--accent)",fontSize:"18px",fontFamily:"'Playfair Display',serif"}}>Nexus Music</span>
    </div>
  );
  if (!user) return <Routes><Route path="*" element={<AuthPage />} /></Routes>;
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/library" element={<Layout><Library /></Layout>} />
      <Route path="/rooms" element={<Layout><RoomPage /></Layout>} />
      <Route path="/room/:code" element={<RoomView />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
