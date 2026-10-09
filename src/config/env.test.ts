import { resolveConfig } from './env';

describe('resolveConfig', () => {
  it('uses local development defaults when nothing is set', () => {
    expect(resolveConfig({}, {} as ImportMetaEnv)).toEqual({
      apiUrl: 'http://localhost:8080',
      pollIntervalMs: 10_000,
      mocksEnabled: false,
    });
  });

  it('prefers runtime config over build-time variables and strips trailing slashes', () => {
    expect(
      resolveConfig({ apiUrl: 'https://api.example.com/' }, {
        VITE_API_URL: 'http://ignored',
      } as ImportMetaEnv).apiUrl,
    ).toBe('https://api.example.com');
    expect(
      resolveConfig({ apiUrl: ' ' }, { VITE_API_URL: 'http://build/' } as ImportMetaEnv).apiUrl,
    ).toBe('http://build');
  });

  it('ignores an invalid poll interval', () => {
    expect(
      resolveConfig({}, { VITE_POLL_INTERVAL_MS: 'soon' } as ImportMetaEnv).pollIntervalMs,
    ).toBe(10_000);
    expect(
      resolveConfig({}, { VITE_POLL_INTERVAL_MS: '2500' } as ImportMetaEnv).pollIntervalMs,
    ).toBe(2500);
  });
});
