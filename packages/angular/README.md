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

## ButtonGroup

`OkklyButtonGroup` (`okkly-button-group`) is a split button: one main action
plus a chevron menu of variants of that same action. It is composed like
Angular Material's `mat-menu` — your own buttons, each with its own `(click)` —
where `@okkly/react`'s `<ButtonGroup>` takes `action`/`menu` data with
callbacks. Its inputs mirror React's otherwise.

```html
<okkly-button-group color="indigo">
  <button okklyButtonGroupAction (click)="send()"><svg okklyButtonGroupIcon>…</svg>Send</button>
  <button okklyButtonGroupMenuItem (click)="sendLater()">Send later…</button>
  <button okklyButtonGroupMenuItem (click)="saveDraft()">Save as draft</button>
</okkly-button-group>
```

| Input           | Values                                                           |
| --------------- | ---------------------------------------------------------------- |
| `variant`       | `primary` (default), `secondary`                                 |
| `color`         | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice` |
| `disabled`      | Disables the whole split button                                  |
| `menuAriaLabel` | Accessible name of the chevron (default `Open menu`)             |
| `disablePortal` | Renders the menu in place instead of in `document.body`          |

The chevron appears once at least one `okklyButtonGroupMenuItem` is projected.
The menu opens in an `OkklyPopover` — portalled, flipped or shifted to stay on
screen, and grown in — and works like `mat-menu` from the keyboard: opening
(by click or ArrowDown on the chevron) focuses the first item, the arrow keys,
Home and End move between items, and picking one, Escape, Tab or an outside
click closes it and returns focus to the chevron. `disabled` on the action
button disables just that action.

## Icon

`OkklyIcon` (`okkly-icon`) renders a glyph from `@okkly/icons`. Pick one by
`name`, or pass markup you already imported via `icon` — the tree-shakeable
form to prefer in application code. Inputs mirror `@okkly/react`'s `<Icon>`
name-for-name.

```ts
import { iconStar } from "@okkly/icons";
```

```html
<okkly-icon name="iconSearch" />
<okkly-icon [icon]="iconStar" color="primary" titleAccess="Favourite" />
<p>Starred <okkly-icon [icon]="iconStar" fontSize="inherit" /> items stay pinned.</p>
```

| Input         | Values                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`        | Any `@okkly/icons` export name (`IconName`); bundles the whole set                                                   |
| `icon`        | Imported SVG markup; wins over `name`                                                                                |
| `color`       | `inherit` (default), `primary`, `dante`, `indigo`, `violet`, `ember`, `ice`, `success`, `warning`, `danger`, `muted` |
| `fontSize`    | `small`, `medium` (default), `large`, `inherit` (tracks the text size)                                               |
| `titleAccess` | Accessible name; without it the icon is `aria-hidden` decoration                                                     |

The markup is injected as trusted HTML, so it must be markup you control at
build time — never a string from a user, an API or a URL. `ICON_NAMES` lists
every name, for pickers.

## IconButton

`OkklyIconButton` (`button[okklyIconButton]`, `a[okklyIconButton]`) is an
icon-only control for toolbars and dense UIs. Like `OkklyButton`, it decorates
a native element; the glyph is the projected content. Inputs follow Angular
Material's icon button where they overlap and mirror `@okkly/react`'s
`<IconButton>` otherwise.

```html
<button okklyIconButton variant="glass" aria-label="Add">
  <svg>…</svg>
</button>
<a okklyIconButton href="/new" aria-label="Create"><svg>…</svg></a>
```

| Input           | Values                                                           |
| --------------- | ---------------------------------------------------------------- |
| `variant`       | `ghost` (default), `glass`, `solid`                              |
| `color`         | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice` |
| `size`          | `small`, `medium` (default), `large`                             |
| `disabled`      | Disables the control; a disabled anchor is `aria-disabled`       |
| `disableRipple` | Turns off the press ripple                                       |

There is no visible label, so always give it an `aria-label` (or a tooltip).

## Checkbox

`OkklyCheckbox` (`okkly-checkbox`) is a binary or indeterminate choice. Inputs
mirror `@okkly/react`'s `<Checkbox>` name-for-name; the selector follows
Angular Material's `mat-checkbox`.

```html
<okkly-checkbox label="Subscribe to updates" [(checked)]="subscribed" />
<okkly-checkbox
  label="Select all"
  [checked]="all"
  [indeterminate]="some"
  (checkedChange)="toggleAll($event)"
