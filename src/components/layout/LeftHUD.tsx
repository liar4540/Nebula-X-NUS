import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { useStore } from '../../store/useStore';
import { SUBSYSTEMS, SENSOR_RANGES, type SubsystemId } from '../../lib/constants';
import { getStatusColor, getStatusLabel, getHealthPercent, formatValue } from '../../lib/utils';

export function LeftHUD() {
  const selectedSubsystem = useStore(s => s.selectedSubsystem);
  const setSelectedSubsystem = useStore(s => s.setSelectedSubsystem);
  const subsystemHealth = useStore(s => s.subsystemHealth);
  const sensorWindow = useStore(s => s.sensorWindow);
  const currentTick = useStore(s => s.getEffectiveTick());

  return (
    <div className="left-hud">
      <div className="left-hud-inner glass-panel-solid">
        <div className="hud-section-title" data-tour-id="subsystem-health">Monitored Subsystems</div>

        {SUBSYSTEMS.map(sub => {
          const score = subsystemHealth[sub.id] ?? 0;
          const health = getHealthPercent(score);
          const color = getStatusColor(score);
          const label = getStatusLabel(score);
          const isActive = selectedSubsystem === sub.id;

          return (
            <div
              key={sub.id}
              className={`subsystem-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedSubsystem(isActive ? null : sub.id)}
            >
              <div className="subsystem-card-header">
                <span className="subsystem-name">{sub.label}</span>
                <span className={`subsystem-status-badge ${label.toLowerCase()}`}>
                  {label}
                </span>
              </div>
              <div className="health-bar-container">
                <div className="health-bar-track">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${health}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="health-bar-label" style={{ color }}>
                  {health}%
                </span>
              </div>
            </div>
          );
        })}

        <div className="hud-section-title" style={{ marginTop: 8 }}>Live Sensor Readings</div>

        <div className="sensor-readings">
          <SensorRow label="Bearing Temp" value={currentTick.bearingTemp} unit="°C" warn={70} crit={85} />
          <SensorRow label="Bogie Vibration" value={currentTick.bogieVibration} unit="mm/s" warn={3.5} crit={5.0} />
          <SensorRow label="Motor Current" value={currentTick.motorCurrent} unit="A" warn={165} crit={190} />
          <SensorRow label="Brake Pressure" value={currentTick.brakePressure} unit="bar" warn={3.5} crit={2.5} invertWarn />
          <SensorRow label="Door Current" value={currentTick.doorCycleCurrent} unit="A" warn={18} crit={22} />
          <SensorRow label="HVAC Temp" value={currentTick.hvacCompressorTemp} unit="°C" warn={48} crit={55} />
          <SensorRow label="Acoustic dB" value={currentTick.acousticEmission} unit="dB" warn={62} crit={72} />
        </div>

        {/* Sensor Chart */}
        <div className="chart-container" style={{ marginTop: 8 }}>
          <div className="chart-title">
            {selectedSubsystem
              ? `${SUBSYSTEMS.find(s => s.id === selectedSubsystem)?.shortLabel} — Primary Sensor`
              : 'Bearing Temperature Trend'}
          </div>
          <SensorChart
            subsystemId={selectedSubsystem}
            data={sensorWindow}
          />
        </div>
      </div>
    </div>
  );
}

function SensorRow({
  label, value, unit, warn, crit, invertWarn = false
}: {
  label: string; value: number; unit: string; warn: number; crit: number; invertWarn?: boolean;
}) {
  const statusClass = invertWarn
    ? (value <= crit ? 'critical' : value <= warn ? 'warning' : 'normal')
    : (value >= crit ? 'critical' : value >= warn ? 'warning' : 'normal');

  return (
    <div className="sensor-row">
      <span className="sensor-label">{label}</span>
      <span className={`sensor-value ${statusClass}`}>
        {formatValue(value)} {unit}
      </span>
    </div>
  );
}

function SensorChart({ subsystemId, data }: { subsystemId: SubsystemId | null; data: any[] }) {
  // Determine which sensor to chart
  const sensorKey = useMemo(() => {
    if (!subsystemId) return 'bearingTemp';
    const sub = SUBSYSTEMS.find(s => s.id === subsystemId);
    return sub?.primarySensors[0] ?? 'bearingTemp';
  }, [subsystemId]);

  const range = SENSOR_RANGES[sensorKey as keyof typeof SENSOR_RANGES];

  const chartData = useMemo(() => {
    return data.map((tick, i) => ({
      idx: i,
      value: tick[sensorKey] as number,
    }));
  }, [data, sensorKey]);

  const warnHigh = (range as any).warnHigh;
  const critHigh = (range as any).critHigh;
  const warnLow = (range as any).warnLow;
  const critLow = (range as any).critLow;

  // Calculate Y domain
  const values = chartData.map(d => d.value);
  const minVal = Math.min(...values, range.min - 5);
  const maxVal = Math.max(...values, (warnHigh || range.max) + 10);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        {/* Threshold bands */}
        {warnHigh && critHigh && (
          <>
            <ReferenceArea
              y1={warnHigh}
              y2={critHigh}
              fill="rgba(245, 158, 11, 0.08)"
              strokeOpacity={0}
            />
            <ReferenceArea
              y1={critHigh}
              y2={maxVal + 20}
              fill="rgba(239, 68, 68, 0.08)"
              strokeOpacity={0}
            />
          </>
        )}
        {warnLow && critLow && (
          <>
            <ReferenceArea
              y1={critLow}
              y2={warnLow}
              fill="rgba(245, 158, 11, 0.08)"
              strokeOpacity={0}
            />
            <ReferenceArea
              y1={0}
              y2={critLow}
              fill="rgba(239, 68, 68, 0.08)"
              strokeOpacity={0}
            />
          </>
        )}

        {/* Threshold lines */}
        {warnHigh && (
          <ReferenceLine y={warnHigh} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
        )}
        {critHigh && (
          <ReferenceLine y={critHigh} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
        )}
        {warnLow && (
          <ReferenceLine y={warnLow} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
        )}
        {critLow && (
          <ReferenceLine y={critLow} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
        )}

        <XAxis dataKey="idx" hide />
        <YAxis
          domain={[minVal, maxVal]}
          tick={{ fill: '#64748B', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          tickLine={false}
          axisLine={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#06B6D4"
          strokeWidth={2}
          fill="url(#chartGradient)"
          dot={false}
          isAnimationActive={false}
        />
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.02} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}
