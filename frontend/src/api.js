import axios from "axios";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE, timeout: 20000 });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("nx_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const register   = (username, password) => api.post("/auth/register", { username, password }).then(r=>r.data);
export const login      = (username, password) => api.post("/auth/login",    { username, password }).then(r=>r.data);
export const me         = ()                   => api.get("/auth/me").then(r=>r.data);
export const createRoom = ()                   => api.post("/rooms/create").then(r=>r.data);
export const joinRoom   = code                 => api.post(`/rooms/${code}/join`).then(r=>r.data);
export const leaveRoom  = code                 => api.post(`/rooms/${code}/leave`).then(r=>r.data);
export const getRoom    = code                 => api.get(`/rooms/${code}`).then(r=>r.data);

export const search      = (q, limit=20) => api.get("/search",   { params:{q,limit} }).then(r=>r.data.results);
export const getRelated  = id            => api.get(`/related/${id}`).then(r=>r.data.results);
export const getTrack    = id            => api.get(`/track/${id}`).then(r=>r.data);
export const getTrending = ()            => api.get("/trending").then(r=>r.data.results);
export const streamUrl   = id            => `${BASE}/stream/${id}`;
export const wsUrl       = code          => `${BASE.replace("http","ws")}/ws/room/${code}`;
