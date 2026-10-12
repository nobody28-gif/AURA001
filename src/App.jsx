import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, useGLTF, OrbitControls, ContactShadows, BakeShadows, Float, Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. CURRENCY CONVERTER ENGINE (USD, EUR, AED, JPY)
// -------------------------------------------------------------
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, suffix: 'M' },
  EUR: { symbol: '€', rate: 0.92, suffix: 'M' },
  AED: { symbol: 'AED ', rate: 3.67, suffix: 'M' },
  JPY: { symbol: '¥', rate: 154.5, suffix: 'B' }
};

const formatPrice = (baseMillionUSD, currencyKey) => {
  const c = CURRENCIES[currencyKey] || CURRENCIES.USD;
  if (currencyKey === 'JPY') {
    const valInBillion = (baseMillionUSD * c.rate) / 1000;
    return `${c.symbol}${valInBillion.toFixed(2)}${c.suffix}`;
  }
  const converted = baseMillionUSD * c.rate;
  return `${c.symbol}${converted.toFixed(1)}${c.suffix}`;
};

// -------------------------------------------------------------
// 2. PLOT DATA & REAL ESTATE CONFIGURATION
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
    windowTitle: 'North Facade // Obsidian Crest',
    tag: 'Obsidian Crest', 
    rawPrice: basePrice, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[3]],
    specs: { area: '5,200 sq ft', ceiling: '16.5 ft', orientation: 'North (Direct Mountain)', joinery: 'Charred Cedar & Granite', deed: 'Freehold Perpetual' },
    desc: 'Unbroken panoramic vista facing northern high mountain peaks. Features private obsidian water reflection veranda and acoustic stone screens.' 
  },
  { 
    id: '02', 
    gate: `${prefix} East Altar`, 
    angle: Math.PI / 2, 
    windowTitle: 'East Facade // Dawn Pavilion',
    tag: 'Dawn Pavilion', 
    rawPrice: basePrice - 0.6, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[3], PLOT_IMAGES[0]],
    specs: { area: '4,850 sq ft', ceiling: '15.0 ft', orientation: 'East (Sunrise Valley)', joinery: 'White Hinoki & Slate', deed: 'Freehold Perpetual' },
    desc: 'Bathed in pale sunrise light across charcoal valley mist. Features morning tea chamber and cantilevered rock deck.' 
  },
  { 
    id: '03', 
    gate: `${prefix} South Court`, 
    angle: Math.PI, 
    windowTitle: 'South Facade // Imperial Terrace',
    tag: 'Imperial Terrace', 
    rawPrice: basePrice + 0.8, 
    img: PLOT_IMAGES[2],
    gallery: [PLOT_IMAGES[2], PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[1]],
    specs: { area: '5,600 sq ft', ceiling: '18.0 ft', orientation: 'South (Cascade Exposure)', joinery: 'Mortise & Tenon Ebony', deed: 'Freehold Perpetual' },
    desc: 'Direct elevation view above rushing waterfall terraces. Built with triple-vaulted timber beams and dual guest reception wings.' 
  },
  { 
    id: '04', 
    gate: `${prefix} West Ridge`, 
    angle: (3 * Math.PI) / 2, 
    windowTitle: 'West Facade // Twilight Balcony',
    tag: 'Twilight Balcony', 
    rawPrice: basePrice - 0.4, 
    img: PLOT_IMAGES[3],
    gallery: [PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[1], PLOT_IMAGES[2]],
    specs: { area: '4,900 sq ft', ceiling: '15.5 ft', orientation: 'West (Crimson Dusk)', joinery: 'Smoked Ironwood & Glass', deed: 'Freehold Perpetual' },
    desc: 'Framed by dark mountain pines and twilight cloud currents. Direct unobstructed view of evening sky transitions.' 
  },
  { 
    id: '05', 
    gate: `${prefix} Zenith Loft`, 
    tag: 'Sky Sanctuary', 
    rawPrice: basePrice + 0.5, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[2], PLOT_IMAGES[1], PLOT_IMAGES[3]],
    specs: { area: '5,100 sq ft', ceiling: '19.0 ft', orientation: 'Zenith Sky Opening', joinery: 'Blackened Timber Truss', deed: 'Freehold Perpetual' },
    desc: 'Double-vaulted timber ceiling with celestial skylight and master cedar meditation room.' 
  },
  { 
    id: '06', 
    gate: `${prefix} Pine Alcove`, 
    tag: 'Forest Garden', 
    rawPrice: basePrice - 0.8, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[3], PLOT_IMAGES[0], PLOT_IMAGES[2]],
    specs: { area: '4,400 sq ft', ceiling: '14.0 ft', orientation: 'North-East Forest', joinery: 'Natural Moss Rock & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Secluded bamboo garden with private tea reception pavilion, integrated stone pathway, and acoustic isolation.' 
  },
  { 
    id: '07', 
    gate: `${prefix} Lotus Chamber`, 
    tag: 'Thermal Spring', 
    rawPrice: basePrice + 0.2, 
    img: PLOT_IMAGES[2],
    gallery: [PLOT_IMAGES[2], PLOT_IMAGES[0], PLOT_IMAGES[3], PLOT_IMAGES[1]],
    specs: { area: '4,950 sq ft', ceiling: '16.0 ft', orientation: 'South-East Mountain Spring', joinery: 'Basalt & Hinoki Bath', deed: 'Freehold Perpetual' },
    desc: 'Natural hot spring stone bath with acoustic isolation and private thermal water connection direct from bedrock.' 
  },
  { 
    id: '08', 
    gate: `${prefix} Cloud Bower`, 
    tag: 'Mist Outlook', 
    rawPrice: basePrice - 0.5, 
    img: PLOT_IMAGES[3],
    gallery: [PLOT_IMAGES[3], PLOT_IMAGES[1], PLOT_IMAGES[2], PLOT_IMAGES[0]],
    specs: { area: '4,650 sq ft', ceiling: '14.5 ft', orientation: 'South-West Gorge', joinery: 'Cantilevered Steel & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Cantilevered cedar deck hanging directly over mountain cliffs with frameless glass thermal partitions.' 
  },
  { 
    id: '09', 
    gate: `${prefix} Shadow Hall`, 
    tag: 'Ebony Gallery', 
    rawPrice: basePrice + 0.3, 
    img: PLOT_IMAGES[0],
    gallery: [PLOT_IMAGES[0], PLOT_IMAGES[3], PLOT_IMAGES[1], PLOT_IMAGES[2]],
    specs: { area: '5,050 sq ft', ceiling: '15.5 ft', orientation: 'North-West Ridge', joinery: 'Charred Shou Sugi Ban', deed: 'Freehold Perpetual' },
    desc: 'Dark charred-timber master suite with custom screen joinery, discrete diplomat reception alcoves, and private wine cellar.' 
  },
  { 
    id: '10', 
    gate: `${prefix} Solitude Point`, 
    tag: 'Meditation Post', 
    rawPrice: basePrice - 0.9, 
    img: PLOT_IMAGES[1],
    gallery: [PLOT_IMAGES[1], PLOT_IMAGES[0], PLOT_IMAGES[2], PLOT_IMAGES[3]],
    specs: { area: '4,200 sq ft', ceiling: '14.0 ft', orientation: 'Western Horizon', joinery: 'Natural Granite & Cedar', deed: 'Freehold Perpetual' },
    desc: 'Quiet sanctuary at the estate perimeter with private rock garden and direct valley views.' 
  }
];

