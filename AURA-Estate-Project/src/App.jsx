import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, useGLTF, OrbitControls, ContactShadows, BakeShadows, Float, Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. SMOOTH ZERO-LAG 50-FRAME BACKGROUND SCRUBBER
// -------------------------------------------------------------
const TOTAL_FRAMES = 50;

const getFramePath = (index) => {
  const padIndex = String(index).padStart(3, '0');
  return `/frames/frame_${padIndex}.jpg`;
};

// Global scroll offset holder (Direct 60fps update without re-rendering React)
export const globalScrollRef = { current: 0 };

function FrameSequenceBackground() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const lastRenderedIndex = useRef(-1);
  const animFrameId = useRef(null);

  useEffect(() => {
    const imgs = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let drawW, drawH, drawX, drawY;
    if (canvasAspect > imgAspect) {
      drawW = width;
      drawH = width / imgAspect;
      drawX = 0;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    lastRenderedIndex.current = frameIndex;
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        if (lastRenderedIndex.current >= 0) {
          drawFrame(lastRenderedIndex.current);
        } else {
          drawFrame(0);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = () => {
      const offset = globalScrollRef.current;
      const targetIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(offset * (TOTAL_FRAMES - 1)))
      );

      if (targetIndex !== lastRenderedIndex.current) {
        drawFrame(targetIndex);
      }
      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full object-cover filter brightness-80 contrast-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#07080c]/50 to-[#06070a]/80 pointer-events-none" />
    </div>
  );
}

// -------------------------------------------------------------
// 2. PLOT & FLOOR DATA
// -------------------------------------------------------------
const PLOT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
];

const generateTenPlots = (basePrice, prefix) => [
  { 
    id: '01', 
    gate: `${prefix} North Gate`, 
    angle: 0, 
    tag: 'Obsidian Crest', 
    price: `$${(basePrice).toFixed(1)}M`, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[3]],
    specs: { area: '5,200 sq ft', ceiling: '16.5 ft', orientation: 'North (Direct Mountain)', joinery: 'Charred Cedar & Granite', deed: 'Freehold Perpetual' },
    desc: 'Unbroken panoramic vista facing northern high mountain peaks. Features private obsidian water reflection veranda and acoustic stone screens.' 
  },
  { 
    id: '02', 
    gate: `${prefix} East Altar`, 
    angle: Math.PI / 2, 
    tag: 'Dawn Pavilion', 
    price: `$${(basePrice - 0.6).toFixed(1)}M`, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[3], PLOT_IMAGES[0]],
    specs: { area: '4,850 sq ft', ceiling: '15.0 ft', orientation: 'East (Sunrise Valley)', joinery: 'White Hinoki & Slate', deed: 'Freehold Perpetual' },
    desc: 'Bathed in pale sunrise light across charcoal valley mist. Features morning tea chamber and cantilevered rock deck.' 
  },
  { 
    id: '03', 
    gate: `${prefix} South Court`, 
    angle: Math.PI, 
    tag: 'Imperial Terrace', 
    price: `$${(basePrice + 0.8).toFixed(1)}M`, 
    img: PLOT_IMAGES[2],
    gallery: [PLOT_IMAGES[2], PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[1]],
    specs: { area: '5,600 sq ft', ceiling: '18.0 ft', orientation: 'South (Cascade Exposure)', joinery: 'Mortise & Tenon Ebony', deed: 'Freehold Perpetual' },
    desc: 'Direct elevation view above rushing waterfall terraces. Built with triple-vaulted timber beams and dual guest reception wings.' 
  },
  { 
    id: '04', 
    gate: `${prefix} West Ridge`, 
    angle: (3 * Math.PI) / 2, 
    tag: 'Twilight Balcony', 
    price: `$${(basePrice - 0.4).toFixed(1)}M`, 
    img: PLOT_IMAGES[3],
    gallery: [PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[1], PLOT_IMAGES[2]],
    specs: { area: '4,900 sq ft', ceiling: '15.5 ft', orientation: 'West (Crimson Dusk)', joinery: 'Smoked Ironwood & Glass', deed: 'Freehold Perpetual' },
    desc: 'Framed by dark mountain pines and twilight cloud currents. Direct unobstructed view of evening sky transitions.' 
  },
  { 
    id: '05', 
    gate: `${prefix} Zenith Loft`, 
    tag: 'Sky Sanctuary', 
    price: `$${(basePrice + 0.5).toFixed(1)}M`, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[2], PLOT_IMAGES[1], PLOT_IMAGES[3]],
    specs: { area: '5,100 sq ft', ceiling: '19.0 ft', orientation: 'Zenith Sky Opening', joinery: 'Blackened Timber Truss', deed: 'Freehold Perpetual' },
    desc: 'Double-vaulted timber ceiling with celestial skylight and master cedar meditation room.' 
  },
  { 
    id: '06', 
    gate: `${prefix} Pine Alcove`, 
    tag: 'Forest Garden', 
    price: `$${(basePrice - 0.8).toFixed(1)}M`, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[2]],
    specs: { area: '4,400 sq ft', ceiling: '14.0 ft', orientation: 'North-East Forest', joinery: 'Natural Moss Rock & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Secluded bamboo garden with private tea reception pavilion, integrated stone pathway, and acoustic isolation.' 
  },
  { 
    id: '07', 
    gate: `${prefix} Lotus Chamber`, 
    tag: 'Thermal Spring', 
    price: `$${(basePrice + 0.2).toFixed(1)}M`, 
    img: PLOT_IMAGES[2],
    gallery: [PLOT_IMAGES[2], PLOT_IMAGES[0], PLOT_IMAGES[3], PLOT_IMAGES[1]],
    specs: { area: '4,950 sq ft', ceiling: '16.0 ft', orientation: 'South-East Mountain Spring', joinery: 'Basalt & Hinoki Bath', deed: 'Freehold Perpetual' },
    desc: 'Natural hot spring stone bath with acoustic isolation and private thermal water connection direct from bedrock.' 
  },
  { 
    id: '08', 
    gate: `${prefix} Cloud Bower`, 
    tag: 'Mist Outlook', 
    price: `$${(basePrice - 0.5).toFixed(1)}M`, 
    img: PLOT_IMAGES[3],
    gallery: [PLOT_IMAGES[3], PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[0]],
    specs: { area: '4,650 sq ft', ceiling: '14.5 ft', orientation: 'South-West Gorge', joinery: 'Cantilevered Steel & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Cantilevered cedar deck hanging directly over mountain cliffs with frameless glass thermal partitions.' 
  },
  { 
    id: '09', 
    gate: `${prefix} Shadow Hall`, 
    tag: 'Ebony Gallery', 
    price: `$${(basePrice + 0.3).toFixed(1)}M`, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[3], PLOT_IMAGES[1], PLOT_IMAGES[2]],
    specs: { area: '5,050 sq ft', ceiling: '15.5 ft', orientation: 'North-West Ridge', joinery: 'Charred Shou Sugi Ban', deed: 'Freehold Perpetual' },
    desc: 'Dark charred-timber master suite with custom screen joinery, discrete diplomat reception alcoves, and private wine cellar.' 
  },
  { 
    id: '10', 
    gate: `${prefix} Solitude Point`, 
    tag: 'Meditation Post', 
    price: `$${(basePrice - 0.9).toFixed(1)}M`, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[0], PLOT_IMAGES[2], PLOT_IMAGES[3]],
    specs: { area: '4,200 sq ft', ceiling: '14.0 ft', orientation: 'Western Horizon', joinery: 'Natural Granite & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Quiet sanctuary at the estate perimeter with private rock garden and direct valley views.' 
  }
];

