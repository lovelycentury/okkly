---
name: create-svelte-component
description: Scaffold a new component in @okkly/svelte (Svelte 5, runes) following the package's structure — the component (.svelte) and its types (.types.ts), a Svelte CSF story that doubles as the docs page, Playwright component tests with matrix screenshots, the stylesheet registration, the public export, a README section, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, scaffold, or port (from @okkly/react) a Svelte component in packages/svelte.
argument-hint: <ComponentName> [what it does / which @okkly/react component it ports]
---

# Create a Svelte component

Build `$ARGUMENTS` as a new component in `packages/svelte`, matching how the existing components are laid out. If no name was given, ask for one (PascalCase) and a one-line description before starting.

## Styles come first

The component's look lives in `@okkly/design-system`, not in this package. If `packages/design-system/src/components/<Name>/<Name>.scss` does not exist yet, run the **`create-design-component`** skill for it first, then continue here. The Svelte component only decides which `okkly-<kebab>` classes go on which element.

## Port, don't reinvent

`@okkly/react` is the reference implementation, and most components already exist there. If `packages/react/src/components/<Name>/<Name>.tsx` exists, this is a port:

- Props keep React's names, types, and defaults **name-for-name**; the union types keep their names (`<Name>Variant`, `<Name>Size`…).
- The rendered DOM — element, classes, modifiers, `aria-*` wiring, keyboard handling — matches React's, so the same stylesheet produces the same result.
- The only differences are the ones Svelte forces, and they are listed in the props doc comment (see Conventions).
- The behaviours React's `<Name>.ct.tsx` tests (`should …`) are the checklist for this package's `<Name>.ct.ts`, and its screenshot matrices are copied axis for axis.
- The stories mirror React's `<Name>.stories.tsx`: same `title`, same story names in the same order, so the workbenches read the same.

## Read before writing

1. Confirm the name is free: `packages/svelte/src/components/<Name>/` must not exist.
2. Read `packages/svelte/src/components/Button/` — `Button.svelte`, `Button.types.ts`, `Button.stories.svelte`, `Button.ct.ts` — the reference for every convention below. [templates.md](templates.md) is a starting point, not a substitute; where they differ, follow the existing code.
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables.
4. If porting, read the React component, its stories and its `.ct.tsx`.
5. Reuse before inventing: `src/actions/` (e.g. `ripple`), existing components, and `@okkly/helpers`. Behaviour React attaches through a hook + element (`useRipple` + `<Ripple>`) becomes a Svelte **action** in `src/actions/<name>.ts`, exported from `src/index.ts`.

## Files to create

| File                                                          | Purpose                                         |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `packages/svelte/src/components/<Name>/<Name>.svelte`         | The component                                   |
| `packages/svelte/src/components/<Name>/<Name>.types.ts`       | Every type the component declares               |
| `packages/svelte/src/components/<Name>/<Name>.stories.svelte` | Svelte CSF stories = the component's docs page  |
| `packages/svelte/src/components/<Name>/<Name>.ct.ts`          | Playwright component tests + matrix screenshots |
| `packages/svelte/styles.scss`                                 | `@use` the component's stylesheet               |
| `packages/svelte/.storybook/preview.ts`                       | Import the same stylesheet for the workbench    |
| `packages/svelte/playwright/index.ts`                         | Import the same stylesheet for the tests        |
| `packages/svelte/src/index.ts`                                | Append the export block                         |
| `packages/svelte/README.md`                                   | A `## <Name>` section, like `## Button`         |
| `.changeset/svelte-<kebab-name>.md`                           | `minor` bump for `@okkly/svelte`                |

Tests and stories never ship — `files` in `package.json` excludes `*.ct.*`, `*.stories.*` and the test helpers in `dist/playwright` from the tarball — so nothing else needs registering. Internal sub-parts (like `Button/Spinner.svelte`) sit in the same folder and are not exported.

### Registering the stylesheet (all three places, always)

