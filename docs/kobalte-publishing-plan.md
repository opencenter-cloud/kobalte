# Kobalte Solid 2 Fork — Publishing Plan

> **Purpose:** For openCenter-cloud maintainers, describes the plan to publish the local `kobalte/` fork to npm under the `@opencenter-cloud` scope so shadcn-solid and other downstream consumers can install a Solid 2-compatible Kobalte before upstream publishes.

Last updated: 2026-07-09

## Context

The `kobalte/` monorepo in this workspace is a fork of `github.com/kobaltedev/kobalte`, branch `feat/corvu-next-integration` on top of upstream `solid2`. Phases A–D of `docs/kobalte-plan.md` are complete: types clean, libraries build, 466/466 tests pass, Storybook boots. Nothing has been published to npm yet.

Downstream (`shadcn-solid`) is blocked on an installable Solid 2 Kobalte. Upstream Kobalte hasn't tagged a `next` release. Rather than wait, publish under `@opencenter-cloud` as a bridge — the same pattern as `@corvu-next`, adapted for an active-upstream situation (see "Why not `@kobalte-next`" below).

## Naming decision

Scope: `@opencenter-cloud`. Package renames:

| Upstream | This fork |
|----------|-----------|
| `@kobalte/core` | `@opencenter-cloud/kobalte-core` |
| `@kobalte/utils` | `@opencenter-cloud/kobalte-utils` |
| `@kobalte/tests` (private) | `@opencenter-cloud/kobalte-tests` (still private) |
| `@kobalte/tailwindcss` | `@opencenter-cloud/kobalte-tailwindcss` |
| `@kobalte/vanilla-extract` | `@opencenter-cloud/kobalte-vanilla-extract` |

**Why not `@kobalte-next`?** Upstream Kobalte is active and will eventually publish `@kobalte/core@next` (the standard npm dist-tag). A `@kobalte-next` scope would collide semantically. `@opencenter-cloud/*` signals "our build, distributor" and cleanly deprecates when upstream ships.

## Version scheme

Initial publish: **all packages at `0.1.0`.** Mirrors `@corvu-next` policy; uniform track; obvious that this is a fork line not upstream continuation. Bump together for future releases.

## Publish order (topological)

1. `@opencenter-cloud/kobalte-utils` (no workspace deps)
2. `@opencenter-cloud/kobalte-core` (depends on utils)
3. `@opencenter-cloud/kobalte-tailwindcss` (no workspace deps)
4. `@opencenter-cloud/kobalte-vanilla-extract` (no workspace deps)

`kobalte-tests` remains `private: true` — never published.

## Edit surface

| File / group | Count | Change |
|--------------|-------|--------|
| Package `name` fields | 5 | `@kobalte/*` → `@opencenter-cloud/kobalte-*` |
| Package `version` fields | 5 | Set to `0.1.0` |
| Package `repository.url` | 5 | Point to `github.com/opencenter-cloud/kobalte` |
| Package `homepage` | 5 | Point to fork tree |
| Package `bugs.url` | 5 | Point to fork issues |
| `dependencies` in `core/package.json` | 1 | `@kobalte/utils@^0.9.2` → `@opencenter-cloud/kobalte-utils@^0.1.0` |
| `devDependencies` in `core/package.json` | 1 | `@kobalte/tests@workspace:*` → `@opencenter-cloud/kobalte-tests@workspace:*` |
| Source imports in `packages/core/src/**` | ~245 | `from "@kobalte/utils"` → `from "@opencenter-cloud/kobalte-utils"` |
| `turbo.json` | 1 line | Task dep names |
| `.storybook/main.ts` | 1 alias | Vite resolve alias |
| `packages/core/vite.config.ts` | 1 alias | Vite resolve alias |
| Root `package.json` | 1 script | `dev:core` filter name |
| `packages/core/dev/index.html` | 1 line | Playground title (cosmetic) |
| Package READMEs | 5 | Point to fork, mark as bridge |
| Root `README.md` | package table | Point to fork packages |

**Skipped:** `apps/docs/**` (Phase E deferred), CHANGELOG.md files (historical), `.git/**`, lockfiles (regenerate via `pnpm install`).

## Phases

### Phase P1 — Rename in-repo (~30 min)

1. Rewrite the 5 `package.json` names and internal workspace dep references.
2. Scripted rewrite of source imports: `@kobalte/utils` → `@opencenter-cloud/kobalte-utils` across `packages/core/src/**`. Restricted to `from "..."`/`from '...'` import specifiers to avoid touching comments or credits.
3. Update `turbo.json`, `.storybook/main.ts`, `packages/core/vite.config.ts`, root `package.json` script, `packages/core/dev/index.html`.
4. `pnpm install` to regenerate `pnpm-lock.yaml` (workspace refs update automatically).

