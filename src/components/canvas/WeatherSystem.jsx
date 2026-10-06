import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEstateStore, WEATHER_PROFILES } from '../../stores/useEstateStore';

export default function WeatherSystem() {
  const weatherPhase = useEstateStore((s) => s.weatherPhase);
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 220;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 85,
        y: Math.random() * 80 - 30,
        z: (Math.random() - 0.5) * 65,
        speed: 0.6 + Math.random() * 1.6,
        spin: 0.02 + Math.random() * 0.04,
        drift: (Math.random() - 0.5) * 2.2
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y -= p.speed * delta * 1.8;
      p.x += Math.sin(t * p.speed * 0.5) * 0.03 + (p.drift * delta);
      p.z += Math.cos(t * p.speed * 0.5) * 0.03;
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
    <group>
      <group position={[-40, 48, -90]}>
        <mesh>
          <sphereGeometry args={[14, 24, 24]} />
          <meshBasicMaterial color={weatherPhase === 'morning' ? [5, 4.8, 4] : [5, 3.5, 1]} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[22, 20, 20]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
      </group>

      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial 
          color="#ff7700" 
          emissive="#ff0055" 
          emissiveIntensity={weatherPhase === 'night' ? 3.5 : 1.2} 
          transparent 
          opacity={0.9} 
        />
      </instancedMesh>
    </group>
  );
}