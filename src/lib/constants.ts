// ── Design System Colors ──
export const COLORS = {
  bg: {
    deep: '#090D16',
    panel: 'rgba(15, 23, 42, 0.65)',
    panelSolid: '#0F172A',
    hover: 'rgba(15, 23, 42, 0.85)',
  },
  border: {
    panel: 'rgba(148, 163, 184, 0.12)',
    active: 'rgba(6, 182, 212, 0.4)',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  accent: {
    cyan: '#06B6D4',
    cyanDim: 'rgba(6, 182, 212, 0.15)',
  },
  status: {
    normal: '#10B981',
    normalDim: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningDim: 'rgba(245, 158, 11, 0.15)',
    critical: '#EF4444',
    criticalDim: 'rgba(239, 68, 68, 0.15)',
    criticalGlow: '#FF3B3B',
  },
  chart: {
    grid: 'rgba(148, 163, 184, 0.08)',
    line1: '#06B6D4',
    line2: '#8B5CF6',
    line3: '#F59E0B',
    thresholdAmber: 'rgba(245, 158, 11, 0.12)',
    thresholdRed: 'rgba(239, 68, 68, 0.12)',
  },
  three: {
    bodyGrey: 0x8892a0,
    windowDark: 0x1a2332,
    bogieSteel: 0x6b7280,
    brakeMetal: 0x9ca3af,
    doorPanel: 0x64748b,
    hvacUnit: 0x78716c,
    glowGreen: 0x10b981,
    glowAmber: 0xf59e0b,
    glowRed: 0xef4444,
    accentRed: 0xdc2626,
    accentGreen: 0x16a34a,
  },
} as const;

// ── Anomaly Thresholds ──
export const THRESHOLDS = {
  normal: 0.3,
  warning: 0.55,
  critical: 0.75,
  emergency: 0.9,
} as const;

// ── Sensor Normal Operating Ranges ──
export const SENSOR_RANGES = {
  bearingTemp: { min: 45, max: 55, warnHigh: 70, critHigh: 85, unit: '°C', label: 'Bearing Temp' },
  bogieVibration: { min: 1.2, max: 2.0, warnHigh: 3.5, critHigh: 5.0, unit: 'mm/s', label: 'Bogie Vibration' },
  motorCurrent: { min: 120, max: 140, warnHigh: 165, critHigh: 190, unit: 'A', label: 'Motor Current' },
  brakePressure: { min: 4.8, max: 5.2, warnLow: 3.5, critLow: 2.5, unit: 'bar', label: 'Brake Pressure' },
  doorCycleCurrent: { min: 8, max: 12, warnHigh: 18, critHigh: 22, unit: 'A', label: 'Door Cycle Current' },
  hvacCompressorTemp: { min: 38, max: 42, warnHigh: 48, critHigh: 55, unit: '°C', label: 'HVAC Compressor Temp' },
  acousticEmission: { min: 45, max: 52, warnHigh: 62, critHigh: 72, unit: 'dB', label: 'Acoustic Emission' },
} as const;

// ── Subsystem Definitions ──
export type SubsystemId = 'bogie' | 'brakes' | 'doors' | 'hvac';

export interface SubsystemConfig {
  id: SubsystemId;
  label: string;
  shortLabel: string;
  primarySensors: (keyof typeof SENSOR_RANGES)[];
  cameraTarget: [number, number, number];
  cameraDistance: number;
  color: number;
}

export const SUBSYSTEMS: SubsystemConfig[] = [
  {
    id: 'bogie',
    label: 'Bogie & Bearings',
    shortLabel: 'Bogie',
    primarySensors: ['bearingTemp', 'bogieVibration', 'acousticEmission'],
    cameraTarget: [0, -0.8, 3],
    cameraDistance: 5,
    color: 0x3b82f6,
  },
  {
    id: 'brakes',
    label: 'Pneumatic Brakes',
    shortLabel: 'Brakes',
    primarySensors: ['brakePressure'],
    cameraTarget: [0, -0.8, -3],
    cameraDistance: 5,
    color: 0xf59e0b,
  },
  {
    id: 'doors',
    label: 'Bi-Parting Doors',
    shortLabel: 'Doors',
    primarySensors: ['doorCycleCurrent', 'motorCurrent'],
    cameraTarget: [2.5, 0.5, 0],
    cameraDistance: 6,
    color: 0x8b5cf6,
  },
  {
    id: 'hvac',
    label: 'Roof HVAC Pack',
    shortLabel: 'HVAC',
    primarySensors: ['hvacCompressorTemp'],
    cameraTarget: [0, 2.5, 0],
    cameraDistance: 7,
    color: 0x06b6d4,
  },
];

// ── ML Model Definitions ──
export type ModelId = 'isoForest' | 'autoencoder' | 'lstm';

export interface ModelConfig {
  id: ModelId;
  label: string;
  latency: string;
  leadTime: string;
  strength: string;
}

export const ML_MODELS: ModelConfig[] = [
  {
    id: 'isoForest',
    label: 'Isolation Forest',
    latency: '< 5ms',
    leadTime: '~15 mins',
    strength: 'Catches sudden spikes & sensor outliers',
  },
  {
    id: 'autoencoder',
    label: 'Autoencoder',
    latency: '~20ms',
    leadTime: '~2 hours',
    strength: 'Captures multi-sensor non-linear correlations',
  },
  {
    id: 'lstm',
    label: 'LSTM Drift',
    latency: '~45ms',
    leadTime: '~8-12 hours',
    strength: 'Catches gradual degradation patterns',
  },
];

// ── Timing Constants ──
export const TICK_INTERVAL_MS = 1000;
export const TOTAL_TICKS = 500;
export const ROLLING_WINDOW = 60;
export const FAULT_RAMP_TICKS = 15;
export const CAMERA_LERP_DURATION = 2.0;
