import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

import { resetConvertMocks } from '@/mocks/convert/handlers';
import { server } from '@/mocks/server';

// Every test talks to the mock API; a request with no handler is a test bug.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetConvertMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
afterAll(() => server.close());
