import { Reading } from './storage';

// Turns a list of readings into the numbers shown on the Summary screen.
// low and high are the target range limits in mg/dL.
export function computeStats(readings: Reading[], low = 70, high = 180) {
  const n = readings.length;
  if (n === 0) return null;

  const vals = readings.map(r => r.value);
  const lows = vals.filter(v => v < low).length;
  const highs = vals.filter(v => v > high).length;
  const inRange = n - lows - highs;

  return {
    count: n,
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / n),
    min: Math.min(...vals),
    max: Math.max(...vals),
    lows,
    highs,
    pctLow: Math.round((lows / n) * 100),
    pctInRange: Math.round((inRange / n) * 100),
    pctHigh: Math.round((highs / n) * 100),
  };
}

// Picks a color for a reading: amber = low, green = in range, red = high.
export function rangeColor(value: number, low = 70, high = 180) {
  if (value < low) return '#d97706';
  if (value > high) return '#e48a8a';
  return '#25365d';
}