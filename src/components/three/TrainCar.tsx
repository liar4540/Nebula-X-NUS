import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { COLORS } from '../../lib/constants';

/** Procedural train car body with accent stripe */
export function TrainCar() {
  const selectedTrain = useStore(s => s.selectedTrain);
  const viewMode = useStore(s => s.viewMode);

  const isXray = viewMode === 'xray';

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.three.bodyGrey,
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: isXray ? 0.08 : 1,
    wireframe: isXray,
    side: isXray ? THREE.DoubleSide : THREE.FrontSide,
  }), [isXray]);

  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.three.windowDark,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: isXray ? 0.03 : 0.7,
  }), [isXray]);

  const stripeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: selectedTrain.accentColor,
    roughness: 0.3,
    metalness: 0.5,
    transparent: isXray,
    opacity: isXray ? 0.15 : 1,
    emissive: new THREE.Color(selectedTrain.accentColor),
    emissiveIntensity: 0.1,
  }), [selectedTrain.accentColor, isXray]);

  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.5,
    metalness: 0.4,
    transparent: true,
    opacity: isXray ? 0.06 : 1,
    wireframe: isXray,
    side: isXray ? THREE.DoubleSide : THREE.FrontSide,
  }), [isXray]);

  const underMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.6,
    metalness: 0.5,
    transparent: true,
    opacity: isXray ? 0.06 : 1,
    wireframe: isXray,
  }), [isXray]);

  return (
    <group>
      {/* Main body */}
      <mesh material={bodyMat} position={[0, 0.4, 0]}>
        <boxGeometry args={[2.9, 2.0, 12]} />
      </mesh>

      {/* Roof (slightly wider with arch effect) */}
      <mesh material={roofMat} position={[0, 1.5, 0]}>
        <boxGeometry args={[2.7, 0.2, 12]} />
      </mesh>
      {/* Roof arch pieces */}
      <mesh material={roofMat} position={[0, 1.55, 0]}>
        <boxGeometry args={[2.2, 0.12, 11.8]} />
      </mesh>

      {/* Underbody */}
      <mesh material={underMat} position={[0, -0.7, 0]}>
        <boxGeometry args={[2.6, 0.15, 11.5]} />
      </mesh>

      {/* Equipment boxes under the car */}
      {[-2, 0, 2].map((z, i) => (
        <mesh key={`equip-${i}`} material={underMat} position={[0, -0.85, z]}>
          <boxGeometry args={[1.8, 0.15, 1.2]} />
        </mesh>
      ))}

      {/* Accent stripe — runs along both sides */}
      {[1.46, -1.46].map((x, i) => (
        <mesh key={`stripe-${i}`} material={stripeMat} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.02, 0.18, 12.02]} />
        </mesh>
      ))}

      {/* Second accent stripe for dual-stripe trains */}
      {[1.46, -1.46].map((x, i) => (
        <mesh key={`stripe2-${i}`} material={stripeMat} position={[x, -0.15, 0]}>
          <boxGeometry args={[0.02, 0.06, 12.02]} />
        </mesh>
      ))}

      {/* Windows — rows of window cutouts on both sides */}
      {!isXray && (
        <>
          {[1.47, -1.47].map((x, side) =>
            Array.from({ length: 10 }, (_, i) => {
              const z = -4.5 + i * 1.0;
              // Skip door positions
              if (Math.abs(z - 0) < 0.8 || Math.abs(z + 3.2) < 0.8 || Math.abs(z - 3.2) < 0.8) return null;
              return (
                <mesh key={`window-${side}-${i}`} material={windowMat} position={[x, 0.55, z]}>
                  <boxGeometry args={[0.03, 0.8, 0.7]} />
                </mesh>
              );
            })
          )}
        </>
      )}

      {/* End cab window (front) */}
      {!isXray && (
        <>
          <mesh material={windowMat} position={[0, 0.7, 6.01]}>
            <boxGeometry args={[2.0, 0.7, 0.03]} />
          </mesh>
          <mesh material={windowMat} position={[0, 0.7, -6.01]}>
            <boxGeometry args={[2.0, 0.7, 0.03]} />
          </mesh>
        </>
      )}

      {/* Coupler bumps at each end */}
      <mesh material={underMat} position={[0, -0.2, 6.15]}>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
      </mesh>
      <mesh material={underMat} position={[0, -0.2, -6.15]}>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
      </mesh>
    </group>
  );
}
