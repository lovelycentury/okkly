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

## Box

`OkklyBox` (`[okklyBox]`) is the layout primitive, as a directive: MUI-style
system props on whatever element it decorates. Inputs mirror `@okkly/react`'s
`<Box>` name-for-name and resolve through the same `@okkly/shared` function, so
both render the same DOM.

```html
<section
  okklyBox
  display="flex"
  [flexDirection]="{ base: 'column', md: 'row' }"
  gap="4"
  [p]="{ base: 3, md: 6 }"
  bgcolor="bg.surface-raised"
  borderRadius="3"
>
  …
</section>
```

| Inputs                                                                                                           | Value                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `m` `mx` `my` `mt` `mr` `mb` `ml`, `p` `px` `py` `pt` `pr` `pb` `pl`, `gap` `rowGap` `columnGap`, `borderRadius` | A step on the 4px scale (`2` → 8px) or any CSS length                            |
| `display` `flexDirection` `flexWrap` `alignItems` `justifyContent` `alignSelf` `flexGrow` `flexShrink`           | The CSS value                                                                    |
| `flexBasis` `width` `height` `minWidth` `maxWidth` `minHeight` `maxHeight`                                       | A fraction up to `1` is a percentage, a larger number pixels, a string CSS       |
| `bgcolor` `color` `borderColor`                                                                                  | A token path (`bg.surface`, `text.secondary`, `border.strong`…) or any CSS color |
| `border`                                                                                                         | A width in pixels, drawn in the default border color, or the CSS shorthand       |
| `container`                                                                                                      | Makes the Box a query container for its descendants' `@`-keys                    |

Every system input takes one value per breakpoint: `base` at every width, the
viewport breakpoints `2xs` … `xl` from that window width up, and the container
breakpoints `@xs` (320px) … `@xl` (1024px) from that width of the nearest
`container` Box up — container values win. There is no `as`: put `okklyBox` on
the element the markup calls for. A numeric attribute (`p="4"`) reads as a
number, as `[p]="4"` does; a static attribute also stays on the element, as
with any Angular input, while a binding leaves nothing behind. The element's
own `class` and `style` merge with the directive's.

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
pnpm --filter @okkly/angular test:playwright   # component tests, in a real Chromium
```
