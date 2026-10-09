import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

import { resetProtocolDb, seedSampleProtocols } from '@/mocks/protocols/db';
import { server } from '@/mocks/server';

// Every test talks to the mock API; a request with no handler is a test bug.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// Unit tests start from example protocols in every state; the app itself starts empty.
beforeEach(() => seedSampleProtocols());
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetProtocolDb();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
afterAll(() => server.close());