/>
```

| Input                               | Values                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `checked`                           | On/off; `[(checked)]` with `checkedChange`                                                                                    |
| `indeterminate`                     | Mixed state, cleared when the user toggles; `[(indeterminate)]`                                                               |
| `label`                             | Text beside the box, a `<label for>` tied to the native input                                                                 |
| `size`                              | `small`, `medium`, `large`; unset follows a group, else `medium`                                                              |
| `color`                             | `primary`, `dante`, `indigo`, `violet`, `ember`, `ice`, `success`, `warning`, `danger`; unset follows a group, else `primary` |
| `disabled`                          | Non-interactive                                                                                                               |
| `name`, `value`, `id`, `aria-label` | Forwarded to the native input                                                                                                 |

No `ngModel` or reactive-forms binding yet, as with `OkklyTextField`.

## CheckboxGroup

`OkklyCheckboxGroup` (`okkly-checkbox-group`) is a labelled set of checkboxes
that share one question. Nest `okkly-checkbox` elements with a `value` each; the
group gives them a shared `name`, owns which are checked, and passes its
`disabled`, `size` and `color` down unless a checkbox sets its own. Inputs
mirror `@okkly/react`'s `<CheckboxGroup>` name-for-name.

```html
<okkly-checkbox-group label="Notification channels" [(value)]="channels">
  <okkly-checkbox value="email" label="Email me updates" />
  <okkly-checkbox value="push" label="Push notifications" />
</okkly-checkbox-group>
```

| Input      | Values                                                                      |
| ---------- | --------------------------------------------------------------------------- |
| `value`    | Checked values; `[(value)]` (React's `defaultValue` is a one-way `[value]`) |
| `name`     | Shared input name; generated when omitted                                   |
| `label`    | Shown above the options and used as the group's accessible name             |
| `disabled` | Disables every checkbox                                                     |
| `size`     | `small`, `medium` (default), `large`                                        |
| `color`    | Any checkbox colour (default `primary`)                                     |

## Radio

`OkklyRadio` (`okkly-radio`) is one option of a single choice — usually nested
in an `OkklyRadioGroup`. Inputs mirror `@okkly/react`'s `<Radio>` name-for-name.

```html
<okkly-radio name="plan" value="pro" label="Pro" [(checked)]="isPro" />
```

| Input                               | Values                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `checked`                           | Selected; `[(checked)]` with `checkedChange`                                                  |
| `label`                             | Text beside the circle, a `<label for>` tied to the native input                              |
| `size`                              | `small`, `medium`, `large`; unset follows a group, else `medium`                              |
| `color`                             | `primary`, `dante`, `indigo`, `violet`, `ember`, `ice`; unset follows a group, else `primary` |
| `disabled`                          | Non-interactive                                                                               |
| `name`, `value`, `id`, `aria-label` | Forwarded to the native input                                                                 |

## RadioGroup

`OkklyRadioGroup` (`okkly-radio-group`) is a labelled single choice. Nest
`okkly-radio` elements with a `value` each; the group gives them a shared
`name`, owns which one is selected, and passes its `disabled`, `size` and
`color` down unless a radio sets its own. Inputs mirror `@okkly/react`'s
`<RadioGroup>` name-for-name.

```html
<okkly-radio-group label="Notification preference" [(value)]="preference">
  <okkly-radio value="email" label="Email me updates" />
  <okkly-radio value="none" label="No notifications" />
