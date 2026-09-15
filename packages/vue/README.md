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

## Checkbox

Binary or indeterminate choice. Props mirror `@okkly/react`'s `<Checkbox>`
name-for-name.

| Prop            | Type                                                                                   | Default        |
| --------------- | -------------------------------------------------------------------------------------- | -------------- |
| `indeterminate` | `boolean`                                                                              | `false`        |
| `size`          | `small \| medium \| large`                                                             | `medium`       |
| `color`         | `primary \| dante \| indigo \| violet \| ember \| ice \| success \| warning \| danger` | `primary`      |
| `disabled`      | `boolean`                                                                              | `false`        |
| `id`            | `string`                                                                               | auto-generated |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@okkly/vue";

const subscribed = ref(false);
</script>

<template>
  <Checkbox v-model="subscribed">
    <template #label>Subscribe to updates</template>
  </Checkbox>
</template>
```

`label` is a slot rather than a prop, since Vue has no `ReactNode`, and renders
only when filled. The controlled `checked` state is `v-model`. Anything else
the `<input>` itself understands (`value`, `name`, `required`, `aria-*`,
`@change`…) falls through to it — `class` is the one exception, which lands
on the outer `<label>` instead, matching React's `className`.

## Switch

Immediate on/off toggle — prefer `Checkbox` for form "agree" statements that
submit later. Props mirror `@okkly/react`'s `<Switch>` name-for-name.

| Prop       | Type                                                   | Default        |
| ---------- | ------------------------------------------------------ | -------------- |
| `size`     | `small \| medium \| large`                             | `medium`       |
| `color`    | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`      |
| `disabled` | `boolean`                                              | `false`        |
| `id`       | `string`                                               | auto-generated |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@okkly/vue";

const notifications = ref(false);
</script>

<template>
  <Switch v-model="notifications">
    <template #label>Enable notifications</template>
  </Switch>
</template>
```

`label` is a slot rather than a prop, since Vue has no `ReactNode`, and renders
only when filled. The controlled `checked` state is `v-model`. Anything else
the `<input>` itself understands (`value`, `name`, `required`, `aria-*`,
`@change`…) falls through to it — `class` is the one exception, which lands
on the outer `<label>` instead, matching React's `className`. The rendered
`<input type="checkbox" role="switch">` carries the switch role for assistive
technology.

## TextField

Single-line text input with label, helper text, and error state — the
foundation most form fields build on. Props mirror `@okkly/react`'s
`<TextField>` name-for-name.

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

`color` tints the focus ring/glow — `dante` is a rare, deliberate accent
moment; the rest are for matching a field to surrounding brand/section color.

## Box

The layout primitive: a `div` — or any element, through `as` — that takes
MUI-style system props. Props mirror `@okkly/react`'s `<Box>` name-for-name and
resolve through the same `@okkly/shared` function, so both render the same DOM.

```vue
<Box
  as="section"
  display="flex"
  :flex-direction="{ base: 'column', md: 'row' }"
  :gap="4"
  :p="{ base: 3, md: 6 }"
  bgcolor="bg.surface-raised"
  :border-radius="3"
>
  …
</Box>
```

| Props                                                                                                            | Value                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `m` `mx` `my` `mt` `mr` `mb` `ml`, `p` `px` `py` `pt` `pr` `pb` `pl`, `gap` `rowGap` `columnGap`, `borderRadius` | A step on the 4px scale (`2` → 8px) or any CSS length                            |
| `display` `flexDirection` `flexWrap` `alignItems` `justifyContent` `alignSelf` `flexGrow` `flexShrink`           | The CSS value                                                                    |
| `flexBasis` `width` `height` `minWidth` `maxWidth` `minHeight` `maxHeight`                                       | A fraction up to `1` is a percentage, a larger number pixels, a string CSS       |
| `bgcolor` `color` `borderColor`                                                                                  | A token path (`bg.surface`, `text.secondary`, `border.strong`…) or any CSS color |
| `border`                                                                                                         | A width in pixels, drawn in the default border color, or the CSS shorthand       |
| `as`                                                                                                             | A tag name or a component — `div` by default                                     |
| `container`                                                                                                      | Makes the Box a query container for its descendants' `@`-keys                    |

Every system prop takes one value per breakpoint: `base` at every width, the
viewport breakpoints `2xs` … `xl` from that window width up, and the container
breakpoints `@xs` (320px) … `@xl` (1024px) from that width of the nearest
`container` Box up — container values win. `class`, `style` and every other
attribute fall through to the element, and a consumer's `class`/`style` merge
after Box's own.

## Popper

Positioning and nothing else — puts its default slot next to `anchorEl` and
keeps it there through scrolling, resizing and the edges of the viewport, via
[`@popperjs/core`][popperjs]. It draws no surface and owns no dismissal; it is
the engine `Popover` is built on. Props mirror `@okkly/react`'s `<Popper>`
name-for-name.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Popper } from "@okkly/vue";

const anchorEl = ref<HTMLElement | null>(null);
</script>

<template>
  <button ref="anchorEl" type="button">Anchor</button>
  <Popper :open="!!anchorEl" :anchor-el="anchorEl" placement="bottom-start">
    <div class="my-panel">Positioned, and nothing else.</div>
  </Popper>
</template>
```

