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

## ButtonGroup

A split button: one main action, always visible, plus an optional chevron
menu of variants of that same action — MUI's "split button" recipe folded
into a single component. Props mirror `@okkly/react`'s `<ButtonGroup>`
name-for-name: `action`/`variant`/`menu`/`color`/`disabled`/`menuAriaLabel`.

```vue
<ButtonGroup
  :action="{ label: 'Save', onClick: save }"
  :menu="[{ label: 'Save as…', onClick: saveAs }]"
/>
```

`action.icon` and each menu item's `label` narrow from React's `ReactNode` to
`string` — `icon` is raw SVG markup, rendered the way `Icon`'s own `icon` prop
is, since `action`/`menu` are plain data props rather than something a slot
can reach into. For a row of independent toggle buttons, use
`SegmentedToggle` instead — this component only ever renders one action.

## IconButton

Icon-only control for toolbars and dense UIs. Renders a native `<button>`, or
an `<a>` when given an `href`, exactly like `Button`. Props mirror
`@okkly/react`'s `<IconButton>` name-for-name.

| Prop            | Type                                                   | Default     |
| --------------- | ------------------------------------------------------ | ----------- |
| `variant`       | `ghost \| glass \| solid`                              | `ghost`     |
| `color`         | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`   |
| `size`          | `small \| medium \| large`                             | `medium`    |
| `disabled`      | `boolean`                                              | `false`     |
| `disableRipple` | `boolean`                                              | `false`     |
| `href`          | `string`                                               | `undefined` |

```vue
<IconButton aria-label="Add">
  <PlusIcon />
</IconButton>
```

React's `icon` prop and `children` fallback (`icon ?? children`) collapse
into a single default slot — the glyph, whichever way you pass it. Always
provide `aria-label`, since the slot is a bare icon with no visible text.
Anything else the element itself understands — `class`, `@click`, `aria-*` —
falls through to the rendered `<button>`/`<a>`. A disabled `<a>` drops its
href and reports `aria-disabled`.

## Fab

Floating action button for a screen's primary create/navigate action. Renders
a native `<button>`, or an `<a>` when given an `href`, exactly like `Button`.
Props mirror `@okkly/react`'s `<Fab>` name-for-name.

| Prop            | Type                                                   | Default     |
| --------------- | ------------------------------------------------------ | ----------- |
| `variant`       | `standard \| soft`                                     | `standard`  |
| `color`         | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`   |
| `size`          | `small \| medium \| large`                             | `medium`    |
| `disabled`      | `boolean`                                              | `false`     |
| `disableRipple` | `boolean`                                              | `false`     |
| `href`          | `string`                                               | `undefined` |

```vue
<Fab aria-label="Add">
  <PlusIcon />
</Fab>

<Fab>
  <PlusIcon />
  <template #label>New track</template>
</Fab>
```

React's required `icon` prop becomes the default slot — the glyph, always
present. `label` becomes the `label` slot; filling it grows the FAB into an
extended pill instead of a plain circle, the same way React infers shape from
whether `label` is set rather than a separate enum value. Provide
`aria-label` when the `label` slot is empty. Anything else the element itself
understands — `class`, `@click`, `aria-*` — falls through to the rendered
`<button>`/`<a>`. A disabled `<a>` drops its href and reports
`aria-disabled`. No built-in `SpeedDial` — compose plain `Fab`s instead.

## FileUpload

Drop zone for selecting files — click or drag & drop, with per-file
validation and a list of the current selection. Files that violate a
constraint are kept and marked instead of being dropped silently, so the
user can see what went wrong and remove them deliberately. Props mirror
`@okkly/react`'s `<FileUpload>` name-for-name.

| Prop            | Type                                                           | Default     |
| --------------- | -------------------------------------------------------------- | ----------- |
| `multiple`      | `boolean`                                                      | `false`     |
| `accept`        | `FileType[]`                                                   | `undefined` |
| `maxSize`       | `number \| BinaryPrefixedSize`                                 | `undefined` |
| `maxTotalSize`  | `number \| BinaryPrefixedSize`                                 | `undefined` |
| `maxCount`      | `number`                                                       | `undefined` |
| `replace`       | `boolean`                                                      | `false`     |
| `size`          | `large \| medium \| small`                                     | `large`     |
| `listType`      | `list \| maxHeight \| button \| hidden`                        | `list`      |
| `required`      | `boolean`                                                      | `false`     |
| `error`         | `boolean`                                                      | `undefined` |
| `showError`     | `boolean`                                                      | `undefined` |
| `name`          | `string`                                                       | `undefined` |
| `disabled`      | `boolean`                                                      | `false`     |
| `labels`        | `Partial<FileUploadLabels>`                                    | `undefined` |
| `locale`        | `string`                                                       | `undefined` |
| `getFileStatus` | `(file: File, index: number) => FileUploadStatus \| undefined` | `undefined` |
| `fullWidth`     | `boolean`                                                      | `false`     |
| `id`            | `string`                                                       | `undefined` |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FileUpload } from "@okkly/vue";

const files = ref<File[]>([]);
</script>

<template>
  <FileUpload v-model="files" multiple max-size="10MiB">
    <template #label>Attachments</template>
  </FileUpload>
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed
`defineModel<File | File[] | null>()`; `v-model` is always typed that way
regardless of `multiple` — React discriminates `onChange`'s signature on a
generic type param, which `defineProps` can't express, so check `multiple`
yourself if the branch matters. `label` becomes the `label` slot. React's
`renderFile` render prop becomes the `file` scoped slot, receiving
`{ file, index, status, disabled, remove }`. `onValidityChange` becomes the
`validity-change` emit. `inputRef` is dropped — use `defineExpose`'s own
`inputRef` (a template ref on the component instance) instead. There is no
`Tooltip` in `@okkly/vue` yet, so the `size="small"` error surfaces via the
native `title` attribute instead of a floating tooltip.