const ESTATE_DATA = [
  { floor: 'Level 6', id: 6, floorY: 26, name: 'Sky Sanctuary Villas', rawBase: 28.5, size: '5,800 sq ft', elevation: '+2,400m', desc: 'The pinnacle crown of the estate. Floating above the celestial star field with private stone bridges and obsidian balconies.', plots: generateTenPlots(28.5, 'Sanctuary') },
  { floor: 'Level 5', id: 5, floorY: 21, name: 'Imperial Shadow Suites', rawBase: 21.2, size: '5,100 sq ft', elevation: '+2,100m', desc: 'Full-floor residence with dual private gate balconies, master cedar bathing room, and dark stone reception halls.', plots: generateTenPlots(21.2, 'Imperial') },
  { floor: 'Level 4', id: 4, floorY: 16, name: 'Heritage Timber Lofts', rawBase: 16.8, size: '4,600 sq ft', elevation: '+1,800m', desc: 'Double-vaulted timber lofts surrounded by ancient twisted bonsai and starry night skies.', plots: generateTenPlots(16.8, 'Heritage') },
  { floor: 'Level 3', id: 3, floorY: 11, name: 'Wellness Spring Suites', rawBase: 13.4, size: '4,200 sq ft', elevation: '+1,500m', desc: 'Crafted around thermal springs with charred black basalt and incense hearths overlooking the celestial horizon.', plots: generateTenPlots(13.4, 'Wellness') },
  { floor: 'Level 2', id: 2, floorY: 6, name: 'Executive Quarters', rawBase: 10.8, size: '3,800 sq ft', elevation: '+1,200m', desc: 'Spacious gallery pavilions and private library alcoves framed by heavy stone lintels and charcoal panels.', plots: generateTenPlots(10.8, 'Executive') },
  { floor: 'Level 1', id: 1, floorY: 1, name: 'Garden Cascade Duplex', rawBase: 8.2, size: '4,500 sq ft', elevation: '+900m', desc: 'Resting directly behind cascading waterfalls, connected to stone paths, dark moss terraces, and ancient bamboo groves.', plots: generateTenPlots(8.2, 'Garden') }
];

// -------------------------------------------------------------
// 3. SYNTHESIZED TIBETAN ZEN AMBIENT AUDIO ENGINE (432Hz)
// -------------------------------------------------------------
function useZenAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);

      [216, 432, 648].forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setIsPlaying(true);
    } else {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
        setIsPlaying(true);
      } else if (audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
        setIsPlaying(false);
      }
    }
  };

  return { isPlaying, toggleAudio };
}

