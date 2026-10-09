# Contributing

## Branches and pull requests

| Branch                 | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `main`                 | Released code. Updated only from `dev` when a release is agreed.      |
| `dev`                  | Integration branch. Every change arrives here through a pull request. |
| `feature/<short-name>` | One feature or fix, branched from `dev`.                              |

1. `git switch dev && git pull && git switch -c feature/<short-name>`
2. Make the change, with tests.
3. `npm run check && npm run test:e2e`
4. Push and open a pull request into `dev`. Fill in the template.
5. CI must be green and one reviewer must approve before merging.

Keep a pull request to one purpose. If it grows past a few hundred lines of real change,
split it.

## Commit messages

Short imperative subject line, optionally prefixed with the type of change:

```
feat(convert): show upload progress
fix(review): keep the reviewer id after certifying
docs: explain the runtime configuration
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

## Code conventions

- **Feature folders.** New code goes in `src/features/<feature>/` (`api/`, `hooks/`,
  `components/`, `pages/`, `types.ts`). Something used by two features moves to `src/shared/`.
  Import another feature only through its `index.ts`. See [docs/architecture.md](docs/architecture.md).
- **Only `shared/api/httpClient.ts` calls `fetch`.** Features wrap it in typed functions in
  their `api/` folder, and components reach those through TanStack Query hooks.
- **Types mirror the backend.** When the backend's JSON changes, update `types.ts` and
  [docs/api-contract.md](docs/api-contract.md) in the same pull request.
- **Small components** with typed props; no `any`. Use MUI components and the theme instead of
  custom CSS or hard-coded colours.
- **User-facing text** is plain and specific: say what happened and what the user can do.
- **Comments** explain _why_, not _what_.
- Prettier formats, ESLint must report zero warnings (`npm run lint`).

## Tests

- New logic gets a unit test; a new screen gets a component test for its main states
  (loading, error, empty, data).
- A new user flow gets a Playwright test in `e2e/`.
- Tests use the MSW handlers in `src/mocks/`. Add or change fixtures there rather than mocking
  `fetch` by hand.

## Changelog

Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md) for any user-visible change.
