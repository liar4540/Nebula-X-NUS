import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ML_MODELS, type ModelId } from '../../lib/constants';
import { getStatusColor, getStatusLabel } from '../../lib/utils';

export function RightHUD() {
  const selectedModel = useStore(s => s.selectedModel);
  const setSelectedModel = useStore(s => s.setSelectedModel);
  const anomalyScores = useStore(s => s.anomalyScores);
  const shapValues = useStore(s => s.shapValues);

  // Get score for selected model
  const activeScore = anomalyScores[selectedModel] ?? 0;
  const scorePercent = Math.round(activeScore * 100);
  const scoreColor = getStatusColor(activeScore);
  const scoreLabel = getStatusLabel(activeScore);

  // Sort SHAP values descending
  const sortedShap = useMemo(() => {
    return Object.entries(shapValues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [shapValues]);

  const maxShap = sortedShap.length > 0 ? Math.max(...sortedShap.map(s => s[1]), 0.01) : 1;

  return (
    <div className="right-hud">
      <div className="right-hud-inner glass-panel-solid">
        <div className="hud-section-title">Live Anomaly Score</div>

        {/* Radial Gauge */}
        <div className="anomaly-gauge">
          <AnomalyGauge score={activeScore} color={scoreColor} />
          <div className="gauge-label" style={{ color: scoreColor }}>
            {scoreLabel}
          </div>
        </div>

        <div className="hud-section-title">Model Comparison</div>

        {/* Model Cards */}
        {ML_MODELS.map(model => {
          const isActive = selectedModel === model.id;
          const modelScore = anomalyScores[model.id] ?? 0;

          return (
            <div
              key={model.id}
              className={`model-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="model-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`model-radio ${isActive ? 'active' : ''}`} />
                  <span className="model-name">{model.label}</span>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: getStatusColor(modelScore),
                }}>
                  {Math.round(modelScore * 100)}%
                </span>
              </div>
              <div className="model-meta">
                <span>⏱ {model.latency}</span>
                <span>🔮 {model.leadTime}</span>
              </div>
              {isActive && (
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                  {model.strength}
                </div>
              )}
            </div>
          );
        })}

        <div className="hud-section-title" style={{ marginTop: 8 }}>
          Feature Attribution (SHAP)
        </div>

        {/* SHAP Bars */}
        <div className="shap-bar-container">
          {sortedShap.length === 0 && (
            <div style={{ fontSize: 11, color: '#64748B', padding: '8px 0', textAlign: 'center' }}>
              No significant features detected
            </div>
          )}
          {sortedShap.map(([name, value]) => (
            <div key={name} className="shap-bar-row">
              <div className="shap-bar-label">
                <span className="shap-bar-label-name">{name}</span>
                <span className="shap-bar-label-value">
                  +{Math.round(value * 100)}%
                </span>
              </div>
              <div className="shap-bar-track">
                <div
                  className="shap-bar-fill"
                  style={{ width: `${(value / maxShap) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** SVG Radial Anomaly Gauge */
function AnomalyGauge({ score, color }: { score: number; color: string }) {
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score);

  return (
    <svg className="gauge-svg" viewBox={`0 0 ${size} ${size}`}>
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148, 163, 184, 0.08)"
        strokeWidth={strokeWidth}
      />

      {/* Score arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease',
          filter: score > 0.75 ? `drop-shadow(0 0 6px ${color})` : 'none',
        }}
      />

      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2 - 8}
        textAnchor="middle"
        fill={color}
        fontSize="32"
        fontWeight="800"
        fontFamily="'JetBrains Mono', monospace"
        style={{ transition: 'fill 0.4s ease' }}
      >
        {Math.round(score * 100)}%
      </text>
      <text
        x={size / 2}
        y={size / 2 + 16}
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="10"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        letterSpacing="1"
      >
        RISK SCORE
      </text>
    </svg>
  );
}
