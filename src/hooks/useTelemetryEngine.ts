import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { TICK_INTERVAL_MS } from '../lib/constants';

/** Drives the telemetry playback loop at TICK_INTERVAL_MS intervals */
export function useTelemetryEngine() {
  const isPlaying = useStore(s => s.isPlaying);
  const playbackSpeed = useStore(s => s.playbackSpeed);
  const advanceTick = useStore(s => s.advanceTick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        advanceTick();
      }, TICK_INTERVAL_MS / playbackSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, advanceTick]);
}
