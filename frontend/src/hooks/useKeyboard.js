import { useEffect } from "react";
import { usePlayerStore } from "../store.js";

export function useKeyboard(audioRef) {
  const { togglePlay, next, prev, setVolume, volume } = usePlayerStore();
  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch(e.code) {
        case "Space":        e.preventDefault(); togglePlay(); break;
        case "ArrowRight":   e.preventDefault(); if (audioRef?.current) audioRef.current.currentTime += 10; break;
        case "ArrowLeft":    e.preventDefault(); if (audioRef?.current) audioRef.current.currentTime -= 10; break;
        case "ArrowUp":      e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); break;
        case "ArrowDown":    e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); break;
        case "KeyN":         next(); break;
        case "KeyP":         prev(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, next, prev, setVolume, volume, audioRef]);
}