`svelte-package` copies sources instead of bundling them, so a component **cannot** import its own stylesheet the way the React and Vue ones do. The published `style.css` is compiled from `styles.scss`, and the workbench and the Playwright mount harness (`playwright/index.ts`) import the same list — keep them in step:

```scss
// packages/svelte/styles.scss — read off disk, so the `src/` path
@use "@okkly/design-system/src/components/<Name>/<Name>.scss";
```

```ts
// packages/svelte/.storybook/preview.ts and packages/svelte/playwright/index.ts —
// resolved by Vite, so the public export path
import "@okkly/design-system/components/<Name>/<Name>.scss";
```

Also add the stylesheet of every design-system component this one renders (e.g. `Ripple`) if it is not listed yet.

## Conventions

### Types (`<Name>.types.ts`)

Every type the component declares lives in this file next to `<Name>.svelte`, as in `Button.types.ts`; the component declares none.

- The union types (`<Name>Variant`, `<Name>Size`…), a local `SharedProps`, and `<Name>Props`, with only `import type` statements at the top (`svelte/elements`, `Snippet` from `svelte`) — no runtime code.
- `<Name>Props = SharedProps & Omit<HTMLAttributes<HTMLDivElement>, keyof SharedProps>` — the component's own props, plus the native attributes of the root element (`svelte/elements`), minus any key the component redefines.
- Put a doc comment on `<Name>Props` saying it mirrors `@okkly/react`'s `<<Name>>` (and through it MUI) and listing the Svelte-forced differences — `ReactNode` props become snippets.
- Every prop gets a JSDoc block with a one-line description and `@default`.
- A sibling component's types come from its own `.types` module (`import type { FieldSize } from "../Field/Field.types"`), and stories, tests and `src/index.ts` import from `./<Name>.types` — never from a `.svelte` file.

### Component (`<Name>.svelte`)

- One instance `<script lang="ts">` that imports its props with `import type { <Name>Props } from "./<Name>.types";` and destructures `$props()`. A `<script lang="ts" module>` block appears only for a runtime value the component exports, never for types.
- Destructure every prop with its default in `$props()`, pull `class: className` out, and spread `...rest` onto the root so `onclick`, `aria-*`, `data-*` land on the element.
- Mapping React's API:
  - `children` and every other `ReactNode` prop (`startIcon`, `action`…) → a `Snippet` prop with the same name, rendered with `{@render x?.()}` and only when passed.
  - Callback props for events the root element already fires (`onClick`) → nothing; the native `onclick` spreads through `...rest`.
  - Component-specific callbacks (`onClose`, `onChange`) → callback props with React's name.
  - A controlled `value` + `onChange` pair → `value = $bindable()`, so consumers can `bind:value`.
  - Refs to DOM nodes → `bind:this`; behaviour attached to an element → an action (`use:`).
- Derived values use `$derived`; classes are a `$derived` array filtered with `Boolean` and joined — `"okkly-component"`, `"okkly-<kebab>"`, modifiers for **non-default** values only, then `className` last. Use only class names the stylesheet defines.
- Accessibility is part of the component: correct native element or role, `aria-*` wiring, keyboard support, and `$props.id()` for generated ids.
- A `<style>` block only for markup this package invents and the design system therefore cannot know about (like `.okkly-button__loader`) — wrapped in `:global(…)`, with a comment saying why. Everything else belongs in the stylesheet.

### Story (`<Name>.stories.svelte`) — this is the docs

