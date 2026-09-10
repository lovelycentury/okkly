---
name: create-svelte-component
description: Scaffold a new component in @okkly/svelte (Svelte 5, runes) following the package's structure — the component (.svelte), a Svelte CSF story that doubles as the docs page, Vitest + Testing Library tests with a harness, the stylesheet registration, the public export, a README section, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, scaffold, or port (from @okkly/react) a Svelte component in packages/svelte.
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
- The behaviours React's `<Name>.ct.tsx` tests (`should …`) are the checklist for this package's spec.
- The stories mirror React's `<Name>.stories.tsx`: same `title`, same story names in the same order, so the workbenches read the same.

## Read before writing

1. Confirm the name is free: `packages/svelte/src/components/<Name>/` must not exist.
2. Read `packages/svelte/src/components/Button/` — `Button.svelte`, `Button.stories.svelte`, `Button.spec.ts`, `Button.harness.svelte` — the reference for every convention below. [templates.md](templates.md) is a starting point, not a substitute; where they differ, follow the existing code.
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables.
4. If porting, read the React component, its stories and its `.ct.tsx`.
5. Reuse before inventing: `src/actions/` (e.g. `ripple`), existing components, and `@okkly/helpers`. Behaviour React attaches through a hook + element (`useRipple` + `<Ripple>`) becomes a Svelte **action** in `src/actions/<name>.ts`, exported from `src/index.ts`.

## Files to create

| File                                                          | Purpose                                           |
| ------------------------------------------------------------- | ------------------------------------------------- |
| `packages/svelte/src/components/<Name>/<Name>.svelte`         | The component                                     |
| `packages/svelte/src/components/<Name>/<Name>.stories.svelte` | Svelte CSF stories = the component's docs page    |
| `packages/svelte/src/components/<Name>/<Name>.spec.ts`        | Vitest + `@testing-library/svelte` tests          |
| `packages/svelte/src/components/<Name>/<Name>.harness.svelte` | Test wrapper that turns plain props into snippets |
| `packages/svelte/styles.scss`                                 | `@use` the component's stylesheet                 |
| `packages/svelte/.storybook/preview.ts`                       | Import the same stylesheet for the workbench      |
| `packages/svelte/src/index.ts`                                | Append the export block                           |
| `packages/svelte/README.md`                                   | A `## <Name>` section, like `## Button`           |
| `.changeset/svelte-<kebab-name>.md`                           | `minor` bump for `@okkly/svelte`                  |

Specs, harnesses, and stories never ship — `files` in `package.json` excludes them from the tarball — so nothing else needs registering. Internal sub-parts (like `Button/Spinner.svelte`) sit in the same folder and are not exported.

### Registering the stylesheet (both places, always)

`svelte-package` copies sources instead of bundling them, so a component **cannot** import its own stylesheet the way the React and Vue ones do. The published `style.css` is compiled from `styles.scss`, and the workbench imports the same list — keep them in step:

```scss
// packages/svelte/styles.scss — read off disk, so the `src/` path
@use "@okkly/design-system/src/components/<Name>/<Name>.scss";
```

```ts
// packages/svelte/.storybook/preview.ts — resolved by Vite, so the public export path
import "@okkly/design-system/components/<Name>/<Name>.scss";
```

Also add the stylesheet of every design-system component this one renders (e.g. `Ripple`) if it is not listed yet.

## Conventions

### Component (`<Name>.svelte`)

- **Two script blocks**, as in `Button.svelte`: `<script lang="ts" module>` exports the union types and `<Name>Props`; the instance `<script lang="ts">` destructures `$props()`.
- `<Name>Props = SharedProps & Omit<HTMLAttributes<HTMLDivElement>, keyof SharedProps>` — the component's own props, plus the native attributes of the root element (`svelte/elements`), minus any key the component redefines.
- Put a doc comment on `<Name>Props` saying it mirrors `@okkly/react`'s `<<Name>>` (and through it MUI) and listing the Svelte-forced differences — `ReactNode` props become snippets.
- Every prop gets a JSDoc block with a one-line description and `@default`.
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

### Tests (`<Name>.spec.ts` + `<Name>.harness.svelte`)

- `render`/`screen`/`within` from `@testing-library/svelte`, `describe`/`it`/`expect`/`vi` from `vitest` (no globals). `jest-dom` matchers and cleanup are already wired in `vitest.setup.ts`.
- A test cannot pass a snippet as a plain value, so render through `<Name>.harness.svelte`, which takes a string `label` (and flags like `withIcons`) and builds the snippets itself. Every other prop passes straight through.
- One `describe("<Name>", …)`, test names in the present tense, as in `Button.spec.ts`. Cover: content and accessible name, default classes, each modifier (flip props with `await rerender(…)`), a consumer's `class` merged in, snippets rendered only when passed, callbacks, keyboard interaction, disabled/edge states.
- Scope queries to each render's `container` when one test renders twice.
- The environment is jsdom: there is no layout, so assert classes and attributes, not sizes.

### Export (`src/index.ts`)

```ts
export { default as <Name> } from "./components/<Name>/<Name>.svelte";
export type { <Name>Props, <Name>Variant } from "./components/<Name>/<Name>.svelte";
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
pnpm --filter @okkly/svelte test
pnpm --filter @okkly/svelte build
pnpm lint
pnpm exec prettier --check packages/svelte .changeset
```

`build` is not optional: it compiles `styles.scss`, which is what proves the new `@use` resolves. Then check `dist/okkly-svelte.css` contains `.okkly-<kebab>`. Offer to start Storybook (`pnpm storybook svelte`, port 6009) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(svelte): add the <Name> component`.
