import { QueryClient } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { AppProviders } from '@/app/AppProviders';

interface RenderOptions {
  /** Starting URL, e.g. `/review/abc`. */
  route?: string;
  /** Route path pattern for `ui`, e.g. `/review/:sha`, so `useParams` works. */
  path?: string;
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Renders `ui` with the real providers, a fresh query cache and an in-memory router. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '/' }: RenderOptions = {},
): RenderResult {
  const routes: RouteObject[] = [
    { path, element: ui },
    { path: '*', element: <div>other page</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  return render(
    <AppProviders queryClient={createTestQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
