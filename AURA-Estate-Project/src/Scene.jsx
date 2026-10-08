// src/Scene.jsx
import React, { useMemo, useRef, useState, useEffect, Suspense, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, useGLTF, OrbitControls, ContactShadows, BakeShadows, Float, Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ==========================================
// 1. FRAME SCRUBBER COMPONENT
// ==========================================
function FrameScrubber({ frameCount }) {
  const scroll = useScroll();
  
  // Preload all images so there is no lag when scrolling
  const images = useMemo(() => {
    const imgs = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      
      // *** CHANGE THIS if your frames are named differently! ***
      // Example: If named "1.jpg", "2.jpg" -> `/frames/${i}.jpg`
      // Example: If named "frame1.png" -> `/frames/frame${i}.png`
      img.src = `/frames/${i}.jpg`; 
      
      imgs.push(img);
    }
    return imgs;
  }, [frameCount]);

  useFrame(() => {
    if (!scroll) return;
    
    // Convert scroll offset (0.0 to 1.0) into a frame number
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(scroll.offset * frameCount))
    );
    
    const canvas = document.getElementById('bg-canvas');
    if (canvas && images[frameIndex] && images[frameIndex].complete) {
      const ctx = canvas.getContext('2d');
      const img = images[frameIndex];
      
      // Match canvas resolution to screen size
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Draw image to fill the screen (object-fit: cover equivalent)
      const scale = Math.max(canvas.width / (img.width || 1), canvas.height / (img.height || 1));
      const x = (canvas.width / 2) - ((img.width || 1) / 2) * scale;
      const y = (canvas.height / 2) - ((img.height || 1) / 2) * scale;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, (img.width || 1) * scale, (img.height || 1) * scale);
    }
  });

  return null;
}

// ==========================================
// 2. PASTE YOUR 3D COMPONENTS HERE
// ==========================================
// ---> PASTE PagodaModel, MountainBase, AnimeCelestialStarfield, RedCherryBlossom, 
// ---> PaleCelestialMoon, SinglePlotAnchor, FloorOrbitingPlots, ElevatorBuilding, 
// ---> ResponsiveCameraDirector, SceneController, SnappingControls RIGHT HERE!


// ==========================================
// 3. MAIN SCENE EXPORT
// ==========================================
export default function Scene({ isMobile, isTablet, onOpenCategory, onDirectEnquire, onExploreClick }) {
  return (
    <>
      {/* This HTML canvas sits BEHIND the 3D scene to play the video frames */}
      <canvas 
        id="bg-canvas"
        style={{
          position: 'absolute',
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          zIndex: -1, 
          pointerEvents: 'none'
        }}
      />

      {/* gl={{ alpha: true }} makes the 3D canvas transparent so the video frames underneath can be seen! */}
      <Canvas 
        shadows
        dpr={[1, 1.25]} 
        camera={{ position: [0, 0, 35], fov: 22, near: 0.1, far: 250 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }} 
      >
        {/* Make sure to paste ResponsiveCameraDirector and SnappingControls above! */}
        <ResponsiveCameraDirector isMobile={isMobile} isTablet={isTablet} />
        <SnappingControls enabled={true} />
        
        <ambientLight intensity={0.65} color="#e4e4e7" />
        <directionalLight position={[-40, 50, -80]} intensity={3.4} color="#f4f4f5" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
        <directionalLight position={[30, 20, 40]} intensity={0.8} color="#71717a" />
        
        <BakeShadows />
        
        <fog attach="fog" args={['#07080c', 28, 110]} />
        
        <AnimeCelestialStarfield count={850} />
        <PaleCelestialMoon />
        <RedCherryBlossom />

        <ScrollControls pages={8} damping={0.25} snap>
          
          {/* ---> SCRUBBER ADDED HERE! <--- */}
          {/* CHANGE 150 TO YOUR ACTUAL TOTAL NUMBER OF IMAGE FRAMES */}
          <FrameScrubber frameCount={150} />

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
    </>
  );
}

// Preload your 3D models here
useGLTF.preload('/scene-compressed.gltf');
useGLTF.preload('/mountain-compressed.glb');