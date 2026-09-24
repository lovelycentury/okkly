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

## Divider

`OkklyDivider` (`okkly-divider`) is a hairline separator for lists, stacks and
toolbars. Inputs mirror `@okkly/react`'s `<Divider>` name-for-name.

```html
<okkly-divider />
<okkly-divider><span okklyDividerLabel>or</span></okkly-divider>
<okkly-divider orientation="vertical" flexItem />
```

| Input         | Values                                                     |
| ------------- | ---------------------------------------------------------- |
| `orientation` | `horizontal` (default), `vertical`                         |
| `variant`     | `fullWidth` (default), `inset`, `middle`                   |
| `flexItem`    | Stretches to fill a flex container's cross axis            |
| `textAlign`   | `left`, `center` (default), `right` — where the label sits |

The label is projected content tagged `okklyDividerLabel` rather than plain
children: Angular cannot tell whether a default slot received anything, and the
label's presence changes the divider's classes. A vertical divider shows no
label. The host is always `<okkly-divider role="separator">` (with
`aria-orientation="vertical"` when vertical), where React picks between an
`<hr>` and a `<div role="separator">`. Restyle it through the
`--okkly-divider-*` variables, set on the divider itself.

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

## Typography

`OkklyTypography` (`[okklyTypography]`) is the editorial type scale, as a
directive: it puts a `variant`'s size, line height, weight and tracking on
whatever element it decorates. Inputs mirror `@okkly/react`'s `<Typography>`
name-for-name.

```html
<h1 okklyTypography variant="display-lg" gutterBottom>Orbit</h1>
<p okklyTypography variant="body-lg" color="secondary">
  Approve CV downloads by location and radius.
</p>
```

| Inputs         | Value                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`      | `display-2xl` `display-xl` `display-lg` `h1` `h2` `h3` `h4` `body-lg` `body-md` `body-sm` `label-md` `label-sm` `caption` `overline` `mono-sm` (default `body-md`) |
| `color`        | `inherit` (default) `primary` `secondary` `muted` `accent` `success` `warning` `danger`                                                                            |
| `align`        | `inherit` (default) `left` `center` `right` `justify`                                                                                                              |
| `gutterBottom` | Adds a bottom margin proportional to the step's own font size                                                                                                      |
| `noWrap`       | Clips overflowing text to one line with an ellipsis                                                                                                                |

There is no `as`: put `okklyTypography` on the element the markup calls for —
`@okkly/react`'s per-variant default-element map has no Angular equivalent for
the same reason `okklyBox` has none, since the consumer already picked the
element by writing it.

## Ripple

`OkklyRipple` (`[okklyRipple]`) paints the press feedback and is applied to
`OkklyButton` as a host directive. Use it directly on any element that is
`position: relative; overflow: hidden`:

```html
<div okklyRipple class="okkly-component my-pressable">…</div>
```

It stays quiet on a host that is `:disabled` or `aria-disabled="true"`.

## Popper

`OkklyPopper` (`okkly-popper`) is positioning and nothing else: it puts an element
next to another element and keeps it there through scrolling, resizing, and the
edges of the viewport. It draws no surface — the projected content brings its own.

| Input              | Type                                                 | Default     |
| ------------------ | ---------------------------------------------------- | ----------- |
| `open`             | `boolean` (required)                                 | —           |
| `anchorEl`         | `HTMLElement \| VirtualElement \| (() => …) \| null` | `undefined` |
| `placement`        | Popper.js `Placement`                                | `bottom`    |
| `keepMounted`      | `boolean`                                            | `false`     |
| `disablePortal`    | `boolean`                                            | `false`     |
| `container`        | `Element \| DocumentFragment \| null`                | the body    |
| `modifiers`        | Popper.js modifiers                                  | `undefined` |
| `popperOptions`    | `Partial<Options>`                                   | `{}`        |
| `transition`       | `boolean`                                            | `false`     |
| `matchAnchorWidth` | `boolean \| "min"`                                   | `false`     |
| `minWidth`         | `number \| string`                                   | `undefined` |
| `role`             | `string`                                             | `tooltip`   |
| `popperClass`      | `string`                                             | `""`        |

```html
<button #trigger type="button" (click)="open.set(!open())">Details</button>
<okkly-popper [open]="open()" [anchorEl]="trigger" placement="bottom-start">
  <div class="my-card">…</div>