**Verification:**
```bash
cd kobalte
grep -rE "@kobalte/(core|utils|tests|tailwindcss|vanilla-extract)" packages/ turbo.json .storybook/ apps/docs/ || true  # only apps/docs matches should remain
npx tsc --noEmit --project packages/core/tsconfig.json   # 0 errors
pnpm --filter '!@kobalte/docs' --filter '!./apps/*' build
pnpm --filter '@opencenter-cloud/kobalte-core' test       # 466 pass
```

### Phase P2 — Package metadata for publish (~15 min)

Per package (core, utils, tailwindcss, vanilla-extract):

- Set `version: "0.1.0"`.
- Update `repository.url` to `git+https://github.com/opencenter-cloud/kobalte.git`.
- Update `homepage` to `https://github.com/opencenter-cloud/kobalte/tree/feat/corvu-next-integration/packages/<name>#readme`.
- Update `bugs.url` to `https://github.com/opencenter-cloud/kobalte/issues`.
- Confirm `publishConfig.access: "public"` present.
- Add short `README.md` at each package root: "Bridge fork of `@kobalte/<name>` for Solid 2. Tracks upstream `solid2` branch. Superseded when upstream publishes."
- Preserve upstream `author`, `contributors`, `license` (MIT) — attribution intact.

### Phase P3 — Dry-run publish (~10 min)

```bash
cd kobalte
pnpm --filter '@opencenter-cloud/kobalte-utils' publish --dry-run --access public --no-git-checks
pnpm --filter '@opencenter-cloud/kobalte-core' publish --dry-run --access public --no-git-checks
pnpm --filter '@opencenter-cloud/kobalte-tailwindcss' publish --dry-run --access public --no-git-checks
pnpm --filter '@opencenter-cloud/kobalte-vanilla-extract' publish --dry-run --access public --no-git-checks
```

Review the file lists, package sizes, and version numbers before proceeding.

### Phase P4 — Publish (requires explicit user go-ahead)

```bash
cd kobalte
pnpm --filter '@opencenter-cloud/kobalte-utils' publish --access public --no-git-checks
# Verify: npm view @opencenter-cloud/kobalte-utils version
pnpm --filter '@opencenter-cloud/kobalte-core' publish --access public --no-git-checks
pnpm --filter '@opencenter-cloud/kobalte-tailwindcss' publish --access public --no-git-checks
pnpm --filter '@opencenter-cloud/kobalte-vanilla-extract' publish --access public --no-git-checks
```

**Publish is irreversible after the 72-hour npm unpublish window.** Do not run Phase P4 until dry-runs are reviewed.

### Phase P5 — Post-publish

1. Commit + push to `feat/corvu-next-integration` on `opencenter-cloud/kobalte`.
2. Track decision in workspace intelligence: "Publish Kobalte Solid 2 fork under @opencenter-cloud scope."
3. Track milestone: "@opencenter-cloud/kobalte-*: 4 packages published to npm at 0.1.0."
4. Update root `/Users/victor.palma/projects/openCenter-cloud/solid2/README.md`:
   - Move Kobalte from "🟢 Core migration merged, unpublished" to "✅ Published (@opencenter-cloud fork, 0.1.0)".
   - Update "Impact on This Project" table.
   - Add changelog entry.

## Risks

| Risk | Mitigation |
|------|-----------|
| pnpm 10 vs root `packageManager: pnpm@11.9.0` | Use `corepack pnpm@11.9.0` for the build; fall back to `pnpm@10.32.1` if that fails (both support workspace protocol) |
| Publishing conflicts if `@opencenter-cloud/kobalte-*` names already exist | Check with `npm view` before publish; block if unexpected |
| Downstream expects `@kobalte/*` API — different scope changes import paths | Downstream consumers rewrite imports; documented in package READMEs |
| Sub-path exports (`@kobalte/core/tabs` etc.) — sub-paths carry over from the `exports` map, no code change needed | Verified in `core/package.json`: `"./*"` map is scope-agnostic |
| Upstream publishes their own `@kobalte/*` Solid 2 release later | Deprecate `@opencenter-cloud/kobalte-*` with `deprecate` message pointing users to upstream |

## Rollback

Within 72 hours of publish, `npm unpublish @opencenter-cloud/kobalte-<name>@0.1.0` removes the release. Later than 72 hours, `npm deprecate` is the only option. Both are documented in the post-publish notes.

## Links

- [Fork repo](https://github.com/opencenter-cloud/kobalte)
- [Branch `feat/corvu-next-integration`](https://github.com/opencenter-cloud/kobalte/tree/feat/corvu-next-integration)
- [`docs/kobalte-plan.md`](./kobalte-plan.md) — Phase A–D migration
- [Kobalte upstream PR #680](https://github.com/kobaltedev/kobalte/pull/680) — reference for `@corvu-next` integration
- [`@corvu-next` on npm](https://www.npmjs.com/settings/corvu-next/packages) — precedent for scope-based fork publishing
