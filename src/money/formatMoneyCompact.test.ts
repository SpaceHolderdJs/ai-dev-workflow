import { describe, expect, it } from 'vitest';
import { formatMoneyCompact } from './formatMoneyCompact';

describe('formatMoneyCompact', () => {
  it.each([
    [0, '$0'],
    [950, '$950'],
    [999.4, '$999'],
    [999.6, '$1K'], // rounds to 1000, so it must carry to K
    [1_000, '$1K'],
    [12_345, '$12.3K'],
    [999_950, '$1M'], // the regression: used to read "$1000K"
    [1_250_000, '$1.3M'],
    [999_960_000, '$1B'],
    [3_400_000_000, '$3.4B'],
    [-585_340, '-$585.3K'],
  ])('%d -> %s', (amount, expected) => {
    expect(formatMoneyCompact(amount)).toBe(expected);
  });

  it('never renders a four-digit number in front of a unit', () => {
    for (let amount = 990_000; amount <= 1_010_000; amount += 50) {
      expect(formatMoneyCompact(amount)).not.toMatch(/\d{4}[KMB]$/);
    }
  });

  it('does not invent a figure for a missing value', () => {
    expect(formatMoneyCompact(Number.NaN)).toBe('—');
    expect(formatMoneyCompact(Number.POSITIVE_INFINITY)).toBe('—');
  });
});
