---
name: create-vue-component
description: Scaffold a new component in @okkly/vue following the package's structure — the single-file component (.vue) and its types (.types.ts), a Storybook story that doubles as the docs page, Playwright component tests with matrix screenshots, the public export, a README section, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, scaffold, or port (from @okkly/react) a Vue component in packages/vue.
argument-hint: <ComponentName> [what it does / which @okkly/react component it ports]
---

# Create a Vue component

Build `$ARGUMENTS` as a new component in `packages/vue`, matching how the existing components are laid out. If no name was given, ask for one (PascalCase) and a one-line description before starting.

## Styles come first

The component's look lives in `@okkly/design-system`, not in this package. If `packages/design-system/src/components/<Name>/<Name>.scss` does not exist yet, run the **`create-design-component`** skill for it first, then continue here. The Vue component only decides which `okkly-<kebab>` classes go on which element.

## Port, don't reinvent

`@okkly/react` is the reference implementation, and most components already exist there. If `packages/react/src/components/<Name>/<Name>.tsx` exists, this is a port:

- Props keep React's names, types, and defaults **name-for-name**; the union types keep their names (`<Name>Variant`, `<Name>Size`…).
- The rendered DOM — element, classes, modifiers, `aria-*` wiring, keyboard handling — matches React's, so the same stylesheet produces the same result.
- The only differences are the ones Vue forces, and they are listed in the props doc comment (see Conventions).
- The behaviours React's `<Name>.ct.tsx` tests (`should …`) are the checklist for this package's `<Name>.ct.ts`, and its screenshot matrices are copied axis for axis.
- The stories mirror React's `<Name>.stories.tsx`: same `title`, same story names in the same order, so the workbenches read the same.

## Read before writing

