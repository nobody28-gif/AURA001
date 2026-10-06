import React from 'react';
import { useEstateStore, ESTATE_DATA } from '../../stores/useEstateStore';

export default function FloorSelector() {
  const walkInBalcony = useEstateStore((s) => s.walkInBalcony);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pointer-events-auto">
      {ESTATE_DATA.map((floor) => (
        <button
          key={floor.id}
          onClick={() => walkInBalcony(floor, floor.plots[0])}
          className="group flex items-center gap-2 justify-end text-right"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {floor.floor}
          </span>
          <div className="w-3 h-3 rounded-full border border-cyan-400/60 bg-black/60 group-hover:bg-cyan-400 group-hover:scale-125 transition-all shadow-sm" />
        </button>
      ))}
    </div>
  );
}