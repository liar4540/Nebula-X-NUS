import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import type { SubsystemId } from '../../lib/constants';
import { SUBSYSTEMS, THRESHOLDS, COLORS } from '../../lib/constants';

interface SubsystemWrapperProps {
  subsystemId: SubsystemId;
  children: React.ReactNode;
  position?: [number, number, number];
}

export function SubsystemWrapper({ subsystemId, children, position = [0, 0, 0] }: SubsystemWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectedSubsystem = useStore(s => s.selectedSubsystem);
  const setSelectedSubsystem = useStore(s => s.setSelectedSubsystem);
  const subsystemHealth = useStore(s => s.subsystemHealth);

  const isSelected = selectedSubsystem === subsystemId;
  const healthScore = subsystemHealth[subsystemId] ?? 0;

  // Determine glow color based on health score
  const glowColor = useMemo(() => {
    if (healthScore >= THRESHOLDS.critical) return new THREE.Color(COLORS.three.glowRed);
    if (healthScore >= THRESHOLDS.warning) return new THREE.Color(COLORS.three.glowAmber);
    return new THREE.Color(COLORS.three.glowGreen);
  }, [healthScore]);

  // Animate glow intensity
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Pulsating glow when anomaly is detected
    if (healthScore >= THRESHOLDS.critical) {
      const pulse = Math.sin(time * 4) * 0.5 + 0.5;
      groupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive = glowColor;
          child.material.emissiveIntensity = 0.3 + pulse * 0.7;
        }
      });
    } else if (healthScore >= THRESHOLDS.warning) {
      groupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive = glowColor;
          child.material.emissiveIntensity = 0.15 + Math.sin(time * 2) * 0.1;
        }
      });
    } else {
      groupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = hovered || isSelected ? 0.08 : 0;
          if (hovered || isSelected) {
            child.material.emissive = new THREE.Color(0x06b6d4);
          }
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedSubsystem(isSelected ? null : subsystemId);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}