## InlineAction

Compact text/icon control for table rows and cards — loading, success, and
error states without a full `Button`. `state` is the single source of truth
for the non-native visual states (loading/success/error/readonly/disabled);
`disabled`/`loading`/`readonly` are convenience overrides that win over
`state` when true (disabled > loading > readonly). Props mirror
`@okkly/react`'s `<InlineAction>` name-for-name.

| Prop          | Type                                                                                         | Default     |
| ------------- | -------------------------------------------------------------------------------------------- | ----------- |
| `placeholder` | `string`                                                                                     | `undefined` |
| `action`      | `string`                                                                                     | `"Copy"`    |
| `size`        | `small \| medium \| large`                                                                   | `medium`    |
| `color`       | `primary \| dante \| indigo \| violet \| ember \| ice \| success \| warning \| danger`       | `undefined` |
| `fill`        | `filled \| soft \| outline \| gradient \| glass`                                             | `filled`    |
| `message`     | `string`                                                                                     | `undefined` |
| `state`       | `default \| hover \| focus \| filled \| loading \| success \| error \| readonly \| disabled` | `default`   |
| `readonly`    | `boolean`                                                                                    | `false`     |
| `loading`     | `boolean`                                                                                    | `false`     |
| `disabled`    | `boolean`                                                                                    | `false`     |
| `id`          | `string`                                                                                     | `undefined` |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { InlineAction } from "@okkly/vue";

const value = ref("");
</script>

<template>
  <InlineAction v-model="value" placeholder="you@company.com" @action="copy" />
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed `defineModel<string>()`
(this component has no uncontrolled `defaultValue` in React either, so there
is none here). `actionIcon` (`ReactNode` in React) becomes the `action-icon`
slot, shown only when `state` is `default`/`hover`/`focus`/`filled`/`readonly`
— it's overridden automatically for loading/success/error/readonly, same as
React. `onAction` becomes the `action` emit — a prop and an emit sharing a
name is fine in Vue, since `props.action`/`emit("action")` live in separate
namespaces. `className` is dropped — a consumer's `class` merges onto the
root automatically; every other native `<input>` attribute falls through to
the rendered `<input>` on its own.

## NumberInput

Numeric text field with steppers. Prefer over `TextField` when min/max/step
matter and values stay numeric. Props follow MUI's `TextField` API where
applicable, mirroring `@okkly/react`'s `<NumberInput>` name-for-name.

| Prop        | Type                       | Default     |
| ----------- | -------------------------- | ----------- |
| `hideLabel` | `boolean`                  | `false`     |
| `size`      | `small \| medium \| large` | `medium`    |
| `color`     | `primary \| dante`         | `primary`   |
| `error`     | `boolean`                  | `false`     |
| `fullWidth` | `boolean`                  | `false`     |
| `disabled`  | `boolean`                  | `false`     |
| `controls`  | `stepper \| chevrons`      | `stepper`   |
| `min`       | `number`                   | `undefined` |
| `max`       | `number`                   | `undefined` |
| `step`      | `number`                   | `1`         |
| `required`  | `boolean`                  | `false`     |
| `id`        | `string`                   | `undefined` |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NumberInput } from "@okkly/vue";

const value = ref<number | null>(12);
</script>

<template>
  <NumberInput v-model="value" :min="1" :max="99">
    <template #label>Quantity</template>
  </NumberInput>
