import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { SUBSYSTEMS, CAMERA_LERP_DURATION } from '../../lib/constants';

export function CameraRig() {
  const controlsRef = useRef<any>(null);
  const selectedSubsystem = useStore(s => s.selectedSubsystem);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(5, 3, 8));
  const lookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const lerpProgress = useRef(1);
  const autoRotateAngle = useRef(0);

  const { camera } = useThree();

  // Set initial camera position
  useEffect(() => {
    camera.position.set(6, 3, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // When subsystem changes, update targets
  useEffect(() => {
    if (selectedSubsystem) {
      const config = SUBSYSTEMS.find(s => s.id === selectedSubsystem);
      if (config) {
        const [tx, ty, tz] = config.cameraTarget;
        const dist = config.cameraDistance;
        // Position camera offset from the target
        targetRef.current.set(tx + dist * 0.7, ty + dist * 0.5, tz + dist * 0.7);
        lookAtRef.current.set(tx, ty, tz);
        lerpProgress.current = 0;
      }
    } else {
      // Return to orbit overview
      targetRef.current.set(6, 3, 8);
      lookAtRef.current.set(0, 0, 0);
      lerpProgress.current = 0;
    }
  }, [selectedSubsystem]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (lerpProgress.current < 1) {
      lerpProgress.current = Math.min(1, lerpProgress.current + delta / CAMERA_LERP_DURATION);
      const t = easeInOutCubic(lerpProgress.current);

      camera.position.lerp(targetRef.current, t * 0.05);
      controlsRef.current.target.lerp(lookAtRef.current, t * 0.05);
      controlsRef.current.update();
    } else if (!selectedSubsystem) {
      // Gentle auto-orbit when no subsystem selected
      autoRotateAngle.current += delta * 0.08;
      const radius = 10;
      const px = Math.cos(autoRotateAngle.current) * radius;
      const pz = Math.sin(autoRotateAngle.current) * radius;
      camera.position.lerp(new THREE.Vector3(px, 3.5, pz), 0.01);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.01);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={25}
      maxPolarAngle={Math.PI / 1.8}
      enablePan={false}
    />
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
