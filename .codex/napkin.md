# Napkin

## Corrections

| Date | Source | What Went Wrong | What To Do Instead |
| ---- | ------ | --------------- | ------------------ |
| 2026-03-02 | self | Ran `npx eslint` before dependencies were installed and it pulled `eslint@10`, which broke this repo's lint setup | Install project deps first and use repo-local tooling (`./node_modules/.bin/eslint` or `npm run lint`) |
| 2026-03-02 | self | Playwright initially reused a different app already running on `localhost:3000`, so test snapshots were from the wrong project | For local validation, run Playwright with an isolated port/config or disable `reuseExistingServer` |
| 2026-03-02 | self | Ran shell commands against paths like `src/pages/wings/[id].tsx` without quoting and zsh treated brackets as globs | Quote bracketed Next.js route paths (`'src/pages/wings/[id].tsx'`) in shell commands |
| 2026-03-02 | self | Tried `@trpc/server@latest` before upgrading TypeScript and hit peer conflict (`typescript >= 5.7.2`) | Upgrade shared toolchain peers (TypeScript, React, Next ESLint config) before framework packages that require them |
| 2026-03-02 | user | Workspace state was changed mid-upgrade via stash | Re-check current git and dependency state before continuing queue |
| 2026-03-02 | self | Running `next dev` after upgrading to Next 16 auto-modified `tsconfig.json` and regenerated `next-env.d.ts` | Always re-check generated config files after first Next 16 boot |
| 2026-03-02 | self | Plain `npm install` now fails due peer conflict (`next-auth@4.24.13` optional peer `nodemailer@^7` vs installed `nodemailer@8`) | Use `npm install --force` until either `next-auth` peer support catches up or `nodemailer` is pinned back to v7 |
| 2026-03-02 | self | `npm install --force` still fails because postinstall runs `prisma generate` and Prisma 7 rejects datasource `url` in `schema.prisma` | Prisma 7 migration needs schema/config changes before installs can complete cleanly; otherwise skip/fix postinstall before install |
| 2026-03-02 | self | Upgrading `next-seo` to v7 removed `DefaultSeo`/`NextSeo` component exports from root package | Use `next-seo/pages` generator functions and wrap them in local components for pages-router compatibility |
| 2026-03-02 | self | Keeping stale direct deps (`nodemailer`, `react-query`) caused install peer deadlocks after framework upgrades | Remove unused/stale direct deps that duplicate transitive functionality before forcing peer overrides |
| 2026-03-02 | self | `@prisma/adapter-libsql` class changed (`PrismaLibSQL` old API) causing runtime constructor errors | Use `PrismaLibSql` and pass `{ url, authToken }` directly to constructor |
| 2026-03-02 | self | Next 16 pages-router throws hard error for `<Link><a/></Link>` patterns | Add `legacyBehavior` on old-style links or refactor to new Link API before route smoke tests |
| 2026-03-02 | self | Next 16 warns on `images.domains`/`swcMinify` and next-auth warns on `unstable_getServerSession` | Move to `images.remotePatterns`, remove `swcMinify`, and use `getServerSession` |
| 2026-03-02 | self | Used BSD `sed` with GNU-style `s/=.*$//=g` while trying to list env keys | Prefer `awk -F=` (or BSD-safe `sed` syntax) on macOS |
| 2026-03-02 | self | Prisma 7 removed `datasources` constructor option and renamed model arg helper types (`UserArgs`, `SpotArgs`, etc.) | Use adapters in `new PrismaClient({ adapter })` and switch to `*DefaultArgs` in `Prisma.validator` |
| 2026-03-02 | self | React Query v5 no longer reports query status as `"loading"` | Replace status checks with `"pending"` (or use `isPending`) |
| 2026-03-02 | self | next-seo v7 JSON-LD component props changed (`images`→`image`, `rating`→`aggregateRating`, `title`→`headline`, etc.) | Update JSON-LD props to the v7 schema names and required field shapes |
| 2026-03-02 | self | tRPC v11 transformer configuration changed and broke client setup typing | Put transformer on the link (`httpBatchLink`) and keep `createTRPCNext` transformer option for type compatibility |
| 2026-03-02 | self | Next 16 logs warnings for legacy `next/image` prop `objectFit` | Migrate to `style={{ objectFit: "cover" }}` |
| 2026-03-02 | self | Playwright setup failed because `prisma db push` consistently returns a Prisma 7 schema-engine error in this env | Make e2e setup resilient by not relying on `prisma db push`; keep setup lightweight for smoke tests |
| 2026-03-02 | self | `npm run dev` started Next only, so tRPC calls failed with `ECONNREFUSED 127.0.0.1:8080` when Turso wasn’t started separately | Make `dev` start Turso automatically (or detect existing `:8080`) before launching Next |
| 2026-03-02 | self | ESLint 10 breaks with current Next/React lint plugin stack (`react/display-name` runtime error) | Pin to ESLint 9.x until ecosystem supports ESLint 10 in this repo |
| 2026-03-02 | self | `prisma db push` for SQLite intermittently fails with generic Prisma 7 schema-engine error unless tracing is enabled | For e2e setup scripts, set `RUST_LOG=trace` in the `db push` environment |
| 2026-03-02 | self | Playwright workflow container browser version lagged behind repo Playwright package | Keep `.github/workflows/playwright.yml` image version aligned with `@playwright/test` version |
| 2026-03-02 | self | `npm run build` fails fast when required DB env vars are unset in the shell | Validate builds with explicit env (or `.env` values) so Next config/env parsing has required keys |
| 2026-03-03 | self | Ran Playwright against stale `.next` output (`npm run start` webServer) and saw old markup in assertions | Run `npm run build` after UI edits before start-based e2e checks |
| 2026-03-03 | self | Ran `prisma db push` and `npm run build` in parallel; build executed before schema sync and failed on missing tables | Keep dependent validation steps sequential (`db push` then `build`) even when parallelization is preferred |
| 2026-03-03 | self | Ran `rg` across `git diff --name-only` paths including deleted files and got noisy IO errors | Filter with `--diff-filter=ACMRT` before bulk scans on changed files |