</template>
```

`label`/`helperText` (both `ReactNode` in React) become the `label`/
`helper-text` slots. The controlled `value`/`onChange` pair becomes an
unnamed `defineModel<number | null>()`; `defaultValue` still seeds it once
on mount when nothing is bound. `onBlur`/`onKeyDown` are dropped — Vue
merges a consumer's `@blur`/`@keydown` with the component's own internal
listeners automatically (both run), unlike React where the component has to
manually call the prop back. `className`/`id` are dropped from that list —
Vue's own fallthrough (`class`) and `useId()` (`id`) handle them; every
other native `<input>` attribute falls through to the rendered `<input>` on
its own.

## Rating

Star (or custom glyph) scale for scores. Support half-steps with
`precision` when the data allows it. Props follow MUI's `Rating` API
closely, mirroring `@okkly/react`'s `<Rating>` name-for-name.

| Prop           | Type                                                              | Default     |
| -------------- | ----------------------------------------------------------------- | ----------- |
| `defaultValue` | `number \| null`                                                  | `null`      |
| `max`          | `number`                                                          | `5`         |
| `precision`    | `0.5 \| 1`                                                        | `0.5`       |
| `size`         | `small \| medium \| large`                                        | `medium`    |
| `color`        | `warning \| primary \| dante \| indigo \| violet \| ember \| ice` | `warning`   |
| `icon`         | `star \| heart`                                                   | `"star"`    |
| `readOnly`     | `boolean`                                                         | `false`     |
| `disabled`     | `boolean`                                                         | `false`     |
| `name`         | `string`                                                          | `undefined` |
| `getLabelText` | `(value: number) => string`                                       | —           |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Rating } from "@okkly/vue";

const value = ref<number | null>(3);
</script>

<template>
  <Rating v-model="value" />
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed
`defineModel<number | null>()`; `defaultValue` still seeds it once on mount
when nothing is bound, and the event argument drops the same way it does
for `Checkbox`/`Switch`. `icon` narrows from React's `RatingIcon | ReactNode`
to just `RatingIcon` — pass a custom filled glyph through the `icon` slot
instead, which wins over the `icon` prop when filled (rendered the same way
for every star — full, half, and empty differ only by wrapping CSS, same as
the built-in star/heart). `label` (`ReactNode` in React) becomes the `label`
slot.

## RichEditor

TipTap-based rich text with toolbar, slash menu, and word count. Prefer
`TextArea` for plain notes. Built on `@tiptap/vue-3` instead of
`@tiptap/react` — the same framework-agnostic `@tiptap/core`/`@tiptap/pm`/
`@tiptap/starter-kit`/extension packages underneath. Props mirror
`@okkly/react`'s `<RichEditor>` name-for-name.

| Prop          | Type                      | Default              |
| ------------- | ------------------------- | -------------------- |
| `format`      | `html \| json`            | `"html"`             |
| `toolbar`     | `full \| compact \| none` | `"full"`             |
| `placeholder` | `string`                  | `"Write something…"` |
| `maxLength`   | `number`                  | `undefined`          |
| `autosave`    | `number \| false`         | `5000`               |
| `slashMenu`   | `boolean`                 | `true`               |
| `readonly`    | `boolean`                 | `false`              |
| `disabled`    | `boolean`                 | `false`              |
| `error`       | `boolean`                 | `false`              |
| `fullWidth`   | `boolean`                 | `true`               |
| `color`       | `primary \| dante`        | `"primary"`          |
| `id`          | `string`                  | `undefined`          |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { RichEditor } from "@okkly/vue";

const value = ref("<p>Write something…</p>");
</script>

<template>
  <RichEditor v-model="value">
    <template #label>Description</template>
  </RichEditor>
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed
`defineModel<RichEditorValue>()`; `defaultValue` still seeds it once on
mount when nothing is bound. `label`/`helperText` (both `ReactNode` in
React) become the `label`/`helper-text` slots. `className`/`id` are dropped
— Vue's own fallthrough (`class`) and `useId()` (`id`) handle them.

## SegmentedToggle

Exclusive segments in one control — view modes, filters, or short option
sets. Props follow MUI's `ToggleButtonGroup` API loosely, mirroring
`@okkly/react`'s `<SegmentedToggle>` name-for-name.

| Prop           | Type                                                   | Default     |
| -------------- | ------------------------------------------------------ | ----------- |
| `items`        | `SegmentedToggleItem[]`                                | —           |
| `defaultValue` | `string \| string[]`                                   | `undefined` |
| `exclusive`    | `boolean`                                              | `true`      |
| `color`        | `primary \| dante \| indigo \| violet \| ember \| ice` | `"primary"` |
| `disabled`     | `boolean`                                              | `false`     |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SegmentedToggle } from "@okkly/vue";

const value = ref("week");
const items = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];
</script>

<template>
  <SegmentedToggle v-model="value" :items="items" />
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed
`defineModel<string | string[]>()`; `v-model` is always typed that way
regardless of `exclusive` — React discriminates `onChange`'s signature on
`exclusive` via a value that can be either shape, which `defineProps` can't
express either, so check `exclusive` yourself if the branch matters.
`defaultValue` still seeds it once on mount when nothing is bound. Each
item's `label` and `icon` (both `ReactNode` in React) narrow to `string` —
`icon` is raw SVG markup, rendered the way `Icon`'s own `icon` prop is,
since `items` is a plain data prop rather than something a slot can reach
into. `className` is dropped — a consumer's `class` merges onto the root
automatically.

## Checkbox

Binary or indeterminate choice. Props mirror `@okkly/react`'s `<Checkbox>`
name-for-name.

| Prop            | Type                                                                                   | Default        |
| --------------- | -------------------------------------------------------------------------------------- | -------------- |
| `value`         | `string`                                                                               | `undefined`    |
| `name`          | `string`                                                                               | `undefined`    |
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
only when filled. The controlled `checked` state is `v-model` — standalone.
Nested inside a `CheckboxGroup`, `value` picks the option and the checked
state comes from the group instead; `size`/`color` also fall back through the
group when unset. Anything else the `<input>` itself understands (`required`,
`aria-*`, …) falls through to it — `class` is the one exception, which lands
on the outer `<label>` instead, matching React's `className`.

## CheckboxGroup

Multi-select set of `Checkbox` children — nest them directly rather than
passing an options array, the same composition pattern as `RadioGroup`
(multi-select instead of single). Props mirror `@okkly/react`'s
`<CheckboxGroup>` name-for-name: `name`/`defaultValue`/`disabled`/`size`/
`color`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, CheckboxGroup } from "@okkly/vue";

const channels = ref<string[]>(["email"]);
</script>

<template>
  <CheckboxGroup v-model="channels">
    <template #label>Notification channels</template>
    <Checkbox value="email"><template #label>Email</template></Checkbox>
    <Checkbox value="sms"><template #label>SMS</template></Checkbox>
  </CheckboxGroup>
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed `defineModel<string[]>()`,
so consumers can `v-model` it — `defaultValue` still seeds it (read in a
computed fallback, never written into the model on mount) when nothing is
bound. `children` becomes the default slot and `label` becomes the `label`
slot.

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

## Radio / RadioGroup

`Radio` is a bare control — nest it inside `RadioGroup` for exclusive choice
among options, matching MUI's RadioGroup composition pattern. Props mirror
`@okkly/react`'s `<Radio>` / `<RadioGroup>` name-for-name.

| `Radio` prop | Type                                                   | Default        |
| ------------ | ------------------------------------------------------ | -------------- |
| `checked`    | `boolean`                                              | `undefined`    |
| `value`      | `string`                                               | `undefined`    |
| `name`       | `string`                                               | `undefined`    |
| `size`       | `small \| medium \| large`                             | `undefined`    |
| `color`      | `primary \| dante \| indigo \| violet \| ember \| ice` | `undefined`    |
| `disabled`   | `boolean`                                              | `false`        |
| `id`         | `string`                                               | auto-generated |

| `RadioGroup` prop | Type                                                   | Default        |
| ----------------- | ------------------------------------------------------ | -------------- |
| `name`            | `string`                                               | auto-generated |
| `defaultValue`    | `string`                                               | `undefined`    |
| `disabled`        | `boolean`                                              | `false`        |
| `size`            | `small \| medium \| large`                             | `medium`       |
| `color`           | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`      |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@okkly/vue";