// -------------------------------------------------------------
// 4. 3D MODELS & PAGODA WITH RED & YELLOW INTERNAL LIGHTS
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
      
      {/* --- DYNATIC RED & WARM YELLOW INTERNAL LIGHTING SYSTEM --- */}
      {/* Tier 1: Warm Golden Yellow Core + Red Eaves */}
      <pointLight position={[0, 3.2, 0]} intensity={18} color="#ffbe1a" distance={15} decay={2} />
      <pointLight position={[2.8, 3.5, 2.8]} intensity={12} color="#ff1744" distance={11} decay={2} />
      <pointLight position={[-2.8, 3.5, -2.8]} intensity={12} color="#ff1744" distance={11} decay={2} />

      {/* Tier 2: Rich Crimson Red Core + Golden Amber Accents */}
      <pointLight position={[0, 8.5, 0]} intensity={20} color="#ff1e38" distance={16} decay={2} />
      <pointLight position={[-2.4, 8.8, 2.4]} intensity={14} color="#ffb703" distance={12} decay={2} />
      <pointLight position={[2.4, 8.8, -2.4]} intensity={14} color="#ffb703" distance={12} decay={2} />

      {/* Tier 3: Warm Lantern Golden Amber */}
      <pointLight position={[0, 14.2, 0]} intensity={22} color="#ffba08" distance={17} decay={2} />
      <pointLight position={[2.2, 14.5, 2.2]} intensity={14} color="#ff1e38" distance={11} decay={2} />

      {/* Tier 4: Crimson Red Chamber Glow */}
      <pointLight position={[0, 19.8, 0]} intensity={20} color="#ff1744" distance={16} decay={2} />
      <pointLight position={[-2.0, 20.1, -2.0]} intensity={14} color="#ffd166" distance={11} decay={2} />

      {/* Tier 5 & Spire: Golden Crown Radiance & Red Peak Sparkle */}
      <pointLight position={[0, 25.5, 0]} intensity={24} color="#ffb703" distance={18} decay={2} />
      <pointLight position={[0, 29.0, 0]} intensity={16} color="#ff1744" distance={14} decay={2} />
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