const ESTATE_DATA = [
  { 
    floor: '6th Floor', 
    id: 6,
    floorY: 26,
    name: 'Sky Sanctuary Villas', 
    price: '$28,500,000', 
    size: '5,800 sq ft', 
    kanji: '天閣', 
    elevation: '+2,400m', 
    desc: 'The pinnacle crown of the estate. Floating above the celestial star field with private stone bridges and obsidian balconies.',
    plots: generateTenPlots(28.5, 'Sanctuary')
  },
  { 
    floor: '5th Floor', 
    id: 5,
    floorY: 21,
    name: 'Imperial Shadow Suites', 
    price: '$21,200,000', 
    size: '5,100 sq ft', 
    kanji: '皇苑', 
    elevation: '+2,100m', 
    desc: 'Full-floor residence with dual private gate balconies, master cedar bathing room, and dark stone reception halls.',
    plots: generateTenPlots(21.2, 'Imperial')
  },
  { 
    floor: '4th Floor', 
    id: 4,
    floorY: 16,
    name: 'Heritage Timber Lofts', 
    price: '$16,800,000', 
    size: '4,600 sq ft', 
    kanji: '古梁', 
    elevation: '+1,800m', 
    desc: 'Double-vaulted timber lofts surrounded by ancient twisted bonsai and starry night skies.',
    plots: generateTenPlots(16.8, 'Heritage')
  },
  { 
    floor: '3rd Floor', 
    id: 3,
    floorY: 11,
    name: 'Wellness Spring Suites', 
    price: '$13,400,000', 
    size: '4,200 sq ft', 
    kanji: '淨泉', 
    elevation: '+1,500m', 
    desc: 'Crafted around thermal springs with charred black basalt and incense hearths overlooking the celestial horizon.',
    plots: generateTenPlots(13.4, 'Wellness')
  },
  { 
    floor: '2nd Floor', 
    id: 2,
    floorY: 6,
    name: 'Executive Quarters', 
    price: '$10,800,000', 
    size: '3,800 sq ft', 
    kanji: '政房', 
    elevation: '+1,200m', 
    desc: 'Spacious gallery pavilions and private library alcoves framed by heavy stone lintels and charcoal panels.',
    plots: generateTenPlots(10.8, 'Executive')
  },
  { 
    floor: '1st Floor', 
    id: 1,
    floorY: 1,
    name: 'Garden Cascade Duplex', 
    price: '$8,200,000', 
    size: '4,500 sq ft', 
    kanji: '翠庭', 
    elevation: '+900m', 
    desc: 'Resting directly behind cascading waterfalls, connected to stone paths, dark moss terraces, and ancient bamboo groves.',
    plots: generateTenPlots(8.2, 'Garden')
  }
];

// -------------------------------------------------------------
// 3. 3D MODELS & VISUAL ASSETS
// -------------------------------------------------------------
function PagodaModel() {
  const { scene } = useGLTF('/scene.gltf'); 

  useMemo(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  if (!scene) return null;

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={1} />
      <pointLight position={[0, 4.8, 0]} intensity={18} color="#ff9055" distance={16} decay={2} />
      <pointLight position={[0, 14.8, 0]} intensity={20} color="#ffaa66" distance={18} decay={2} />
      <pointLight position={[0, 24.8, 0]} intensity={16} color="#ff8044" distance={15} decay={2} />
    </group>
  );
}

function MountainBase({ position, scale }) {
  try {
    const { scene } = useGLTF('/mountain.glb'); 
    if (!scene) return null;
    return <primitive object={scene} position={position} scale={scale} />;
  } catch (e) {
    return null;
  }
}

function AnimeCelestialStarfield({ count = 850 }) {
  const pointsRef = useRef();
  const diamondRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 65 + Math.random() * 70;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 15;
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return [pos];
  }, [count]);

  const brightStars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      const theta = (i / 40) * Math.PI * 2 + Math.random() * 0.2;
      const radius = 45 + Math.random() * 40;
      list.push({
        x: Math.sin(theta) * radius,
        y: Math.random() * 45 + 5,
        z: Math.cos(theta) * radius,
        scale: 0.8 + Math.random() * 1.4,
        pulseSpeed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.008;
      pointsRef.current.rotation.x = Math.sin(t * 0.004) * 0.03;
    }
    if (diamondRef.current) {
      for (let i = 0; i < brightStars.length; i++) {
        const s = brightStars[i];
        const pulse = Math.sin(t * s.pulseSpeed + s.phase) * 0.45 + 0.95;
        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(s.scale * pulse, s.scale * pulse, s.scale * pulse);
        dummy.rotation.set(t * 0.2, t * 0.3, t * 0.1);
        dummy.updateMatrix();
        diamondRef.current.setMatrixAt(i, dummy.matrix);
      }
      diamondRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={1.3} color="#f4f4f5" transparent opacity={0.88} sizeAttenuation depthWrite={false} />
      </points>

      <instancedMesh ref={diamondRef} args={[null, null, brightStars.length]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={3.8} roughness={0.1} metalness={0.8} />
      </instancedMesh>

      <Sparkles count={240} scale={[110, 80, 110]} size={3.0} speed={0.4} opacity={0.7} color="#bae6fd" />
    </group>
  );
}

function RedCherryBlossom({ count = 220 }) { 
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 85,
        y: Math.random() * 80 - 30,
        z: (Math.random() - 0.5) * 65,
        speed: 0.6 + Math.random() * 1.5,
        spin: 0.02 + Math.random() * 0.04,
        drift: (Math.random() - 0.5) * 1.8
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y -= p.speed * delta * 1.6;
      p.x += Math.sin(t * p.speed * 0.5) * 0.025 + (p.drift * delta);
      p.z += Math.cos(t * p.speed * 0.5) * 0.025;
      if (p.y < -35) p.y = 35;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.x += p.spin;
      dummy.rotation.y += p.spin;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.22, 6, 6, 0, Math.PI, 0, Math.PI / 1.8]} />
      <meshStandardMaterial color="#8c0316" emissive="#ff082e" emissiveIntensity={2.8} roughness={0.25} side={THREE.DoubleSide} transparent opacity={0.92} depthWrite={false} />
    </instancedMesh>
  );
}

