import { formatBytes, formatNumber } from './format';

describe('format helpers', () => {
  it('formats byte sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('formats optional numbers', () => {
    expect(formatNumber(0.456)).toBe('0.46');
    expect(formatNumber(null)).toBe('—');
  });
});
