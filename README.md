# @opencenter-cloud/kobalte-* — Solid 2 Bridge Fork

[![license-badge]](https://github.com/opencenter-cloud/kobalte#license)

[license-badge]: https://img.shields.io/github/license/kobaltedev/kobalte

Bridge fork of [Kobalte](https://github.com/kobaltedev/kobalte) providing npm-installable packages for **Solid 2.0** adoption before upstream publishes an official release.

## Branch: `solid2-next`

This branch contains the full Kobalte component library migrated to `solid-js@^2.0.0-beta.14`, published under the `@opencenter-cloud` npm scope.

| Published Package | Upstream Equivalent | Version |
|-------------------|--------------------:|--------:|
| [`@opencenter-cloud/kobalte-core`](https://www.npmjs.com/package/@opencenter-cloud/kobalte-core) | `@kobalte/core` | 0.1.0 |
| [`@opencenter-cloud/kobalte-utils`](https://www.npmjs.com/package/@opencenter-cloud/kobalte-utils) | `@kobalte/utils` | 0.1.0 |
| [`@opencenter-cloud/kobalte-tailwindcss`](https://www.npmjs.com/package/@opencenter-cloud/kobalte-tailwindcss) | `@kobalte/tailwindcss` | 0.1.0 |
| [`@opencenter-cloud/kobalte-vanilla-extract`](https://www.npmjs.com/package/@opencenter-cloud/kobalte-vanilla-extract) | `@kobalte/vanilla-extract` | 0.1.0 |

### Source lineage

```
upstream kobaltedev/kobalte (solid2 branch)
  └── PR #673 — initial Solid 2 migration (Jul 3, 2026)
  └── PR #679 — replace createToggleState with Solid Primitives 2.0 (Jul 6, 2026)
  └── PR #680 — corvu-next integration (open)
        └── opencenter-cloud/kobalte (solid2-next) ← this branch
```

## Relationship to `@corvu-next`

[`@corvu-next`](https://www.npmjs.com/settings/corvu-next/packages) is a companion fork maintained in [`opencenter-cloud/corvu-next`](https://github.com/opencenter-cloud/corvu-next). It provides Solid 2-compatible builds of [corvu](https://github.com/corvudev/corvu), which has been dormant since August 2025.

**How they connect:**

- Kobalte's Drawer, Calendar, Resizable, and OTPField components depend on corvu primitives (presence, focus-trap, dismissible, etc.).
- Upstream corvu has no Solid 2 support. `@corvu-next` fills that gap.
- `@opencenter-cloud/kobalte-core` is built and tested against `@corvu-next@0.1.3` — no runtime dependency on upstream corvu.

| Scope | Upstream | Status | Packages |
|-------|----------|--------|----------|
| `@opencenter-cloud/kobalte-*` | `kobaltedev/kobalte` (active) | Bridge until upstream publishes Solid 2 tag | 4 |
| `@corvu-next/*` | `corvudev/corvu` (dormant) | Long-term replacement until upstream revives | 20 |

## Purpose

These forks exist to **unblock Solid 2 adoption** in downstream projects (e.g., shadcn-solid, openCenter-console) that depend on Kobalte and Corvu but cannot wait for upstream npm releases.

- Upstream Kobalte's `solid2` branch is code-complete and tested (466/466 tests pass) but has no npm release timeline.
- Upstream Corvu hasn't committed since August 2025; its stale `features/solid-v2` branch targets an obsolete `2.0.0-experimental.1` API.
- Both forks track upstream source closely and make minimal changes (scope rename, dep wiring, type fixes).

## Installation

```bash
# Kobalte components
pnpm add @opencenter-cloud/kobalte-core

# Tailwind plugin (optional)
pnpm add -D @opencenter-cloud/kobalte-tailwindcss

# Vanilla Extract plugin (optional)
pnpm add -D @opencenter-cloud/kobalte-vanilla-extract
```

Peer dependencies: `solid-js@^2.0.0-beta.14`, `@solidjs/web@^2.0.0-beta.14`.

## Usage

```tsx
import { Dialog } from "@opencenter-cloud/kobalte-core/dialog";
import { Tabs } from "@opencenter-cloud/kobalte-core/tabs";
import { Drawer } from "@opencenter-cloud/kobalte-core/drawer";
```

All component APIs are identical to upstream Kobalte — refer to [kobalte.dev](https://kobalte.dev/) for documentation.

## Deprecation Plan

Both fork scopes are **temporary bridges** with defined sunset conditions:

### `@opencenter-cloud/kobalte-*` → deprecated when:

1. Upstream Kobalte publishes `@kobalte/core` with a `solid2` or `next` npm dist-tag, OR
2. Upstream Kobalte releases a new major version targeting Solid 2.

**Migration:** replace `@opencenter-cloud/kobalte-core` → `@kobalte/core` in imports and `package.json`. APIs are identical.

### `@corvu-next/*` → deprecated when:

1. Upstream corvu publishes packages targeting `solid-js@^2.0.0-beta.14` or later, OR
2. Upstream merges the migration offered in [Issue #106](https://github.com/corvudev/corvu/issues/106), OR
3. Kobalte removes its corvu dependency in favor of Solid Primitives 2.0 equivalents.

**Migration:** replace `@corvu-next/*` → `@corvu/*` in imports and `package.json`.

### What deprecation looks like

When a sunset condition is met:

1. `npm deprecate @opencenter-cloud/kobalte-*` (or `@corvu-next/*`) with a message pointing to the upstream package.
2. Final version published with only a README change documenting the migration.
3. Fork repos archived.

## Verification

```bash
# From this repo root:
pnpm install
pnpm --filter '@opencenter-cloud/kobalte-utils' build
pnpm --filter '@opencenter-cloud/kobalte-tests' build
pnpm --filter '@opencenter-cloud/kobalte-core' build

# Typecheck
npx tsc --noEmit --project packages/core/tsconfig.json

# Tests (466 pass, 112 skipped)
pnpm --filter '@opencenter-cloud/kobalte-core' test

# Storybook
pnpm storybook
```

## Links

- [Kobalte upstream](https://github.com/kobaltedev/kobalte) — [solid2 branch](https://github.com/kobaltedev/kobalte/tree/solid2)
- [Kobalte PR #680 (corvu-next integration)](https://github.com/kobaltedev/kobalte/pull/680)
- [Corvu upstream](https://github.com/corvudev/corvu) — [Issue #106 (merge offer)](https://github.com/corvudev/corvu/issues/106)
- [`opencenter-cloud/corvu-next`](https://github.com/opencenter-cloud/corvu-next)
- [Solid 2.0 migration guide](https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/MIGRATION.md)
- [kobalte.dev documentation](https://kobalte.dev/)

## Acknowledgment

- [Kobalte](https://kobalte.dev/) by jer3m01, Fabien Marie-Louise, David Di Biase
- [Corvu](https://corvu.dev/) by Jasmin Noetzli
- [Solid Primitives](https://github.com/solidjs-community/solid-primitives)
- [Ariakit](https://ariakit.org/), [Radix UI](https://www.radix-ui.com/), [React Aria](https://react-spectrum.adobe.com/react-aria/), [Zag](https://zagjs.com/)

## License

MIT — original upstream license preserved. See [LICENSE.md](./LICENSE.md).
