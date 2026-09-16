import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function inverseLerp(a: number, b: number, v: number): number {
  if (a === b) return 0;
  return Math.max(0, Math.min(1, (v - a) / (b - a)));
}

export function formatValue(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatTime(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getStatusColor(score: number): string {
  if (score >= 0.75) return '#EF4444';
  if (score >= 0.55) return '#F59E0B';
  return '#10B981';
}

export function getStatusLabel(score: number): string {
  if (score >= 0.75) return 'CRITICAL';
  if (score >= 0.55) return 'WARNING';
  return 'NORMAL';
}

export function getHealthPercent(score: number): number {
  return Math.round(Math.max(0, (1 - score)) * 100);
}

/** Gaussian noise around a mean */
export function gaussianNoise(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stddev;
}

/** Smooth step for fault ramps */
export function smoothStep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
