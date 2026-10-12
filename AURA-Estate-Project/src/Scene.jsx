// src/Scene.jsx
import React, { useMemo, useRef, useState, useEffect, Suspense, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, useGLTF, OrbitControls, ContactShadows, BakeShadows, Float, Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- PASTE ALL YOUR 3D COMPONENTS HERE ---
// (PagodaModel, MountainBase, AnimeCelestialStarfield, RedCherryBlossom, PaleCelestialMoon, 
// SinglePlotAnchor, FloorOrbitingPlots, ElevatorBuilding, ResponsiveCameraDirector, 
// SceneController, SnappingControls)

export default function Scene({ isMobile, isTablet, onOpenCategory, onDirectEnquire, onExploreClick }) {
  return (
    <Canvas 
      shadows
      dpr={[1, 1.25]} 
      camera={{ position: [0, 0, 35], fov: 22, near: 0.1, far: 250 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ResponsiveCameraDirector isMobile={isMobile} isTablet={isTablet} />
      <fog attach="fog" args={['#07080c', 28, 110]} />
      <SnappingControls enabled={true} />
      
      <ambientLight intensity={0.65} color="#e4e4e7" />
      <directionalLight position={[-40, 50, -80]} intensity={3.4} color="#f4f4f5" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
      <directionalLight position={[30, 20, 40]} intensity={0.8} color="#71717a" />
      
      <BakeShadows />
      
      <AnimeCelestialStarfield count={850} />
      <PaleCelestialMoon />
      <RedCherryBlossom />

      <ScrollControls pages={8} damping={0.25} snap>
        <SceneController 
          onOpenCategory={onOpenCategory} 
          onDirectEnquire={onDirectEnquire}
          onExploreClick={onExploreClick} 
          isMobile={isMobile}
        />
      </ScrollControls>

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.72} intensity={1.3} mipmapBlur />
        <Vignette eskil={false} offset={0.14} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload('/scene-compressed.gltf');
useGLTF.preload('/mountain-compressed.glb');