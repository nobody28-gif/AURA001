import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Float, Html, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useEstateStore, ESTATE_DATA } from '../../stores/useEstateStore';

function PagodaModel() {
  const { scene } = useGLTF('/scene.gltf'); 
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        child.material.roughness = 0.28; 
        child.material.metalness = 0.55; 
      }
    });
  }, [scene]);

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={1} />
      <pointLight position={[0, 5, 0]} intensity={22} color="#ff9900" distance={18} decay={2} />
      <pointLight position={[0, 15, 0]} intensity={26} color="#ffb700" distance={22} decay={2} />
      <pointLight position={[0, 25, 0]} intensity={22} color="#ff7700" distance={18} decay={2} />
    </group>
  );
}

function MountainBase({ position, scale }) {
  const { scene } = useGLTF('/mountain.glb'); 
  return <primitive object={scene} position={position} scale={scale} />;
}

function FloorOrbitingPlots({ floorData }) {
  const walkInBalcony = useEstateStore((s) => s.walkInBalcony);
  const setPlotDetailsFloor = useEstateStore((s) => s.setPlotDetailsFloor);
  const radius = 9.8;

  return (
    <group position={[0, floorData.floorY, 0]}>
      {floorData.plots.map((plot) => {
        const x = Math.sin(plot.angle) * radius;
        const z = Math.cos(plot.angle) * radius;

        return (
          <group key={plot.id} position={[x, 0, z]} rotation={[0, plot.angle, 0]}>
            <Html transform distanceFactor={14} zIndexRange={[10, 50]}>
              <div 
                className="w-56 p-3 rounded-2xl bg-[#090d14]/90 backdrop-blur-xl border border-cyan-500/40 shadow-xl text-white select-none cursor-pointer transition-all hover:scale-105 hover:border-cyan-400 group"
                onClick={() => walkInBalcony(floorData, plot)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30">
                    {plot.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">{plot.price}</span>
                </div>
                <div 
                  className="w-full h-24 rounded-xl flex items-center justify-center p-3 mb-2"
                  style={{ background: `radial-gradient(circle at 50% 120%, ${plot.imgColor} 0%, #06090e 85%)` }}
                >
                  <span className="text-3xl drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">🏙️</span>
                </div>
                <p className="text-[10px] text-zinc-300 leading-tight mb-2 line-clamp-2">{plot.desc}</p>
                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[9px]">
                  <span className="text-zinc-400">{floorData.name}</span>
                  <span className="text-cyan-400 font-bold">Walk In 🚶‍♂️ →</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      <group position={[11.8, 0.5, 2]}>
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.8}>
          <Html transform distanceFactor={13} position={[0, 0, 0.4]} zIndexRange={[20, 60]}>
            <button
              onClick={() => setPlotDetailsFloor(floorData)}
              className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-blue-950/90 hover:from-cyan-600 hover:to-amber-500 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(0,229,255,0.8)] text-white transition-all hover:scale-110 cursor-pointer backdrop-blur-md"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-cyan-300 whitespace-nowrap">
                ☯ SHOW MORE
              </span>
              <span className="text-[8px] tracking-widest text-zinc-300 uppercase mt-0.5 whitespace-nowrap">
                {floorData.floor} Catalog
              </span>
            </button>
          </Html>
        </Float>
      </group>
    </group>
  );
}

export default function PagodaScene() {
  const scroll = useScroll();
  const groupRef = useRef();

  useFrame((_, delta) => {
    const startY = -42; 
    const endY = -4; 
    const targetY = startY + (scroll.offset * (endY - startY));
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 6.5, delta);
  });

  return (
    <group ref={groupRef}>
      <PagodaModel />
      <MountainBase position={[0, -15, 0]} scale={[5, 8, 5]} />
      {ESTATE_DATA.map((tier) => (
        <FloorOrbitingPlots key={tier.id} floorData={tier} />
      ))}
      <ContactShadows position={[0, -0.1, 0]} opacity={0.92} scale={32} blur={2.2} far={10} resolution={512} color="#000000" />
    </group>
  );
}