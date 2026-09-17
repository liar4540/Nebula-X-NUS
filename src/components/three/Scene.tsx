import { Suspense, useMemo } from 'react';
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
  const theme = useStore(s => s.theme);

  const isLight = theme === 'light';

  const glConfig = useMemo(() => ({
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: isLight ? 1.4 : 1.0,
  }), [isLight]);

  return (
    <div className="canvas-bg" data-tour-id="3d-twin">
      <Canvas
        gl={glConfig}
        camera={{ position: [6, 3, 8], fov: 45, near: 0.1, far: 100 }}
        onPointerMissed={() => setSelectedSubsystem(null)}
        scene={{ background: new THREE.Color(isLight ? '#F1F5F9' : '#090D16') }}
      >
        <Suspense fallback={null}>
          {/* Lighting — adapts to theme */}
          <ambientLight
            intensity={isLight ? 0.8 : 0.15}
            color={isLight ? '#ffffff' : '#8899bb'}
          />
          <directionalLight
            position={[8, 10, 5]}
            intensity={isLight ? 1.6 : 1.2}
            color={isLight ? '#ffffff' : '#b0c4de'}
            castShadow
          />
          <directionalLight
            position={[-5, 6, -3]}
            intensity={isLight ? 0.8 : 0.5}
            color={isLight ? '#f0f0f0' : '#ffa040'}
          />
          <pointLight
            position={[0, -2, 0]}
            intensity={isLight ? 0.15 : 0.3}
            color={isLight ? '#94a3b8' : '#1e3a5f'}
          />

          {/* Environment for reflections */}
          <Environment preset={isLight ? 'city' : 'night'} />

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
            args={[40, 40, isLight ? 0xc8d5e2 : 0x1a2744, isLight ? 0xe2e8f0 : 0x111827]}
            position={[0, -1.8, 0]}
          />

          {/* Camera */}
          <CameraRig />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={isLight ? 0.9 : 0.6}
              luminanceSmoothing={0.3}
              intensity={isLight ? 0.5 : 1.5}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
