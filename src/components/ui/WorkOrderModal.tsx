import { useStore } from '../../store/useStore';
import { FAULT_SCENARIOS } from '../../data/faultScenarios';
import { formatValue } from '../../lib/utils';

export function WorkOrderModal() {
  const showWorkOrder = useStore(s => s.showWorkOrder);
  const setShowWorkOrder = useStore(s => s.setShowWorkOrder);
  const selectedTrain = useStore(s => s.selectedTrain);
  const activeFault = useStore(s => s.activeFault);
  const currentTick = useStore(s => s.getEffectiveTick());
  const anomalyScores = useStore(s => s.anomalyScores);
  const clearFault = useStore(s => s.clearFault);

  if (!showWorkOrder) return null;

  const scenario = activeFault
    ? FAULT_SCENARIOS.find(f => f.id === activeFault)
    : null;

  const now = new Date();
  const workOrderId = `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const handleClose = () => {
    setShowWorkOrder(false);
    clearFault();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div>
            <div className="modal-title">Maintenance Work Order</div>
            <div className="modal-subtitle">
              Auto-generated from anomaly detection — {workOrderId}
            </div>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Asset Information</div>
          <div className="modal-field">
            <span className="modal-field-label">Train Model</span>
            <span className="modal-field-value">{selectedTrain.model}</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Car Number</span>
            <span className="modal-field-value">{selectedTrain.carNumber}</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">MRT Line</span>
            <span className="modal-field-value">{selectedTrain.line}</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Affected Subsystem</span>
            <span className="modal-field-value" style={{ color: '#EF4444' }}>
              {scenario ? scenario.affectedSubsystem.toUpperCase() : 'BOGIE & BEARINGS'}
            </span>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Anomaly Summary</div>
          <div className="modal-field">
            <span className="modal-field-label">Detection Method</span>
            <span className="modal-field-value">Autoencoder + LSTM Consensus</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Anomaly Score</span>
            <span className="modal-field-value" style={{ color: '#EF4444' }}>
              {Math.round(Math.max(anomalyScores.autoencoder, anomalyScores.lstm) * 100)}%
            </span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Fault Type</span>
            <span className="modal-field-value">
              {scenario?.label.replace('Inject ', '') || 'Bearing Degradation'}
            </span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Priority</span>
            <span className="modal-field-value" style={{
              color: '#EF4444',
              background: 'rgba(239, 68, 68, 0.15)',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              P1 — CRITICAL
            </span>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Sensor Snapshot at Detection</div>
          <div className="modal-field">
            <span className="modal-field-label">Bearing Temp</span>
            <span className="modal-field-value">{formatValue(currentTick.bearingTemp)}°C</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Bogie Vibration</span>
            <span className="modal-field-value">{formatValue(currentTick.bogieVibration)} mm/s</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Motor Current</span>
            <span className="modal-field-value">{formatValue(currentTick.motorCurrent)} A</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Acoustic Emission</span>
            <span className="modal-field-value">{formatValue(currentTick.acousticEmission)} dB</span>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Recommended Actions</div>
          <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
            1. Route train to Bishan Depot for inspection<br />
            2. Inspect Bearing 1A journal for pitting / spalling marks<br />
            3. Check bearing grease condition and temperature history<br />
            4. Replace bearing assembly if raceway damage confirmed<br />
            5. Verify traction motor alignment post-replacement
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Assignment</div>
          <div className="modal-field">
            <span className="modal-field-label">Assigned Depot</span>
            <span className="modal-field-value">Bishan Depot</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Team</span>
            <span className="modal-field-value">Wheelset Maintenance Crew B</span>
          </div>
          <div className="modal-field">
            <span className="modal-field-label">Est. Downtime</span>
            <span className="modal-field-value">~4 hours</span>
          </div>
        </div>

        <button className="modal-close-btn" onClick={handleClose}>
          ✓ Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