- Svelte CSF (`@storybook/addon-svelte-csf`): `defineMeta` in `<script module lang="ts">`. The JSDoc above `defineMeta` becomes the page description.
- Each `<Story>` has an HTML comment above it explaining the use case, and renders through `{#snippet template(args)}` so snippet content (the label, icons) can be written inline.
- `title` uses an existing sidebar group: `Control/`, `Navigation/`, `Feedback/`, `Overlays/`, `Data/`, `Media/`, `Brand/`, `Helpers/` — the same one React uses.
- `args` lists every prop default; `argTypes` gives unions an `inline-radio` (few options) or `select` control, and booleans an explicit `boolean` control. Declare the option arrays once as typed constants (`const sizes: <Name>Size[] = […]`).
- If not porting: first story `Playground` ("Play with every prop from the controls panel."), then one story per realistic use case, ending with `Custom styling`, which overrides the `--okkly-<kebab>-*` variables inline on the component.
- Inline icons as SVG inside a snippet rather than importing `@okkly/icons`, as `Button.stories.svelte` does.

### Tests (`<Name>.ct.ts`)

Tests run in a real Chromium through Playwright (`@playwright/experimental-ct-svelte`), against the stylesheet the package ships — the same setup as `@okkly/react`'s `.ct.tsx`. This package pins its own, older Playwright (see `playwright.config.ts`).

- Import `test`/`expect` from `../../playwright/a11y` (never directly from Playwright) and `executeMatrixScreenshotTest` from `../../playwright/screenshots`.
- `mount(<Name>, { props, slots })`:
  - snippet props (`children`, `label`, `startIcon`…) go in `slots` as raw markup. Each must be a single element or a single text node — `createRawSnippet` keeps only the first node;
  - callback props (`onclick`, `oninput`) and a consumer's `class` go in `props`;
  - flip props with `component.update({ props })`.
- Import the union types from `./<Name>.types` and declare option arrays with `as const satisfies readonly <Name>Variant[]` so a new union member is a type error until the tests cover it.
- A `test.describe("Screenshot tests", …)` block with one matrix per visual axis (variants, colors, sizes, states), as in `Button.ct.ts`; each cell is `args: (column, row) => ({ props, slots })` and is scanned by axe. A matrix that shows hover/focus/active uses `hooks.beforeEach` with `useFocusStateHooks` and stays isolated; a purely static one may set `fastNoIsolation: true`.
- Behaviour tests named `should …`, each body marked with `// ARRANGE`, `// ACT`, `// ASSERT` comments. Cover: role and accessible name, default classes, each modifier, a consumer's `class` merged in, snippets rendered only when passed, callbacks, keyboard interaction, disabled/edge states. Group related cases with `test.describe("<prop>", …)`.
- Drive the component the way a user does — `click()`, `page.mouse`, `pressSequentially()` — rather than dispatching synthetic events.

### Export (`src/index.ts`)

```ts
export { default as <Name> } from "./components/<Name>/<Name>.svelte";
export type { <Name>Props, <Name>Variant } from "./components/<Name>/<Name>.types";
```

### Changeset

`.changeset/svelte-<kebab-name>.md`, `minor` (`major` is blocked by CI on 0.x packages). If `create-design-component` added the stylesheet in the same change, list `"@okkly/design-system": minor` here too:

```md
---
"@okkly/svelte": minor
---

Add `<Name>`, <one sentence on what it is>, mirroring `@okkly/react`'s `<Name>`.
```

## Verify

Run from the repo root and fix everything before reporting done:

```bash
pnpm --filter @okkly/svelte typecheck
pnpm --filter @okkly/svelte exec playwright test src/components/<Name>
pnpm --filter @okkly/svelte build
pnpm lint
pnpm exec prettier --check packages/svelte .changeset
```

`build` is not optional: it compiles `styles.scss`, which is what proves the new `@use` resolves. Then check `dist/okkly-svelte.css` contains `.okkly-<kebab>`. Tests must pass with no retries (the config has `retries: 0`); if Chromium is missing, run `pnpm --filter @okkly/svelte exec playwright install chromium` first. Screenshots are compared only on CI's Linux image — locally they are skipped — so new baselines come from the `Update Svelte Playwright screenshots` workflow. Offer to start Storybook (`pnpm storybook svelte`, port 6009) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(svelte): add the <Name> component`.