const preference = ref("email");
</script>

<template>
  <RadioGroup v-model="preference">
    <template #label>Notification preference</template>
    <Radio value="email"><template #label>Email</template></Radio>
    <Radio value="sms"><template #label>SMS</template></Radio>
  </RadioGroup>
</template>
```

`RadioGroup` shares its selection with nested `Radio`s through `provide`/
`inject` (the Vue equivalent of React's context) — no options array, just
nest `<Radio value="...">` directly. The controlled `value` + `onChange` pair
becomes `v-model`; `defaultValue` still seeds it once on mount when nothing is
bound, same as React's uncontrolled mode. `size`/`color` set on `RadioGroup`
apply to every nested `Radio` unless one sets its own. `label` is a slot on
both components, rendering only when filled; on `RadioGroup` it also becomes
the visible group heading above the options (there's no automatic
`aria-label` derived from it, unlike React — pass your own `aria-label` when
the visible label isn't plain text). `Radio`'s own `checked` stays a plain
prop paired with the `change` emit rather than `v-model`, since a grouped
radio's checked state is derived from the group rather than owned locally.

## Chip / ChipGroup

`Chip` is a compact filter, tag, or choice token; `ChipGroup` composes them
into a wrapping row with single- or multi-select. Props mirror
`@okkly/react`'s `<Chip>` / `<ChipGroup>` name-for-name.

| `Chip` prop   | Type                                           | Default    |
| ------------- | ---------------------------------------------- | ---------- |
| `variant`     | `glass \| solid \| outline \| accent \| dante` | `glass`    |
| `size`        | `small \| medium \| large`                     | `medium`   |
| `selected`    | `boolean`                                      | `false`    |
| `dot`         | `boolean`                                      | `false`    |
| `removable`   | `boolean`                                      | `false`    |
| `disabled`    | `boolean`                                      | `false`    |
| `removeLabel` | `string`                                       | `"Remove"` |

| `ChipGroup` prop | Type                                                   | Default     |
| ---------------- | ------------------------------------------------------ | ----------- |
| `items`          | `ChipGroupItem[]`                                      | `undefined` |
| `exclusive`      | `boolean`                                              | `false`     |
| `color`          | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`   |
| `disabled`       | `boolean`                                              | `false`     |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ChipGroup } from "@okkly/vue";

const filters = ref<string[]>(["design"]);
const items = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
];
</script>

<template>
  <ChipGroup v-model="filters" :items="items" />
</template>
```

`Chip`'s `label` becomes the default slot (its only primary content, same
mapping as `Button`'s `children`) and `icon` becomes the `icon` slot, since
Vue has no `ReactNode`. `Chip`'s `click` listener — bound with `@click`, same
as any native element — is read by the component itself rather than left to
a plain fallthrough: only that lets it decide `role="button"`/keyboard
activation from whether a listener is attached at all, and gate it in JS
when `disabled`. `onRemove` becomes the `remove` emit.

`ChipGroup`'s controlled `value` + `onChange` pair becomes an unnamed
`v-model`, typed `string | string[]` depending on `exclusive`; `children`
becomes the default slot, the escape hatch for a fully custom chip tree used
when `items` is omitted. `ChipGroupItem.label` is a plain `string` rather
than `ReactNode`, since a data array has no natural place for slot content;
its `onClick`/`onRemove` stay plain callback props exactly as in React, since
they live inside a data object rather than being props of a component
instance.

## Slider

Continuous or discrete value along a track, with single or range (two-thumb)
selection. Props mirror `@okkly/react`'s `<Slider>` name-for-name.

| Prop                | Type                                                   | Default      |
| ------------------- | ------------------------------------------------------ | ------------ |
| `min`               | `number`                                               | `0`          |
| `max`               | `number`                                               | `100`        |
| `step`              | `number`                                               | `1`          |
| `marks`             | `boolean \| { value: number; label?: string }[]`       | `false`      |
| `orientation`       | `horizontal \| vertical`                               | `horizontal` |
| `disabled`          | `boolean`                                              | `false`      |
| `color`             | `primary \| dante \| indigo \| violet \| ember \| ice` | `primary`    |
| `size`              | `small \| medium \| large`                             | `medium`     |
| `valueLabelDisplay` | `auto \| on \| off`                                    | `off`        |
| `discrete`          | `boolean`                                              | `false`      |
| `shiftStep`         | `number`                                               | `undefined`  |
| `getAriaLabel`      | `(index: number) => string`                            | `undefined`  |
| `getAriaValueText`  | `(value: number, index: number) => string`             | `undefined`  |
| `track`             | `normal \| inverted \| none`                           | `normal`     |
| `valueLabelFormat`  | `(value: number, index: number) => string`             | `String`     |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@okkly/vue";

const brightness = ref(30);
</script>

<template>
  <Slider v-model="brightness" value-label-display="auto" aria-label="Brightness" />
</template>
```

