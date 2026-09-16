import type { SubsystemId } from '../lib/constants';

export type FaultType = 'bearingPitting' | 'doorObstacle' | 'brakeLeak';

export interface FaultScenario {
  id: FaultType;
  label: string;
  icon: string;
  affectedSubsystem: SubsystemId;
  description: string;
  rampTicks: number;
  /** Returns multipliers/offsets for each sensor at a given ramp progress (0-1) */
  apply: (progress: number) => SensorModifiers;
}

export interface SensorModifiers {
  bearingTemp: number;
  bogieVibration: number;
  motorCurrent: number;
  brakePressure: number;
  doorCycleCurrent: number;
  hvacCompressorTemp: number;
  acousticEmission: number;
  /** Anomaly score overrides per model */
  isoForestScore: number;
  autoencoderScore: number;
  lstmScore: number;
  /** SHAP values for explainability */
  shapValues: Record<string, number>;
}

const defaultModifiers = (): SensorModifiers => ({
  bearingTemp: 0,
  bogieVibration: 0,
  motorCurrent: 0,
  brakePressure: 0,
  doorCycleCurrent: 0,
  hvacCompressorTemp: 0,
  acousticEmission: 0,
  isoForestScore: 0,
  autoencoderScore: 0,
  lstmScore: 0,
  shapValues: {},
});

// Smooth step for natural ramps
function smoothStep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// Exponential ramp for aggressive escalation
function expRamp(t: number, power = 2): number {
  return Math.pow(Math.max(0, Math.min(1, t)), power);
}

export const FAULT_SCENARIOS: FaultScenario[] = [
  {
    id: 'bearingPitting',
    label: 'Inject Bearing Pitting',
    icon: '⚙️',
    affectedSubsystem: 'bogie',
    description: 'Increases high-frequency vibration and temperature over a 15-second ramp',
    rampTicks: 15,
    apply: (p: number): SensorModifiers => {
      const s = smoothStep(p);
      const e = expRamp(p, 2.5);
      return {
        ...defaultModifiers(),
        bearingTemp: s * 40,           // +40°C at peak → ~95°C
        bogieVibration: e * 4.5,       // +4.5 mm/s → ~6.5 mm/s
        acousticEmission: s * 26,      // +26 dB → ~78 dB
        motorCurrent: s * 8,           // slight increase from bearing drag
        isoForestScore: e * 0.65,      // spikes late
        autoencoderScore: s * 0.82,    // rises steadily
        lstmScore: smoothStep(p * 0.6) * 0.55, // flags early (drift)
        shapValues: {
          'Vibration Z-Axis RMS': 0.48 * s,
          'Bearing Temperature': 0.32 * s,
          'Acoustic Emission': 0.14 * s,
          'Motor Current Draw': 0.06 * s,
        },
      };
    },
  },
  {
    id: 'doorObstacle',
    label: 'Inject Door Obstacle',
    icon: '🚪',
    affectedSubsystem: 'doors',
    description: 'Spikes current draw during door closure cycle simulation',
    rampTicks: 15,
    apply: (p: number): SensorModifiers => {
      const s = smoothStep(p);
      // Door faults are more step-like — sudden spike
      const step = p > 0.3 ? smoothStep((p - 0.3) / 0.7) : 0;
      return {
        ...defaultModifiers(),
        doorCycleCurrent: step * 15,     // +15A → ~25A
        motorCurrent: step * 70,          // +70A → ~210A
        isoForestScore: step * 0.78,     // catches the spike
        autoencoderScore: s * 0.72,
        lstmScore: s * 0.4,
        shapValues: {
          'Door Cycle Current': 0.52 * step,
          'Motor Current Surge': 0.35 * step,
          'Cycle Duration': 0.08 * s,
          'Retry Count': 0.05 * s,
        },
      };
    },
  },
  {
    id: 'brakeLeak',
    label: 'Inject Brake Pressure Leak',
    icon: '🛑',
    affectedSubsystem: 'brakes',
    description: 'Slow pressure decay during simulated braking',
    rampTicks: 15,
    apply: (p: number): SensorModifiers => {
      const s = smoothStep(p);
      // Pressure decay is negative
      return {
        ...defaultModifiers(),
        brakePressure: -s * 3.0,         // -3.0 bar → ~2.1 bar
        isoForestScore: expRamp(p, 3) * 0.6,   // catches late
        autoencoderScore: s * 0.7,
        lstmScore: smoothStep(p * 0.5) * 0.65,  // catches early
        shapValues: {
          'Brake Line Pressure': 0.62 * s,
          'Pressure Decay Rate': 0.22 * s,
          'Brake Response Time': 0.11 * s,
          'Compressor Duty Cycle': 0.05 * s,
        },
      };
    },
  },
];
