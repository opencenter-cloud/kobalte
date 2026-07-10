# @opencenter-cloud/kobalte-vanilla-extract

Bridge fork of [`@kobalte/vanilla-extract`](https://github.com/kobaltedev/kobalte/tree/solid2/packages/vanilla-extract) for **Solid 2.0**.

Vanilla Extract utilities for styling Kobalte components using `data-*` attribute selectors.

## Why this exists

Upstream Kobalte's `solid2` branch is complete and tested but has no npm release yet. This package provides an installable build so projects using `@opencenter-cloud/kobalte-core` with Vanilla Extract can style components today.

## Installation

```bash
pnpm add -D @opencenter-cloud/kobalte-vanilla-extract
```

## Usage

```ts
import { componentStateStyles } from "@opencenter-cloud/kobalte-vanilla-extract";

export const trigger = style([
  componentStateStyles({
    expanded: { backgroundColor: "blue" },
    closed: { opacity: 0.5 },
  }),
]);
```

## Peer dependencies

- `@vanilla-extract/css@^1.13.0`

## Source

Tracks [`opencenter-cloud/kobalte`](https://github.com/opencenter-cloud/kobalte), branch `solid2-next`.

## Deprecation

This package will be deprecated when upstream Kobalte publishes an official Solid 2 release. Switch back to `@kobalte/vanilla-extract`.

## License

MIT — see [LICENSE.md](../../LICENSE.md). Original author: Fabien Marie-Louise.
