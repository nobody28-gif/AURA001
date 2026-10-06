import React from 'react';
import { useEstateStore } from '../../stores/useEstateStore';

export default function TelemetryHUD() {
  const cameraMode = useEstateStore((s) => s.cameraMode);
  const exitBalcony = useEstateStore((s) => s.exitBalcony);

  return (
    <>
      {cameraMode === 'balcony' ? (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 animate-in fade-in duration-300">
          <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-full border-2 border-cyan-400 shadow-2xl flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              Balcony Mode // 1.7m Eye Level
            </span>
            <button
              onClick={exitBalcony}
              className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              Exit Balcony ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-[#090d15]/85 backdrop-blur-md px-6 py-2 rounded-full border border-cyan-500/40 shadow-xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span id="plot-tracker" className="text-cyan-200 text-[11px] font-bold tracking-[0.2em] uppercase font-mono">
              NORTH SPIRE // MEGACITY OVERLOOK
            </span>
          </div>
        </div>
      )}
    </>
  );
}