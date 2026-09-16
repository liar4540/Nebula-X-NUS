import { useMemo } from 'react';
import * as THREE from 'three';
import { SubsystemWrapper } from './SubsystemWrapper';

/** Bogie & Wheelset — axles, wheels, bearing housings, traction motor */
export function BogieSystem() {
  return (
    <>
      <SubsystemWrapper subsystemId="bogie" position={[0, -1.15, 3.5]}>
        <BogieUnit />
      </SubsystemWrapper>
      <SubsystemWrapper subsystemId="bogie" position={[0, -1.15, -3.5]}>
        <BogieUnit />
      </SubsystemWrapper>
    </>
  );
}

function BogieUnit() {
  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.35,
    metalness: 0.8,
  }), []);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.4,
    metalness: 0.7,
  }), []);

  return (
    <group>
      {/* Bogie frame */}
      <mesh material={darkMat} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.15, 2.0]} />
      </mesh>

      {/* Side frames */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={`side-${i}`} material={darkMat} position={[x, -0.1, 0]}>
          <boxGeometry args={[0.12, 0.35, 2.0]} />
        </mesh>
      ))}

      {/* Axles */}
      {[-0.7, 0.7].map((z, i) => (
        <mesh key={`axle-${i}`} material={steelMat} position={[0, -0.3, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 12]} />
        </mesh>
      ))}

      {/* Wheels */}
      {[-0.7, 0.7].map((z) =>
        [-1.1, 1.1].map((x, j) => (
          <group key={`wheel-${z}-${j}`} position={[x, -0.3, z]}>
            <mesh material={steelMat} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 0.08, 20]} />
            </mesh>
            {/* Wheel flange */}
            <mesh material={darkMat} rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.05 : -0.05, 0, 0]}>
              <cylinderGeometry args={[0.38, 0.35, 0.03, 20]} />
            </mesh>
          </group>
        ))
      )}

      {/* Bearing housings */}
      {[-0.7, 0.7].map((z) =>
        [-0.9, 0.9].map((x, j) => (
          <mesh key={`bearing-${z}-${j}`} material={steelMat} position={[x, -0.15, z]}>
            <boxGeometry args={[0.22, 0.2, 0.18]} />
          </mesh>
        ))
      )}

      {/* Traction motor */}
      <mesh material={darkMat} position={[0.4, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 12]} />
      </mesh>
      {/* Motor end cap */}
      <mesh material={steelMat} position={[0.4, -0.1, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
      </mesh>
    </group>
  );
}

/** Pneumatic Brake System — discs and calipers */
export function BrakeSystem() {
  const brakeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.3,
    metalness: 0.85,
  }), []);

  const caliperMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.4,
    metalness: 0.7,
  }), []);

  // Brake discs on each axle
  const brakePositions: [number, number, number][] = [
    [0.6, -1.45, 3.0], [-0.6, -1.45, 3.0],
    [0.6, -1.45, 4.0], [-0.6, -1.45, 4.0],
    [0.6, -1.45, -3.0], [-0.6, -1.45, -3.0],
    [0.6, -1.45, -4.0], [-0.6, -1.45, -4.0],
  ];

  return (
    <SubsystemWrapper subsystemId="brakes">
      {brakePositions.map((pos, i) => (
        <group key={`brake-${i}`} position={pos}>
          {/* Brake disc */}
          <mesh material={brakeMat} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
          </mesh>
          {/* Caliper */}
          <mesh material={caliperMat} position={[0, 0.12, 0]}>
            <boxGeometry args={[0.12, 0.18, 0.15]} />
          </mesh>
        </group>
      ))}
    </SubsystemWrapper>
  );
}

/** Bi-Parting Passenger Doors — sliding panels + tracks */
export function DoorSystem() {
  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.6,
  }), []);

  const trackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.7,
  }), []);

  // 3 door pairs on each side
  const doorZPositions = [-3.2, 0, 3.2];

  return (
    <SubsystemWrapper subsystemId="doors">
      {doorZPositions.map((z, i) => (
        <group key={`door-pair-${i}`}>
          {/* Right side doors */}
          <group position={[1.52, 0.2, z]}>
            {/* Door track */}
            <mesh material={trackMat} position={[0, 1.05, 0]}>
              <boxGeometry args={[0.04, 0.06, 1.3]} />
            </mesh>
            {/* Left panel */}
            <mesh material={doorMat} position={[0, 0.05, -0.32]}>
              <boxGeometry args={[0.06, 1.9, 0.58]} />
            </mesh>
            {/* Right panel */}
            <mesh material={doorMat} position={[0, 0.05, 0.32]}>
              <boxGeometry args={[0.06, 1.9, 0.58]} />
            </mesh>
            {/* Actuator box */}
            <mesh material={trackMat} position={[0.05, 1.05, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.3]} />
            </mesh>
          </group>

          {/* Left side doors (mirror) */}
          <group position={[-1.52, 0.2, z]}>
            <mesh material={trackMat} position={[0, 1.05, 0]}>
              <boxGeometry args={[0.04, 0.06, 1.3]} />
            </mesh>
            <mesh material={doorMat} position={[0, 0.05, -0.32]}>
              <boxGeometry args={[0.06, 1.9, 0.58]} />
            </mesh>
            <mesh material={doorMat} position={[0, 0.05, 0.32]}>
              <boxGeometry args={[0.06, 1.9, 0.58]} />
            </mesh>
            <mesh material={trackMat} position={[-0.05, 1.05, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.3]} />
            </mesh>
          </group>
        </group>
      ))}
    </SubsystemWrapper>
  );
}

/** Roof HVAC Units — two rectangular pods with fan grilles */
export function HVACSystem() {
  const hvacMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.5,
    metalness: 0.5,
  }), []);

  const grilleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x52525b,
    roughness: 0.6,
    metalness: 0.4,
  }), []);

  return (
    <SubsystemWrapper subsystemId="hvac">
      {[-2.5, 2.5].map((z, i) => (
        <group key={`hvac-${i}`} position={[0, 1.95, z]}>
          {/* Main pod */}
          <mesh material={hvacMat}>
            <boxGeometry args={[2.0, 0.4, 1.8]} />
          </mesh>
          {/* Top cover with slight bevel */}
          <mesh material={hvacMat} position={[0, 0.22, 0]}>
            <boxGeometry args={[1.9, 0.04, 1.7]} />
          </mesh>
          {/* Fan grilles */}
          {[-0.5, 0.5].map((x, j) => (
            <mesh key={`fan-${j}`} material={grilleMat} position={[x, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.06, 16]} />
            </mesh>
          ))}
          {/* Side vents */}
          <mesh material={grilleMat} position={[1.02, 0, 0]}>
            <boxGeometry args={[0.04, 0.3, 1.4]} />
          </mesh>
          <mesh material={grilleMat} position={[-1.02, 0, 0]}>
            <boxGeometry args={[0.04, 0.3, 1.4]} />
          </mesh>
        </group>
      ))}
    </SubsystemWrapper>
  );
}
