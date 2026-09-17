import { create } from 'zustand';
import type { SubsystemId, ModelId } from '../lib/constants';
import type { TelemetryTick } from '../data/mockTelemetry';
import type { FaultType, SensorModifiers } from '../data/faultScenarios';
import type { TrainConfig } from '../data/trainConfigs';
import { TRAIN_CONFIGS } from '../data/trainConfigs';
import { MOCK_TELEMETRY } from '../data/mockTelemetry';
import { FAULT_SCENARIOS } from '../data/faultScenarios';
import { ROLLING_WINDOW, TOTAL_TICKS, THRESHOLDS } from '../lib/constants';

export type ViewMode = 'solid' | 'xray' | 'exploded';
export type GlobalStatus = 'normal' | 'evaluating' | 'anomaly';

interface SubsystemHealth {
  bogie: number;   // anomaly score 0-1
  brakes: number;
  doors: number;
  hvac: number;
}

interface StoreState {
  // Train selection
  selectedTrain: TrainConfig;
  setSelectedTrain: (id: string) => void;

  // Subsystem focus
  selectedSubsystem: SubsystemId | null;
  setSelectedSubsystem: (id: SubsystemId | null) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Telemetry playback
  telemetryTick: number;
  setTelemetryTick: (tick: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  // Fault injection
  activeFault: FaultType | null;
  faultProgress: number; // 0-1
  injectFault: (fault: FaultType) => void;
  clearFault: () => void;
  updateFaultProgress: (delta: number) => void;

  // ML model selection
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;

  // Derived state
  currentTick: TelemetryTick | null;
  sensorWindow: TelemetryTick[];
  anomalyScores: { isoForest: number; autoencoder: number; lstm: number };
  subsystemHealth: SubsystemHealth;
  globalStatus: GlobalStatus;
  shapValues: Record<string, number>;

  // Computed from tick + fault
  getEffectiveTick: () => TelemetryTick;

  // Demo
  demoMode: boolean;
  setDemoMode: (on: boolean) => void;

  // Work order
  showWorkOrder: boolean;
  setShowWorkOrder: (show: boolean) => void;

  // Advance tick (called by playback engine)
  advanceTick: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

function applyFaultModifiers(tick: TelemetryTick, modifiers: SensorModifiers): TelemetryTick {
  return {
    ...tick,
    bearingTemp: tick.bearingTemp + modifiers.bearingTemp,
    bogieVibration: tick.bogieVibration + modifiers.bogieVibration,
    motorCurrent: tick.motorCurrent + modifiers.motorCurrent,
    brakePressure: tick.brakePressure + modifiers.brakePressure,
    doorCycleCurrent: tick.doorCycleCurrent + modifiers.doorCycleCurrent,
    hvacCompressorTemp: tick.hvacCompressorTemp + modifiers.hvacCompressorTemp,
    acousticEmission: tick.acousticEmission + modifiers.acousticEmission,
    isoForestScore: Math.min(1, tick.isoForestScore + modifiers.isoForestScore),
    autoencoderScore: Math.min(1, tick.autoencoderScore + modifiers.autoencoderScore),
    lstmScore: Math.min(1, tick.lstmScore + modifiers.lstmScore),
    shapValues: Object.keys(modifiers.shapValues).length > 0
      ? modifiers.shapValues
      : tick.shapValues,
  };
}

function computeSubsystemHealth(tick: TelemetryTick): SubsystemHealth {
  return {
    bogie: Math.max(tick.isoForestScore, tick.autoencoderScore, tick.lstmScore),
    brakes: tick.brakePressure < 3.5 ? 0.7 : tick.brakePressure < 4.0 ? 0.4 : 0.08,
    doors: tick.doorCycleCurrent > 18 ? 0.75 : tick.doorCycleCurrent > 14 ? 0.4 : 0.06,
    hvac: tick.hvacCompressorTemp > 48 ? 0.5 : 0.05,
  };
}

function computeGlobalStatus(health: SubsystemHealth): GlobalStatus {
  const max = Math.max(health.bogie, health.brakes, health.doors, health.hvac);
  if (max >= THRESHOLDS.critical) return 'anomaly';
  if (max >= THRESHOLDS.warning) return 'evaluating';
  return 'normal';
}

export const useStore = create<StoreState>((set, get) => ({
  // Train
  selectedTrain: TRAIN_CONFIGS[0],
  setSelectedTrain: (id) => {
    const train = TRAIN_CONFIGS.find(t => t.id === id);
    if (train) set({ selectedTrain: train });
  },

  // Subsystem
  selectedSubsystem: null,
  setSelectedSubsystem: (id) => set({ selectedSubsystem: id }),

  // View
  viewMode: 'solid',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Playback
  telemetryTick: 0,
  setTelemetryTick: (tick) => {
    const clamped = Math.max(0, Math.min(TOTAL_TICKS - 1, tick));
    set({
      telemetryTick: clamped,
      currentTick: MOCK_TELEMETRY[clamped],
      sensorWindow: MOCK_TELEMETRY.slice(
        Math.max(0, clamped - ROLLING_WINDOW + 1),
        clamped + 1
      ),
    });
    // Update derived
    const tick2 = get().getEffectiveTick();
    const health2 = computeSubsystemHealth(tick2);
    set({
      anomalyScores: {
        isoForest: tick2.isoForestScore,
        autoencoder: tick2.autoencoderScore,
        lstm: tick2.lstmScore,
      },
      subsystemHealth: health2,
      globalStatus: computeGlobalStatus(health2),
      shapValues: tick2.shapValues,
    });
  },
  isPlaying: true,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  playbackSpeed: 1,
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // Fault
  activeFault: null,
  faultProgress: 0,
  injectFault: (fault) => set({ activeFault: fault, faultProgress: 0 }),
  clearFault: () => set({ activeFault: null, faultProgress: 0 }),
  updateFaultProgress: (delta) => {
    const current = get().faultProgress;
    set({ faultProgress: Math.min(1, current + delta) });
  },

  // Model
  selectedModel: 'autoencoder',
  setSelectedModel: (model) => set({ selectedModel: model }),

  // Derived defaults
  currentTick: MOCK_TELEMETRY[0],
  sensorWindow: MOCK_TELEMETRY.slice(0, 1),
  anomalyScores: { isoForest: 0.06, autoencoder: 0.05, lstm: 0.08 },
  subsystemHealth: { bogie: 0.08, brakes: 0.08, doors: 0.06, hvac: 0.05 },
  globalStatus: 'normal',
  shapValues: {},

  // Effective tick with fault modifiers applied
  getEffectiveTick: () => {
    const state = get();
    const baseTick = MOCK_TELEMETRY[state.telemetryTick] || MOCK_TELEMETRY[0];
    if (!state.activeFault || state.faultProgress <= 0) return baseTick;

    const scenario = FAULT_SCENARIOS.find(f => f.id === state.activeFault);
    if (!scenario) return baseTick;

    const modifiers = scenario.apply(state.faultProgress);
    return applyFaultModifiers(baseTick, modifiers);
  },

  // Demo
  demoMode: true,
  setDemoMode: (on) => set({ demoMode: on }),

  // Work order
  showWorkOrder: false,
  setShowWorkOrder: (show) => set({ showWorkOrder: show }),

  // Advance
  advanceTick: () => {
    const state = get();
    const nextTick = (state.telemetryTick + 1) % TOTAL_TICKS;

    // Advance fault progress if active
    if (state.activeFault) {
      const scenario = FAULT_SCENARIOS.find(f => f.id === state.activeFault);
      if (scenario) {
        const delta = 1 / scenario.rampTicks;
        state.updateFaultProgress(delta);
      }
    }

    state.setTelemetryTick(nextTick);
  },

  // Theme
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}));
