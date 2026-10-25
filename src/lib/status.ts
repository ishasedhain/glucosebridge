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
      color: '#e48a8a',
      bg: '#fbe3e3',
      note: "Follow your doctor's guidance.",
    };
  }
  return {
    label: 'In the standard range',
    color: '#6da67a',
    bg: '#e3f1e6',
    note: `Standard range: ${low} to ${high} mg/dL. Ask your doctor for yours.`,
  };
}