// -------------------------------------------------------------
// CHERRY BLOSSOMS (BEHIND PAGODA, SLOW DRIFT, GLOWING SHINE)
// -------------------------------------------------------------
function RedCherryBlossom({ count = 850 }) { 
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // 88% pass behind the pagoda or on wide flanks, only 12% in foreground
      const isForeground = Math.random() < 0.12;
      
      let x, z;
      if (isForeground) {
        // Few gentle petals floating in front of the model
        x = (Math.random() - 0.5) * 35;
        z = 6.0 + Math.random() * 18.0;
      } else {
        // Background petals strictly passing behind the building
        x = (Math.random() - 0.5) * 85;
        if (Math.abs(x) < 8.0) {
          // In line with the pagoda: strictly behind it (Z < -6)
          z = -7.0 - Math.random() * 40.0;
        } else {
          // Broad wings to the left and right
          z = (Math.random() - 0.5) * 45 - 6.0;
        }
      }

      temp.push({
        x,
        y: Math.random() * 85 - 35,
        z,
        isForeground,
        // Slower, graceful floating speed
        speed: 0.16 + Math.random() * 0.32,
        spin: 0.008 + Math.random() * 0.018,
        drift: (Math.random() - 0.5) * 0.45,
        scale: isForeground ? (0.75 + Math.random() * 0.4) : (0.5 + Math.random() * 0.6)
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Slow, peaceful descent
      p.y -= p.speed * delta * 4.5;
      p.x += Math.sin(t * p.speed * 0.4) * 0.012 + (p.drift * delta);
      p.z += Math.cos(t * p.speed * 0.4) * 0.008;

      if (p.y < -35) {
        p.y = 45; // Resets back to sky
        if (p.isForeground) {
          p.x = (Math.random() - 0.5) * 35;
        } else {
          p.x = (Math.random() - 0.5) * 85;
        }
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.rotation.x += p.spin;
      dummy.rotation.y += p.spin * 0.8;
      dummy.rotation.z += p.spin * 0.5;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.22, 6, 6, 0, Math.PI, 0, Math.PI / 1.8]} />
      {/* Radiant crystalline shine material with glowing bloom */}
      <meshStandardMaterial 
        color="#ff224e" 
        emissive="#ff0d35" 
        emissiveIntensity={3.4} 
        roughness={0.2} 
        metalness={0.35} 
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.92} 
        depthWrite={false} 
      />
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

// -------------------------------------------------------------
// 5. SMART CARDINAL BALCONY ANCHOR (Zero Overlap Protection)
// -------------------------------------------------------------
function SinglePlotAnchor({ plot, floorData, onDirectEnquire, currency, isMobile }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardGroupRef = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    if (!cardGroupRef.current) return;

    if (scroll.offset < 0.06 || scroll.offset > 0.95) {
      if (isVisible) setIsVisible(false);
      return;
    }

    const cameraPos = state.camera.position;
    const cardWorldPos = new THREE.Vector3();
    cardGroupRef.current.getWorldPosition(cardWorldPos);

    const verticalDist = Math.abs(cameraPos.y - cardWorldPos.y);
    if (verticalDist > 4.4) {
      if (isVisible) setIsVisible(false);
      return;
    }

    const cameraAngle = Math.atan2(cameraPos.x, cameraPos.z);
    let diff = Math.abs(cameraAngle - plot.angle);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

    const shouldShow = diff < 0.62;
    if (isVisible !== shouldShow) {
      setIsVisible(shouldShow);
    }
  });

  const radius = isMobile ? 8.4 : 10.2;
  const x = Math.sin(plot.angle) * radius;
  const z = Math.cos(plot.angle) * radius;

  return (
    <group ref={cardGroupRef} position={[x, 0, z]}>
      {isVisible && (
        <Html center distanceFactor={isMobile ? 18 : 15} zIndexRange={[10, 40]}>
          <div 
            className="w-44 sm:w-52 p-2.5 rounded-2xl bg-[#0c0d12]/95 backdrop-blur-2xl border border-zinc-700/60 shadow-[0_15px_40px_rgba(0,0,0,0.95)] text-zinc-100 font-sans select-none cursor-pointer group hover:scale-105 transition-all duration-200"
            onClick={() => onDirectEnquire(plot, floorData)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[7.5px] sm:text-[8px] uppercase tracking-widest text-red-400 font-bold px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40">
                {plot.tag}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-200">
                {formatPrice(plot.rawPrice, currency)}
              </span>
            </div>

            <div className="w-full h-18 sm:h-22 rounded-xl overflow-hidden relative border border-zinc-800 mb-1.5 bg-black">
              <img src={plot.img} alt={plot.gate} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex items-end p-2">
                <span className="text-[9px] sm:text-[10px] font-serif font-bold text-zinc-200 uppercase tracking-widest line-clamp-1">
                  {plot.gate}
                </span>
              </div>
            </div>

            <p className="text-[8.5px] sm:text-[9.5px] text-zinc-400 leading-tight mb-1.5 line-clamp-2">
              {plot.desc}
            </p>

            <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800 text-[7.5px] sm:text-[8.5px] text-zinc-400">
              <span className="font-mono text-zinc-500">{plot.specs.area}</span>
              <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">View Details →</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FloorOrbitingPlots({ floorData, onOpenCategory, onDirectEnquire, currency, isMobile }) {
  const topFourPlots = floorData.plots.slice(0, 4);
  const scroll = useScroll();
  const [showPill, setShowPill] = useState(false);
  const pillGroupRef = useRef();

  useFrame((state) => {
    if (scroll.offset < 0.06 || scroll.offset > 0.95) {
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
          currency={currency}
          isMobile={isMobile} 
        />
      ))}

      <group ref={pillGroupRef} position={[isMobile ? 8.5 : 11.5, 0.5, 2]}>
        <Float speed={2.2} rotationIntensity={0.2} floatIntensity={0.7}>
          {showPill && (
            <Html center distanceFactor={isMobile ? 16 : 14} zIndexRange={[20, 60]}>
              <button
                onClick={() => onOpenCategory(floorData)}
                className="group relative flex flex-col items-center justify-center px-3.5 sm:px-4 py-2 rounded-2xl bg-zinc-950/90 hover:bg-black border border-zinc-700 hover:border-red-600/80 shadow-[0_0_25px_rgba(0,0,0,0.85)] text-zinc-100 transition-all duration-300 hover:scale-110 cursor-pointer backdrop-blur-md"
              >
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-red-400 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> SEE MORE PLOTS
                </span>
                <span className="text-[7.5px] sm:text-[8px] tracking-widest text-zinc-400 uppercase mt-0.5 whitespace-nowrap">
                  {floorData.floor} ({floorData.plots.length} Units)
                </span>
              </button>
            </Html>
          )}
        </Float>
      </group>
    </group>
  );
}

function ElevatorBuilding({ onOpenCategory, onDirectEnquire, currency, isMobile }) {
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
        <FloorOrbitingPlots 
          key={tier.id} 
          floorData={tier} 
          onOpenCategory={onOpenCategory} 
          onDirectEnquire={onDirectEnquire}
          currency={currency}
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

function SceneController({ onOpenCategory, onDirectEnquire, onExploreClick, currency, isMobile }) {
  const scroll = useScroll();
  const heroHintRef = useRef();
  const altitudeTrackerRef = useRef();

  useFrame(() => {
    if (heroHintRef.current) {
      const isVisible = scroll.offset <= 0.04;
      heroHintRef.current.style.opacity = isVisible ? '0.75' : '0';
      heroHintRef.current.style.pointerEvents = isVisible ? 'auto' : 'none';
    }

    if (altitudeTrackerRef.current) {
      const minAlt = 900;
      const maxAlt = 2400;
      const currentAlt = Math.round(maxAlt - scroll.offset * (maxAlt - minAlt));
      altitudeTrackerRef.current.innerText = `+${currentAlt}M ALTITUDE // PURE ALPINE AIR`;
    }
  });

  return (
    <>
      <ElevatorBuilding onOpenCategory={onOpenCategory} onDirectEnquire={onDirectEnquire} currency={currency} isMobile={isMobile} />
      
      <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        
        {/* HERO SECTION */}
        <div className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-auto relative overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span ref={altitudeTrackerRef} className="text-[9px] sm:text-[11px] uppercase tracking-[0.35em] font-mono text-zinc-400 font-semibold">
              +2,400M ALTITUDE // PURE ALPINE AIR
            </span>
          </div>

          <h1 
            style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold text-white tracking-[0.16em] leading-none drop-shadow-[0_15px_40px_rgba(0,0,0,0.95)] select-none my-1 sm:my-2"
          >
            AURA
          </h1>

          <div className="inline-block mt-2 sm:mt-3 px-4 sm:px-6 py-1.5 rounded-full bg-zinc-900/70 backdrop-blur-md border border-zinc-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.85)] max-w-[92vw]">
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-medium">
              Ultra-Luxury Pagoda Mountain Estates // 6 Celestial Tiers
            </p>
          </div>

          <p className="max-w-md sm:max-w-xl text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mt-4 sm:mt-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] px-2">
            Ascend through six transcendent architectural tiers carved into eternal mountain rock beneath starry celestial skies. 
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
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-red-700/90 hover:bg-red-600 text-white font-semibold text-[10px] sm:text-xs tracking-[0.25em] uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105"
            >
              Begin Ascent ↓
            </button>
            <button
              onClick={onExploreClick}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-[10px] sm:text-xs tracking-[0.25em] uppercase border border-zinc-700 transition-all backdrop-blur-md hover:scale-105"
            >
              Estate Overview
            </button>
          </div>

          <div 
            ref={heroHintRef}
            style={{ transition: 'opacity 0.2s ease-out' }}
            className="absolute bottom-6 sm:bottom-10 flex flex-col items-center gap-1 animate-bounce"
          >
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-400 uppercase">Scroll to Descend Levels</span>
            <span className="text-zinc-400 text-xs">↓</span>
          </div>
        </div>

        {/* 6 Floor Sections */}
        {ESTATE_DATA.map((tier, idx) => (
          <div 
            key={tier.id} 
            className={`h-screen flex items-center ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} px-6 sm:px-12 md:px-24`}
          >
            <div className="max-w-[280px] sm:max-w-xs pointer-events-auto bg-[#0e0f14]/90 backdrop-blur-2xl p-5 sm:p-6 border border-zinc-800 shadow-2xl rounded-2xl">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1 block">
                {tier.floor} // {tier.elevation}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-100 mb-1.5">{tier.name}</h2>
              <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed mb-3">
                Spin horizontally to inspect all 4 cardinal facades, or explore all 10 plot blueprints below.
              </p>
              <button 
                onClick={() => onOpenCategory(tier)} 
                className="px-4 sm:px-5 py-2 bg-zinc-900 hover:bg-red-800 text-zinc-200 hover:text-white border border-zinc-700 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-lg transition-all"
              >
                EXPLORE ALL PLOTS
              </button>
            </div>
          </div>
        ))}

        {/* Ground Floor */}
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center pointer-events-auto bg-[#0e0f14]/90 backdrop-blur-2xl p-6 sm:p-8 border border-zinc-800 shadow-2xl rounded-2xl max-w-xs sm:max-w-sm">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1 block">
              Base Level // Grand Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-zinc-100 mb-1.5">Mountain Gate</h2>
            <p className="text-zinc-400 text-[11px] sm:text-xs mb-5">
              Ascend back through the mountain elevation tiers to return to the highest celestial pinnacle.
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
      const gates = ['NORTH FACADE // MOUNTAIN EXPOSURE', 'EAST FACADE // DAWN VALLEY', 'SOUTH FACADE // CASCADE EXPOSURE', 'WEST FACADE // CRIMSON DUSK'];
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
      touches={{
        ONE: THREE.TOUCH.NONE,
        TWO: THREE.TOUCH.ROTATE
      }}
      onStart={() => (isDragging.current = true)}
      onEnd={() => (isDragging.current = false)}
    />
  ) : null;
}

// -------------------------------------------------------------
// 6. MASTER CHEN AI BROKER DRAWER
// -------------------------------------------------------------
function GeminiRealEstateBrokerDrawer({ isOpen, onClose, selectedPlotName, initialContextPrompt }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome to AURA Mountain Estate. I am Master Chen, Managing Intelligence Broker. I can calculate escrow arrangements, compare cardinal elevations, review mortise-and-tenon cedar joinery, and explain sovereign perpetual freehold deed structures. How may I direct your acquisition today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedPlotName) {
      const promptText = initialContextPrompt || 
        `I see you are inspecting **${selectedPlotName}**. This residence enjoys high-elevation cardinal exposure, private reflection veranda frontage, and perpetual deed ownership. Would you like to review escrow terms or structure an acquisition deposit?`;
      
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

    if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('valuation')) {
      return "At AURA, valuations scale strictly by altitude, privacy, and deed airspace:\n\n• Level 1 Garden Cascade: $8.2M ($1,822/sq ft)\n• Level 2 Executive Quarters: $10.8M ($2,842/sq ft)\n• Level 3 Wellness Spring Suites: $13.4M ($3,190/sq ft)\n• Level 4 Heritage Timber Lofts: $16.8M ($3,652/sq ft)\n• Level 5 Imperial Shadow Suites: $21.2M ($4,156/sq ft)\n• Level 6 Sky Sanctuary Villas: $28.5M ($4,913/sq ft)\n\nAll acquisitions include sovereign perpetual freehold title deeds.";
    }

    if (q.includes('deed') || q.includes('title') || q.includes('ownership') || q.includes('legal') || q.includes('tax')) {
      return "All plots are conveyed under **Perpetual Freehold Title** backed by international sovereign maritime escrow trusts. Ownership includes complete airspace rights, subterranean thermal spring integration, and zero municipal property surcharges for international buyers.";
    }

    if (q.includes('timber') || q.includes('architect') || q.includes('materials') || q.includes('joinery') || q.includes('cedar')) {
      return "AURA is engineered using authentic dynastic mortise-and-tenon cedar joinery (Dou-Gong) crafted from ancient aged red cedar, charred Shou Sugi Ban, and volcanic basalt rock. No iron nails or composite adhesives are used in primary load-bearing members, ensuring seismic durability across centuries.";
    }

    return `Regarding your inquiry on "${query}": Every residential quadrant at AURA is engineered with distinct orientation benefits, custom thermal ventilation, and dedicated concierge access. Would you like me to arrange an escrow reservation or review the floorplan blueprint?`;
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
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 to-zinc-800 flex items-center justify-center text-white font-serif font-bold text-base shadow-lg border border-red-500/50">
            ◆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-zinc-100 text-sm sm:text-base font-bold tracking-wide">Master Chen</h3>
              <span className="text-[8px] sm:text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-red-400">
                Senior Real Estate Broker
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans">AURA Sovereign Property Intelligence</p>
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
              {m.sender === 'user' ? 'Client' : 'Master Chen'}
            </span>
            <div
              className={`p-3.5 sm:p-4 rounded-2xl max-w-[90%] text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
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
            placeholder="Ask about plot valuations, deeds, square feet..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-[10px] sm:text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. HIGH-RESOLUTION ARCHITECTURAL GALLERY MODAL (SLEEK & SIMPLE)
// -------------------------------------------------------------
function DetailedPlotModal({ plot, floor, currency, onClose, onConsultBroker }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!plot) return null;

  const perspectivesTitles = [
    'Exterior Facade & Balcony View',
    'Panoramic Cardinal Mountain Vista',
    'Master Cedar Living Pavilion',
    'Architectural Night Ambient View'
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-300 text-zinc-100 select-none">
      <div className="w-full max-w-4xl bg-[#0c0d12] border border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        
        {/* Sleek Minimalist Header */}
        <div className="flex justify-between items-start pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/50 border border-red-700/40 text-[9px] sm:text-[10px] font-mono uppercase text-red-400">
                {floor?.floor} // Plot {plot.id}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-zinc-400">{plot.tag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-zinc-100 font-bold">{plot.gate}</h2>
          </div>
          
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800/80 transition-colors uppercase text-[10px] sm:text-xs font-bold tracking-widest flex items-center gap-1"
          >
            Close ✕
          </button>
        </div>

        {/* Crisp Architectural Photo Gallery */}
        <div className="my-4">
          <div className="w-full h-56 sm:h-72 md:h-96 rounded-2xl overflow-hidden border border-zinc-800 relative bg-black group">
            <img 
              src={plot.gallery[activePhotoIdx]} 
              alt={plot.gate} 
              className="w-full h-full object-cover transition-all duration-700 filter brightness-95 group-hover:scale-105" 
            />
            <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-700 text-[9px] sm:text-xs font-mono text-zinc-200">
              Perspective {activePhotoIdx + 1} of 4: {perspectivesTitles[activePhotoIdx]}
            </div>
            <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-red-600/50 text-xs sm:text-sm font-mono font-bold text-red-400 shadow-lg">
              {formatPrice(plot.rawPrice, currency)}
            </div>
          </div>

          {/* 4 Clean Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {plot.gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-14 sm:h-20 rounded-xl overflow-hidden border transition-all duration-300 ${
                  activePhotoIdx === idx ? 'border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[7.5px] sm:text-[8px] font-mono text-zinc-300">
                  Side {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-2">
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-0.5">Footprint</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono">{plot.specs.area}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-0.5">Ceiling Clearance</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono">{plot.specs.ceiling}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-0.5">Orientation</span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono">{plot.specs.orientation}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block mb-0.5">Title Deed</span>
            <span className="text-xs sm:text-sm font-semibold text-red-400 font-mono">{plot.specs.deed}</span>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-zinc-400 font-light leading-relaxed my-2">
          {plot.desc} Constructed with authentic {plot.specs.joinery}.
        </p>

        {/* Minimalist Action Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-zinc-800/80 mt-2">
          <div>
            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Acquisition Valuation</span>
            <span className="text-lg sm:text-xl font-serif text-white font-bold">{formatPrice(plot.rawPrice, currency)} Full Title</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onConsultBroker(plot.gate, `I would like to acquire and reserve ${plot.gate} (${formatPrice(plot.rawPrice, currency)}, ${plot.specs.area}) on ${floor?.floor}. What is the escrow schedule?`);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:scale-105"
          >
            Enquire & Consult Master Chen →
          </button>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. 10-PLOT HORIZONTAL SWIPE CATALOG
// -------------------------------------------------------------
function HorizontalCategoryModal({ floor, isOpen, onClose, onSelectPlot, currency }) {
  if (!isOpen || !floor) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080c]/98 backdrop-blur-3xl flex flex-col p-4 sm:p-8 md:p-12 select-none animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-400 font-bold block">
            {floor.floor} // {floor.elevation}
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif text-white font-bold">{floor.name}</h1>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full text-xs font-mono uppercase tracking-widest"
        >
          Return to Estate ✕
        </button>
      </div>

      <p className="text-zinc-400 text-xs sm:text-sm my-3 max-w-xl">
        Swipe horizontally across all 10 residential units in this tier. Click any plot to inspect complete blueprints and specifications.
      </p>

      <div className="flex-1 flex items-center overflow-x-auto gap-5 py-4 px-2 no-scrollbar scroll-smooth">
        {floor.plots.map((plot) => (
          <div 
            key={plot.id}
            onClick={() => onSelectPlot(plot, floor)}
            className="min-w-[270px] sm:min-w-[310px] max-w-[310px] bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl group"
          >
            <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden relative mb-3 bg-black">
              <img src={plot.img} alt={plot.gate} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-zinc-300">
                Plot {plot.id}
              </div>
              <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded bg-red-950/90 text-[10px] font-mono font-bold text-red-400 border border-red-800">
                {formatPrice(plot.rawPrice, currency)}
              </div>
            </div>

            <div>
              <span className="text-[9.5px] uppercase font-mono text-red-400 font-bold">{plot.tag}</span>
              <h3 className="text-base font-serif text-white font-bold mt-0.5">{plot.gate}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{plot.desc}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span>{plot.specs.area}</span>
              <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">View Details →</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
        ← Swipe Horizontally to Inspect All 10 Units →
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. OVERVIEW MODALS
// -------------------------------------------------------------
function SectionModal({ title, subtitle, content, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-zinc-100 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0c0d12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-red-500 font-semibold block mb-1">
              {subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-bold tracking-wide">{title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-bold p-1">
            Close ✕
          </button>
        </div>
        <div className="my-4 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-3 font-light">
          {content}
        </div>
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. MAIN ROOT APPLICATION
// -------------------------------------------------------------
export default function App() {
  const [activeFloor, setActiveFloor] = useState(null);
  const [activePlotDetails, setActivePlotDetails] = useState(null);
  const [isBrokerOpen, setIsBrokerOpen] = useState(false);
  const [brokerInquiryPlot, setBrokerInquiryPlot] = useState(null);
  const [brokerContextPrompt, setBrokerContextPrompt] = useState(null);
  const [activeNavModal, setActiveNavModal] = useState(null);
  const [currency, setCurrency] = useState('USD');

  const { isPlaying: isAudioPlaying, toggleAudio } = useZenAudio();

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const handleOpenCategory = (floorItem) => {
    setActiveFloor(floorItem);
  };

  const handleDirectEnquire = (plot, floor) => {
    setActivePlotDetails(plot);
  };

  const handleConsultBrokerForPlot = (plotName, customPrompt) => {
    setBrokerInquiryPlot(plotName);
    setBrokerContextPrompt(customPrompt);
    setIsBrokerOpen(true);
  };

  return (
    <div className="relative w-screen h-screen bg-[#07080c] overflow-hidden font-sans select-none touch-pan-y" style={{ touchAction: 'pan-y' }}>
      
      {/* Top Header Navigation */}
      <header className="absolute top-0 left-0 w-full px-4 sm:px-6 py-3.5 flex justify-between items-center z-50 bg-[#07080c]/85 backdrop-blur-2xl border-b border-zinc-800/80 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 rounded-full border border-red-700/60 bg-zinc-900 flex items-center justify-center shadow-md">
            <span className="text-red-400 font-serif font-bold text-xs">◆</span>
          </div>
          <div>
            <span className="text-white font-serif text-base sm:text-lg tracking-[0.25em] font-bold block leading-none">
              AURA
            </span>
            <span className="text-[7.5px] uppercase tracking-[0.25em] text-red-500 font-medium block mt-0.5">
              Mountain Estate
            </span>
          </div>
        </div>

        {/* Navigation Modals */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/70 border border-zinc-800/80 px-3 py-1.5 rounded-full shadow-inner text-[11px] font-mono tracking-widest uppercase">
          <button
            onClick={() => setActiveNavModal('about')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            ESTATE PHILOSOPHY
          </button>
          <span className="text-zinc-700 select-none">•</span>
          <button
            onClick={() => setActiveNavModal('know_more')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            SPECIFICATIONS
          </button>
          <span className="text-zinc-700 select-none">•</span>
          <button
            onClick={() => setActiveNavModal('contact')}
            className="px-4 py-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all font-medium"
          >
            PRIVATE DESK
          </button>
        </nav>

        {/* Global Controls: Currency + Zen Audio + Master Chen */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Currency Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-full p-0.5 text-[9px] font-mono">
            {Object.keys(CURRENCIES).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-2 py-1 rounded-full transition-all ${
                  currency === cur ? 'bg-red-700 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Zen Ambient Sound Generator Toggle */}
          <button
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              isAudioPlaying ? 'bg-zinc-900 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>{isAudioPlaying ? '♪ ZEN SOUND ON' : '♪ AUDIO'}</span>
          </button>

          {/* Master Chen AI Drawer Trigger */}
          <button
            onClick={() => {
              setBrokerInquiryPlot(null);
              setBrokerContextPrompt(null);
              setIsBrokerOpen(true);
            }}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all shadow-lg border border-red-700/60"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
            <span className="hidden sm:inline">Master Chen</span>
          </button>
        </div>
      </header>

      {/* Cardinal HUD Tracker at Bottom Center */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[90vw] sm:w-auto flex justify-center">
        <div className="bg-zinc-950/90 backdrop-blur-md px-5 py-2 rounded-full border border-zinc-800 shadow-xl flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span id="plot-tracker" className="text-zinc-300 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase font-mono whitespace-nowrap">
            NORTH FACADE // MOUNTAIN EXPOSURE
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
        className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-40 pointer-events-auto bg-zinc-950 hover:bg-red-800 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-zinc-800 hover:border-red-600 group"
      >
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
        <span className="text-[10px] font-bold tracking-widest uppercase pr-1 text-zinc-300 group-hover:text-white hidden sm:inline">Ask Real Estate AI</span>
      </button>

      {/* Drawers & Modals */}
      <GeminiRealEstateBrokerDrawer 
        isOpen={isBrokerOpen} 
        onClose={() => setIsBrokerOpen(false)} 
        selectedPlotName={brokerInquiryPlot}
        initialContextPrompt={brokerContextPrompt}
      />

      <DetailedPlotModal 
        plot={activePlotDetails} 
        floor={activeFloor} 
        currency={currency}
        onClose={() => setActivePlotDetails(null)} 
        onConsultBroker={handleConsultBrokerForPlot}
      />

      <HorizontalCategoryModal 
        floor={activeFloor}
        isOpen={Boolean(activeFloor && !activePlotDetails)}
        onClose={() => setActiveFloor(null)}
        onSelectPlot={(p, f) => {
          setActivePlotDetails(p);
        }}
        currency={currency}
      />

      <SectionModal 
        isOpen={activeNavModal === 'about'} 
        onClose={() => setActiveNavModal(null)}
        subtitle="ESTATE PHILOSOPHY"
        title="About AURA Mountain Estate"
        content={
          <>
            <p>
              AURA is an architectural sanctuary positioned atop eternal mountain peaks at +2,400 meters elevation. 
              Engineered as a harmonious dialogue between dynastic wooden pagoda traditions and contemporary luxury living.
            </p>
            <p>
              Every level features four cardinal residential quadrants, constructed without iron fasteners using authentic mortise-and-tenon cedar joinery, acoustic volcanic basalt, and subterranean thermal spring connections.
            </p>
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
              <strong>Deed Structure:</strong> All residences are deeded in perpetual freehold titles held under sovereign international maritime escrow trusts with multi-generational inheritance guarantees.
            </p>
            <p>
              <strong>Private Infrastructure:</strong> Dedicated heliport pads on Level 6, high-speed pneumatic elevators, subterranean private wine cellars, and on-demand helicopter transfers.
            </p>
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
              Acquisitions are handled strictly by private invitation or direct consultation with Master Chen, Senior Managing Broker.
            </p>
            <p className="font-mono text-xs text-red-400">
              Direct Desk: +1 (800) 820-AURA<br />
              Diplomatic Concierge: desk@aura-mountain-estate.com<br />
              Helipad Transfer Coordinates: 30°23'N 103°55'E
            </p>
          </>
        }
      />

      {/* 3D CANVAS LAYER */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto touch-pan-y" style={{ touchAction: 'pan-y' }}>
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
            {/* 850 Slow, Glowing Cherry Blossom Petals Passing Primarily Behind the Pagoda */}
            <RedCherryBlossom count={850} />

            <ScrollControls pages={8} damping={0.25} snap>
              <SceneController 
                onOpenCategory={handleOpenCategory} 
                onDirectEnquire={handleDirectEnquire}
                onExploreClick={() => setActiveNavModal('know_more')} 
                currency={currency}
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
          © 2026 AURA Mountain Estate. All Rights Reserved. Sovereign Ultra-Luxury Living.
        </span>
      </div>
    </div>
  );
}

useGLTF.preload('/scene.gltf');
useGLTF.preload('/mountain.glb');