import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("nx_token");
    const u = localStorage.getItem("nx_user");
    if (t && u) { setToken(t); setUser(u); }
    setLoading(false);
  }, []);

  const login = (username, tok) => {
    setUser(username); setToken(tok);
    localStorage.setItem("nx_token", tok);
    localStorage.setItem("nx_user", username);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("nx_token");
    localStorage.removeItem("nx_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