function PaleCelestialMoon() {
  return (
    <group position={[-40, 50, -90]}>
      <mesh>
        <sphereGeometry args={[13, 24, 24]} />
        <meshBasicMaterial color={[4.2, 4.2, 4.4]} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[22, 20, 20]} />
        <meshBasicMaterial color="#71717a" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function SinglePlotAnchor({ plot, floorData, onDirectEnquire, isMobile }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardGroupRef = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    if (!cardGroupRef.current) return;

    if (scroll.offset < 0.08 || scroll.offset > 0.94) {
      if (isVisible) setIsVisible(false);
      return;
    }

    const cameraPos = state.camera.position;
    const cardWorldPos = new THREE.Vector3();
    cardGroupRef.current.getWorldPosition(cardWorldPos);

    const verticalDist = Math.abs(cameraPos.y - cardWorldPos.y);
    if (verticalDist > 4.2) {
      if (isVisible) setIsVisible(false);
      return;
    }

    const cameraAngle = Math.atan2(cameraPos.x, cameraPos.z);
    let diff = Math.abs(cameraAngle - plot.angle);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

    const shouldShow = diff < 0.72;
    if (isVisible !== shouldShow) {
      setIsVisible(shouldShow);
    }
  });

  const radius = isMobile ? 8.6 : 10.4;
  const x = Math.sin(plot.angle) * radius;
  const z = Math.cos(plot.angle) * radius;

  return (
    <group ref={cardGroupRef} position={[x, 0, z]}>
      {isVisible && (
        <Html center distanceFactor={isMobile ? 18 : 16} zIndexRange={[10, 40]}>
          <div 
            className="w-48 sm:w-56 p-2.5 sm:p-3 rounded-2xl bg-[#0f1015]/95 backdrop-blur-xl border border-zinc-700/60 shadow-[0_10px_35px_rgba(0,0,0,0.85)] text-zinc-100 font-sans select-none cursor-pointer group hover:scale-105 transition-all duration-200"
            onClick={() => onDirectEnquire(plot, floorData)}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-red-400 font-bold px-2 py-0.5 rounded-full bg-red-950/50 border border-red-800/40">
                {plot.tag}
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-zinc-300">{plot.price}</span>
            </div>

            <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden relative border border-zinc-800 mb-1.5 sm:mb-2">
              <img src={plot.img} alt={plot.gate} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                <span className="text-[10px] sm:text-[11px] font-serif font-bold text-zinc-200 uppercase tracking-widest">
                  {plot.gate}
                </span>
              </div>
            </div>

            <p className="text-[9px] sm:text-[10px] text-zinc-400 leading-tight mb-1.5 sm:mb-2 line-clamp-2">
              {plot.desc}
            </p>

            <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t border-zinc-800 text-[8px] sm:text-[9px] text-zinc-500">
              <span>{floorData.name}</span>
              <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">Enquire AI →</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FloorOrbitingPlots({ floorData, onOpenCategory, onDirectEnquire, isMobile }) {
  const topFourPlots = floorData.plots.slice(0, 4);
  const scroll = useScroll();
  const [showPill, setShowPill] = useState(false);
  const pillGroupRef = useRef();

  useFrame((state) => {
    if (scroll.offset < 0.08 || scroll.offset > 0.94) {
      if (showPill) setShowPill(false);
      return;
    }
    if (!pillGroupRef.current) return;
    const worldPos = new THREE.Vector3();
    pillGroupRef.current.getWorldPosition(worldPos);
    const vDist = Math.abs(state.camera.position.y - worldPos.y);
    const visible = vDist < 4.2;
    if (showPill !== visible) {
      setShowPill(visible);
    }
  });

  return (
    <group position={[0, floorData.floorY, 0]}>
      {topFourPlots.map((plot) => (
        <SinglePlotAnchor 
          key={plot.id} 
          plot={plot} 
          floorData={floorData} 
          onDirectEnquire={onDirectEnquire}
          isMobile={isMobile}
        />
      ))}

      <group ref={pillGroupRef} position={[isMobile ? 8.5 : 11.5, 0.5, 2]}>
        <Float speed={2.2} rotationIntensity={0.2} floatIntensity={0.7}>
          {showPill && (
            <Html center distanceFactor={isMobile ? 16 : 14} zIndexRange={[20, 60]}>
              <button
                onClick={() => onOpenCategory(floorData)}
                className="group relative flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-black border border-zinc-700 hover:border-red-600/80 shadow-[0_0_25px_rgba(0,0,0,0.8)] text-zinc-100 transition-all duration-300 hover:scale-110 cursor-pointer backdrop-blur-md"
              >
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-bold text-red-400 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> VIEW MORE
                </span>
                <span className="text-[7px] sm:text-[8px] tracking-widest text-zinc-400 uppercase mt-0.5 whitespace-nowrap">
                  {floorData.floor} (10 Plots)
                </span>
              </button>
            </Html>
          )}
        </Float>
      </group>
    </group>
  );
}

function ElevatorBuilding({ onOpenCategory, onDirectEnquire, isMobile }) {
  const scroll = useScroll();
  const groupRef = useRef();

  useFrame((_, delta) => {
    globalScrollRef.current = scroll.offset;

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
        <FloorOrbitingPlots 
          key={tier.id} 
          floorData={tier} 
          onOpenCategory={onOpenCategory} 
          onDirectEnquire={onDirectEnquire}
          isMobile={isMobile} 
        />
      ))}

      <ContactShadows position={[0, -0.1, 0]} opacity={0.94} scale={32} blur={2.2} far={10} resolution={512} color="#000000" />
    </group>
  );
}

