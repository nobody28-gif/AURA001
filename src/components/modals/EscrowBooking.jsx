import React, { useState } from 'react';
import { useEstateStore } from '../../stores/useEstateStore';

export default function EscrowBooking() {
  const escrowPlot = useEstateStore((s) => s.escrowPlot);
  const setEscrowPlot = useEstateStore((s) => s.setEscrowPlot);
  const [method, setMethod] = useState('wire');
  const [complete, setComplete] = useState(false);

  if (!escrowPlot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400">Escrow Hold // 30-Day Refundable</span>
            <h3 className="text-xl font-serif text-cyan-100">{escrowPlot.gate}</h3>
          </div>
          <button onClick={() => setEscrowPlot(null)} className="text-zinc-400 hover:text-white text-xs">Close ✕</button>
        </div>

        {complete ? (
          <div className="py-12 text-center">
            <span className="text-4xl block mb-2">✅</span>
            <h4 className="text-lg font-bold text-cyan-300">Deed Hold Registered</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Holding deposit confirmed for {escrowPlot.gate}. Master Chen will initiate the maritime trust transfer.
            </p>
            <button 
              onClick={() => { setComplete(false); setEscrowPlot(null); }}
              className="mt-6 px-6 py-2 bg-cyan-600 rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4 my-6 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 flex justify-between">
              <span className="text-zinc-400">Target Value:</span>
              <span className="font-bold text-amber-400 font-mono">{escrowPlot.price}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 flex justify-between">
              <span className="text-zinc-400">Holding Deposit (1%):</span>
              <span className="font-bold text-cyan-300 font-mono">$50,000 USD</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setMethod('wire')}
                className={`flex-1 py-2 rounded-xl border ${method === 'wire' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'border-white/10 text-zinc-400'}`}
              >
                Bank Wire
              </button>
              <button 
                onClick={() => setMethod('crypto')}
                className={`flex-1 py-2 rounded-xl border ${method === 'crypto' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'border-white/10 text-zinc-400'}`}
              >
                USDC / ETH
              </button>
            </div>

            <button 
              onClick={() => setComplete(true)}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold uppercase tracking-widest text-xs mt-4"
            >
              Confirm Holding Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}