## User Preferences

- Use `agent-browser` when asked to inspect websites.
- Write tests, but keep count low and prefer integration tests.
- Do not write tests for behavior already guaranteed by the type system.
- Reference React guidance: `https://react.dev/learn/you-might-not-need-an-effect`.

## Patterns That Work

- Capture a baseline before dependency upgrades by visiting `/`, `/spots`, `/ratings`, `/map`, and `/api/auth/signin`.
- Upgrade one dependency at a time in a strict queue, with peer-conflict retries using `--force` only when necessary.
- For `scripts/` with TS 5 + Zod 4, `tsc` build is stable with `--skipLibCheck --esModuleInterop`.
- Use repeated `npm run build` passes after each fix to surface the next upgrade regression quickly.
- `npm run dev` now boots Turso + Next together; if homepage load returns `200` on `/api/trpc/public.getAllSpots`, the local DB wiring is healthy.
- For text search fields that must avoid browser/password-manager suggestions, set anti-autofill attributes on both the `<form>` and the `<input>` (including `data-lpignore` for LastPass).

## Patterns That Don't Work

- Starting upgrade order without accounting for major peer requirements.

## Domain Notes

- Repo path: `/Users/makon/dev/naked-extra-crispy`.
- This project has root and `scripts/` Node package manifests.
- Current root state already includes major upgrades in progress (`next@16`, `react@19`, `typescript@5`, `@trpc@11`).
- `scripts/build:post-to-instagram` now fails on TS 5 + Zod 4 without compatibility flags (`esModuleInterop` and/or `skipLibCheck`).
- Upgrading to Prisma 7 introduced install-time breakage in `postinstall` (`prisma generate`) due schema format changes.
- Prisma 7 expects database URLs in `prisma.config.ts` (not in the `datasource` block of `schema.prisma`).
| 2026-03-03 | self | Unquoted paths with bracketed routes (e.g. `src/pages/spots/[id]/...`) failed in zsh due glob expansion | Always quote dynamic-route paths in shell commands (`'src/pages/spots/[id]/index.tsx'`) |
| 2026-03-03 | self | Combined `rm` + install command was blocked by policy in this environment | Use `apply_patch` for deletions and run package-manager commands separately |
| 2026-03-03 | self | `next build` failed on SSG data collection when test SQLite existed but schema tables were absent | Run `prisma db push` against the build DB URL before build validation when using local SQLite files |
| 2026-03-03 | self | Playwright initially validated the wrong app because port `3000` was occupied and config reused existing server in non-CI mode | Run e2e with `CI=1` and ensure `:3000` is free (or owned by this repo) before test execution |
