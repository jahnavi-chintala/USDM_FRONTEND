# Changelog

All notable changes to this project are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- The whole interface now follows the **iDigitise Protocol UI** design: navy header with the
  iDigitise logo, Manrope type, the purple accent, and the screens below. The separate
  Convert and Review pages are replaced.
- One backend address (`VITE_API_URL` / `API_URL`) instead of two; the app talks to the
  proposed protocol API in `docs/api-contract.md` (mocked until the backend implements it).

### Added

- Home: greeting with the counts (processing, ready for review, need attention, approved),
  the upload card, and the protocols **In Progress** and **Approved** with search and a status
  filter.
- Upload of several PDF or Word files at once, each tracked on its own with a specific reason
  and Retry when it is refused. Wrong types and files over 60 MB are refused before sending.
- Processing page with the three named stages and a live log; Failed page with the reason,
  what to do, Retry processing and Re-upload.
- Review per USDM class: class list with status and confidence, approve, reject, edit (reason
  required) and re-extract one class or the whole protocol; every value with its verbatim
  quote, highlighted on the source page; Schedule of Activities grid; live confidence ring.
- Approved: download the USDM JSON and store the output in the database.
- Review on phones: class chips, stacked source page and sticky actions.
- Project setup: React + TypeScript (Vite), MUI, React Router, TanStack Query.
- App shell with navigation and a Settings dialog (API key, reviewer id).
- Runtime configuration of backend URLs (`/config.js`), Docker image with nginx.
- Quality tooling: ESLint, Prettier, Vitest, Playwright, Mock Service Worker, GitHub Actions CI.
- Documentation: README, contributing guide, architecture, backend API contract.