The controlled `value` + `onChange` pair becomes an unnamed `v-model`, typed
`number | number[]` — pass an array to get a two-thumb range slider.
`defaultValue` still seeds it once on mount when nothing is bound, same as
React's uncontrolled mode; unlike `RadioGroup`, this never happens through an
eager write to the model (which would itself emit `update:modelValue` on
mount) — the fallback lives in the read path instead, so nothing fires until
the user actually moves a thumb, matching React's lazy initializer.
`onChangeCommitted` becomes the `changeCommitted` emit, firing once a drag or
keypress settles rather than on every intermediate value. Both drop the
`(event, …)` pair down to just the value, since nothing native fires a real
event here. The headless pointer/keyboard/ARIA behavior underneath is
`useSlider` from `@okkly/vue-composables`, the Vue port of
`@okkly/react-hooks`'s hook of the same name.

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

## TextArea

Multi-line text field for notes and descriptions. Prefer RichEditor when
formatting is required. Props mirror `@okkly/react`'s `<TextArea>`
name-for-name.

| Prop        | Type                       | Default        |
| ----------- | -------------------------- | -------------- |
| `hideLabel` | `boolean`                  | `false`        |
| `size`      | `small \| medium \| large` | `medium`       |
| `color`     | `primary \| dante`         | `primary`      |
| `error`     | `boolean`                  | `false`        |
| `fullWidth` | `boolean`                  | `false`        |
| `disabled`  | `boolean`                  | `false`        |
| `rows`      | `number`                   | `3`            |
| `maxRows`   | `number`                   | `undefined`    |
| `autosize`  | `boolean`                  | `false`        |
| `maxLength` | `number`                   | `undefined`    |
| `resize`    | `none \| vertical \| both` | `vertical`     |
| `required`  | `boolean`                  | `false`        |
| `id`        | `string`                   | auto-generated |

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TextArea } from "@okkly/vue";

const message = ref("");
</script>

<template>
  <TextArea v-model="message" required>
    <template #label>Message</template>
    <template #helper-text>Markdown supported</template>
  </TextArea>
</template>
```

`label` and `helper-text` are slots rather than props, since Vue has no
`ReactNode`; each renders only when filled. The controlled value is
`v-model`. Anything else the `<textarea>` itself understands (`placeholder`,
`name`, `@input`, `@change`…) falls through to it — `class` is the one
exception, which lands on the outer wrapper instead, matching React's
`className`.

Set `maxLength` to show an "n / max" character counter next to the helper
text. `autosize` grows the field with its content up to `maxRows`; `resize`
controls the manual resize handle and is ignored while `autosize` is on.

## Spinner

An indeterminate loading ring. Props mirror `@okkly/react`'s `<Spinner>`
name-for-name: `size`/`color`/`thickness`.

```vue
<Spinner size="small" color="primary" />
```

## Option primitives

`OptionScope`, `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`,
`OptionCheck` and `HighlightMatch` — the building blocks a custom `#option`
slot (see `Autocomplete` below) is built from, mirroring `@okkly/react`'s
`Option.tsx` exports name-for-name. `OptionScope` names the BEM block
(`"okkly-autocomplete"`, and later `"okkly-select"`) the parts underneath it
read, so a custom row still picks up its listbox's styling; outside a scope
they render as plain, unstyled elements.

## Autocomplete

Text field with a filtered suggestions list — continuous typing, multi-select
tags, grouping and free solo. Props follow `@okkly/react`'s `<Autocomplete>`
name-for-name where Vue lets it; see the doc comment on `AutocompleteProps` in
`Autocomplete.types.ts` for the full list of Vue-forced differences. The
highlights:

- The controlled `value`/`onChange` pair becomes the primary `v-model`;
  `inputValue`/`onInputChange` and `open`/`onOpenChange` become the named
  models `v-model:input-value` and `v-model:open`. A `change` emit still
  carries MUI's full `(event, value, reason, details)` signature for callers
  that need the reason a plain `v-model` drops.
- `renderOption`/`renderInput`/`renderGroup`/`renderNoOptions`/
  `renderLoading`/`renderTags` become the scoped slots `#option`, `#input`,
  `#group`, `#no-options`, `#loading` and `#tags`. `#option` and `#input` are
  narrower than React's render props — Vue's template model has no equivalent
  for "hand over pre-rendered content to reposition" without dropping to
  manual render functions, so `#option` replaces a whole row (full parity) but
  `#group` only replaces the header (the row list stays fixed) and `#input`
  only replaces the `<input>` (the tag row and clear/toggle buttons stay
  fixed).

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Autocomplete } from "@okkly/vue";
import type { AutocompleteOption } from "@okkly/vue";

const options: AutocompleteOption[] = [
  { value: "paris", label: "Paris" },
  { value: "tokyo", label: "Tokyo" },
];
const city = ref<AutocompleteOption | null>(null);
</script>

<template>
  <Autocomplete v-model="city" :options="options">
    <template #label>City</template>
  </Autocomplete>
