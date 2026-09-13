# @okkly/angular

Angular component library for the Okryshto design system.

```bash
pnpm add @okkly/angular
```

Load the styles once from your global `styles.scss` — the design system's
tokens, fonts, and reset first, then this package's component CSS:

```scss
@use "@okkly/design-system/styles/index.scss";
@use "@okkly/angular/style.css";
```

`@okkly/angular/style.css` carries only the component rules; every colour,
radius, and duration in them resolves against the `--okkly-*` custom properties
that `@okkly/design-system` declares, so both imports are required.

Then import the standalone component where you need it:

```ts
import { Component } from "@angular/core";
import { OkklyButton } from "@okkly/angular";

@Component({
  selector: "app-root",
  imports: [OkklyButton],
  template: `<button okklyButton variant="primary">Click me</button>`,
})
export class AppComponent {}
```

## Button

`OkklyButton` is an attribute component: it decorates a native `<button>` or
`<a>` rather than wrapping one, so the element keeps its own semantics,
attributes, and event bindings.

| Input             | Type                                                         | Default   |
| ----------------- | ------------------------------------------------------------ | --------- |
| `variant`         | `primary \| gradient \| secondary \| soft \| ghost \| glass` | `primary` |
| `color`           | `primary \| dante \| indigo \| violet \| ember \| ice`       | `primary` |
| `shape`           | `pill \| rounded`                                            | `pill`    |
| `size`            | `small \| medium \| large`                                   | `medium`  |
| `fullWidth`       | `boolean`                                                    | `false`   |
| `loading`         | `boolean`                                                    | `false`   |
| `loadingPosition` | `start \| center \| end`                                     | `center`  |
| `disabled`        | `boolean`                                                    | `false`   |
| `disableRipple`   | `boolean`                                                    | `false`   |

Icons are projected content tagged with a marker directive:

```ts
import { OkklyButton, OkklyButtonStartIcon } from "@okkly/angular";
```

```html
<button okklyButton variant="soft" size="large">
  <svg okklyButtonStartIcon viewBox="0 0 24 24"><!-- … --></svg>
  Save
</button>
```

An untagged slot collapses, so no gap is reserved for an icon you did not pass.

`loading` implies `disabled` and swaps in a spinner — at the start slot, the
end slot, or centered over a dimmed label, per `loadingPosition`.

Anchors cannot be disabled natively, so `<a okklyButton disabled>` gets
`aria-disabled="true"`, `tabindex="-1"`, and swallowed clicks; its `href` is
left untouched.

## TextField

`OkklyTextField` (`okkly-text-field`) is a single-line text input with label,
helper, and error — the foundation for most form fields.

| Input         | Type                                                                  | Default   |
| ------------- | --------------------------------------------------------------------- | --------- |
| `label`       | `string`                                                              | —         |
| `hideLabel`   | `boolean`                                                             | `false`   |
| `size`        | `small \| medium \| large`                                            | `medium`  |
| `color`       | `primary \| secondary \| dante \| violet \| ember \| ice \| contrast` | `primary` |
| `error`       | `boolean`                                                             | `false`   |
| `helperText`  | `string`                                                              | —         |
| `fullWidth`   | `boolean`                                                             | `false`   |
| `disabled`    | `boolean`                                                             | `false`   |
| `readOnly`    | `boolean`                                                             | `false`   |
| `required`    | `boolean`                                                             | `false`   |
| `type`        | `string`                                                              | `"text"`  |
| `placeholder` | `string`                                                              | —         |
| `id`          | `string`                                                              | generated |
| `value`       | `string` (`model`, two-way)                                           | `""`      |

```ts
import { Component } from "@angular/core";
import { OkklyTextField } from "@okkly/angular";

@Component({
  selector: "app-root",
  imports: [OkklyTextField],
  template: `<okkly-text-field label="Email" [(value)]="email" />`,
})
export class AppComponent {
  email = "";
}
```

Adornments (an icon, a unit, a button) are projected content tagged with a
marker directive, rendered inside the border beside the input:

```ts
import { OkklyTextField, OkklyTextFieldStartAdornment } from "@okkly/angular";
```

```html
<okkly-text-field label="Amount">
  <span okklyTextFieldStartAdornment>$</span>
</okkly-text-field>
```

`hideLabel` keeps the label in the DOM for assistive tech but visually hides
it. `required` shows a dante asterisk after the label and marks the native
`<input required>`. Its label/helper/error chrome comes from the internal
`Field` shell shared with future field-based controls (Select, Autocomplete).

## Ripple

`OkklyRipple` (`[okklyRipple]`) paints the press feedback and is applied to
`OkklyButton` as a host directive. Use it directly on any element that is
`position: relative; overflow: hidden`:

```html
<div okklyRipple class="okkly-component my-pressable">…</div>
```

It stays quiet on a host that is `:disabled` or `aria-disabled="true"`.

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.ts` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm storybook angular                       # dev server on :6007
pnpm --filter @okkly/angular storybook:build # static build → storybook-static/
```

Both scripts run `docs:json` first: Angular has no react-docgen equivalent, so
[Compodoc](https://compodoc.app) reads each input's type, default, and JSDoc off
the sources into `documentation.json`, which the docs page renders. That file is
generated, not committed — which is also why `typecheck` regenerates it before
running `tsc`.

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.ts`.

## Development

```bash
pnpm --filter @okkly/angular build   # ng-packagr → dist/, then style.css
pnpm --filter @okkly/angular test    # vitest + Angular TestBed (zoneless)
```
