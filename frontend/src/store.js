import { create } from "zustand";
import { getRelated } from "./api.js";

const load = (k,d) => { try { return JSON.parse(localStorage.getItem(k))??d; } catch { return d; } };
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

export const usePlayerStore = create((set, get) => ({
  queue:[], currentIndex:-1, currentTrack:null,
  isPlaying:false, volume:load("nx_vol",0.8),
  progress:0, duration:0, shuffle:false, repeat:false,
  liked:load("nx_liked",[]),
  history:load("nx_history",[]),
  playlists:load("nx_playlists",[]),
  showQueue:false,
  sleepTimer:null, sleepTimeout:null,

  playTrack: (track, queue=[], index=0) => {
    const { history } = get();
    const newHistory = [track, ...history.filter(t=>t.id!==track.id)].slice(0,50);
    save("nx_history", newHistory);
    set({ currentTrack:track, queue, currentIndex:index, isPlaying:true, history:newHistory });
  },

  next: async () => {
    const { queue, currentIndex, shuffle, currentTrack } = get();
    let n = shuffle ? Math.floor(Math.random()*queue.length) : currentIndex+1;
    if (n < queue.length) {
      set({ currentIndex:n, currentTrack:queue[n], isPlaying:true });
    } else if (currentTrack) {
      // fetch related songs
      try {
        const related = await getRelated(currentTrack.id);
        if (related && related.length > 0) {
          set({ queue:related, currentIndex:0, currentTrack:related[0], isPlaying:true });
        }
      } catch {}
    }
  },

  prev: () => {
    const { queue, currentIndex } = get();
    const p = currentIndex-1;
    if (p >= 0) set({ currentIndex:p, currentTrack:queue[p], isPlaying:true });
  },

  togglePlay:    () => set(s=>({ isPlaying:!s.isPlaying })),
  toggleShuffle: () => set(s=>({ shuffle:!s.shuffle })),
  toggleRepeat:  () => set(s=>({ repeat:!s.repeat })),
  toggleQueue:   () => set(s=>({ showQueue:!s.showQueue })),
  setVolume:     v  => { save("nx_vol",v); set({ volume:v }); },
  setProgress:   p  => set({ progress:p }),
  setDuration:   d  => set({ duration:d }),
  addToQueue:    t  => { const {queue,currentIndex}=get(); set({queue:[...queue.slice(0,currentIndex+1),t,...queue.slice(currentIndex+1)]}); },

  toggleLike: (track) => {
    const { liked } = get();
    const exists = liked.find(t=>t.id===track.id);
    const next = exists ? liked.filter(t=>t.id!==track.id) : [track,...liked];
    save("nx_liked",next); set({ liked:next });
  },
  isLiked: id => get().liked.some(t=>t.id===id),

  createPlaylist: name => {
    const { playlists } = get();
    const pl = { id:Date.now().toString(), name, tracks:[], createdAt:new Date().toISOString() };
    const next = [pl,...playlists]; save("nx_playlists",next); set({ playlists:next }); return pl;
  },
  addToPlaylist: (plId, track) => {
    const next = get().playlists.map(pl=>
      pl.id===plId&&!pl.tracks.find(t=>t.id===track.id)
        ? {...pl,tracks:[...pl.tracks,track]} : pl);
    save("nx_playlists",next); set({ playlists:next });
  },
  removeFromPlaylist: (plId, trackId) => {
    const next = get().playlists.map(pl=>
      pl.id===plId ? {...pl,tracks:pl.tracks.filter(t=>t.id!==trackId)} : pl);
    save("nx_playlists",next); set({ playlists:next });
  },
  deletePlaylist: plId => {
    const next = get().playlists.filter(pl=>pl.id!==plId);
    save("nx_playlists",next); set({ playlists:next });
  },

  setSleepTimer: minutes => {
    const { sleepTimeout } = get();
    if (sleepTimeout) clearTimeout(sleepTimeout);
    if (!minutes) { set({ sleepTimer:null, sleepTimeout:null }); return; }
    const t = setTimeout(()=>set({ isPlaying:false, sleepTimer:null, sleepTimeout:null }), minutes*60000);
    set({ sleepTimer:minutes, sleepTimeout:t });
  },
}));