| Prop               | Type                                  | Default     |
| ------------------ | ------------------------------------- | ----------- |
| `open`             | `boolean`                             | —           |
| `anchorEl`         | `PopperAnchorEl`                      | `undefined` |
| `placement`        | `PopperPlacement`                     | `"bottom"`  |
| `keepMounted`      | `boolean`                             | `false`     |
| `disablePortal`    | `boolean`                             | `false`     |
| `container`        | `Element \| DocumentFragment \| null` | `undefined` |
| `modifiers`        | `Array<Partial<Modifier<…>>>`         | `undefined` |
| `popperOptions`    | `Partial<Options>`                    | `undefined` |
| `transition`       | `boolean`                             | `false`     |
| `matchAnchorWidth` | `boolean \| "min"`                    | `false`     |
| `minWidth`         | `number \| string`                    | `undefined` |
| `role`             | `string`                              | `"tooltip"` |

`children`, including React's render-prop form, becomes the default slot,
scoped with `{ placement, transitionProps }`: `placement` is what Popper.js
actually resolved to, and `transitionProps` (present only when `transition`
is set) is `{ in, onEnter, onExited }` — wire it into a `<Transition>` so
Popper stays mounted for the whole exit. `popperRef` is dropped; put a
template ref on `<Popper>` and read its exposed `popperInstance` instead.

## Popover

`Popper` plus dismissal: Escape, click-outside, a surface, and a scale+fade
transition. It is **not** modal and has **no scrim by default** —
`hideBackdrop` starts at `true`. Props mirror `@okkly/react`'s `<Popover>`
name-for-name; `onClose` becomes the `close` emit, still carrying
`(event, reason)`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "@okkly/vue";

const anchorEl = ref<HTMLElement | null>(null);
</script>

<template>
  <button @click="anchorEl = $event.currentTarget">Open</button>
  <Popover :open="!!anchorEl" :anchor-el="anchorEl" @close="anchorEl = null">
    <div>A menu, a filter panel, a date picker — anything that belongs to a control.</div>
  </Popover>
</template>
```

| Prop                 | Type                                    | Default     |
| -------------------- | --------------------------------------- | ----------- |
| `open`               | `boolean`                               | —           |
| `anchorEl`           | `HTMLElement \| null`                   | `undefined` |
| `anchorPosition`     | `{ top: number; left: number }`         | `undefined` |
| `placement`          | `PopperPlacement`                       | `"bottom"`  |
| `transitionDuration` | `number \| { enter?; exit? } \| "auto"` | `"auto"`    |
| `disablePortal`      | `boolean`                               | `false`     |
| `hideBackdrop`       | `boolean`                               | `true`      |
| `matchAnchorWidth`   | `boolean`                               | `false`     |
| `minWidth`           | `number \| string`                      | `undefined` |
| `paperClassName`     | `string`                                | `undefined` |

## Modal

The low-level primitive every modal overlay is built from: a portal, a
backdrop, a trapped focus, a body scroll lock, Escape handling, and focus
restored on close. **It draws no surface of its own** — the default slot
supplies all visual chrome. Props mirror `@okkly/react`'s `<Modal>`
name-for-name; `onClose` becomes the `close` emit.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Modal } from "@okkly/vue";

const open = ref(false);
</script>

<template>
  <button @click="open = true">Open</button>
  <Modal :open="open" @close="open = false">
    <div class="my-dialog" role="dialog" aria-modal="true" aria-label="Example">
      Your own panel, centred and styled by you.
    </div>
  </Modal>
</template>
```

| Prop                   | Type              | Default     |
| ---------------------- | ----------------- | ----------- |
| `open`                 | `boolean`         | —           |
| `container`            | `Element \| null` | `undefined` |
| `disablePortal`        | `boolean`         | `false`     |
| `disableEscapeKeyDown` | `boolean`         | `false`     |
| `disableAutoFocus`     | `boolean`         | `false`     |
| `disableEnforceFocus`  | `boolean`         | `false`     |
| `disableRestoreFocus`  | `boolean`         | `false`     |
| `disableScrollLock`    | `boolean`         | `false`     |
| `hideBackdrop`         | `boolean`         | `false`     |
| `keepMounted`          | `boolean`         | `false`     |
| `backdropClass`        | `string`          | `undefined` |

MUI's `slotProps.backdrop` escape hatch narrows to `backdropClass` — a single
extra class for restyling the backdrop. Anything a backdrop click should
additionally do belongs in the `close` handler, which already sees the
`"backdropClick"` reason.

[popperjs]: https://popper.js.org/

## Dialog

