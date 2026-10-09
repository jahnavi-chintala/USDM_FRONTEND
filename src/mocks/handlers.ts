import type { RequestHandler } from 'msw';

/**
 * Mock API handlers, one module per backend feature. Used by `npm run dev:mock`,
 * the Playwright tests (browser worker) and the Vitest tests (Node server).
 */
export const handlers: RequestHandler[] = [];