</okkly-radio-group>
```

| Input      | Values                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| `value`    | The selected value; `[(value)]` (React's `defaultValue` is a one-way `[value]`) |
| `name`     | Shared input name; generated when omitted                                       |
| `label`    | Shown above the options and used as the group's accessible name                 |
| `disabled` | Disables every radio                                                            |
| `size`     | `small`, `medium` (default), `large`                                            |
| `color`    | Any radio colour (default `primary`)                                            |

## Switch

`OkklySwitch` (`okkly-switch`) is an immediate on/off toggle — a native
checkbox carrying `role="switch"`. Prefer `OkklyCheckbox` for statements a form
submits later. Inputs mirror `@okkly/react`'s `<Switch>` name-for-name.

```html
<okkly-switch label="Dark mode" [(checked)]="darkMode" />
```

| Input                               | Values                                                           |
| ----------------------------------- | ---------------------------------------------------------------- |
| `checked`                           | On/off; `[(checked)]` with `checkedChange`                       |
| `label`                             | Text beside the track, a `<label for>` tied to the native input  |
| `size`                              | `small`, `medium` (default), `large`                             |
| `color`                             | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice` |
| `disabled`                          | Non-interactive                                                  |
| `name`, `value`, `id`, `aria-label` | Forwarded to the native input                                    |

## Chip

`OkklyChip` (`okkly-chip`) is a compact filter, tag or choice token. Inputs
mirror `@okkly/react`'s `<Chip>` name-for-name; the remove output is
`removed`, after Angular Material's `mat-chip`.

```html
<okkly-chip label="Fintech" variant="accent" dot />
<okkly-chip label="Remote" clickable [selected]="remote" (click)="remote = !remote" />
<okkly-chip label="Mobile" removable (removed)="drop('Mobile')" />
<okkly-chip label="Starred"><svg okklyChipIcon>…</svg></okkly-chip>
```

| Input         | Values                                                         |
| ------------- | -------------------------------------------------------------- |
| `label`       | Chip text                                                      |
| `variant`     | `glass` (default), `solid`, `outline`, `accent`, `dante`       |
| `size`        | `small`, `medium` (default), `large`                           |
| `selected`    | Active/filter state (`aria-pressed` when clickable)            |
| `dot`         | Leading status dot, unless an `okklyChipIcon` is projected     |
| `clickable`   | Makes it a focusable toggle button; Enter/Space fire `(click)` |
| `removable`   | Shows a trailing × that emits `removed`                        |
| `removeLabel` | Accessible name of the × (default `Remove`)                    |
| `disabled`    | Blocks clicks and removal                                      |

React infers a clickable chip from `onClick`; Angular cannot see whether a
`(click)` listener exists, so it takes MUI's explicit `clickable` input.

## ChipGroup

`OkklyChipGroup` (`okkly-chip-group`) is a wrapping row of chips that manage
single or multiple selection together. It is shaped like Angular Material's
`mat-chip-listbox`: bind the selection with `[(value)]` and mark each option
chip `okklyChipGroupOption` with its value. Its inputs mirror
`@okkly/react`'s `<ChipGroup>`.

```html
<okkly-chip-group [(value)]="departments">
  <okkly-chip okklyChipGroupOption="design" label="Design" />
  <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
</okkly-chip-group>

<okkly-chip-group exclusive [(value)]="view">…</okkly-chip-group>
```

| Input       | Values                                                           |
| ----------- | ---------------------------------------------------------------- |
| `value`     | A string when `exclusive`, a string array otherwise; `[(value)]` |
| `exclusive` | Single-select mode (default `false`)                             |
| `color`     | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice` |
| `disabled`  | Disables every chip in the group                                 |

Option chips become toggle buttons driven by the group; while `value` is unset
each keeps its own `selected`. Chips without the marker are left alone —
React's `children` escape hatch — and removable tags use the chip's own
`removable` and `(removed)` where React takes `items` with `onRemove`.

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

## Spinner

`OkklySpinner` (`okkly-spinner`) is an indeterminate loading ring, a
`role="status"` region labelled "Loading". Inputs mirror `@okkly/react`'s
`<Spinner>` name-for-name.

```html
<okkly-spinner size="large" aria-label="Loading your projects" />
<okkly-spinner size="small" aria-hidden="true" />
```

| Input       | Values                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `size`      | `small`, `medium` (default), `large`                                                             |
| `color`     | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice`, `success`, `warning`, `danger` |
| `thickness` | Ring stroke width in pixels, overriding the size preset                                          |

`aria-label` is an input: set it on the element to say what is loading, and it
replaces the default rather than competing with it. Inside a control that
already names the wait, hide the ring with `aria-hidden="true"`.