A centred panel that interrupts — built on `Modal`, which owns the portal,
backdrop, focus trap, scroll lock and focus restoration. `Dialog` adds the
centring and the sized paper, opening it with a `Grow` transition, and ships
`DialogTitle` / `DialogContent` / `DialogActions` / `DialogClose` for the
parts. Props mirror `@okkly/react`'s `<Dialog>` name-for-name and inherit
every `Modal` prop; `onClose` becomes the `close` emit, carrying
`(event, reason)` so a stray backdrop click can be told apart from a
deliberate Escape.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@okkly/vue";

const open = ref(false);
const close = () => {
  open.value = false;
};
</script>

<template>
  <Button @click="open = true">Delete the project</Button>
  <Dialog :open="open" max-width="xs" @close="close">
    <DialogTitle>Delete “Night drive”?</DialogTitle>
    <DialogContent>This cannot be undone.</DialogContent>
    <DialogActions>
      <Button variant="ghost" @click="close">Keep it</Button>
      <Button color="ember" @click="close">Delete it</Button>
    </DialogActions>
  </Dialog>
</template>
```

| Prop                 | Type                                            | Default  |
| -------------------- | ----------------------------------------------- | -------- |
| `fullWidth`          | `boolean`                                       | `false`  |
| `maxWidth`           | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| false` | `"sm"`   |
| `fullScreen`         | `boolean`                                       | `false`  |
| `transitionDuration` | `number \| { enter?, exit? } \| "auto"`         | `"auto"` |

Every `Modal` prop above (`container`, `keepMounted`, `disableEscapeKeyDown`,
…) is inherited and forwarded. `DialogClose` renders the corner ✕ — pass it
its own `@click` handler, since closing stays the caller's job.

## Transitions

`Fade`, `Grow`, `Zoom`, `Slide` and `Collapse` mirror `@okkly/react`'s
transition family, which in turn follows MUI's. Each takes a single default
slot and an `in` boolean (yes, `in` — it is only a reserved word as a bare
identifier, not as a prop name, so `:in="open"` works), and animates it:

| Component  | Animates                  | Default use                                                      |
| ---------- | ------------------------- | ---------------------------------------------------------------- |
| `Fade`     | opacity                   | present or not, with no directional cue                          |
| `Grow`     | scale + opacity, from 75% | something arriving _from_ a trigger — `Popover` is built on this |
| `Zoom`     | scale, from nothing       | a floating action button, a badge popping in                     |
| `Slide`    | translate along one edge  | a drawer, a toast, a bottom sheet                                |
| `Collapse` | height (or width)         | an accordion panel, "show more"                                  |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Fade } from "@okkly/vue";

const open = ref(false);
</script>

<template>
  <button @click="open = !open">Toggle</button>
  <Fade :in="open">
    <div class="my-panel">…</div>
  </Fade>
</template>
```

Shared props (`in`, `appear`, `easing`, and — Fade/Grow/Zoom/Slide only —
`keepMounted`) are documented on `SharedTransitionProps`. Two differences from
React's family, both forced by Vue having no `cloneElement`:

- Each component owns one wrapper element around the slot, rather than
  writing its class/style directly onto the caller's own child — the only way
  to reach that child reliably is through Vue's `<Transition>` hooks, and a
  bare `<slot>` cannot carry `v-show` (or any directive) for `keepMounted` to
  use.
- `mountOnEnter`/`unmountOnExit` — react-transition-group's two independent
  knobs — collapse into the one `keepMounted` boolean: `false` (the default)
  removes the child from the DOM once hidden (`v-if`); `true` keeps it,
  hidden with `display: none` (`v-show`), which is Vue's native way to do
  what React does with `visibility: hidden` while staying mounted.

`Collapse` is the exception: it always owns a wrapper, so its content is
mounted by default (`unmountOnExit`, off by default, opts into removing it
once fully collapsed) and it has no `keepMounted` prop.

Every component's six React lifecycle callbacks (`onEnter`/`onEntering`/
`onEntered`/`onExit`/`onExiting`/`onExited`) narrow to four emits — `enter`,
`entered`, `exit`, `exited` — since Vue's `<Transition>` exposes one hook per
phase rather than react-transition-group's three-part state machine.
`addEndListener`, an RTG escape hatch, has no Vue equivalent and is dropped;
every component already owns its end-of-transition timing.

## useRipple

`<Ripple>` paints the overlay `useRipple` tracks. The composable itself, along
with the ones `Modal` and `Popover` are built from, lives in
[`@okkly/vue-composables`][vue-composables] — install it alongside this
package to use them directly. Use them on any element that is
`position: relative; overflow: hidden`:

```bash
pnpm add @okkly/vue-composables
```

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Ripple } from "@okkly/vue";
import { useRipple } from "@okkly/vue-composables";

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

[vue-composables]: https://github.com/lovelycentury/okkly/tree/main/packages/vue-composables#readme

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
pnpm --filter @okkly/vue test:playwright   # component tests — see Tests
```

The library build lives in `vite.lib.config.ts` rather than `vite.config.ts`:
Storybook's Vite builder merges the project's root config into its own, and
neither `build.lib` nor the `.d.ts` pass has any business running for the
workbench. `.storybook/main.ts` brings its own `@vitejs/plugin-vue` in
exchange, since there is no root config for it to inherit one from.
