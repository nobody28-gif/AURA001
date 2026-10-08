// src/FrameSequenceBackground.jsx
import React, { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 50;

// Helper to format frame_001.jpg, frame_002.jpg ... frame_050.jpg
const getFramePath = (index) => {
  const padIndex = String(index).padStart(3, '0');
  return `/frames/frame_${padIndex}.jpg`;
};

export default function FrameSequenceBackground({ scrollProgress = 0 }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loaded, setLoaded] = useState(false);

  // 1. Preload all 50 frames in the background
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // 2. Render frame to canvas with aspect-ratio cover math
  const renderFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete) return;

    // Handle high-DPI crispness & full screen covering
    const width = canvas.width;
    const height = canvas.height;

    const imgAspect = img.width / img.height;
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

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  // 3. Resize canvas to match window dimensions
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Re-render current frame after resize
        const currentIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(scrollProgress * (TOTAL_FRAMES - 1)))
        );
        renderFrame(currentIdx);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loaded]);

  // 4. Update frame whenever scrollProgress changes (0.0 to 1.0)
  useEffect(() => {
    if (!loaded) return;
    const targetIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(scrollProgress * (TOTAL_FRAMES - 1)))
    );
    renderFrame(targetIndex);
  }, [scrollProgress, loaded]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full object-cover filter brightness-90 contrast-105" />
      
      {/* Cinematic vignette & atmospheric dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-black/30 to-[#07080c]/80 pointer-events-none" />
    </div>
  );
}