## Alert

`OkklyAlert` (`okkly-alert`) is an inline banner rendered as a `role="alert"`
live region. The message is the projected content. Inputs mirror
`@okkly/react`'s `<Alert>` name-for-name.

```html
<okkly-alert severity="danger" title="Couldn't save the draft" closable (close)="dismiss()">
  Your connection dropped while uploading. Nothing was lost.
  <button okklyButton okklyAlertAction variant="ghost" size="small">Retry</button>
</okkly-alert>
```

| Input      | Values                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| `severity` | `success`, `info` (default), `warning`, `danger`, `dante`                 |
| `variant`  | `standard` (default), `outlined`, `filled`                                |
| `title`    | Bold headline above the message                                           |
| `icon`     | `false` hides the icon; project an `okklyAlertIcon` to replace it         |
| `closable` | Renders a dismiss button that emits `close` — removing the alert is yours |

Project the recovery control tagged `okklyAlertAction`. React shows the close
button when `onClose` is set; Angular cannot see whether a `(close)` listener
exists, so `closable` turns it on.

## SeverityIcon

`OkklySeverityIcon` (`okkly-severity-icon`) is a tinted chip holding a status
glyph. Inputs mirror `@okkly/react`'s `<SeverityIcon>` name-for-name.

```html
<okkly-severity-icon severity="danger" size="small" label="Failed" />
<okkly-severity-icon severity="danger" size="large">
  <svg okklySeverityIconGlyph>…</svg>
</okkly-severity-icon>
```

| Input      | Values                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| `severity` | `success`, `info` (default), `warning`, `danger`, `primary`, `neutral` |
| `size`     | `small`, `medium` (default), `large`                                   |
| `shape`    | `circle` (default), `rounded`                                          |
| `label`    | Text equivalent of the tone; without it the icon is `aria-hidden`      |

A projected `okklySeverityIconGlyph` replaces the built-in glyph and keeps the
tint.

## Skeleton

`OkklySkeleton` (`okkly-skeleton`) is a placeholder that holds the space
content will take while it loads. It is always `aria-hidden`; announce the wait
once on the container with `aria-busy="true"`. Inputs mirror `@okkly/react`'s
`<Skeleton>` name-for-name.

```html
<div aria-busy="true" aria-label="Loading comments">
  <okkly-skeleton variant="circular" width="40" height="40" />
  <okkly-skeleton width="35%" />
</div>
```

| Input       | Values                                                             |
| ----------- | ------------------------------------------------------------------ |
| `variant`   | `text` (default), `circular`, `rectangular`, `rounded`             |
| `width`     | A number is pixels (`width="40"` too), a string any CSS length     |
| `height`    | Same as `width`                                                    |
| `animation` | `pulse` (default), `wave`, `false` (`animation="false"` works too) |

## Progress

`OkklyProgress` (`okkly-progress`) reports how far along a task is, as a
linear bar or a circular ring. The host is the `role="progressbar"` element;
give it a name with `aria-label` or `aria-labelledby`. Inputs mirror
`@okkly/react`'s `<Progress>` name-for-name.

```html
<okkly-progress [value]="uploaded" aria-label="Uploading report.pdf" />
<okkly-progress
  type="circular"
  value="74"
  color="warning"
  showLabel
  aria-label="Build minutes used"
/>
<okkly-progress variant="indeterminate" aria-label="Searching" />
```

| Input       | Values                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `value`     | 0–100, clamped (default `0`); ignored while indeterminate                                        |
| `variant`   | `determinate` (default), `indeterminate`                                                         |
| `type`      | `linear` (default), `circular`                                                                   |
| `size`      | `small`, `medium` (default), `large`                                                             |
| `color`     | `primary` (default), `dante`, `indigo`, `violet`, `ember`, `ice`, `success`, `warning`, `danger` |
| `showLabel` | Prints the percentage inside a determinate circular ring                                         |

Where Angular Material has `mat-progress-bar` and `mat-progress-spinner` with a
`mode`, this is one element with a `type` switch and React's `variant`.

## Card