function ResponsiveCameraDirector({ isMobile, isTablet }) {
  const { camera } = useThree();

  useEffect(() => {
    if (isMobile) {
      camera.position.set(0, 0, 48);
      camera.fov = 28;
    } else if (isTablet) {
      camera.position.set(0, 0, 40);
      camera.fov = 25;
    } else {
      camera.position.set(0, 0, 35);
      camera.fov = 22;
    }
    camera.updateProjectionMatrix();
  }, [isMobile, isTablet, camera]);

  return null;
}

function SceneController({ onOpenCategory, onDirectEnquire, onExploreClick, isMobile }) {
  const scroll = useScroll();
  const heroHintRef = useRef();

  useFrame(() => {
    if (heroHintRef.current) {
      const isVisible = scroll.offset <= 0.04;
      heroHintRef.current.style.opacity = isVisible ? '0.65' : '0';
      heroHintRef.current.style.pointerEvents = isVisible ? 'auto' : 'none';
    }
  });

  return (
    <>
      <ElevatorBuilding onOpenCategory={onOpenCategory} onDirectEnquire={onDirectEnquire} isMobile={isMobile} />
      
      <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* HERO SECTION */}
        <div className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-auto relative overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono text-zinc-400 font-semibold">
              Imperial Mountain Heights // +2,400M
            </span>
          </div>

          <h1 
            style={{ fontFamily: "'Ma Shan Zheng', 'Cinzel Decorative', 'Cinzel', serif" }}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold text-white tracking-[0.16em] sm:tracking-[0.18em] leading-none drop-shadow-[0_15px_40px_rgba(0,0,0,0.95)] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 select-none my-1 sm:my-2"
          >
            AURA
          </h1>

          <div className="inline-block mt-2 sm:mt-3 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.85)] max-w-[92vw]">
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] text-zinc-300 font-medium">
              Ultra-Luxury Mountain Sanctuaries & Pagoda Estates
            </p>
          </div>

          <p className="max-w-md sm:max-w-xl text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mt-4 sm:mt-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] px-2">
            Ascend through seven transcendent architectural tiers carved into eternal mountain rock beneath celestial skies. 
            Mortise-and-tenon cedar joinery meets unbroken horizons.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={() => {
                if (scroll && scroll.el) {
                  const targetScroll = scroll.el.clientHeight * 1.05;
                  scroll.el.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-red-700/90 hover:bg-red-600 text-white font-semibold text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.45)] hover:scale-105"
            >
              Begin Ascent ↓
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase border border-zinc-700 transition-all backdrop-blur-md hover:scale-105"
            >
              Explore Estate
            </button>
          </div>

          <div 
            ref={heroHintRef}
            style={{ transition: 'opacity 0.2s ease-out' }}
            className="absolute bottom-6 sm:bottom-10 flex flex-col items-center gap-1 animate-bounce"
          >
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-400 uppercase">Scroll to Ascend Levels</span>
            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Floor Sections */}
        {ESTATE_DATA.map((tier, idx) => (
          <div 
            key={tier.id} 
            className={`h-screen flex items-center ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} px-6 sm:px-12 md:px-24`}
          >
            <div className="max-w-[280px] sm:max-w-xs pointer-events-auto bg-[#0e0f14]/85 backdrop-blur-2xl p-5 sm:p-6 border border-zinc-800 shadow-2xl rounded-2xl">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1 block">
                {tier.floor} // {tier.kanji}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-100 mb-1.5 sm:mb-2">{tier.name}</h2>
              <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed mb-3 sm:mb-4">
                Spin horizontally to inspect cardinal gates, or view all 10 plot specifications below.
              </p>
              <button 
                onClick={() => onOpenCategory(tier)} 
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-900 hover:bg-red-800 text-zinc-200 hover:text-white border border-zinc-700 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg transition-all"
              >
                VIEW MORE
              </button>
            </div>
          </div>
        ))}

        {/* Ground Floor */}
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center pointer-events-auto bg-[#0e0f14]/90 backdrop-blur-2xl p-6 sm:p-8 border border-zinc-800 shadow-2xl rounded-2xl max-w-xs sm:max-w-sm">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1 block">
              Ground Floor // 大門
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-zinc-100 mb-1.5 sm:mb-2">Grand Entrance</h2>
            <p className="text-zinc-400 text-[11px] sm:text-xs mb-5 sm:mb-6">
              Ascend through the mountain elevation tiers to return to the highest celestial peak.
            </p>
            <button 
              onClick={() => {
                if (scroll && scroll.el) {
                  scroll.el.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }} 
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-zinc-900 hover:bg-red-800 text-zinc-200 hover:text-white border border-zinc-700 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg transition-all"
            >
              Ascend to Peak ↑
            </button>
          </div>
        </div>
      </Scroll>
    </>
  );
}

function SnappingControls({ enabled }) {
  const controlsRef = useRef();
  const isDragging = useRef(false);

  useFrame((state, delta) => {
    if (!controlsRef.current || !enabled) return;

    const currentAngle = controlsRef.current.getAzimuthalAngle();
    const step = Math.PI / 2; 
    const nearestGate = Math.round(currentAngle / step) * step;
    
    if (!isDragging.current) {
      const distanceToGate = Math.abs(currentAngle - nearestGate);
      if (distanceToGate > 0.001 && distanceToGate < 0.35) {
        const newAngle = THREE.MathUtils.lerp(currentAngle, nearestGate, 5.5 * delta);
        const radius = 35; 
        state.camera.position.x = Math.sin(newAngle) * radius;
        state.camera.position.z = Math.cos(newAngle) * radius;
        controlsRef.current.update();
      }
    }

    const plotTracker = document.getElementById('plot-tracker');
    if (plotTracker) {
      const gateIndex = Math.abs(Math.round(currentAngle / step)) % 4;
      const gates = ['NORTH GATE // EXPOSURE', 'EAST GATE // DAWN', 'SOUTH GATE // CASCADE', 'WEST GATE // RIDGE'];
      plotTracker.innerText = gates[gateIndex];
    }
  });

  return enabled ? (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      enableZoom={false} 
      enablePan={false} 
      minPolarAngle={Math.PI / 2.3} 
      maxPolarAngle={Math.PI / 1.8} 
      enableDamping={true}
      dampingFactor={0.06} 
      // Mobile Touch Fix: Prevents 1-finger vertical swipes from locking up Drei scroll
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
      onStart={() => (isDragging.current = true)}
      onEnd={() => (isDragging.current = false)}
    />
  ) : null;
}

