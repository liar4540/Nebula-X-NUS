import { useStore } from '../../store/useStore';
import { TRAIN_CONFIGS } from '../../data/trainConfigs';

export function TopBar() {
  const selectedTrain = useStore(s => s.selectedTrain);
  const setSelectedTrain = useStore(s => s.setSelectedTrain);
  const globalStatus = useStore(s => s.globalStatus);
  const demoMode = useStore(s => s.demoMode);
  const setDemoMode = useStore(s => s.setDemoMode);
  const subsystemHealth = useStore(s => s.subsystemHealth);

  // Fleet health: % of subsystems that are normal
  const normalCount = Object.values(subsystemHealth).filter(s => s < 0.3).length;
  const fleetPercent = Math.round((normalCount / 4) * 100);

  const statusLabel = globalStatus === 'anomaly'
    ? 'ANOMALY DETECTED'
    : globalStatus === 'evaluating'
      ? 'EVALUATING'
      : 'ALL SYSTEMS NORMAL';

  // Group trains by line
  const lineGroups = TRAIN_CONFIGS.reduce((acc, train) => {
    if (!acc[train.line]) acc[train.line] = [];
    acc[train.line].push(train);
    return acc;
  }, {} as Record<string, typeof TRAIN_CONFIGS>);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <span className="logo-mark">NEBULA DTWIN</span>

          <select
            className="train-selector"
            value={selectedTrain.id}
            onChange={(e) => setSelectedTrain(e.target.value)}
          >
            {Object.entries(lineGroups).map(([line, trains]) => (
              <optgroup key={line} label={line}>
                {trains.map(train => (
                  <option key={train.id} value={train.id}>
                    {train.model} / Car {train.carNumber}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className={`status-pill ${globalStatus}`}>
            <div className="status-dot" />
            {statusLabel}
          </div>
        </div>

        <div className="topbar-right">
          <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
            Fleet Status: {fleetPercent}% Normal
          </span>

          <div
            className="demo-badge"
            onClick={() => setDemoMode(!demoMode)}
          >
            Demo Mode [{demoMode ? 'ON' : 'OFF'}]
          </div>
        </div>
      </div>
    </div>
  );
}
