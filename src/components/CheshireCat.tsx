import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh } from "three";

const CheshireCat = () => {
  const { scene } = useGLTF("/assets/models/chesire cat.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0.1, 1, 0.1]}
      scale={[0.5, 0.5, 0.5]}
    />
  );
};

useGLTF.preload("/assets/models/chesire cat.glb");

export default CheshireCat;
