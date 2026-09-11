# @okkly/vue

Vue component library for the Okryshto design system.

```bash
pnpm add @okkly/vue vue
```

Load the styles once at your entry point — the design system's tokens, fonts,
and reset first, then this package's component CSS:

```ts
import "@okkly/design-system/styles/index.scss";
import "@okkly/vue/style.css";
```

`@okkly/vue/style.css` carries only the component rules; every colour, radius,
and duration in them resolves against the `--okkly-*` custom properties that
`@okkly/design-system` declares, so both imports are required.

```vue
<script setup lang="ts">
import { Button } from "@okkly/vue";
</script>

<template>
  <Button variant="primary" @click="save">Click me</Button>
</template>
```

## Button

Renders a native `<button>`, or an `<a>` when given an `href`. Props mirror
`@okkly/react`'s `<Button>` name-for-name.

| Prop              | Type                                                         | Default     |
| ----------------- | ------------------------------------------------------------ | ----------- |
| `variant`         | `primary \| gradient \| secondary \| soft \| ghost \| glass` | `primary`   |
| `color`           | `primary \| dante \| indigo \| violet \| ember \| ice`       | `primary`   |
| `shape`           | `pill \| rounded`                                            | `pill`      |
| `size`            | `small \| medium \| large`                                   | `medium`    |
| `fullWidth`       | `boolean`                                                    | `false`     |
| `loading`         | `boolean`                                                    | `false`     |
| `loadingPosition` | `start \| center \| end`                                     | `center`    |
| `disabled`        | `boolean`                                                    | `false`     |
| `disableRipple`   | `boolean`                                                    | `false`     |
| `href`            | `string`                                                     | `undefined` |

Icons are slots rather than props, since Vue has no `ReactNode`:

```vue
<Button variant="soft" size="large">
  <template #start-icon><SaveIcon /></template>
  Save
</Button>
```

An unfilled icon slot renders nothing at all, so no gap is reserved for an icon
you did not pass. `loading` implies `disabled` and swaps in a spinner — at the
start slot, the end slot, or centered over a dimmed label, per `loadingPosition`.

Anything the element itself understands — `class`, `type`, `@click`, `aria-*` —
falls through to the rendered `<button>`/`<a>`. A disabled `<a>` drops its href
and reports `aria-disabled`.

## TextField

Single-line text input with label, helper text, and error state — the
foundation most form fields build on. Props mostly mirror `@okkly/react`'s
`<TextField>` name-for-name; `color` is wider here (see below).

| Prop        | Type                                                                  | Default        |
| ----------- | --------------------------------------------------------------------- | -------------- |
| `hideLabel` | `boolean`                                                             | `false`        |
| `size`      | `small \| medium \| large`                                            | `medium`       |
| `color`     | `primary \| secondary \| dante \| violet \| ember \| ice \| contrast` | `primary`      |
| `error`     | `boolean`                                                             | `false`        |
| `fullWidth` | `boolean`                                                             | `false`        |
| `required`  | `boolean`                                                             | `false`        |
| `disabled`  | `boolean`                                                             | `false`        |
| `id`        | `string`                                                              | auto-generated |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TextField } from "@okkly/vue";

const email = ref("");
</script>

<template>
  <TextField v-model="email" required>
    <template #label>Email</template>
    <template #helper-text>We'll never share it</template>
  </TextField>
</template>
```

`label`, `helper-text`, `start-adornment` and `end-adornment` are slots rather
than props, since Vue has no `ReactNode`; each renders only when filled. The
controlled value is `v-model`. Anything else the `<input>` itself understands
(`type`, `placeholder`, `name`, `maxlength`, `@input`, `@change`…) falls
through to it — `class` is the one exception, which lands on the outer field
wrapper instead, matching React's `className`.

`color` tints the focus ring/glow and accepts any `--okkly-accent-*` token —
`dante` is a rare, deliberate accent moment; the rest are plain color choices.

## useRipple

`useRipple` is the Vue counterpart of the `@okkly/react-hooks` hook, and
`<Ripple>` paints the overlay it tracks. Use them on any element that is
`position: relative; overflow: hidden`:

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Ripple, useRipple } from "@okkly/vue";

const root = useTemplateRef<HTMLElement>("root");
const { ripples, events, hideRipple } = useRipple(root);
</script>

<template>
  <div ref="root" class="okkly-component my-pressable" v-on="events">
    <Ripple :ripples="ripples" :on-ripple-end="hideRipple" />
    …
  </div>
</template>
```

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.ts` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm storybook vue                          # dev server on :6008
pnpm --filter @okkly/vue storybook:build    # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.ts`.

## Tests

Components are tested with [Playwright component testing][ct]: each one is
mounted in a real Chromium and driven the way a user would drive it, so the
assertions run against the CSS the package actually ships. A component's tests
sit next to it as `*.ct.ts`, one file per component.

```bash
pnpm --filter @okkly/vue test:playwright   # component tests
pnpm --filter @okkly/vue test              # vitest + @vue/test-utils
```

`playwright/index.html` is the mount harness; it loads the design tokens once,
exactly as an app entry point does. Shared helpers live in `src/playwright`:
`a11y.ts` configures axe, `screenshots.ts` wires it into the screenshot runs,
and `matrix/` builds the labelled grid — Vue's `mount(Component, { props,
slots, on })` takes a component and its props/slots/listeners separately
rather than one composed element, so each matrix cell is described as that bag
instead of the JSX React's version builds directly.

### Screenshots

Each component also has one or more **matrix screenshots**: a single committed
image holding every variant of a component in a labelled grid, so a visual
regression shows up as one changed cell rather than a wall of near-identical
files. Every cell is scanned by axe as it is captured, so a component is only
signed off once it both looks right and reads right.

Baselines are pixel-exact per platform, so they are generated on CI's pinned
Linux image and never on a developer's machine — locally the comparison is
skipped entirely (`ignoreSnapshots`).

[ct]: https://playwright.dev/docs/test-components

## Development

```bash
pnpm --filter @okkly/vue build   # vite lib build → dist/, types, and style.css
pnpm --filter @okkly/vue test    # vitest + @vue/test-utils
```

The library build lives in `vite.lib.config.ts` rather than `vite.config.ts`:
Storybook's Vite builder merges the project's root config into its own, and
neither `build.lib` nor the `.d.ts` pass has any business running for the
workbench. `.storybook/main.ts` brings its own `@vitejs/plugin-vue` in
exchange, since there is no root config for it to inherit one from.
