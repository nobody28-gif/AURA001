import React from 'react';
import { useEstateStore } from '../../stores/useEstateStore';

export default function BlueprintDrawer() {
  const floor = useEstateStore((s) => s.cadFloor);
  const setCadFloor = useEstateStore((s) => s.setCadFloor);

  if (!floor) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#090e17] border-2 border-cyan-500/50 rounded-2xl p-8 shadow-2xl flex flex-col text-cyan-100">
        <div className="flex justify-between items-center pb-4 border-b border-cyan-500/30">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Vector CAD Schematic // {floor.elevation}</span>
            <h2 className="text-2xl font-serif text-white">{floor.name} Architectural Blueprints</h2>
          </div>
          <button onClick={() => setCadFloor(null)} className="text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-bold">Close ✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30">
            <span className="text-xs text-zinc-400 block font-mono">Master Chamber</span>
            <span className="text-lg font-bold text-white font-mono">{floor.cad.master}</span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30">
            <span className="text-xs text-zinc-400 block font-mono">Living Volume</span>
            <span className="text-lg font-bold text-white font-mono">{floor.cad.living}</span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30">
            <span className="text-xs text-zinc-400 block font-mono">Cantilever Terrace</span>
            <span className="text-lg font-bold text-white font-mono">{floor.cad.terrace}</span>
          </div>
        </div>

        <div className="w-full h-64 rounded-xl bg-[#04060a] border border-cyan-500/30 flex items-center justify-center p-6 overflow-hidden">
          <svg className="w-full h-full text-cyan-400" viewBox="0 0 500 200">
            <rect x="50" y="20" width="400" height="160" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="80" y="40" width="160" height="120" fill="none" stroke="#ff0055" strokeWidth="2" />
            <rect x="260" y="40" width="160" height="120" fill="none" stroke="#ffaa00" strokeWidth="2" />
            <text x="110" y="80" fill="#ffffff" fontSize="12" fontFamily="monospace">MASTER RESIDENCE</text>
            <text x="290" y="80" fill="#ffffff" fontSize="12" fontFamily="monospace">TEA VERANDA</text>
          </svg>
        </div>
      </div>
    </div>
  );
}