`OkklyCard` (`okkly-card`) is a surface that groups one thing. Like Angular
Material's card it is composed from slots, each owning its own padding: use the
ones you need, in the order you need them. Inputs mirror `@okkly/react`'s
`<Card>` family name-for-name.

```html
<okkly-card variant="glass">
  <img okklyCardMedia [src]="cover" height="180" />
  <okkly-card-header title="Night drive vol. 2" subheader="Released 14 March">
    <okkly-avatar okklyCardAvatar initials="OK" size="sm" />
    <button okklyIconButton okklyCardAction aria-label="More options"><svg>…</svg></button>
  </okkly-card-header>
  <okkly-card-content>Eleven tracks recorded over the winter.</okkly-card-content>
  <okkly-card-actions>
    <button okklyButton size="small">Play</button>
  </okkly-card-actions>
</okkly-card>
```

| Part                  | Inputs                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `okkly-card`          | `variant` (`solid` default, `raised`, `glass`, `outline`, `aura`), `raised`, `padding` (`none`, `sm`, `md` default, `lg`), `color` (aura tone), `interactive` |
| `okkly-card-header`   | `title`, `subheader`; `okklyCardAvatar` and `okklyCardAction` projected slots, anything else goes under the title                                             |
| `okkly-card-content`  | —                                                                                                                                                             |
| `okkly-card-actions`  | —                                                                                                                                                             |
| `img[okklyCardMedia]` | `height` — pixels or any CSS length (default `150`); `alt` defaults to empty                                                                                  |

`interactive` only adds the hover lift: wrap the card in, or put inside it, a
real link or button so it is reachable by keyboard.

## Photo

`OkklyPhoto` (`okkly-photo`) is a framed portrait or hero cutout on a dark
surface. Inputs mirror `@okkly/react`'s `<Photo>` name-for-name.

```html
<okkly-photo [image]="member.photo" [alt]="member.name" variant="scrim" [caption]="member.name" />
<okkly-photo alt="Anna Berg"><span okklyPhotoFallback>AB</span></okkly-photo>
```

| Input         | Values                                                               |
| ------------- | -------------------------------------------------------------------- |
| `image`       | Source URL; falls back to a silhouette when unset or broken          |
| `alt`         | Required — names the image, or the placeholder when there is none    |
| `variant`     | `plain` (default), `framed`, `scrim`, `noir`, `cutout`               |
| `scrim`       | Adds the bottom gradient; implied by `scrim`/`noir` and by `caption` |
| `transparent` | Alias for `variant="cutout"`                                         |
| `size`        | `sm`, `md` (default), `lg`                                           |
| `caption`     | Name or role over the scrim                                          |
| `radius`      | `none`, `sm`, `md`, `lg`, `xl` (default); ignored on a cutout        |
| `loading`     | Shows a skeleton until the image loads                               |

Project an `okklyPhotoFallback` to replace the silhouette.

## Badge

`OkklyBadge` (`okkly-badge`) pins a count or status dot to the corner of
whatever is projected into it; with nothing projected it renders a standalone
pill for list rows and tab labels. Inputs mirror `@okkly/react`'s `<Badge>`
name-for-name.

```html
<okkly-badge badgeContent="4" color="dante">
  <button okklyIconButton aria-label="Notifications, 4 unread"><svg>…</svg></button>
</okkly-badge>
<okkly-badge variant="dot" color="success"><okkly-avatar initials="OK" /></okkly-badge>
<okkly-badge [badgeContent]="count" color="indigo" />
```

| Input          | Values                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `badgeContent` | A count or short label; `0` is hidden, and `badgeContent="4"` reads as a number                           |
| `color`        | `primary`, `dante`, `indigo`, `violet`, `ember`, `ice`, `success`, `warning`, `danger`; unset for neutral |
| `variant`      | `standard` (default), `dot`                                                                               |
| `max`          | Counts above it render as `{max}+` (default `99`)                                                         |
| `invisible`    | Hides the badge, keeping the anchor                                                                       |
| `overlap`      | `circular` (default), `rectangular`                                                                       |
| `anchorOrigin` | `{ vertical: "top" \| "bottom", horizontal: "left" \| "right" }` (default top right)                      |

Whether anything was projected is read off the rendered DOM after each render,
so wrapping the anchor in `@if` switches between the anchored and standalone
layouts. The pill itself is decoration: put the count in the anchor's
accessible name.

