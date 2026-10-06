import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useEstateStore } from '../../stores/useEstateStore';

function MiniCityPavilion({ color }) {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.7;
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.3, 8]} />
        <meshStandardMaterial color="#0d0f17" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.3, 0.9, 1.3]} />
        <meshStandardMaterial color="#1a1c26" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[1.7, 0.55, 4]} />
        <meshStandardMaterial color="#08090d" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

export default function PlotDetailsModal() {
  const floor = useEstateStore((s) => s.plotDetailsFloor);
  const setPlotDetailsFloor = useEstateStore((s) => s.setPlotDetailsFloor);
  const setEscrowPlot = useEstateStore((s) => s.setEscrowPlot);

  if (!floor) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col p-8 lg:p-14 bg-gradient-to-br from-[#060911]/98 via-[#0b1322]/98 to-[#04060b]/98 backdrop-blur-3xl text-zinc-100 overflow-y-auto animate-in fade-in duration-300">
      <button 
        onClick={() => setPlotDetailsFloor(null)}
        className="absolute top-8 right-8 text-cyan-400 hover:text-white uppercase tracking-widest text-xs font-bold"
      >
        Close ✕
      </button>

      <div className="max-w-4xl mt-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">{floor.floor} // {floor.kanji}</span>
        <h1 className="text-4xl font-serif text-cyan-100 mt-1">{floor.name}</h1>
        <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed mt-2">{floor.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {floor.plots.map((plot) => (
          <div key={plot.id} className="bg-[#0b101c]/80 border border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-full h-44 rounded-xl bg-[#070b13] border border-cyan-500/20 overflow-hidden relative mb-4">
              <Canvas camera={{ position: [0, 1.8, 3.8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[5, 10, 5]} intensity={2.5} color="#e0f2fe" />
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <MiniCityPavilion color={plot.imgColor} />
                </Float>
              </Canvas>
            </div>
            <div>
              <span className="text-cyan-400 text-[10px] font-mono font-bold block">{plot.tag}</span>
              <h3 className="text-lg font-serif text-cyan-100">{plot.gate}</h3>
              <p className="text-xs text-zinc-400 mt-1">{plot.desc}</p>
            </div>
            <button 
              onClick={() => {
                setPlotDetailsFloor(null);
                setEscrowPlot({ ...plot, floorName: floor.name });
              }}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-950 to-cyan-950 hover:from-cyan-600 hover:to-blue-600 border border-cyan-500/40 text-cyan-100 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all"
            >
              Reserve Plot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}