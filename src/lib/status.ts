// Turns a reading into plain words, a color, and a short note.
// low and high are the target range limits in mg/dL.
export function statusFor(value: number, low = 70, high = 180) {
  if (value < low) {
    return {
      label: 'Below the standard range',
      color: '#b45309',
      bg: '#fef3c7',
      note: "Follow your doctor's plan for low readings.",
    };
  }
  if (value > high) {
    return {
      label: 'Above the standard range',
      color: '#b91c1c',
      bg: '#fee2e2',
      note: "Follow your doctor's guidance.",
    };
  }
  return {
    label: 'In the standard range',
    color: '#0a7d3b',
    bg: '#dcfce7',
    note: `Standard range: ${low} to ${high} mg/dL. Ask your doctor for yours.`,
  };
}