// -------------------------------------------------------------
// 4. MASTER CHEN REAL ESTATE AI CONCIERGE DRAWER
// -------------------------------------------------------------
function GeminiRealEstateBrokerDrawer({ isOpen, onClose, selectedPlotName, initialContextPrompt }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am Master Chen, your specialized Gemini Real Estate Intelligence Assistant for AURA Mountain Estate. I can evaluate properties, compare elevations, discuss structural mortise-and-tenon craftsmanship, calculate escrow schedules, and explain deed laws. How may I assist your real estate acquisition today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedPlotName) {
      const promptText = initialContextPrompt || 
        `I notice you are inquiring about **${selectedPlotName}**. This plot features high-elevation exposure, private veranda frontage, and freehold tenure. Would you like me to outline its square footage valuation, escrow timeline, or mortgage structures?`;
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: promptText
        }
      ]);
    }
  }, [selectedPlotName, initialContextPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateRealEstateResponse = (query) => {
    const q = query.toLowerCase();

    const isRealEstateRelated = 
      q.includes('price') || q.includes('cost') || q.includes('buy') || q.includes('deed') ||
      q.includes('property') || q.includes('plot') || q.includes('floor') || q.includes('villa') ||
      q.includes('suite') || q.includes('sq ft') || q.includes('square') || q.includes('elevation') ||
      q.includes('architect') || q.includes('building') || q.includes('timber') || q.includes('cedar') ||
      q.includes('mortgage') || q.includes('escrow') || q.includes('invest') || q.includes('real estate') ||
      q.includes('land') || q.includes('view') || q.includes('sanctuary') || q.includes('gate') ||
      q.includes('tax') || q.includes('reserve') || q.includes('tour') || q.includes('materials');

    if (!isRealEstateRelated) {
      return "As your dedicated Real Estate Intelligence Assistant, I specialize exclusively in property acquisitions, architectural specifications, valuations, zoning, and deed structures at AURA Mountain Estate. Please ask me any questions regarding our available plots, pricing, or structural craftsmanship!";
    }

    if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('valuation')) {
      return "At AURA, prices scale with altitude and privacy:\n\n• **1st Floor Garden Duplex:** Starting at $8.2M ($1,822/sq ft)\n• **2nd Floor Executive Quarters:** $10.8M ($2,842/sq ft)\n• **3rd Floor Wellness Spring Suites:** $13.4M ($3,190/sq ft)\n• **4th Floor Heritage Timber Lofts:** $16.8M ($3,652/sq ft)\n• **5th Floor Imperial Shadow Suites:** $21.2M ($4,156/sq ft)\n• **6th Floor Sky Sanctuary Villas:** $28.5M ($4,913/sq ft)\n\nAll properties include perpetual freehold deeds and private valet skyway rights.";
    }

    if (q.includes('deed') || q.includes('title') || q.includes('ownership') || q.includes('legal') || q.includes('tax')) {
      return "All plots are conveyed under a **Perpetual Freehold Title** backed by sovereign maritime escrow trusts. Ownership includes complete airspace rights, subterranean thermal spring access, and zero municipal property surcharges for international buyers.";
    }

    if (q.includes('mortgage') || q.includes('escrow') || q.includes('reserve') || q.includes('payment')) {
      return "We offer a 30-day refundable escrow holding deposit (1% of plot valuation) through direct bank wire or USDC/ETH. Standard acquisitions can be structured across a 5-year interest-free developer financing schedule or private international banking syndicates.";
    }

    if (q.includes('timber') || q.includes('architect') || q.includes('materials') || q.includes('joinery') || q.includes('cedar')) {
      return "AURA is engineered using dynastic Chinese mortise-and-tenon joinery (Dou-Gong) crafted from ancient aged red cedar, charred Shou Sugi Ban, and volcanic basalt rock. No iron nails or modern composite adhesives are used in primary load-bearing members, ensuring seismic flexibility and century-long durability.";
    }

    if (q.includes('top') || q.includes('6th') || q.includes('sky villa') || q.includes('best')) {
      return "The 6th Floor Sky Sanctuary Villas ($28.5M, 5,800 sq ft) represent the pinnacle tier at +2,400 meters elevation. It offers an unbroken 360-degree vista above the star field, dedicated private air-bridge access, and obsidian water reflection pools.";
    }

    return `Regarding your inquiry on "${query}": Every residential quadrant at AURA is engineered with distinct orientation benefits, custom thermal ventilation, and dedicated concierge access. Would you like me to arrange an escrow reservation or review the floorplan blueprint for a particular level?`;
  };

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: text.trim() }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateRealEstateResponse(text);
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#0b0c10]/95 border-l border-zinc-800 backdrop-blur-2xl z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.85)] text-zinc-200">
      <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 to-zinc-800 flex items-center justify-center text-white font-serif font-bold text-base sm:text-lg shadow-lg border border-red-500/50">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-serif text-zinc-100 text-sm sm:text-base font-bold tracking-wide">Master Chen</h3>
              <span className="text-[8px] sm:text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-red-400">
                Gemini Real Estate AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans">Specialized Property Intelligence</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
          ✕
        </button>
      </div>

      <div className="px-4 sm:px-6 py-2 border-b border-zinc-800/80 bg-zinc-950/40 flex gap-2 overflow-x-auto text-[9px] sm:text-[10px] font-mono no-scrollbar">
        {['Pricing Breakdown', 'Freehold Deed Legalities', 'Escrow Schedule', 'Architectural Materials'].map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSend(topic)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 hover:border-red-600 text-zinc-300 hover:text-white transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-500 mb-1 px-1">
              {m.sender === 'user' ? 'Client' : 'Gemini Real Estate Assistant'}
            </span>
            <div
              className={`p-3.5 sm:p-4 rounded-2xl max-w-[90%] sm:max-w-[88%] text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-white rounded-br-none border border-zinc-700 shadow-md'
                  : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-xl'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 bg-zinc-900/60 rounded-2xl w-20 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/80">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about plot prices, deeds, square feet..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-[10px] sm:text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function SearchModal({ isOpen, onClose, onSelectFloor }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return ESTATE_DATA;
    return ESTATE_DATA.filter((e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.floor.toLowerCase().includes(query.toLowerCase()) ||
      e.desc.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-zinc-100 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-zinc-800">
          <h3 className="font-serif text-lg sm:text-xl text-zinc-200">Estate Tier Registry</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xs uppercase tracking-widest">Close ✕</button>
        </div>

        <div className="mt-3 sm:mt-4">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by floor, residence name..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none"
          />
        </div>

        <div className="mt-4 sm:mt-6 max-h-72 sm:max-h-80 overflow-y-auto space-y-2.5 sm:space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => { onSelectFloor(item); onClose(); }}
              className="p-3.5 sm:p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-red-700/60 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
            >
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-red-400 font-bold block">{item.floor}</span>
                <h4 className="text-base sm:text-lg font-serif text-zinc-100 group-hover:text-red-300">{item.name}</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 max-w-md line-clamp-1">{item.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-bold text-zinc-200 block">{item.price}</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest">{item.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionModal({ title, subtitle, content, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-zinc-100 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0c0d12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-4 sm:pb-5 border-b border-zinc-800">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.3em] text-red-500 font-semibold block mb-1">
              {subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-bold tracking-wide">{title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-bold p-1">
            Close ✕
          </button>
        </div>

        <div className="my-4 sm:my-6 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-3 sm:space-y-4 font-light">
          {content}
        </div>

        <div className="pt-3 sm:pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailedPlotModal({ plot, floor, onClose, onConsultBroker }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!plot) return null;

  const perspectivesTitles = [
    'Exterior Facade & Veranda',
    'Cardinal Exposure Vista',
    'Master Living Chamber',
    'Architectural Night View'
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-300 text-zinc-100 select-none">
      <div className="w-full max-w-5xl bg-[#0d0e14] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        
        <div className="flex justify-between items-start pb-4 sm:pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-700/50 text-[9px] sm:text-[10px] font-mono uppercase text-red-400">
                {floor?.floor} // Plot {plot.id}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-zinc-400">{plot.tag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-serif text-zinc-100 font-bold">{plot.gate}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 sm:p-2 rounded-full hover:bg-zinc-800 transition-colors uppercase text-[10px] sm:text-xs font-bold tracking-widest flex items-center gap-1"
          >
            Close ✕
          </button>
        </div>

        <div className="my-4 sm:my-6">
          <div className="w-full h-48 sm:h-64 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800 relative bg-black">
            <img 
              src={plot.gallery[activePhotoIdx]} 
              alt={plot.gate} 
              className="w-full h-full object-cover transition-all duration-700 filter brightness-95" 
            />
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/80 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-lg border border-zinc-700 text-[10px] sm:text-xs font-mono text-zinc-200">
              Perspective {activePhotoIdx + 1} of 4: {perspectivesTitles[activePhotoIdx]}
            </div>
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/85 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-red-600/50 text-xs sm:text-base font-mono font-bold text-red-400 shadow-lg">
              {plot.price}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
            {plot.gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-14 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-300 ${
                  activePhotoIdx === idx 
                    ? 'border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                    : 'border-zinc-800 opacity-60 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono text-zinc-300">
                  Side {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-zinc-500 block">Usable Footprint</span>
            <span className="text-xs sm:text-base font-bold text-zinc-200 font-mono">{plot.specs.area}</span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-zinc-500 block">Ceiling Clearance</span>
            <span className="text-xs sm:text-base font-bold text-zinc-200 font-mono">{plot.specs.ceiling}</span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-zinc-500 block">Exposure Angle</span>
            <span className="text-xs sm:text-base font-bold text-zinc-200 font-mono">{plot.specs.orientation}</span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-zinc-500 block">Title Tenure</span>
            <span className="text-xs sm:text-base font-bold text-red-400 font-mono">{plot.specs.deed}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-4 sm:mb-6">
          <h4 className="text-[10px] sm:text-xs uppercase font-mono text-zinc-400 tracking-wider mb-1">Architectural Brief & Materials</h4>
          <p className="text-[11px] sm:text-sm text-zinc-300 leading-relaxed font-light">
            {plot.desc} Constructed with authentic {plot.specs.joinery}, incorporating acoustic dampening and natural thermal cross-ventilation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-zinc-800">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-zinc-500 block">Deed Valuation</span>
            <span className="text-lg sm:text-xl font-serif text-white font-bold">{plot.price} Complete Acquisition</span>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onConsultBroker(plot.gate, `I would like to acquire and reserve ${plot.gate} (${plot.price}, ${plot.specs.area}) on ${floor?.floor}. What is the escrow schedule and perpetual deed terms?`);
              }}
              className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-950/50 hover:scale-[1.02]"
            >
              Enquire & Consult Master Chen →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. MAIN APPLICATION
// -------------------------------------------------------------
export default function App() {
  const [activeFloor, setActiveFloor] = useState(null);
  const [activePlotDetails, setActivePlotDetails] = useState(null);
  const [smokeBurst, setSmokeBurst] = useState(false);
  const [dissolved, setDissolved] = useState(false);
  const [isBrokerOpen, setIsBrokerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [brokerInquiryPlot, setBrokerInquiryPlot] = useState(null);
  const [brokerContextPrompt, setBrokerContextPrompt] = useState(null);
  const [activeNavModal, setActiveNavModal] = useState(null);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Cinzel+Decorative:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes smokeExpansion {
        0% { transform: scale(0.35) rotate(0deg); opacity: 0; filter: blur(35px); }
        50% { transform: scale(1.15) rotate(15deg); opacity: 0.98; filter: blur(24px); }
        100% { transform: scale(1.75) rotate(30deg); opacity: 0; filter: blur(45px); }
      }
      .animate-smoke-burst {
        animation: smokeExpansion 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleOpenCategory = (floorItem) => {
    setActiveFloor(floorItem);
    setSmokeBurst(true);
    setDissolved(false);

    setTimeout(() => {
      setDissolved(true);
    }, 450);

    setTimeout(() => {
      setSmokeBurst(false);
    }, 1450);
  };

  const handleDirectEnquire = (plot, floor) => {
    setBrokerInquiryPlot(plot.gate);
    setBrokerContextPrompt(`Greetings! You are inspecting **${plot.gate}** on ${floor.floor} priced at ${plot.price}. It offers ${plot.specs.area} of freehold living with orientation toward the ${plot.specs.orientation}. How can I assist you with deed verification, mortgage options, or reservation terms?`);
    setIsBrokerOpen(true);
  };

  const handleConsultBrokerForPlot = (plotName, customPrompt) => {
    setBrokerInquiryPlot(plotName);
    setBrokerContextPrompt(customPrompt);
    setIsBrokerOpen(true);
  };

  return (
    <div className="relative w-screen h-screen bg-[#07080c] overflow-hidden font-sans select-none touch-pan-y">
      
      {/* LAYER 0: Background Image Sequence Scrubber */}
      <FrameSequenceBackground />

      {/* Top Header Navigation */}
      <header className="absolute top-0 left-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-50 bg-[#07080c]/90 backdrop-blur-2xl border-b border-zinc-800/80 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-md">
            <span className="text-zinc-200 font-serif font-bold text-sm sm:text-base">魂</span>
          </div>
          <div>
            <span className="text-white font-serif text-base sm:text-lg tracking-[0.25em] font-bold block leading-none">
              AURA
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.25em] text-red-500 font-medium block mt-0.5">
              Mountain Estate
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/70 border border-zinc-800/80 px-3 py-1.5 rounded-full shadow-inner text-[11px] font-mono tracking-widest uppercase">
          <button
            onClick={() => setActiveNavModal('about')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            ABOUT
          </button>
          <span className="text-zinc-700 select-none">•</span>
          <button
            onClick={() => setActiveNavModal('know_more')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            KNOW MORE
          </button>
          <span className="text-zinc-700 select-none">•</span>
          <button
            onClick={() => setActiveNavModal('contact')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            CONTACT
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/90 hover:bg-zinc-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-zinc-700 text-zinc-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-md transition-all"
          >
            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="hidden sm:inline">Search Units</span>
          </button>

          <button
            onClick={() => {
              setBrokerInquiryPlot(null);
              setBrokerContextPrompt(null);
              setIsBrokerOpen(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all shadow-lg border border-red-700/60"
          >
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 animate-ping"></div>
            <span>Master Chen</span>
          </button>
        </div>
      </header>

      {/* Cardinal HUD Tracker at Bottom Center */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[90vw] sm:w-auto flex justify-center">
        <div className="bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-zinc-800 shadow-xl flex items-center gap-2 sm:gap-3">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span id="plot-tracker" className="text-zinc-300 text-[9px] sm:text-[11px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase font-mono whitespace-nowrap">
            NORTH GATE // EXPOSURE
          </span>
        </div>
      </div>

      {/* Floating Ask Broker Button */}
      <button 
        onClick={() => {
          setBrokerInquiryPlot(null);
          setBrokerContextPrompt(null);
          setIsBrokerOpen(true);
        }}
        className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-40 pointer-events-auto bg-zinc-950 hover:bg-red-800 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 sm:gap-3 border border-zinc-800 hover:border-red-600 group"
      >
        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500 animate-ping"></div>
        <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase pr-1 sm:pr-2 text-zinc-300 group-hover:text-white hidden sm:inline">Ask Real Estate AI</span>
      </button>

      {/* Drawers & Modals */}
      <GeminiRealEstateBrokerDrawer 
        isOpen={isBrokerOpen} 
        onClose={() => setIsBrokerOpen(false)} 
        selectedPlotName={brokerInquiryPlot}
        initialContextPrompt={brokerContextPrompt}
      />
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectFloor={handleOpenCategory} 
      />

      <DetailedPlotModal 
        plot={activePlotDetails} 
        floor={activeFloor} 
        onClose={() => setActivePlotDetails(null)} 
        onConsultBroker={handleConsultBrokerForPlot}
      />

      <SectionModal 
        isOpen={activeNavModal === 'about'} 
        onClose={() => setActiveNavModal(null)}
        subtitle="ESTATE PHILOSOPHY"
        title="About AURA Mountain Estate"
        content={
          <>
            <p>
              AURA is an architectural estate positioned atop sacred mountain peaks at +2,400 meters elevation. 
              Conceived as a bridge between dynastic Chinese wooden pagoda traditions and contemporary luxury living.
            </p>
            <p>
              Every level features four cardinal residential quadrants, constructed without iron fasteners using authentic mortise-and-tenon cedar joinery, acoustic volcanic basalt, and thermal spring integration.
            </p>
            <div className="pt-3 border-t border-zinc-800/80">
              <p className="text-[11px] font-mono text-zinc-500">
                © 2026 AURA Mountain Estate. All Rights Reserved. Proprietary Demonstration.
              </p>
            </div>
          </>
        }
      />

      <SectionModal 
        isOpen={activeNavModal === 'know_more'} 
        onClose={() => setActiveNavModal(null)}
        subtitle="TECHNICAL ACQUISITION"
        title="Know More: Specifications & Deeds"
        content={
          <>
            <p>
              <strong>Deed Structure:</strong> All residences are deeded in perpetual freehold titles held under sovereign maritime escrow trusts with multi-generational inheritance guarantees.
            </p>
            <p>
              <strong>Private Infrastructure:</strong> Dedicated heliport pads on Floor 6, high-speed pneumatic elevators, subterranean private wine cellars, and on-demand helicopter transfers to nearby metropolitan hubs.
            </p>
            <div className="pt-3 border-t border-zinc-800/80">
              <p className="text-[11px] font-mono text-zinc-500">
                © 2026 AURA Mountain Estate. All Rights Reserved. Proprietary Demonstration.
              </p>
            </div>
          </>
        }
      />

      <SectionModal 
        isOpen={activeNavModal === 'contact'} 
        onClose={() => setActiveNavModal(null)}
        subtitle="PRIVATE CONCIERGE"
        title="Contact Master Chen & Desk"
        content={
          <>
            <p>
              Inquiries are handled strictly by private invitation or consultation with Master Chen, Senior Managing Broker.
            </p>
            <p className="font-mono text-xs text-red-400">
              Direct Desk: +86 (021) 8820-AURA<br />
              Diplomatic Concierge: desk@aura-mountain-estate.com<br />
              Helicopter Transfer Coordinates: 30°23'N 103°55'E
            </p>
            <div className="pt-3 border-t border-zinc-800/80">
              <p className="text-[11px] font-mono text-zinc-500">
                © 2026 AURA Mountain Estate. All Rights Reserved. Proprietary Demonstration.
              </p>
            </div>
          </>
        }
      />

      {/* Volumetric Fog & Dissolve */}
      {smokeBurst && (
        <div className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center overflow-hidden">
          <div 
            className="absolute w-[160vw] h-[160vh] rounded-full animate-smoke-burst"
            style={{
              background: 'radial-gradient(circle at center, rgba(16,18,24,0.98) 0%, rgba(28,31,40,0.85) 45%, rgba(10,12,16,0.6) 65%, transparent 85%)'
            }}
          />
        </div>
      )}

      {/* 10-Plot Category Catalog Modal */}
      {activeFloor && !activePlotDetails && (
        <div 
          style={{
            transform: dissolved ? 'scale(1) translateY(0px)' : 'scale(0.96) translateY(24px)',
            filter: dissolved ? 'blur(0px) contrast(100%)' : 'blur(22px) contrast(170%)',
            opacity: dissolved ? 1 : 0,
            transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease-out'
          }}
          className="absolute inset-0 z-50 flex flex-col p-4 sm:p-8 lg:p-14 bg-gradient-to-br from-[#09090b]/98 via-[#121318]/98 to-[#050507]/98 backdrop-blur-3xl text-zinc-100 overflow-y-auto scroll-smooth smooth-scroll-panel"
        >
          <button 
            onClick={() => {
              setDissolved(false);
              setTimeout(() => setActiveFloor(null), 350);
            }}
            className="absolute top-4 sm:top-8 right-4 sm:right-8 text-zinc-400 hover:text-white transition-all uppercase tracking-widest text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 group z-20 hover:scale-105"
          >
            Return to Estate
            <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="max-w-4xl mt-6 sm:mt-2 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-red-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 shadow-inner">
              <span>{activeFloor.floor}</span>
              <span>•</span>
              <span>{activeFloor.kanji} Residences // 10 Active Plots</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif text-zinc-100">{activeFloor.name}</h1>
            <p className="text-zinc-400 max-w-2xl text-xs sm:text-sm lg:text-base font-light leading-relaxed mt-1 sm:mt-2">
              {activeFloor.desc} Click any plot card below to inspect complete architectural schematics or enquire with Master Chen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5 mt-6 sm:mt-8 flex-grow relative z-10 pb-10">
            {activeFloor.plots.map((plot) => (
              <div 
                key={plot.id} 
                onClick={() => {
                  setActivePlotDetails(plot);
                  handleDirectEnquire(plot, activeFloor);
                }}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-red-600/70 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between group backdrop-blur-md relative overflow-hidden cursor-pointer hover:shadow-[0_15px_35px_rgba(220,38,38,0.18)]"
              >
                <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden relative border border-zinc-800 mb-2.5 sm:mb-3 bg-black">
                  <img src={plot.img} alt={plot.gate} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-zinc-700 text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-300 font-mono">
                    Plot {plot.id}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[9px] sm:text-[10px] font-mono font-bold text-red-400">
                    {plot.price}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-400 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase font-mono">{plot.tag}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-serif text-zinc-100 group-hover:text-red-300 transition-colors leading-tight">{plot.gate}</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 line-clamp-2 leading-snug">{plot.desc}</p>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePlotDetails(plot);
                    handleDirectEnquire(plot, activeFloor);
                  }}
                  className="mt-3 sm:mt-4 w-full py-2 bg-zinc-900 group-hover:bg-red-800 border border-zinc-700 group-hover:border-red-600 text-zinc-200 group-hover:text-white text-[9px] sm:text-[10px] uppercase tracking-widest font-bold transition-all duration-300 rounded-xl shadow-lg"
                >
                  Enquire & Inspect →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D CANVAS LAYER */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto touch-pan-y">
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#07080c] text-zinc-400">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mb-3"></div>
            <span className="font-mono text-xs uppercase tracking-widest">Loading AURA Celestial WebGL...</span>
          </div>
        }>
          <Canvas 
            shadows
            dpr={[1, 1.25]} 
            camera={{ position: [0, 0, 35], fov: 22, near: 0.1, far: 250 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          >
            <ResponsiveCameraDirector isMobile={isMobile} isTablet={isTablet} />

            <fog attach="fog" args={['#07080c', 35, 120]} />
            
            <SnappingControls enabled={true} />
            
            <ambientLight intensity={0.65} color="#e4e4e7" />
            <directionalLight 
              position={[-40, 50, -80]} 
              intensity={3.4} 
              color="#f4f4f5"
              castShadow 
              shadow-mapSize={[1024, 1024]} 
              shadow-bias={-0.0001}
            />
            <directionalLight position={[30, 20, 40]} intensity={0.8} color="#71717a" />
            
            <BakeShadows />
            
            <AnimeCelestialStarfield count={850} />

            <PaleCelestialMoon />
            <RedCherryBlossom />

            <ScrollControls pages={8} damping={0.25} snap>
              <SceneController 
                onOpenCategory={handleOpenCategory} 
                onDirectEnquire={handleDirectEnquire}
                onExploreClick={() => setActiveNavModal('know_more')} 
                isMobile={isMobile}
              />
            </ScrollControls>

            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom luminanceThreshold={0.72} intensity={1.3} mipmapBlur />
              <Vignette eskil={false} offset={0.14} darkness={0.85} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>

      {/* Subtle Copyright Footer */}
      <div className="absolute bottom-2 sm:bottom-3 left-4 sm:left-6 z-30 pointer-events-none opacity-40">
        <span className="text-[8px] sm:text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          © 2026 AURA Mountain Estate. All Rights Reserved. Proprietary Demonstration.
        </span>
      </div>
    </div>
  );
}