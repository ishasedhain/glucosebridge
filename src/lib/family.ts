import { Reading } from './storage';
import { statusFor } from './status';
import { computeStats } from './stats';

// Builds a short, plain-language text message about the latest reading.
// The list must be newest first.
export function familyMessage(readingsNewestFirst: Reading[]): string {
  const latest = readingsNewestFirst[0];
  const st = statusFor(latest.value);
  const recent = readingsNewestFirst.slice(0, 7);
  const s = computeStats(recent);
  const when = new Date(latest.time).toLocaleString();

  const lines = [
    'Blood sugar update from Glucose Bridge',
    '',
    `Latest reading: ${latest.value} mg/dL (${latest.tag})`,
    `When: ${when}`,
    `Status: ${st.label}`,
  ];

  if (s && recent.length > 1) {
    lines.push(
      `Last ${recent.length} readings: average ${s.avg} mg/dL, ${s.pctInRange}% in range.`
    );
  }

  lines.push('', 'This is a logging tool, not medical advice.');
  return lines.join('\n');
}
