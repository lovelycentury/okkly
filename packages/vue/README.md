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
