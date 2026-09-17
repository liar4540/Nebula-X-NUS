import { gaussianNoise, smoothStep } from '../lib/utils';
import { TOTAL_TICKS } from '../lib/constants';

export interface TelemetryTick {
  timestamp: number;
  bearingTemp: number;
  bogieVibration: number;
  motorCurrent: number;
  brakePressure: number;
  doorCycleCurrent: number;
  hvacCompressorTemp: number;
  acousticEmission: number;
  isoForestScore: number;
  autoencoderScore: number;
  lstmScore: number;
  shapValues: Record<string, number>;
}

function clampMin(v: number, min: number): number {
  return Math.max(min, v);
}

/**
 * Generate pre-computed telemetry stream.
 * - Ticks 0-199: Normal baseline
 * - Ticks 200-349: Subtle drift (LSTM catches it)
 * - Ticks 350-499: Acute anomaly (all models flag it)
 */
export function generateMockTelemetry(): TelemetryTick[] {
  const ticks: TelemetryTick[] = [];
  const baseTime = Date.now() - TOTAL_TICKS * 1000;

  for (let i = 0; i < TOTAL_TICKS; i++) {
    // Phase detection
    const isDrift = i >= 200 && i < 350;
    const isAcute = i >= 350;

    // Drift progress (0-1 within drift phase)
    const driftP = isDrift ? (i - 200) / 150 : isAcute ? 1 : 0;
    // Acute progress (0-1 within acute phase)
    const acuteP = isAcute ? (i - 350) / 150 : 0;

    // Bearing temperature: normal ~50°C, drift to ~62°C, acute to ~92°C
    const bearingTemp = clampMin(
      gaussianNoise(50, 1.5) +
      driftP * 12 +
      smoothStep(acuteP) * 30,
      30
    );

    // Bogie vibration: normal ~1.6, drift to ~2.8, acute to ~6.2
    const bogieVibration = clampMin(
      gaussianNoise(1.6, 0.2) +
      driftP * 1.2 +
      smoothStep(acuteP) * 3.4,
      0.2
    );

    // Motor current: normal ~130A, slight increase in acute
    const motorCurrent = clampMin(
      gaussianNoise(130, 4) +
      smoothStep(acuteP) * 12,
      80
    );

    // Brake pressure: normal ~5.0 bar, stable
    const brakePressure = clampMin(
      gaussianNoise(5.0, 0.08),
      2.0
    );

    // Door cycle current: normal ~10A
    const doorCycleCurrent = clampMin(
      gaussianNoise(10, 0.8),
      4
    );

    // HVAC: normal ~40°C
    const hvacCompressorTemp = clampMin(
      gaussianNoise(40, 0.8),
      25
    );

    // Acoustic emission: normal ~48dB, drift, then spike
    const acousticEmission = clampMin(
      gaussianNoise(48, 1.5) +
      driftP * 8 +
      smoothStep(acuteP) * 22,
      30
    );

    // Model scores
    // LSTM detects drift early
    const lstmScore = Math.min(1, Math.max(0,
      gaussianNoise(0.08, 0.02) +
      smoothStep(driftP) * 0.45 +
      smoothStep(acuteP) * 0.35
    ));

    // Autoencoder catches mid-drift
    const autoencoderScore = Math.min(1, Math.max(0,
      gaussianNoise(0.05, 0.015) +
      smoothStep(driftP * 0.6) * 0.25 +
      smoothStep(acuteP) * 0.62
    ));

    // Isolation Forest only spikes on acute anomalies
    const isoForestScore = Math.min(1, Math.max(0,
      gaussianNoise(0.06, 0.02) +
      (driftP > 0.8 ? smoothStep((driftP - 0.8) / 0.2) * 0.15 : 0) +
      smoothStep(acuteP) * 0.72
    ));

    // SHAP values (dominant for bearing fault scenario)
    const maxScore = Math.max(isoForestScore, autoencoderScore, lstmScore);
    const shapValues: Record<string, number> = {
      'Vibration Z-Axis RMS': maxScore > 0.2 ? 0.48 * (maxScore / 0.9) : 0.05,
      'Bearing Temperature': maxScore > 0.2 ? 0.32 * (maxScore / 0.9) : 0.04,
      'Acoustic Emission': maxScore > 0.2 ? 0.14 * (maxScore / 0.9) : 0.03,
      'Motor Current Draw': maxScore > 0.15 ? 0.06 * (maxScore / 0.9) : 0.02,
    };

    ticks.push({
      timestamp: baseTime + i * 1000,
      bearingTemp,
      bogieVibration,
      motorCurrent,
      brakePressure,
      doorCycleCurrent,
      hvacCompressorTemp,
      acousticEmission,
      isoForestScore,
      autoencoderScore,
      lstmScore,
      shapValues,
    });
  }

  return ticks;
}

// Pre-generate the telemetry data once
export const MOCK_TELEMETRY = generateMockTelemetry();