</template>
```

It's built on the new `useAutocomplete` composable from
`@okkly/vue-composables`, itself built on the new `useControllableState`
composable — see that package's README for both.

## Select

Closed list of options in a field — prefer `Autocomplete` when the list is
long or searchable. Props follow `@okkly/react`'s `<Select>` (and through it
MUI's `Select`) name-for-name where Vue lets it; see the doc comment on
`SelectProps` in `Select.types.ts` for the full list of Vue-forced
differences. The highlights:

- The controlled `value`/`onChange` pair becomes the primary `v-model`;
  `open`/`onOpenChange` becomes the named model `v-model:open`. A `change`
  emit still carries MUI's full `(event, value, reason, details)` signature
  for callers that need the reason a plain `v-model` drops.
- `renderOption`/`renderInput`/`renderValue`/`renderGroup`/`renderNoOptions`/
  `renderLoading` become the scoped slots `#option`, `#trigger`, `#value`,
  `#group`, `#no-options` and `#loading`. `#trigger` is named for what it
  rebuilds — a `div[role="combobox"]` trigger, not a text `<input>` — rather
  than reusing `Autocomplete`'s own `#input` name. `#group` is narrower than
  React's `renderGroup`: it replaces only the header, since Vue's template
  model has no equivalent for "hand over pre-rendered content to reposition"
  without dropping to manual render functions.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Select } from "@okkly/vue";
import type { SelectOption } from "@okkly/vue";

const options: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
];
const team = ref<string | null>(null);
</script>

<template>
  <Select v-model="team" :options="options">
    <template #label>Team</template>
  </Select>
</template>
```

It's built on the new `useSelect` composable from `@okkly/vue-composables`,
which reuses the same grouping/normalization utilities `useAutocomplete`
built — see that package's README for both.

## Icon

Renders any glyph from `@okkly/icons`, painted with `currentColor` so it
inherits the surrounding text colour by default. Props mirror
`@okkly/react`'s `<Icon>` name-for-name: `name`/`icon`/`color`/`fontSize`/
`titleAccess`.

```vue
<Icon name="iconStar" />
<Icon :icon="iconHeart" color="danger" font-size="large" />
```

Give it `name` (autocompleted from the full set) or `icon` (markup you
already imported, for a tree-shakeable bundle) — React encodes "exactly one
of the two" as a discriminated union; Vue's `defineProps` can't express that
XOR, so both stay plain optional props and neither being set renders empty.
`ICON_NAMES` is exported alongside the component, the sorted list of every
available name.

## Typography

Text primitive for the editorial type scale, from `display-2xl` down to
`mono-sm`. Props mirror `@okkly/react`'s `<Typography>` name-for-name:
`variant`/`color`/`align`/`gutterBottom`/`noWrap`/`as`.

```vue
<Typography variant="h1" as="div">Looks like a page title, renders a div</Typography>
```

`as` takes a tag name or a component, the same shape `Box`'s own `as`
already uses, rather than React's per-element prop inference (`as="a"`
accepting exactly `href`) — Vue has no equivalent of
`ComponentPropsWithoutRef<E>` for a runtime-resolved `:is`, so whatever the
chosen element accepts falls through unchecked. `TYPOGRAPHY_VARIANTS` (the
variant → default-tag map) is exported alongside the component, same as
`@okkly/react`.

## Avatar

The person, compressed to one glyph: an image when there's one, initials
when there isn't, falling back to initials on its own if the image fails to
load. Props mirror `@okkly/react`'s `<Avatar>` name-for-name: `src`/`alt`/
`initials`/`status`/`shape`/`size`/`color`.

```vue
<Avatar src="/oleksii.jpg" alt="Oleksii Kryshtopa" status="online" />
<Avatar initials="OK" color="dante" />
```

## AvatarGroup

A stack of overlapping `Avatar` children for "who is on this", collapsing
anything past `max` into a "+N" chip. Props mirror `@okkly/react`'s
`<AvatarGroup>` name-for-name: `max`/`total`/`size`/`spacing`/`ring`/`hues`.

```vue
<AvatarGroup :max="4" :hues="['mint', 'dante', 'indigo']">
  <Avatar v-for="member in team" :key="member.id" :initials="member.initials" />
</AvatarGroup>
```

It reads its `Avatar` children from the default slot and overrides each
one's `size`/`color` with Vue's `cloneVNode` — the same transparent-override
contract React's version gets from `cloneElement`. One Vue-specific wrinkle
this had to account for: a `v-for` inside a slot compiles to a single
`Fragment` vnode wrapping the repeated children rather than N sibling
vnodes the way `{list.map(...)}` already is in JSX, so the children are
flattened before counting/slicing them.

## Divider

Hairline separator for lists, stacks and toolbars, with an optional
centered (or aligned) label. Props mirror `@okkly/react`'s `<Divider>`
name-for-name: `orientation`/`flexItem`/`textAlign`/`variant`; the label is
the default slot.

```vue
<Divider>or</Divider>
<Divider orientation="vertical" flex-item />
```

## Calendar

Month grid for a single date or a start/end range, with a year → month → day
drill-down header. Props mirror `@okkly/react`'s `<Calendar>` name-for-name:
`mode`/`min`/`max`/`weekStart`/`locale`/`previousMonthLabel`/`nextMonthLabel`/
`color`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Calendar } from "@okkly/vue";

const value = ref<Date | null>(null);
</script>

<template>
  <Calendar v-model="value" />
</template>
```

The controlled `value`/`onSelect` pair becomes the primary `v-model`;
`month`/`onMonthChange` becomes the named model `v-model:month`. `v-model` is
always typed `Date | [Date, Date] | null` regardless of `mode` — React
discriminates `onSelect`'s signature on `mode` via a union prop type, which
`defineProps` can't express, so check `mode` yourself if the branch matters.
`calendarToneStyle` (the `color` → `--okkly-calendar-tone` mapping) is
exported alongside the component, same as React, for `DateField`-style
consumers once those are ported.

