# @opencenter-cloud/kobalte-tailwindcss

Bridge fork of [`@kobalte/tailwindcss`](https://github.com/kobaltedev/kobalte/tree/solid2/packages/tailwindcss) for **Solid 2.0**.

A TailwindCSS plugin for styling Kobalte components using `data-*` attribute modifiers like `ui-expanded:*`.

## Why this exists

Upstream Kobalte's `solid2` branch is complete and tested but has no npm release yet. This package provides an installable build so projects using `@opencenter-cloud/kobalte-core` can style components with Tailwind today.

## Installation

```bash
pnpm add -D @opencenter-cloud/kobalte-tailwindcss
```

## Usage

```js
// tailwind.config.js
import kobalte from "@opencenter-cloud/kobalte-tailwindcss";

export default {
  plugins: [kobalte],
};
```

Then use modifiers in your markup:

```html
<div class="ui-expanded:bg-blue-100 ui-closed:opacity-50">...</div>
```

## Peer dependencies

- `tailwindcss@>=3`

## Source

Tracks [`opencenter-cloud/kobalte`](https://github.com/opencenter-cloud/kobalte), branch `solid2-next`.

## Deprecation

This package will be deprecated when upstream Kobalte publishes an official Solid 2 release. Switch back to `@kobalte/tailwindcss`.

## License

MIT — see [LICENSE.md](../../LICENSE.md). Original author: Fabien Marie-Louise.