## Avatar

`OkklyAvatar` (`okkly-avatar`) shows a person's image, or their initials when
there is no image or it fails to load. Inputs mirror `@okkly/react`'s
`<Avatar>` name-for-name.

```html
<okkly-avatar [src]="user.photo" initials="OK" status="online" />
<okkly-avatar initials="AB" color="dante" alt="Anna Berg" />
```

| Input      | Values                                                             |
| ---------- | ------------------------------------------------------------------ |
| `src`      | Image URL; falls back to `initials` when unset or broken           |
| `alt`      | Accessible name — also makes the host `role="img"`                 |
| `initials` | Fallback letters; only the first two are shown                     |
| `status`   | `online`, `offline`, or unset for no presence dot                  |
| `shape`    | `circle` (default), `rounded`                                      |
| `size`     | `sm`, `md` (default), `lg`                                         |
| `color`    | `mint` (default), `dante`, `indigo` — the gradient behind initials |

Leave `alt` unset when a name sits next to the avatar: it is then decoration,
and announcing the name twice is noise.

## AvatarGroup

`OkklyAvatarGroup` (`okkly-avatar-group`) stacks overlapping avatars and
collapses the rest into a "+N" chip. Each member is an `okkly-avatar` marked
`*okklyAvatarGroupItem`; the group renders the ones it keeps and overrides
their size and tone. Inputs mirror `@okkly/react`'s `<AvatarGroup>`
name-for-name.

```html
<okkly-avatar-group max="4" [total]="project.memberCount" [hues]="['mint', 'dante', 'indigo']">
  @for (member of project.members; track member.id) {
  <okkly-avatar *okklyAvatarGroupItem [initials]="member.initials" [src]="member.photo" />
  }
</okkly-avatar-group>
```

| Input     | Values                                                                               |
| --------- | ------------------------------------------------------------------------------------ |
| `max`     | Avatars shown before the chip; at or over it one slot goes to the chip (default `5`) |
| `total`   | Real member count behind the chip, when higher than the members passed in            |
| `size`    | `sm` (default), `md`, `lg` — applied to every member                                 |
| `spacing` | `dense`, `default` (default), `loose`                                                |
| `ring`    | Canvas-coloured separator ring (default `true`)                                      |
| `hues`    | Tones cycled across members (default `["mint"]`)                                     |

React clones its `<Avatar>` children to override them; Angular cannot reach
into projected components, hence the structural marker.

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

## Transitions

The MUI-style transitions of `@okkly/react` are structural directives here:
each one sits on the element it animates, and the inputs go in the
microsyntax. Mounting is real — with `unmountOnExit` the element leaves the
DOM once it has finished leaving, and `mountOnEnter` keeps it out until it is
first shown.

```html
<div *okklyFade="open; timeout: 300; unmountOnExit: true">…</div>
```

Every transition takes the same shared inputs, prefixed with its own name in
the long form (`[okklyFadeTimeout]`):

| Input           | Values                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| (the directive) | Whether the element is shown — MUI's `in`                                 |
| `appear`        | Animate an element that starts shown on its first render (default `true`) |
| `timeout`       | Milliseconds, or `{ enter, exit }`                                        |
| `easing`        | A CSS timing function, or `{ enter, exit }`                               |
| `delay`         | Milliseconds to wait first — React reads it from `style.transitionDelay`  |
| `mountOnEnter`  | Keep the element out of the DOM until it is first shown                   |
| `unmountOnExit` | Take the element out of the DOM once it has left                          |

React's `onEnter` … `onExited` callbacks are the outputs `enter`, `entering`,
`entered`, `exit`, `exiting` and `exited`, each handed the element. The `*`
shorthand cannot bind outputs, so listen on the long form:

```html
<ng-template [okklyFade]="open" (exited)="cleanUp()">
  <div>…</div>
</ng-template>
```

