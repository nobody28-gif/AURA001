import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEstateStore } from '../../stores/useEstateStore';

export default function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  const cameraMode = useEstateStore((s) => s.cameraMode);
  const targetPlot = useEstateStore((s) => s.activeBalconyPlot);

  useFrame((state, delta) => {
    if (cameraMode === 'balcony' && targetPlot) {
      if (controlsRef.current) controlsRef.current.enabled = false;

      const targetX = Math.sin(targetPlot.angle) * 7.2;
      const targetY = targetPlot.floorY + 1.7;
      const targetZ = Math.cos(targetPlot.angle) * 7.2;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);

      const lookDist = 50;
      const lookX = targetX + Math.sin(targetPlot.angle) * lookDist;
      const lookZ = targetZ + Math.cos(targetPlot.angle) * lookDist;
      camera.lookAt(lookX, targetY, lookZ);
    } else {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        const currentAngle = controlsRef.current.getAzimuthalAngle();
        const step = Math.PI / 2;
        const nearestGate = Math.round(currentAngle / step) * step;

        const distanceToGate = Math.abs(currentAngle - nearestGate);
        if (distanceToGate > 0.001 && distanceToGate < 0.35) {
          const newAngle = THREE.MathUtils.lerp(currentAngle, nearestGate, 5.5 * delta);
          const radius = 35;
          camera.position.x = Math.sin(newAngle) * radius;
          camera.position.z = Math.cos(newAngle) * radius;
          controlsRef.current.update();
        }

        const plotTracker = document.getElementById('plot-tracker');
        if (plotTracker) {
          const gateIndex = Math.abs(Math.round(currentAngle / step)) % 4;
          const gates = ['NORTH SPIRE // MEGACITY', 'EAST GATE // SKYLINE', 'SOUTH COURT // LANTERN', 'WEST RIDGE // PEAK'];
          plotTracker.innerText = gates[gateIndex];
        }
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      enableZoom={false} 
      enablePan={false} 
      minPolarAngle={Math.PI / 2.3} 
      maxPolarAngle={Math.PI / 1.8} 
      enableDamping={true}
      dampingFactor={0.06} 
    />
  );
}