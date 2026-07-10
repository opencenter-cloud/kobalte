# @opencenter-cloud/kobalte-core

Bridge fork of [`@kobalte/core`](https://github.com/kobaltedev/kobalte/tree/solid2/packages/core) for **Solid 2.0**.

Unstyled, accessible UI components and primitives for building design systems with SolidJS 2.

## Why this exists

Upstream Kobalte's `solid2` branch is complete and tested but has no npm release yet. This package provides an installable Solid 2-compatible build so downstream projects can adopt Solid 2 today.

## Installation

```bash
pnpm add @opencenter-cloud/kobalte-core
```

## Peer dependencies

- `solid-js@^2.0.0-beta.14`
- `@solidjs/web@^2.0.0-beta.14`

## Usage

Import components using sub-path exports (barrel import is deprecated):

```tsx
import { Dialog } from "@opencenter-cloud/kobalte-core/dialog";
import { Tabs } from "@opencenter-cloud/kobalte-core/tabs";
```

All component APIs match upstream Kobalte — refer to [kobalte.dev](https://kobalte.dev/) for documentation.

## Migrating from `@kobalte/core`

```bash
# Replace imports
find src -name '*.tsx' -exec sed -i '' 's|@kobalte/core|@opencenter-cloud/kobalte-core|g' {} +
```

## Source

Tracks [`opencenter-cloud/kobalte`](https://github.com/opencenter-cloud/kobalte), branch `solid2-next`, which is based on upstream Kobalte's `solid2` branch plus [PR #680](https://github.com/kobaltedev/kobalte/pull/680) patches.

## Deprecation

This package will be deprecated when upstream Kobalte publishes an official Solid 2 release. At that point, switch back to `@kobalte/core`.

## License

MIT — see [NOTICE.txt](./NOTICE.txt). Original authors: jer3m01, Fabien Marie-Louise, David Di Biase.