</okkly-popper>
```

React's render-prop `children({ placement, TransitionProps })` has no Angular
counterpart, so the same three values are public component state: read
`resolvedPlacement()` off a template reference variable, and drive a transition with
`notifyEnter()` and `notifyExited()` — the latter is what keeps the popper mounted
for the whole way out. `growSurface()` wires both to a Grow animation, which is what
`OkklyPopover` and `OkklyTooltip` use.

The popper is moved into the portal container, which leaves `<okkly-popper>` itself
holding nothing — so it is `display: contents`, and `popperClass` is how classes
reach the surface a stylesheet targets. The same applies to `popoverClass`,
`modalClass` and `backdropClass` below.

## Popover

`OkklyPopover` (`okkly-popover`) is Popper plus dismissal: Escape, click-outside, a
paper surface, and a Grow transition. It is **not** modal and has no scrim by
default.

| Input                | Type                                  | Default     |
| -------------------- | ------------------------------------- | ----------- |
| `open`               | `boolean` (required)                  | —           |
| `anchorEl`           | `HTMLElement \| null`                 | `undefined` |
| `anchorPosition`     | `{ top: number; left: number }`       | `undefined` |
| `placement`          | Popper.js `Placement`                 | `bottom`    |
| `transitionDuration` | `number \| { enter, exit } \| "auto"` | `auto`      |
| `disablePortal`      | `boolean`                             | `false`     |
| `hideBackdrop`       | `boolean`                             | `true`      |
| `matchAnchorWidth`   | `boolean`                             | `false`     |
| `minWidth`           | `number \| string`                    | `undefined` |
| `popoverClass`       | `string`                              | `""`        |
| `paperClass`         | `string`                              | `""`        |

```html
<button #trigger okklyButton (click)="anchor.set(trigger)">Actions</button>
<okkly-popover [open]="!!anchor()" [anchorEl]="anchor()" (close)="anchor.set(null)">
  …
</okkly-popover>
```

`close` emits `{ event, reason }`, where `reason` is `"backdropClick"` or
`"escapeKeyDown"` — the pair React passes as two arguments, since an `output()`
carries a single value. `anchorPosition` anchors to coordinates instead of an
element, for a context menu.

## Tooltip

`OkklyTooltip` (`[okklyTooltip]`) is a directive on the trigger itself, as Angular
Material's `matTooltip` is, so its listeners and ARIA attributes land on the real
control with no wrapper. Every input is namespaced for the same reason Material's
are: a trigger usually carries other directives too.

| Input                              | Type                                  | Default |
| ---------------------------------- | ------------------------------------- | ------- |
| `okklyTooltip`                     | `string \| TemplateRef`               | `""`    |
| `okklyTooltipPlacement`            | Popper.js `Placement`                 | `top`   |
| `okklyTooltipOpen`                 | `boolean` (two-way)                   | unbound |
| `okklyTooltipDefaultOpen`          | `boolean`                             | `false` |
| `okklyTooltipEnterDelay`           | `number`                              | `200`   |
| `okklyTooltipLeaveDelay`           | `number`                              | `0`     |
| `okklyTooltipArrow`                | `boolean`                             | `true`  |
| `okklyTooltipInteractive`          | `boolean`                             | `true`  |
| `okklyTooltipDescribeChild`        | `boolean`                             | `false` |
| `okklyTooltipDisableHoverListener` | `boolean`                             | `false` |
| `okklyTooltipDisableFocusListener` | `boolean`                             | `false` |
| `okklyTooltipTransitionDuration`   | `number \| { enter, exit } \| "auto"` | `auto`  |
| `okklyTooltipClass`                | `string`                              | `""`    |

```html
<button type="button" okklyTooltip="Delete — this cannot be undone">
  <svg viewBox="0 0 24 24"><!-- … --></svg>
</button>
```

It decides whether to name or to describe from the trigger, not from an input. A
trigger with a name of its own — visible text or its own `aria-label` — gets the
tooltip as `aria-describedby` while it is open. A trigger with no name at all, as an
icon button has none, gets it as `aria-label`, permanently.
`okklyTooltipDescribeChild` forces the description side.

Pass a `TemplateRef` for content richer than a line of text — that is the Angular
counterpart of React's `ReactNode` title. The outputs are `okklyTooltipOpened` and
`okklyTooltipClosed`.

## Modal

`OkklyModal` (`okkly-modal`) is the plumbing behind every modal overlay and nothing
else: a portal, a backdrop, a focus trap, a scroll lock, Escape handling, and focus
put back where it came from. **It draws no surface of its own** — the projected
content brings the panel, the centring and the dialog semantics.

| Input                  | Type                 | Default  |
| ---------------------- | -------------------- | -------- |
| `open`                 | `boolean` (required) | —        |
| `container`            | `Element \| null`    | the body |
| `disablePortal`        | `boolean`            | `false`  |
| `disableEscapeKeyDown` | `boolean`            | `false`  |
| `disableAutoFocus`     | `boolean`            | `false`  |
| `disableEnforceFocus`  | `boolean`            | `false`  |
| `disableRestoreFocus`  | `boolean`            | `false`  |
| `disableScrollLock`    | `boolean`            | `false`  |
| `hideBackdrop`         | `boolean`            | `false`  |
| `keepMounted`          | `boolean`            | `false`  |
| `modalClass`           | `string`             | `""`     |
| `backdropClass`        | `string`             | `""`     |

```html
<okkly-modal [open]="open()" (close)="open.set(false)">
  <div class="my-centring-layer">
    <div class="my-panel" role="dialog" aria-modal="true" aria-labelledby="title">…</div>
  </div>
</okkly-modal>
```

`close` emits `{ event, reason }`, as `OkklyPopover`'s does. `keepMounted` hides the
subtree with `visibility` rather than removing it, which is what lets a consumer
animate the modal out — there is no `closeAfterTransition`, because with no built-in
transition to wait on, that decision belongs to whoever owns the animation.

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
