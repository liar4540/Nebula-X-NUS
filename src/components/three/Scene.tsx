import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TrainCar } from './TrainCar';
import { BogieSystem, BrakeSystem, DoorSystem, HVACSystem } from './Subsystems';
import { CameraRig } from './CameraRig';
import { useStore } from '../../store/useStore';

export function Scene() {
  const setSelectedSubsystem = useStore(s => s.setSelectedSubsystem);

  return (
    <div className="canvas-bg">
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [6, 3, 8], fov: 45, near: 0.1, far: 100 }}
        onPointerMissed={() => setSelectedSubsystem(null)}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.15} color="#8899bb" />
          <directionalLight
            position={[8, 10, 5]}
            intensity={1.2}
            color="#b0c4de"
            castShadow
          />
          <directionalLight
            position={[-5, 6, -3]}
            intensity={0.5}
            color="#ffa040"
          />
          <pointLight position={[0, -2, 0]} intensity={0.3} color="#1e3a5f" />

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* Train Car Assembly */}
          <group>
            <TrainCar />
            <BogieSystem />
            <BrakeSystem />
            <DoorSystem />
            <HVACSystem />
          </group>

          {/* Ground grid */}
          <gridHelper
            args={[40, 40, 0x1a2744, 0x111827]}
            position={[0, -1.8, 0]}
          />

          {/* Camera */}
          <CameraRig />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.6}
              luminanceSmoothing={0.3}
              intensity={1.5}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
