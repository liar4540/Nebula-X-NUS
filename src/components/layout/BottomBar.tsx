import { useStore } from '../../store/useStore';
import { FAULT_SCENARIOS } from '../../data/faultScenarios';
import { TOTAL_TICKS } from '../../lib/constants';
import { formatTime } from '../../lib/utils';
import type { ViewMode } from '../../store/useStore';

export function BottomBar() {
  const telemetryTick = useStore(s => s.telemetryTick);
  const setTelemetryTick = useStore(s => s.setTelemetryTick);
  const isPlaying = useStore(s => s.isPlaying);
  const setIsPlaying = useStore(s => s.setIsPlaying);
  const playbackSpeed = useStore(s => s.playbackSpeed);
  const setPlaybackSpeed = useStore(s => s.setPlaybackSpeed);
  const activeFault = useStore(s => s.activeFault);
  const injectFault = useStore(s => s.injectFault);
  const clearFault = useStore(s => s.clearFault);
  const globalStatus = useStore(s => s.globalStatus);
  const setShowWorkOrder = useStore(s => s.setShowWorkOrder);
  const viewMode = useStore(s => s.viewMode);
  const setViewMode = useStore(s => s.setViewMode);

  // Calculate time relative to "failure point" at tick 350
  const relativeSeconds = (telemetryTick - 350);
  const timeLabel = formatTime(relativeSeconds);

  // Phase label
  const phaseLabel = telemetryTick < 200
    ? 'Normal Operation'
    : telemetryTick < 350
      ? 'Drift Detected'
      : 'Acute Anomaly';

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'xray', label: 'X-Ray' },
  ];

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-inner">
        {/* Row 1: Timeline */}
        <div className="bottom-row">
          {/* Playback controls */}
          <button
            className="playback-btn"
            onClick={() => {
              const prev = Math.max(0, telemetryTick - 50);
              setTelemetryTick(prev);
            }}
            title="Previous Incident"
          >
            ◄
          </button>

          <button
            className="playback-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Speed controls */}
          {[1, 2, 5].map(speed => (
            <button
              key={speed}
              className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
              onClick={() => setPlaybackSpeed(speed)}
            >
              {speed}x
            </button>
          ))}

          {/* Timeline scrubber */}
          <div className="timeline-container">
            <input
              type="range"
              className="timeline-slider"
              min={0}
              max={TOTAL_TICKS - 1}
              value={telemetryTick}
              onChange={(e) => setTelemetryTick(Number(e.target.value))}
            />
            <span className="timeline-label">
              {timeLabel} ({phaseLabel})
            </span>
          </div>

          {/* View mode toggle */}
          <div className="view-toggle">
            {viewModes.map(vm => (
              <button
                key={vm.id}
                className={`view-toggle-btn ${viewMode === vm.id ? 'active' : ''}`}
                onClick={() => setViewMode(vm.id)}
              >
                {vm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Fault injection + Work order */}
        <div className="bottom-row">
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
            color: '#64748B',
            marginRight: 4,
          }}>
            FAULT INJECT:
          </span>

          {FAULT_SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              className={`fault-btn ${activeFault === scenario.id ? 'active' : ''}`}
              onClick={() => injectFault(scenario.id)}
              title={scenario.description}
            >
              {scenario.icon} {scenario.label.replace('Inject ', '')}
            </button>
          ))}

          <button
            className="fault-btn reset"
            onClick={clearFault}
          >
            🔄 Reset
          </button>

          <div style={{ flex: 1 }} />

          {globalStatus === 'anomaly' && (
            <button
              className="work-order-btn"
              onClick={() => setShowWorkOrder(true)}
            >
              📋 Acknowledge & Generate Work Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
