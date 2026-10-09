import { resolveConfig } from './env';

describe('resolveConfig', () => {
  it('uses local development defaults when nothing is set', () => {
    expect(resolveConfig({}, {} as ImportMetaEnv)).toEqual({
      convertApiUrl: 'http://localhost:8080',
      reviewApiUrl: 'http://localhost:8000',
      jobPollIntervalMs: 10_000,
      mocksEnabled: false,
    });
  });

  it('prefers runtime config over build-time variables and strips trailing slashes', () => {
    const config = resolveConfig({ convertApiUrl: 'https://api.example.com/', reviewApiUrl: ' ' }, {
      VITE_CONVERT_API_URL: 'http://ignored',
      VITE_REVIEW_API_URL: 'http://review/',
    } as ImportMetaEnv);
    expect(config.convertApiUrl).toBe('https://api.example.com');
    expect(config.reviewApiUrl).toBe('http://review');
  });

  it('ignores an invalid poll interval', () => {
    expect(
      resolveConfig({}, { VITE_JOB_POLL_INTERVAL_MS: 'soon' } as ImportMetaEnv).jobPollIntervalMs,
    ).toBe(10_000);
    expect(
      resolveConfig({}, { VITE_JOB_POLL_INTERVAL_MS: '2500' } as ImportMetaEnv).jobPollIntervalMs,
    ).toBe(2500);
  });
});
