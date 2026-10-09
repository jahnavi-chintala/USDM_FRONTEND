# USDM4 Converter — Frontend

Web interface for **USDM4-Assure**
([backend](https://github.com/Lucifer0190/usdm_4_convertor_backend)), which converts clinical
trial protocol PDFs into CDISC **USDM 4.0** JSON.

- **Convert**: upload a protocol PDF, follow the conversion job, then view and download the USDM
  document and its quality report.
- **Review**: go through the extracted fields worst-first, check each against the source PDF,
  correct values with a recorded reason, and certify the run (21 CFR Part 11 audit trail).

> **Status:** in active development on `dev`. The review screens run against mock data until
> the backend's review JSON API exists, see [docs/api-contract.md](docs/api-contract.md).

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment (Docker)](#deployment-docker)
- [Contributing](#contributing)

## Quick start

Requirements: **Node.js 22** (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev:mock     # http://localhost:5173, every API call mocked, no backend needed
```

Against a real backend:

```bash
cp .env.example .env.local   # set the backend URLs if they are not the defaults
npm run dev
```

The backend must allow the frontend's origin (CORS); see
[docs/api-contract.md](docs/api-contract.md#2-cors-needed).

## Scripts

| Command                                     | Does                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                               | Development server against the configured backend                     |
| `npm run dev:mock`                          | Development server with the mock API (`.env.mock`)                    |
| `npm run build`                             | Typecheck, then production build into `dist/`                         |
| `npm run preview`                           | Serve the production build locally                                    |
| `npm run check`                             | Everything CI's first job checks: typecheck, lint, format, unit tests |
| `npm run typecheck`                         | TypeScript, no output                                                 |
| `npm run lint`                              | ESLint (zero warnings allowed)                                        |
| `npm run format` / `format:check`           | Prettier write / verify                                               |
| `npm test` / `test:watch` / `test:coverage` | Vitest unit and component tests                                       |
| `npm run test:e2e`                          | Playwright end-to-end tests (starts the mock dev server)              |

## Configuration

| Variable (build time)       | Docker variable (run time) | Default                 | Meaning                                 |
| --------------------------- | -------------------------- | ----------------------- | --------------------------------------- |
| `VITE_CONVERT_API_URL`      | `CONVERT_API_URL`          | `http://localhost:8080` | Conversion API (`/v1/*`)                |
| `VITE_REVIEW_API_URL`       | `REVIEW_API_URL`           | `http://localhost:8000` | Review API (`/api/review/*`)            |
| `VITE_JOB_POLL_INTERVAL_MS` | —                          | `10000`                 | How often a running job is checked      |
| `VITE_MOCKS`                | —                          | `false`                 | `true` answers all calls with mock data |

User settings (**⚙ Settings** in the top bar), kept for the browser tab only:

- **API key**: sent as `X-API-Key` to the conversion API, when the backend requires one.
- **Reviewer id**: recorded with every review edit and certification.

## Project structure

```
src/
  app/          App shell: providers, theme, layout, routes
  config/       Configuration (env.ts)
  features/     convert/, review/, settings/ — each with api, hooks, components, pages
  shared/       HTTP client, generic components, storage and utilities
  mocks/        Mock Service Worker handlers and fixtures
e2e/            Playwright tests
docker/         Dockerfile, nginx config
docs/           Architecture and API contract
```

Details and conventions: [docs/architecture.md](docs/architecture.md).

## Testing

- **Unit and component tests** (Vitest + Testing Library) sit next to the code as
  `*.test.ts(x)`. API calls are answered by the same mock handlers the dev server uses.
- **End-to-end tests** (Playwright) in `e2e/` drive the real app in Chromium against the mock
  API. First run on a new machine: `npx playwright install chromium`.

CI runs both on every pull request (`.github/workflows/ci.yml`).

## Deployment (Docker)

```bash
docker build -f docker/Dockerfile -t usdm4-frontend .
docker run -p 3000:80 \
  -e CONVERT_API_URL=https://usdm4-api.example.com \
  -e REVIEW_API_URL=https://usdm4-review.example.com \
  usdm4-frontend
```

or `docker compose up --build` (see `docker-compose.yml`). The image serves the static build
with nginx; the backend URLs are written to `/config.js` at container start, so one image
works in every environment. Health check: `GET /healthz`.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the branch workflow, code conventions and the
pull request checklist. Changes are listed in [CHANGELOG.md](CHANGELOG.md).
