# @okkly/svelte

Svelte component library for the Okryshto design system. Built for Svelte 5 —
props are runes, icons are snippets.

```bash
pnpm add @okkly/svelte svelte
```

Load the styles once at your entry point — the design system's tokens, fonts,
and reset first, then this package's component CSS:

```ts
import "@okkly/design-system/styles/index.scss";
import "@okkly/svelte/style.css";
```

`@okkly/svelte/style.css` carries only the component rules; every colour,
radius, and duration in them resolves against the `--okkly-*` custom properties
that `@okkly/design-system` declares, so both imports are required.

```svelte
<script lang="ts">
  import { Button } from "@okkly/svelte";
</script>

<Button variant="primary" onclick={save}>Click me</Button>
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

Icons are snippets, and so is the label:

```svelte
{#snippet save()}<SaveIcon />{/snippet}

<Button variant="soft" size="large" startIcon={save}>Save</Button>
```

A snippet you do not pass renders nothing at all, so no gap is reserved for it.
`loading` implies `disabled` and swaps in a spinner — at the start slot, the end
slot, or centered over a dimmed label, per `loadingPosition`.

Anything else spreads through to the rendered element: `class` merges with the
design system's own classes, and `onclick`, `aria-*`, `data-*` land on it
directly. An anchor cannot be disabled natively, so a disabled one drops its
href and gets `aria-disabled="true"` and `tabindex="-1"`.

## TextField

Single-line text input with label, helper, and error — the foundation for most
form fields. Props mirror `@okkly/react`'s `<TextField>` name-for-name, except
`color`, which takes every accent token the design system defines rather than
just `primary`/`dante`.

| Prop             | Type                                                                  | Default     |
| ---------------- | --------------------------------------------------------------------- | ----------- |
| `label`          | `Snippet`                                                             | `undefined` |
| `hideLabel`      | `boolean`                                                             | `false`     |
| `size`           | `small \| medium \| large`                                            | `medium`    |
| `color`          | `primary \| secondary \| dante \| violet \| ember \| ice \| contrast` | `primary`   |
| `error`          | `boolean`                                                             | `false`     |
| `helperText`     | `Snippet`                                                             | `undefined` |
| `fullWidth`      | `boolean`                                                             | `false`     |
| `required`       | `boolean`                                                             | `false`     |
| `startAdornment` | `Snippet`                                                             | `undefined` |
| `endAdornment`   | `Snippet`                                                             | `undefined` |
| `value`          | bindable                                                              | `undefined` |

```svelte
<script lang="ts">
  import { TextField } from "@okkly/svelte";

  let email = $state("");
</script>

{#snippet label()}Email{/snippet}
{#snippet helper()}We'll never share it{/snippet}

<TextField {label} helperText={helper} bind:value={email} placeholder="you@company.com" />
```

`label`/`helperText`/`startAdornment`/`endAdornment` are snippets, so a
consumer skips whichever it doesn't need — no gap is reserved for it. `value`
is a `$bindable` prop for two-way binding; pass a native `defaultValue`
instead for an uncontrolled field. Anything else — `oninput`, `disabled`,
`aria-*`, `data-*` — spreads through to the rendered `<input>`.

## ripple

`ripple` is a Svelte action — the framework's own primitive for behaviour
attached to an element, and the counterpart of `useRipple` + `<Ripple>` in
`@okkly/react`. Use it on anything that is `position: relative; overflow: hidden`:

```svelte
<script lang="ts">
  import { ripple } from "@okkly/svelte";
</script>

<div class="okkly-component my-pressable" use:ripple>…</div>
```

It stays quiet on a host that is `:disabled` or `aria-disabled="true"`, so a
caller only has to pass `disabled` through to the DOM.

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.svelte` and render from `src`, so a change shows up without
rebuilding.

```bash
pnpm storybook svelte                          # dev server on :6009
pnpm --filter @okkly/svelte storybook:build    # static build → storybook-static/
```

## Development

```bash
pnpm --filter @okkly/svelte build   # svelte-package → dist/, then style.css
pnpm --filter @okkly/svelte test    # vitest + @testing-library/svelte
```

`svelte-package` copies every file under `src` into `dist`, and its old
`package.files` filter was removed in v2 — so the `files` field in
`package.json` is what keeps tests, harnesses, and stories out of the published
tarball. `styles.scss` sits outside `src` for the same reason: the compiled CSS
is what ships.
