import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

export default function CitySkyline({ count = 120 }) {
  const buildingsRef = useRef();
  const windowsRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cityData = useMemo(() => {
    const list = [];
    const colors = ['#00e5ff', '#ff0055', '#ffaa00', '#7928ca', '#00ff66', '#ff0077'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const distance = 85 + Math.random() * 65;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      const width = 4 + Math.random() * 8;
      const depth = 4 + Math.random() * 8;
      const height = 25 + Math.random() * 60;
      const y = height / 2 - 20;
      const glowColor = colors[Math.floor(Math.random() * colors.length)];
      list.push({ x, y, z, width, height, depth, glowColor });
    }
    return list;
  }, [count]);

  useEffect(() => {
    if (!buildingsRef.current || !windowsRef.current) return;
    cityData.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.rotation.set(0, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      buildingsRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(b.x, b.y + (Math.random() - 0.5) * 6, b.z);
      dummy.scale.set(b.width * 1.02, b.height * 0.18, b.depth * 1.02);
      dummy.updateMatrix();
      windowsRef.current.setMatrixAt(i, dummy.matrix);
      windowsRef.current.setColorAt(i, new THREE.Color(b.glowColor));
    });
    buildingsRef.current.instanceMatrix.needsUpdate = true;
    windowsRef.current.instanceMatrix.needsUpdate = true;
    if (windowsRef.current.instanceColor) windowsRef.current.instanceColor.needsUpdate = true;
  }, [cityData, dummy]);

  return (
    <group>
      <instancedMesh ref={buildingsRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0c1017" roughness={0.3} metalness={0.8} />
      </instancedMesh>
      <instancedMesh ref={windowsRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {[
        { pos: [0, 18, -140], scale: [220, 75, 45], rot: 0.1, color: '#090d15' },
        { pos: [-120, 24, -120], scale: [180, 85, 40], rot: -0.2, color: '#080c14' },
        { pos: [130, 20, -130], scale: [190, 80, 40], rot: 0.3, color: '#090d15' }
      ].map((m, idx) => (
        <mesh key={idx} position={m.pos} scale={m.scale} rotation={[0, m.rot, 0]}>
          <coneGeometry args={[1, 1, 5]} />
          <meshStandardMaterial color={m.color} roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}