// 1. Weathered Chinese Stone Gate (Loaded from /gate/gate.gltf)
function AncientPortalGate({ position = [0, -3.8, 18] }) {
  const { scene } = useGLTF('/gate/gate.gltf');

  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.78;
          child.material.metalness = 0.12;
          child.material.envMapIntensity = 0.9;
        }
      }
    });
  }, [scene]);

  return (
    <group position={position} scale={[1.65, 1.65, 1.65]}>
      <primitive object={scene} />
      {/* Lantern accent lights framing the lotus relief archway */}
      <pointLight position={[-1.7, 2.6, 0.5]} intensity={16} color="#ff9944" distance={8} />
      <pointLight position={[1.7, 2.6, 0.5]} intensity={16} color="#ff9944" distance={8} />
    </group>
  );
}

// Preload the gate asset so there is zero hitch when the scene mounts
useGLTF.preload('/gate/gate.gltf');