## TimePicker

Scrollable hour/minute (and, for `format="12h"`, AM/PM) wheels — a plain,
MUI `MultiSectionDigitalClock`-style column list, not a masked text input.
Props mirror `@okkly/react`'s `<TimePicker>` name-for-name:
`step`/`format`/`color`/`hoursAriaLabel`/`minutesAriaLabel`/
`meridiemAriaLabel`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@okkly/vue";
import type { TimePickerValue } from "@okkly/vue";

const value = ref<TimePickerValue>({ h: 9, m: 30 });
</script>

<template>
  <TimePicker v-model="value" format="12h" />
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed `defineModel`, so
consumers `v-model` it; `defaultValue` still seeds it once on mount when
nothing is bound. `value.h` is always canonical 24-hour (0–23) regardless of
`format` — the AM/PM wheel is purely a 12-hour selection helper layered on
top of it.

## DateTimePicker

A fixed inline card composed from `Calendar` + `TimePicker` — pick a day on
the left, dial in a time on the right, then Confirm. No MUI equivalent as a
fixed surface (MUI X's `DateTimePicker` is a masked text input with a
popover); there's no shortcut-preset sidebar either — a preset is one line
against `v-model`. Props mirror `@okkly/react`'s `<DateTimePicker>`
name-for-name: `min`/`max`/`timeStep`/`format`/`weekStart`/`color`/`locale`/
`previousMonthLabel`/`nextMonthLabel`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DateTimePicker } from "@okkly/vue";

const value = ref<Date | null>(null);
</script>

<template>
  <DateTimePicker v-model="value" @confirm="onConfirm">
    <template #timezone-label>GMT+2</template>
  </DateTimePicker>
</template>
```

The controlled `value`/`onChange` pair becomes an unnamed `defineModel`;
`onConfirm` becomes the `confirm` emit, firing with the current value when
Confirm is clicked (disabled until a day is picked). `timezoneLabel`/
`summaryLabel`/`emptyLabel`/`confirmLabel` (all `ReactNode` in React) become
the `timezone-label`/`summary-label`/`empty-label`/`confirm-label` slots —
each falls back to React's own default text when left unfilled, and the
timezone chip renders only when that slot is filled.

## DateField

Masked `dd.mm.yyyy` text input with a `Calendar` popover, built on
`@maskito/vue`'s `v-maskito` directive. Closest MUI counterpart is MUI X's
`DateField`/`DatePicker`. Props mirror `@okkly/react`'s `<DateField>`
name-for-name: `size`/`color`/`error`/`fullWidth`/`disabled`/`min`/`max`/
`placeholder`/`id`/`required`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DateField } from "@okkly/vue";

const value = ref<Date | null>(null);
</script>

<template>
  <DateField v-model="value">
    <template #label>Date</template>
  </DateField>
</template>
```

`label`/`helperText` (both `ReactNode` in React) become the `label`/
`helper-text` slots. The controlled `value`/`onChange` pair becomes an
unnamed `defineModel<Date | null>()`; the controlled `open`/`onOpenChange`
pair becomes the named `defineModel<boolean>("open")`. `className` is
dropped — a consumer's `class` merges onto the field automatically.

## TimeField

Masked `HH:mm` text input with a `TimePicker` popover, built on
`@maskito/vue`'s `v-maskito` directive. Closest MUI counterpart is MUI X's
`TimeField`/`TimePicker`. Props mirror `@okkly/react`'s `<TimeField>`
name-for-name: `size`/`color`/`error`/`fullWidth`/`disabled`/`placeholder`/
`id`/`required`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimeField } from "@okkly/vue";

const value = ref<Date | null>(null);
</script>

<template>
  <TimeField v-model="value">
    <template #label>Time</template>
  </TimeField>
</template>
```

Same slot/model mapping as `DateField`: `label`/`helperText` become the
`label`/`helper-text` slots, the controlled `value`/`onChange` pair becomes
an unnamed `defineModel<Date | null>()` (time-of-day on a fixed base day),
and `open`/`onOpenChange` becomes the named `defineModel<boolean>("open")`.

## DateTimeField

Masked `dd.mm.yyyy, HH:mm` text input with a `DateTimePicker` popover, built
on `@maskito/vue`'s `v-maskito` directive; the picker closes on its own
Confirm click. Closest MUI counterpart is MUI X's
`DateTimeField`/`DateTimePicker`. Props mirror `@okkly/react`'s
`<DateTimeField>` name-for-name: `size`/`color`/`error`/`fullWidth`/
`disabled`/`min`/`max`/`placeholder`/`id`/`required`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DateTimeField } from "@okkly/vue";

const value = ref<Date | null>(null);
</script>

<template>
  <DateTimeField v-model="value">
    <template #label>Date & time</template>
  </DateTimeField>
</template>
```

Same slot/model mapping as `DateField`/`TimeField`: `label`/`helperText`
become the `label`/`helper-text` slots, the controlled `value`/`onChange`
pair becomes an unnamed `defineModel<Date | null>()`, and
`open`/`onOpenChange` becomes the named `defineModel<boolean>("open")`. The
input updates live as the popover's date/time wheels move; it also updates
(and the popover closes) when the popover's own Confirm button is clicked.

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

## Breadcrumbs

Trail of parent pages ending at the current location. Props mirror
`@okkly/react`'s `<Breadcrumbs>` name-for-name: `items`/`maxItems`/
`itemsBeforeCollapse`/`itemsAfterCollapse`/`expandAriaLabel`.

