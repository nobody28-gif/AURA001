import React from 'react';
import { useEstateStore } from '../../stores/useEstateStore';

export default function NavigationBar() {
  const weatherPhase = useEstateStore((s) => s.weatherPhase);
  const setWeatherPhase = useEstateStore((s) => s.setWeatherPhase);
  const openBroker = useEstateStore((s) => s.openBroker);
  const openSearch = useEstateStore((s) => s.openSearch);

  return (
    <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-40 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="w-11 h-11 rounded-full border border-cyan-500/60 bg-gradient-to-br from-blue-700 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.6)]">
          <span className="text-white font-serif font-bold text-xl">盛</span>
        </div>
        <div>
          <h1 className="text-cyan-100 font-serif text-2xl md:text-3xl tracking-[0.3em] font-bold block leading-none">AURA</h1>
          <span className="text-[9px] uppercase tracking-[0.35em] text-cyan-400 font-bold block mt-1">Spatial Architecture 2026</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex gap-1 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
          {['morning', 'sunset', 'night', 'storm'].map((phase) => (
            <button
              key={phase}
              onClick={() => setWeatherPhase(phase)}
              className={`px-3 py-1 rounded-full transition-all ${weatherPhase === phase ? 'bg-cyan-500 text-black font-bold shadow-md' : 'hover:bg-white/10'}`}
            >
              {phase}
            </button>
          ))}
        </div>

        <button 
          onClick={() => openSearch(true)}
          className="flex items-center gap-2 bg-[#090d15]/80 hover:bg-[#121926] px-4 py-2 rounded-full border border-cyan-500/30 text-cyan-200 text-xs font-bold tracking-widest uppercase shadow-md transition-all"
        >
          Units
        </button>

        <button
          onClick={() => openBroker(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg border border-cyan-400/50"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></div>
          <span>AI Co-Pilot</span>
        </button>
      </div>
    </header>
  );
}