| Directive        | Animates                                                              | Default `timeout`                    |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------ |
| `okklyFade`      | Opacity                                                               | `{ enter: 225, exit: 195 }`          |
| `okklyGrow`      | Opacity and scale, from the element's own `transform-origin`          | `"auto"` — from the element's height |
| `okklyZoom`      | Scale from a point, without opacity                                   | `{ enter: 225, exit: 195 }`          |
| `okklySlide`     | Position, in from the `direction` edge of the window or a `container` | `{ enter: 225, exit: 195 }`          |
| `okkly-collapse` | Height (or width), moving what follows — a component, see below       | `300`, or `"auto"`                   |

`OkklyCollapse` (`okkly-collapse`) is the one transition that is a component:
it renders wrappers of its own to measure its content, so the content goes
inside it — `<okkly-collapse [in]="open" timeout="auto">…</okkly-collapse>` —
and its inputs are plain (`[in]`, `orientation`, `collapsedSize`, `timeout`,
`easing`, `appear`, `mountOnEnter`, `unmountOnExit`), with the same six
outputs. Projected content is created with its parent and stays mounted; put
content that should mount on enter and unmount on exit in an
`<ng-template okklyCollapseContent>`.

## Breadcrumbs

`OkklyBreadcrumbs` (`okkly-breadcrumbs`) is the trail of parent pages ending at
the current one. Inputs mirror `@okkly/react`'s `<Breadcrumbs>` name-for-name:
`items`, `separator`, `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`,
`expandAriaLabel`.

```ts
import { iconHome } from "@okkly/icons";

items = [
  { label: "Home", href: "/", icon: iconHome },
  { label: "Projects", href: "/projects" },
  { label: "Settings" },
];
```

```html
<okkly-breadcrumbs [items]="items" [maxItems]="4" />

<okkly-breadcrumbs [items]="items">
  <ng-template okklyBreadcrumbsSeparator>›</ng-template>
</okkly-breadcrumbs>
```

The last crumb is always the current page (`aria-current="page"`), never a
link. An item's `icon` is raw SVG markup or a `TemplateRef`; `separator` is
text, and markup goes in an `okklyBreadcrumbsSeparator` template. The host is
the navigation landmark.

## EmptyState

`OkklyEmptyState` (`okkly-empty-state`) is the panel that stands in for a list
with nothing in it. Inputs mirror `@okkly/react`'s `<EmptyState>` name-for-name:
`title`, `description`, `severity`, `color`, `size`.

```html
<okkly-empty-state title="No projects yet" description="Projects you create will show up here.">
  <button okklyButton okklyEmptyStateAction size="small">New project</button>
</okkly-empty-state>
```

A custom glyph replaces the default severity icon when projected with
`okklyEmptyStateIcon`; every control tagged `okklyEmptyStateAction` goes in the
action row. `severity` picks the default icon's glyph and `color` its tone.

## FAB

`OkklyFab` (`button[okklyFab]`, `a[okklyFab]`) is the floating action button for
a screen's primary action. It decorates a native `<button>` or `<a>` like
Angular Material's `mat-fab`; inputs mirror `@okkly/react`'s `<Fab>`: `variant`,
`color`, `size`, `label`, `disabled`, `disableRipple`.

```html
<button okklyFab aria-label="Add"><okkly-icon name="iconPlus" /></button>
<button okklyFab label="New track"><okkly-icon name="iconMusic" /></button>
```

The glyph is the projected content; a `label` turns the FAB into an extended
pill. An icon-only FAB has no text, so give it an `aria-label`.

## InlineAction

`OkklyInlineAction` (`okkly-inline-action`) is a text field with an action
button inside it — copy, send, retry — and a feedback caption underneath.
Inputs mirror `@okkly/react`'s `<InlineAction>` name-for-name: `value`,
`placeholder`, `action`, `size`, `color`, `fill`, `message`, `state`,
`readonly`, `loading`, `disabled`.

```html
<okkly-inline-action
  aria-label="Email address"
  [(value)]="email"
  action="Send"
  [loading]="sending"
  [message]="error"
  [state]="error ? 'error' : 'default'"
  (actionClick)="send()"
/>
```

`value` is two-way bindable; React's `onAction` is the `actionClick` output. A
glyph projected with `okklyInlineActionIcon` replaces the button's arrow. The
control has no label of its own, so give it an `aria-label` (set on the native
input, as are `id`, `name` and `type`).

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