1. Confirm the name is free: `packages/vue/src/components/<Name>/` must not exist.
2. Read `packages/vue/src/components/Button/` — `Button.vue`, `Button.types.ts`, `Button.stories.ts`, `Button.ct.ts` — the reference for every convention below. [templates.md](templates.md) is a starting point, not a substitute; where they differ, follow the existing code.
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables.
4. If porting, read the React component, its stories and its `.ct.tsx`.
5. Reuse before inventing: `src/composables/` (e.g. `useRipple`), existing components (`Ripple`), and `@okkly/shared` — the framework-neutral half every package shares (a component's prop types and prop-to-class logic, as for Box, plus `bem`/`clamp`/`uniqueId`/`debounce`); anything the four framework packages would each repeat belongs there. A React hook from `@okkly/react-hooks` becomes a composable in `src/composables/use<Name>.ts`, exported from `src/index.ts`.

## Files to create

| File                                                   | Purpose                                       |
| ------------------------------------------------------ | --------------------------------------------- |
| `packages/vue/src/components/<Name>/<Name>.vue`        | The component                                 |
| `packages/vue/src/components/<Name>/<Name>.types.ts`   | Every type the component declares             |
| `packages/vue/src/components/<Name>/<Name>.stories.ts` | Storybook stories = the component's docs page |
| `packages/vue/src/components/<Name>/<Name>.ct.ts`      | Playwright component tests + matrix shots     |
| `packages/vue/src/index.ts`                            | Append the export block                       |
| `packages/vue/README.md`                               | A `## <Name>` section, like `## Button`       |
| `.changeset/vue-<kebab-name>.md`                       | `minor` bump for `@okkly/vue`                 |

Internal sub-parts that are not public API (like `Button/Spinner.vue`) sit in the same folder and are not exported. Stories and tests never ship — `tsconfig.build.json` excludes them — so nothing needs registering beyond `src/index.ts`.

## Conventions

### Types (`<Name>.types.ts`)

Every type the component declares lives in this file next to `<Name>.vue`, as in `Button.types.ts`; the SFC declares none.

- The union types (`<Name>Variant`, `<Name>Size`…) and `export interface <Name>Props`, with only `import type` statements at the top — no runtime code.
- Put a doc comment on `<Name>Props` saying it mirrors `@okkly/react`'s `<<Name>>` (and through it MUI) and listing the Vue-forced differences — e.g. `ReactNode` props become slots.
- Every prop gets a JSDoc block with a one-line description and `@default` (no `@type` — Storybook's Vue docgen reads the TypeScript type).
- Do **not** redeclare native attributes. `class`, `style`, `type`, `@click`, `aria-*`, `data-*` fall through to the root element, and Vue merges a consumer's `class` with the root's `:class` on its own.
- A sibling component's types come from its own `.types` module (`import type { FieldSize } from "../Field/Field.types"`), and stories, tests and `src/index.ts` import from `./<Name>.types` — never from a `.vue` file.

### Component (`<Name>.vue`)

- One `<script setup lang="ts">` with the implementation, importing its props with `import type { <Name>Props } from "./<Name>.types";` — Vue's compiler resolves a type imported from a relative file for `defineProps`. A plain `<script lang="ts">` block appears only for a runtime value the component exports (`getFieldIds` in `Field.vue`), never for types. The type arguments of `defineSlots<{…}>()` and `defineModel<…>()` stay inline.
- The stylesheet is a side-effect import inside `<script setup>`: `import "@okkly/design-system/components/<Name>/<Name>.scss";`. The library build collects it into `okkly-vue.css` — no other registration.
- `withDefaults(defineProps<<Name>Props>(), { … })` lists every default, `undefined` ones included.
- Mapping React's API:
  - `children` → the default slot; other `ReactNode` props (`startIcon`, `action`…) → named kebab-case slots (`start-icon`), typed with `defineSlots` and rendered only when filled (`v-if="!!slots['start-icon']"`).
  - Callback props for events the root element already fires (`onClick`) → nothing; they fall through.
  - Component-specific callbacks (`onClose`, `onChange`) → `defineEmits` with the React name minus `on`, lowercased (`close`, `change`).
  - A controlled `value` + `onChange` pair → `defineModel`, so consumers can `v-model` it.
  - Refs to DOM nodes → `useTemplateRef`.
- Classes: a `computed` array filtered with `Boolean` and joined — `"okkly-component"`, `"okkly-<kebab>"`, then modifiers, emitting a modifier only for **non-default** values. Use only class names the stylesheet defines.
- Accessibility is part of the component: correct native element or role, `aria-*` wiring, keyboard support, and `useId()` for generated ids.
- A `<style>` block only for markup this package invents and the design system therefore cannot know about (like `.okkly-button__loader`) — unscoped, with a comment saying why. Everything else belongs in the stylesheet.

### Story (`<Name>.stories.ts`) — this is the docs

- `Meta`/`StoryObj` from `@storybook/vue3-vite`. The JSDoc above `const meta` becomes the page description.
- Slot content is not a prop, so add it as an extra arg (`label`) in a `<Name>Args` type, and split it back out in a shared `render` helper so it lands in the slot instead of falling through as an attribute (see `Button.stories.ts`).
- `title` uses an existing sidebar group: `Control/`, `Navigation/`, `Feedback/`, `Overlays/`, `Data/`, `Media/`, `Brand/`, `Helpers/` — the same one React uses.
- `args` lists every prop default; `argTypes` gives unions an `inline-radio` (few options) or `select` control.
- If not porting: first story `Playground` ("Play with every prop from the controls panel."), then one story per realistic use case with a JSDoc comment, ending with `CustomStyling`, which overrides the `--okkly-<kebab>-*` variables inline on the component.
- Inline icons as SVG strings rather than importing `@okkly/icons`, as `Button.stories.ts` does.

### Tests (`<Name>.ct.ts`)

Tests run in a real Chromium through Playwright (`@playwright/experimental-ct-vue`), against the stylesheet the package ships — the same setup as `@okkly/react`'s `.ct.tsx`.

- Import `test`/`expect` from `../../playwright/a11y` (never directly from Playwright) and `executeMatrixScreenshotTest` from `../../playwright/screenshots`.
- `mount(<Name>, { props, slots, on })`:
  - `slots` are raw markup, compiled as Vue templates (so an `<svg>` renders as an element);
  - `on` catches emits (`"update:modelValue"`); a native event that falls through to the root (`click`) has no emit, so pass it as a listener prop (`props: { onClick }`);
  - flip props with `component.update({ props })`. It resets the slots unless you pass them again, so assert on classes/attributes after an update, or mount a separate case.
- Import the union types from `./<Name>.types` and declare option arrays with `as const satisfies readonly <Name>Variant[]` so a new union member is a type error until the tests cover it.
- A `test.describe("Screenshot tests", …)` block with one matrix per visual axis (variants, colors, sizes, states), as in `Button.ct.ts`; each cell is `args: (column, row) => ({ props, slots })` and is scanned by axe. A matrix that shows hover/focus/active uses `hooks.beforeEach` with `useFocusStateHooks` and stays isolated; a purely static one may set `fastNoIsolation: true`.
- Behaviour tests named `should …`, each body marked with `// ARRANGE`, `// ACT`, `// ASSERT` comments. Cover: role and accessible name, default classes, each modifier, slots rendered only when filled, emits and fall-through listeners, keyboard interaction, disabled/edge states. Group related cases with `test.describe("<prop>", …)`.
- Drive the component the way a user does — `click()`, `page.mouse`, `pressSequentially()` — rather than dispatching synthetic events.

### Export (`src/index.ts`)

```ts
export { default as <Name> } from "./components/<Name>/<Name>.vue";
export type { <Name>Props, <Name>Variant } from "./components/<Name>/<Name>.types";
```

### Changeset

`.changeset/vue-<kebab-name>.md`, `minor` (`major` is blocked by CI on 0.x packages). If `create-design-component` added the stylesheet in the same change, list `"@okkly/design-system": minor` here too:

```md
---
"@okkly/vue": minor
---

Add `<Name>`, <one sentence on what it is>, mirroring `@okkly/react`'s `<Name>`.
```

## Verify

Run from the repo root and fix everything before reporting done:

```bash
pnpm --filter @okkly/vue typecheck
pnpm --filter @okkly/vue exec playwright test src/components/<Name>
pnpm --filter @okkly/vue build
pnpm lint
pnpm exec prettier --check packages/vue .changeset
```

`build` is not optional: it is what proves the stylesheet import resolves and lands in `okkly-vue.css`. Tests must pass with no retries (the config has `retries: 0`); if Chromium is missing, run `pnpm --filter @okkly/vue exec playwright install chromium` first. Screenshots are compared only on CI's Linux image — locally they are skipped — so new baselines come from the `Update Vue Playwright screenshots` workflow. Offer to start Storybook (`pnpm storybook vue`, port 6008) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(vue): add the <Name> component`.
