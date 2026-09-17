import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { SUBSYSTEMS, CAMERA_LERP_DURATION } from '../../lib/constants';

export function CameraRig() {
  const controlsRef = useRef<any>(null);
  const selectedSubsystem = useStore(s => s.selectedSubsystem);
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(6, 3, 8));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const lerpProgress = useRef(1); // Start at 1 = no animation
  const isAnimating = useRef(false);

  const { camera } = useThree();

  // Set initial camera position
  useEffect(() => {
    camera.position.set(6, 3, 8);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  // When subsystem changes, update targets and start animation
  useEffect(() => {
    if (selectedSubsystem) {
      const config = SUBSYSTEMS.find(s => s.id === selectedSubsystem);
      if (config) {
        const [tx, ty, tz] = config.cameraTarget;
        const dist = config.cameraDistance;
        targetPos.current.set(tx + dist * 0.7, ty + dist * 0.5, tz + dist * 0.7);
        targetLookAt.current.set(tx, ty, tz);
        lerpProgress.current = 0;
        isAnimating.current = true;
      }
    } else {
      // Return to overview
      targetPos.current.set(6, 3, 8);
      targetLookAt.current.set(0, 0, 0);
      lerpProgress.current = 0;
      isAnimating.current = true;
    }
  }, [selectedSubsystem]);

  useFrame((_state, delta) => {
    if (!controlsRef.current) return;

    // Only animate when we have a pending camera transition
    if (isAnimating.current && lerpProgress.current < 1) {
      // Disable user orbit during animation to prevent fighting
      controlsRef.current.enabled = false;

      lerpProgress.current = Math.min(1, lerpProgress.current + delta / CAMERA_LERP_DURATION);
      const t = easeInOutCubic(lerpProgress.current);

      camera.position.lerp(targetPos.current, t * 0.08);
      controlsRef.current.target.lerp(targetLookAt.current, t * 0.08);
      controlsRef.current.update();

      // When animation completes, re-enable user controls
      if (lerpProgress.current >= 1) {
        isAnimating.current = false;
        controlsRef.current.enabled = true;
      }
    }
    // When NOT animating, OrbitControls has full authority — no camera override
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
