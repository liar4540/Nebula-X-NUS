import { useStore } from '../../store/useStore';
import { FAULT_SCENARIOS } from '../../data/faultScenarios';
import { TOTAL_TICKS } from '../../lib/constants';
import { formatTime } from '../../lib/utils';
import type { ViewMode } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';

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

  const viewModes: { id: ViewMode; label: string; tooltip: string }[] = [
    { id: 'solid', label: 'Solid', tooltip: 'Standard view of the train carriage' },
    { id: 'xray', label: 'X-Ray', tooltip: 'Toggles outer body transparency to reveal internal bogies and brake lines' },
  ];

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-inner">
        {/* Row 1: Timeline */}
        <div className="bottom-row">
          {/* Playback controls */}
          <Tooltip label="Jump back 50 ticks" placement="top">
            <button
              className="playback-btn"
              onClick={() => {
                const prev = Math.max(0, telemetryTick - 50);
                setTelemetryTick(prev);
              }}
            >
              ◄
            </button>
          </Tooltip>

          <Tooltip label="Replay historical sensor logs to observe gradual wear signatures" placement="top">
            <button
              className="playback-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          </Tooltip>

          {/* Speed controls */}
          {[1, 2, 5].map(speed => (
            <Tooltip key={speed} label={`Adjust telemetry playback to ${speed}× speed`} placement="top">
              <button
                className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </button>
            </Tooltip>
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
              <Tooltip key={vm.id} label={vm.tooltip} placement="top">
                <button
                  className={`view-toggle-btn ${viewMode === vm.id ? 'active' : ''}`}
                  onClick={() => setViewMode(vm.id)}
                >
                  {vm.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Row 2: Fault injection + Work order */}
        <div className="bottom-row" data-tour-id="fault-injection">
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
            <Tooltip key={scenario.id} label={scenario.description} placement="top">
              <button
                className={`fault-btn ${activeFault === scenario.id ? 'active' : ''}`}
                onClick={() => injectFault(scenario.id)}
              >
                {scenario.icon} {scenario.label.replace('Inject ', '')}
              </button>
            </Tooltip>
          ))}

          <Tooltip label="Clear active fault and reset telemetry" placement="top">
            <button
              className="fault-btn reset"
              onClick={clearFault}
            >
              🔄 Reset
            </button>
          </Tooltip>

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
