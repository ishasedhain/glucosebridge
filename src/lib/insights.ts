import { Reading } from './storage';
import { computeStats } from './stats';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

// Rounded average of a list of numbers.
function average(vals: number[]) {
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Average reading for each tag that has at least 2 readings.
export function tagAverages(readings: Reading[]) {
  return TAGS.map(tag => {
    const vals = readings.filter(r => r.tag === tag).map(r => r.value);
    return { tag, count: vals.length, avg: vals.length ? average(vals) : 0 };
  }).filter(t => t.count >= 2);
}

// Plain-language patterns found in the user's own readings.
// These describe the data only. They are not medical advice.
export function getInsights(readings: Reading[]): string[] {
  if (readings.length < 4) {
    return ['Add a few more readings to see patterns.'];
  }
  const out: string[] = [];
  const avgs = tagAverages(readings);

  avgs.forEach(t => {
    out.push(`${t.tag}: average ${t.avg} mg/dL (${t.count} readings)`);
  });

  // After meals vs before meals
  const before = avgs.find(t => t.tag === 'Before meal');
  const after = avgs.find(t => t.tag === 'After meal');
  if (before && after) {
    const diff = after.avg - before.avg;
    if (Math.abs(diff) >= 20) {
      out.push(`Readings after meals average ${Math.abs(diff)} mg/dL ${diff > 0 ? 'higher' : 'lower'} than readings before meals.`);
    }
  }

  // Morning (before noon) vs evening (5 pm or later)
  const morning = readings.filter(r => new Date(r.time).getHours() < 12).map(r => r.value);
  const evening = readings.filter(r => new Date(r.time).getHours() >= 17).map(r => r.value);
  if (morning.length >= 3 && evening.length >= 3) {
    const diff = average(evening) - average(morning);
    if (Math.abs(diff) >= 20) {
      out.push(`Evening readings average ${Math.abs(diff)} mg/dL ${diff > 0 ? 'higher' : 'lower'} than morning readings.`);
    }
  }

  // Newest 7 readings vs the 7 before them
  if (readings.length >= 8) {
    const recent = readings.slice(-7).map(r => r.value);
    const earlier = readings.slice(-14, -7).map(r => r.value);
    if (earlier.length >= 3) {
      const diff = average(recent) - average(earlier);
      if (Math.abs(diff) >= 15) {
        out.push(`Your latest readings average ${Math.abs(diff)} mg/dL ${diff > 0 ? 'higher' : 'lower'} than the ones before them.`);
      }
    }
  }

  // Readings under 70
  const lows = readings.filter(r => r.value < 70).length;
  if (lows > 0) {
    out.push(`${lows} of your ${readings.length} readings were below 70 mg/dL.`);
  }

  return out;
}

// Builds the text that the "Hear it" button reads out loud.
export function spokenSummary(readings: Reading[]): string {
  const s = computeStats(readings);
  if (!s) return 'You have no readings yet.';
  const latest = readings[readings.length - 1];
  const parts = [
    `You have ${s.count} readings.`,
    `Your latest reading is ${latest.value}, tagged ${latest.tag}.`,
    `Your average is ${s.avg}.`,
    `${s.pctInRange} percent of your readings are in the standard range.`,
  ];
  getInsights(readings)
    .filter(i => i.includes(' than '))
    .forEach(i => parts.push(i));
  parts.push("This is a logging tool, not medical advice. Please follow your doctor's guidance.");
  return parts.join(' ');
}
