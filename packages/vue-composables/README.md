# @okkly/vue-composables

Headless Vue composables for the Okryshto design system — the Vue counterpart
of `@okkly/react-hooks`. `@okkly/vue`'s components are built on these, and you
can use them directly for your own.

```bash
pnpm add @okkly/vue-composables vue
```

## useRipple

Tracks ripple circles for a clickable element, and `<Ripple>` from `@okkly/vue`
paints the overlay it drives.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRipple } from "@okkly/vue-composables";

const root = useTemplateRef<HTMLElement>("root");
const { ripples, events, hideRipple } = useRipple(root);
</script>

<template>
  <div ref="root" v-on="events">…</div>
</template>
```

## Overlay composables

The plumbing `Modal` and `Popover` are built from. Each takes a getter for
`enabled` rather than a plain boolean, so the reactive state it reads (props,
refs) is tracked and the listener is added and removed as that state changes.

- **`useEscapeKey(handler, enabled)`** — calls `handler` on every Escape
  keydown while `enabled()` reads `true`.
- **`useClickOutside(elementRef, handler, enabled)`** — calls `handler` for a
  `mousedown` whose target lands outside `elementRef`.
- **`useFocusTrap(containerRef, enabled, options?)`** — confines Tab/Shift+Tab
  to `containerRef`'s focusable children; `options.autoFocus` (default `true`)
  moves focus to the first one once the trap engages.
- **`useBodyScrollLock(enabled)`** — locks `document.body` scrolling while
  `enabled()` reads `true`, restoring the previous `overflow` once it stops.

```ts
import { useEscapeKey } from "@okkly/vue-composables";

useEscapeKey(
  (event) => emit("close", event, "escapeKeyDown"),
  () => props.open && !props.disableEscapeKeyDown,
);
```

## useSlider

Headless pointer/keyboard/ARIA behavior for a single or range (two-thumb)
slider — the Vue port of `@okkly/react-hooks`'s `useSlider`, and what
`Slider` from `@okkly/vue` is built on. `options` is a getter, called fresh
whenever the composable needs it, since a `setup()` body — unlike a React
hook's — runs only once rather than every render.

Unlike React's `getRootProps()`/`getThumbInputProps()` (JSX-spread
ergonomics templates don't need), this returns styles/attrs — `v-bind`-able,
no event-key casing to get wrong — separately from event listeners —
`v-on`-able, keyed by bare native event name, the same shape `useRipple`'s
own `events` already uses.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useSlider } from "@okkly/vue-composables";

const root = useTemplateRef<HTMLDivElement>("root");
const slider = useSlider(root, () => ({ value: 30, min: 0, max: 100 }));
</script>

<template>
  <div ref="root" :style="slider.rootStyle.value" v-on="slider.rootEvents">
    <div :style="slider.trackStyle.value" />
    <div
      v-for="(thumbValue, index) in slider.values.value"
      :key="index"
      :style="slider.thumbStyle(index, thumbValue)"
    >
      <input v-bind="slider.thumbInputAttrs(index, thumbValue)" v-on="slider.thumbInputEvents" />
    </div>
  </div>
</template>
```

See `@okkly/vue`'s `Slider.vue` for the full composition, including marks and
the inverted-track segments.
