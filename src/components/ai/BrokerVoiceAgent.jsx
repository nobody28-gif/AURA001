import React, { useState } from 'react';

export default function BrokerVoiceAgent() {
  const [active, setActive] = useState(false);

  return (
    <div className="px-6 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between text-[11px]">
      <button 
        onClick={() => setActive(!active)}
        className={`px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase transition-all ${active ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'}`}
      >
        {active ? 'Voice Channel Active 🔴' : 'Connect Voice (WebRTC) 🎙️'}
      </button>
      <div className="flex items-center gap-1">
        {[4, 12, 8, 16, 10, 6, 14, 8].map((h, i) => (
          <span 
            key={i} 
            style={{ height: active ? `${h}px` : '4px' }} 
            className="w-0.5 bg-cyan-400 transition-all duration-150 rounded-full" 
          />
        ))}
      </div>
    </div>
  );
}