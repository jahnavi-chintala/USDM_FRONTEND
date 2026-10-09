import type { RequestHandler } from 'msw';

import { protocolHandlers } from './protocols/handlers';

/**
 * Mock API handlers. Used by `npm run dev:mock`, the Playwright tests (browser worker) and
 * the Vitest tests (Node server).
 */
export const handlers: RequestHandler[] = [...protocolHandlers];
