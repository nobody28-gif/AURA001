import React, { useState, useRef, useEffect } from 'react';
import { useEstateStore, ESTATE_DATA } from '../../stores/useEstateStore';
import BrokerVoiceAgent from './BrokerVoiceAgent';

export default function BrokerChatDrawer() {
  const isOpen = useEstateStore((s) => s.isBrokerOpen);
  const openBroker = useEstateStore((s) => s.openBroker);
  const walkInBalcony = useEstateStore((s) => s.walkInBalcony);
  const setWeatherPhase = useEstateStore((s) => s.setWeatherPhase);

  const [messages, setMessages] = useState([
    {
      sender: 'broker',
      text: "Greetings. I am Master Chen, Senior Managing Broker for Aura Estates. You may command me to fly your camera directly to any floor or view (e.g. 'Fly to the 5th floor sunset view' or 'Show Sky Villa')."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes('fly to') || lower.includes('show') || lower.includes('take me to') || lower.includes('go to')) {
        let floorNum = 6;
        if (lower.includes('5th') || lower.includes('5')) floorNum = 5;
        if (lower.includes('4th') || lower.includes('4')) floorNum = 4;
        if (lower.includes('3rd') || lower.includes('3')) floorNum = 3;
        if (lower.includes('2nd') || lower.includes('2')) floorNum = 2;
        if (lower.includes('1st') || lower.includes('1')) floorNum = 1;

        if (lower.includes('sunset')) setWeatherPhase('sunset');
        if (lower.includes('morning')) setWeatherPhase('morning');
        if (lower.includes('night')) setWeatherPhase('night');

        const chosenFloor = ESTATE_DATA.find((e) => e.id === floorNum);
        walkInBalcony(chosenFloor, chosenFloor.plots[0]);
        reply = `Directing camera controls now. Dollied straight to ${chosenFloor.name} on the ${chosenFloor.floor}. You are now standing on the outer terrace.`;
      } else {
        reply = `I have received your request regarding "${text}". Try commanding me: 'Fly to 5th floor sunset view' to initiate an autonomous spatial camera flight.`;
      }

      setMessages((prev) => [...prev, { sender: 'broker', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#090d15]/95 border-l border-cyan-500/40 backdrop-blur-2xl z-50 flex flex-col shadow-2xl text-zinc-100">
      <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-serif font-bold text-lg border border-cyan-400">
            陳
          </div>
          <div>
            <h3 className="font-serif text-cyan-200 text-base font-bold">Master Chen</h3>
            <p className="text-[11px] text-cyan-400/80 font-mono">Autonomous Spatial Co-Pilot</p>
          </div>
        </div>
        <button onClick={() => openBroker(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
      </div>

      <BrokerVoiceAgent />

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${m.sender === 'user' ? 'bg-gradient-to-r from-blue-700 to-cyan-700 text-white' : 'bg-[#101622] border border-cyan-500/30 text-cyan-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-cyan-400 font-mono animate-pulse">Master Chen is planning flight path...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-cyan-500/20 bg-[#090d15]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command camera or ask pricing..."
            className="flex-1 bg-[#121926] border border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
          <button type="submit" className="px-5 py-3 bg-cyan-600 rounded-xl text-xs font-bold uppercase tracking-widest">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}