```vue
<script setup lang="ts">
import { Breadcrumbs } from "@okkly/vue";
import type { BreadcrumbItem } from "@okkly/vue";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Settings" },
];
</script>

<template>
  <Breadcrumbs :items="items" />
</template>
```

Crumbs come from an `items` array (`{label, href, icon}`) rather than
`children` composition; the last one always renders as the current page,
never as a link. `label`/`icon` narrow from React's `ReactNode` to `string`
— `icon` is raw SVG markup, rendered the way `Icon`'s own `icon` prop is,
since the whole object is a plain data prop with no slot equivalent.
`separator` becomes the `separator` slot, defaulting to a built-in chevron
when left empty. Past `maxItems` crumbs, the middle collapses behind a "…"
button that expands to the full path in place.

## Pagination

Page controls with boundary pages, a sibling window around the current page,
and ellipses in between. Props mirror `@okkly/react`'s `<Pagination>`
name-for-name: `count`/`siblingCount`/`boundaryCount`/`showFirstButton`/
`showLastButton`/`size`/`color`/`disabled`/`shape`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Pagination } from "@okkly/vue";

const page = ref(1);
</script>

<template>
  <Pagination v-model="page" :count="20" />
</template>
```

The controlled `page`/`onChange` pair (React has no separate `defaultValue`
— it is always controlled, defaulting to page 1 when unbound) becomes an
unnamed `defineModel<number>({ default: 1 })`, so consumers can `v-model`
it. The click event `onChange` also carried is dropped, matching
`Rating`/`Checkbox`/`Switch` — nothing here needs it.

## Tabs

Switch between peer views inside one panel — keyboard follows the WAI-ARIA
tabs pattern (roving tabindex, arrows move and activate, Home/End jump to
the ends). Props mirror `@okkly/react`'s `<Tabs>` name-for-name:
`variant`/`orientation`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "@okkly/vue";
import type { TabItem } from "@okkly/vue";

const items: TabItem[] = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity" },
];
const tab = ref("overview");
</script>

<template>
  <Tabs v-model="tab" :items="items" />
</template>
```

Tabs come from an `items` array rather than `Tab` children composition;
`label`/`icon` narrow from React's `ReactNode` to `string` — `icon` is raw
SVG markup, rendered the way `Icon`'s own `icon` prop is, since the whole
object is a plain data prop with no slot equivalent. The controlled
`value`/`onChange` pair becomes an unnamed `defineModel<string>()`;
`defaultValue` still seeds it once while unbound, falling back further to
the first tab's value. Tab panels are left to the consumer, same as React —
`Tabs` owns only the strip.

## Accordion

Expandable section built from three parts: `Accordion` owns the open state,
`AccordionSummary` is the button that toggles it, `AccordionDetails` is the
content — the panel animates its height in both directions and leaves the
DOM once collapsed. Props mirror `@okkly/react`'s `<Accordion>`
name-for-name: `disabled`.

```vue
<script setup lang="ts">
import { Accordion, AccordionSummary, AccordionDetails } from "@okkly/vue";
</script>

<template>
  <Accordion default-expanded>
    <AccordionSummary>Section title</AccordionSummary>
    <AccordionDetails>Panel content.</AccordionDetails>
  </Accordion>
</template>
```

The controlled `expanded`/`onChange` pair becomes an unnamed
`defineModel<boolean>()`; `defaultExpanded` still seeds it once while
unbound. `AccordionSummary`'s `expandIcon` becomes the `#expand-icon` slot,
defaulting to a built-in chevron. `AccordionSummary`/`AccordionDetails` read
the parent's state through Vue's `provide`/`inject` — the same mechanism
`RadioGroup` uses for its `Radio` children — so, like React's context, each
must render inside an `Accordion`.

## Stepper

Progress through an ordered flow — everything before `activeStep` renders
done, the step itself is current, the rest are pending. Purely
presentational — advancing is the consumer's job. Props mirror
`@okkly/react`'s `<Stepper>` name-for-name: `activeStep`/`orientation`/
`alternativeLabel`/`color`.

```vue
<script setup lang="ts">
import { Stepper } from "@okkly/vue";
import type { StepperStep } from "@okkly/vue";

const steps: StepperStep[] = [{ label: "Cart" }, { label: "Delivery" }, { label: "Payment" }];
</script>

<template>
  <Stepper :steps="steps" :active-step="1" />
</template>
```

Steps come from a `steps` array rather than `Step` children composition;
`label`/`description` narrow from React's `ReactNode` to `string`, since the
whole object is a plain data prop with no slot equivalent. `activeStep`
stays a plain required prop — there's no controlled/uncontrolled
distinction to make idiomatic here, same as React.

## Badge

A count or status dot pinned to the corner of another element. Props mirror
`@okkly/react`'s `<Badge>` name-for-name: `color`/`variant`/`max`/
`invisible`/`overlap`/`anchorOrigin`.

```vue
<script setup lang="ts">
import { Badge, IconButton } from "@okkly/vue";
</script>

<template>
  <Badge :badge-content="4" color="dante">
    <IconButton variant="glass" aria-label="Notifications, 4 unread">
      <span v-html="bellIcon" />
    </IconButton>
  </Badge>
</template>
```

React's `children` (the anchor) becomes the default slot — the badge is
standalone when it's empty, which is what you want in a list row or a tab
label. `badgeContent` narrows from `ReactNode` to `string | number` rather
than becoming a slot, since its value is read back for the max-overflow and
zero-hiding logic, not just rendered.

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
