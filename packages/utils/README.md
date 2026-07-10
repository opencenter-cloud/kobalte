# @opencenter-cloud/kobalte-utils

Bridge fork of [`@kobalte/utils`](https://github.com/kobaltedev/kobalte/tree/solid2/packages/utils) for **Solid 2.0**.

## Why this exists

Upstream Kobalte's `solid2` branch is complete and tested but has no npm release yet. This package provides an installable Solid 2-compatible build so downstream projects (e.g., `@opencenter-cloud/kobalte-core`) can resolve their dependencies today.

## Installation

```bash
pnpm add @opencenter-cloud/kobalte-utils
```

## Peer dependencies

- `solid-js@^2.0.0-beta.14`
- `@solidjs/web@^2.0.0-beta.14`

## Source

Tracks [`opencenter-cloud/kobalte`](https://github.com/opencenter-cloud/kobalte), branch `solid2-next`, which is based on upstream Kobalte's `solid2` branch plus [PR #680](https://github.com/kobaltedev/kobalte/pull/680) patches.

## Deprecation

This package will be deprecated when upstream Kobalte publishes an official Solid 2 release. At that point, switch back to `@kobalte/utils`.

## License

MIT — see [LICENSE.md](./LICENSE.md). Original authors: jer3m01, Fabien Marie-Louise.
