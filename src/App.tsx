import './index.css';
import { Scene } from './components/three/Scene';
import { TopBar } from './components/layout/TopBar';
import { LeftHUD } from './components/layout/LeftHUD';
import { RightHUD } from './components/layout/RightHUD';
import { BottomBar } from './components/layout/BottomBar';
import { WorkOrderModal } from './components/ui/WorkOrderModal';
import { GuidedTour } from './components/ui/GuidedTour';
import { useTelemetryEngine } from './hooks/useTelemetryEngine';

function App() {
  // Start the telemetry playback engine
  useTelemetryEngine();

  return (
    <>
      {/* 3D Canvas — full screen background */}
      <Scene />

      {/* HUD Overlay */}
      <div className="app-layout">
        <TopBar />
        <LeftHUD />
        <div className="canvas-area" />
        <RightHUD />
        <BottomBar />
      </div>

      {/* Work Order Modal */}
      <WorkOrderModal />

      {/* Guided Onboarding Tour */}
      <GuidedTour />
    </>
  );
}

export default App;
