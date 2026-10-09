# Changelog

All notable changes to this project are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Convert: upload a protocol PDF (drag and drop or file picker), follow the conversion job
  (polled every 10 s), and see the result: field-decision counts, validation gates, run details,
  a collapsible USDM JSON viewer, and downloads of the USDM document and the report.
- "My conversions": the jobs submitted from this browser, kept in localStorage, with expired
  jobs marked as such.
- Clear messages for every error the conversion API returns (missing API key, file too large,
  encrypted or scanned PDF, assembly failure, timeout).
- Project setup: React + TypeScript (Vite), MUI, React Router, TanStack Query.
- App shell with navigation and a Settings dialog (API key, reviewer id).
- Runtime configuration of backend URLs (`/config.js`), Docker image with nginx.
- Quality tooling: ESLint, Prettier, Vitest, Playwright, Mock Service Worker, GitHub Actions CI.
- Documentation: README, contributing guide, architecture, backend API contract.
