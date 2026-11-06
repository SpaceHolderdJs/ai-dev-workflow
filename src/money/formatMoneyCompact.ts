// Compact currency for dashboard headlines: $950, $12.3K, $1.2M, $3.4B.
//
// The bug that put this file under test: rounding was applied after picking
// the unit, so 999,950 rendered as "$1000K" instead of "$1M", and there was no
// billions unit at all. A carry after rounding now promotes to the next unit.

const UNITS = [
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
] as const;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatMoneyCompact(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '—';
  }

  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  // Pick the unit from the raw value, then round. If rounding carries the
  // figure to 1000 of that unit, promote it: 999.95K -> 1000K -> 1M.
  // Stryker disable next-line EqualityOperator: equivalent mutant - at an exact unit (1000, 1e6, 1e9) `>` falls to the unit below, scales to 1000 and carries back up to the same output.
  const index = UNITS.findIndex(unit => abs >= unit.value);
  const unit = UNITS[index];

  if (!unit) {
    const whole = Math.round(abs);
    return whole >= 1000 ? `${sign}$1K` : `${sign}$${whole}`;
  }

  const scaled = round1(abs / unit.value);
  const larger = UNITS[index - 1];

  if (scaled >= 1000 && larger) {
    return `${sign}$${round1(abs / larger.value)}${larger.suffix}`;
  }

  return `${sign}$${scaled}${unit.suffix}`;
}
