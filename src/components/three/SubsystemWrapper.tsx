import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import type { SubsystemId } from '../../lib/constants';
import { THRESHOLDS, COLORS } from '../../lib/constants';

interface SubsystemWrapperProps {
  subsystemId: SubsystemId;
  children: React.ReactNode;
  position?: [number, number, number];
}

const STATUS_COLORS = {
  good: new THREE.Color(COLORS.three.glowGreen),
  warning: new THREE.Color(COLORS.three.glowAmber),
  broken: new THREE.Color(COLORS.three.glowRed),
};

export function SubsystemWrapper({ subsystemId, children, position = [0, 0, 0] }: SubsystemWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const originalColorsRef = useRef<Map<THREE.Mesh, THREE.Color>>(new Map());
  const [hovered, setHovered] = useState(false);
  const selectedSubsystem = useStore(s => s.selectedSubsystem);
  const setSelectedSubsystem = useStore(s => s.setSelectedSubsystem);
  const subsystemHealth = useStore(s => s.subsystemHealth);

  const isSelected = selectedSubsystem === subsystemId;
  const healthScore = subsystemHealth[subsystemId] ?? 0;

  // Determine status color based on health score
  const statusColor = useMemo(() => {
    if (healthScore >= THRESHOLDS.critical) return STATUS_COLORS.broken;
    if (healthScore >= THRESHOLDS.warning) return STATUS_COLORS.warning;
    return STATUS_COLORS.good;
  }, [healthScore]);

  // Animate glow intensity and tint mesh base color
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !(child.material instanceof THREE.MeshStandardMaterial)) return;

      const mat = child.material;

      // Store original color on first encounter
      if (!originalColorsRef.current.has(child)) {
        originalColorsRef.current.set(child, mat.color.clone());
      }
      const originalColor = originalColorsRef.current.get(child)!;

      if (healthScore >= THRESHOLDS.critical) {
        // Critical: tint mesh red + pulsating emissive
        const pulse = Math.sin(time * 4) * 0.5 + 0.5;
        mat.color.copy(originalColor).lerp(STATUS_COLORS.broken, 0.4);
        mat.emissive.copy(statusColor);
        // When selected, boost emissive intensity significantly
        const baseIntensity = 0.3 + pulse * 0.7;
        mat.emissiveIntensity = isSelected ? baseIntensity + 0.5 : baseIntensity;
      } else if (healthScore >= THRESHOLDS.warning) {
        // Warning: tint mesh orange + gentle pulse
        mat.color.copy(originalColor).lerp(STATUS_COLORS.warning, 0.25);
        mat.emissive.copy(statusColor);
        const baseIntensity = 0.15 + Math.sin(time * 2) * 0.1;
        // When selected, boost emissive intensity
        mat.emissiveIntensity = isSelected ? baseIntensity + 0.4 : baseIntensity;
      } else {
        // Normal: restore original color
        mat.color.copy(originalColor);
        if (hovered || isSelected) {
          mat.emissive.set(0x06b6d4);
          mat.emissiveIntensity = isSelected ? 0.3 : 0.12;
        } else {
          mat.emissive.copy(STATUS_COLORS.good);
          mat.emissiveIntensity = 0.03;
        }
      }
    });
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
