# Architecture

## Overview

A single-page React application following the **iDigitise Protocol UI** design. It holds no
business logic of its own: it uploads protocols, follows their processing, and is a client for
the class review. All state that matters (protocols, review decisions, audit trail) lives in
the backend.

```
Browser ──► Home, Upload, Processing ──► Protocol API      /api/protocols/*
        └─► Review per USDM class    ──► Class review API  /api/protocols/{id}/classes/*
```

Screens: **Home** (counts, upload card, In Progress / Approved tabs) → **Upload** (one row per
file) → **Protocol** page, which shows processing, the failure, or the review depending on the
protocol's status → **Approved** (download, store).

## Technology

| Concern          | Choice                                                                 | Why                                                    |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Language / build | TypeScript (strict), Vite                                              | Type safety; fast dev server and builds                |
| UI components    | MUI (Material UI), the iDigitise theme in `src/app/theme.ts`           | Complete, accessible component set                     |
| Routing          | React Router v7 (`src/app/routes.tsx`)                                 | Standard client-side routing                           |
| Server data      | TanStack Query                                                         | Caching, polling of running jobs, loading/error states |
| Local state      | `useState`, plus `createPersistedStore` for values kept in Web Storage | No global store is needed                              |
| Mock API         | Mock Service Worker (`src/mocks/`)                                     | Same handlers for local dev, unit tests and e2e tests  |
| Tests            | Vitest + Testing Library (unit/component), Playwright (end-to-end)     |                                                        |
| Quality          | ESLint, Prettier, GitHub Actions                                       |                                                        |

## Folder structure

Code is grouped **by feature**. A feature owns its API calls, types, hooks, components and
pages; it exposes what other code may use through its `index.ts`.

```
src/
  app/                 App shell: providers, theme, layout, routes, error pages
  config/env.ts        Runtime + build-time configuration
  features/
    protocols/         Home, uploads, processing and failure screens; the protocol page
    usdm-review/       Review per USDM class, source highlights, approval, download, store
    settings/          API key and reviewer id (sessionStorage)
  shared/
    api/               HTTP client and ApiError — the only place that calls fetch
    components/        Generic UI pieces (BrandMark, Breadcrumbs, StatusPill, ConfidenceBar,
                       ErrorAlert, LoadingState, EmptyState)
    storage/           Safe Web Storage access
    utils/             Formatting and download helpers
  mocks/               MSW handlers and fixtures, per feature
  test/                Test setup and render helpers
e2e/                   Playwright specs
docker/                Dockerfile, nginx config, runtime-config script
docs/                  Architecture, API contract
```

### Layers inside a feature

```
pages/        Route components: read URL params, compose components, no fetch calls
components/   Presentational pieces; receive data and callbacks through props
hooks/        TanStack Query hooks wrapping the api module (query keys live here)
api/          Typed functions that call shared/api/httpClient
types.ts      Types that mirror the backend's JSON
```

Dependencies only point downwards (`pages → components/hooks → api → shared`). A feature
never imports another feature's internals, only its `index.ts`.

## Configuration

See `src/config/env.ts`. The backend URL comes from `/config.js` (written by the Docker image
at start-up), then from `VITE_API_URL`, then from the local default. That is why the same
image can be deployed to any environment.

## Errors

`shared/api/httpClient.ts` turns every failed call into an `ApiError` with the HTTP `status`,
the backend's `detail` message and, when present, its machine-readable `reason`. Features map
those to user-facing text in one place (`features/protocols/errorMessages.ts`). A page that
throws while rendering shows `RouteErrorPage` instead of a blank screen.

## Security notes

- No sign-in yet (planned). The API key is kept in `sessionStorage`, so it is forgotten when
  the tab closes.
- The reviewer id is self-declared, exactly as in the current backend review tool, and is
  sent with every review decision; decisions are blocked until it is set.
- nginx adds `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` headers.
