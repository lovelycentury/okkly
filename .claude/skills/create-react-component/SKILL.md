---
name: create-react-component
description: Scaffold a new component in @okkly/react following the package's structure — the component (.tsx), a Storybook story that doubles as the docs page, Playwright component tests with matrix screenshots, the public export, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, or scaffold a React component in packages/react.
argument-hint: <ComponentName> [what it does / which MUI API it mirrors]
---

# Create a React component

Build `$ARGUMENTS` as a new component in `packages/react`, matching how every existing component is laid out. If no name was given, ask for one (PascalCase) and a one-line description before starting.

## Styles come first

The component's look lives in `@okkly/design-system`, not in this package. If `packages/design-system/src/components/<Name>/<Name>.scss` does not exist yet, run the **`create-design-component`** skill for it first, then continue here. The React component only decides which `okkly-<kebab>` classes go on which element; it adds no styles of its own.

## Read before writing

The existing components are the source of truth; the templates in [templates.md](templates.md) are a starting point, not a substitute. Before writing anything:

1. Confirm the name is free: `packages/react/src/components/<Name>/` must not exist.
2. Read the reference component closest in shape to the new one — its component, `.stories.tsx` and `.ct.tsx`:
   - **Static / presentational** → `Divider`
   - **Interactive control** (hover/focus/active, ripple, disabled, loading, `href`) → `Button`
   - **Overlay / portalled** (renders into `document.body`) → `Tooltip`, `Popover`, `Dialog`
   - **Group of children sharing state** → `RadioGroup`, `CheckboxGroup`, `ChipGroup`
   - **Form field** → `TextField`
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables — the component, stories and tests all build on them.
4. If the component mirrors an MUI component, fetch its API page so prop names match name-for-name.
5. Reuse before inventing: check `@okkly/react-hooks`, `@okkly/helpers`, `src/helpers`, `src/types`, and existing components (`Ripple`, `Icon`, `Popper`, transitions) for anything the new component needs.

## Files to create

| File                                                      | Purpose                                         |
| --------------------------------------------------------- | ----------------------------------------------- |
| `packages/react/src/components/<Name>/<Name>.tsx`         | The component                                   |
| `packages/react/src/components/<Name>/<Name>.stories.tsx` | Storybook stories = the component's docs page   |
| `packages/react/src/components/<Name>/<Name>.ct.tsx`      | Playwright component tests + matrix screenshots |
| `packages/react/src/index.ts`                             | Append the export block                         |
| `.changeset/<kebab-name>.md`                              | `minor` bump for `@okkly/react`                 |

Only add a test fixture under `packages/react/src/playwright/fixtures/` when a prop cannot cross the Node↔browser boundary (see Tests).

## Conventions

### Component (`<Name>.tsx`)

- First line `"use client";`, then React imports, then the side-effect stylesheet import `import "@okkly/design-system/components/<Name>/<Name>.scss";`.
- Export every union type used by a prop as its own named type (`<Name>Variant`, `<Name>Size`, `<Name>Color`…) so the tests and consumers can reference it.
- `export interface <Name>Props extends Omit<HTMLAttributes<…>, …>` — extend the native attributes of the root element, omitting any key the component redefines.
- Put a doc comment on the props type saying which MUI API it follows and listing the **deliberate gaps** (no `sx`, no `classes`, etc.), like `Divider`/`Button` do.
- Every prop gets a JSDoc block with a one-line description, `@default`, and `@type {…}`. Storybook reads these for the Controls table, so they are the prop documentation.
- `export const <Name> = forwardRef<HTMLElement, <Name>Props>(function <Name>(…) {…})` — named function inside `forwardRef`, defaults destructured in the parameter list, `className` and `...rest` forwarded to the root.
- Classes are built as an array filtered with `Boolean` and joined: `"okkly-component"`, `"okkly-<kebab>"`, then modifiers. Emit a modifier only for **non-default** values (`size !== "medium" && \`okkly-<kebab>--${size}\``), then `className` last. Use only class names the stylesheet defines.
- Accessibility is part of the component: correct native element or role, `aria-*` wiring, keyboard support, and `useId` for generated ids.

### Story (`<Name>.stories.tsx`) — this is the docs

The global docs template renders Title → Description → Primary → Controls → Examples, so:

- The JSDoc comment above `const meta` becomes the page description — one or two sentences on what the component is for.
- `title` uses an existing sidebar group: `Control/`, `Navigation/`, `Feedback/`, `Overlays/`, `Data/`, `Media/`, `Brand/`, `Helpers/`.
- `args` lists every prop default; `argTypes` gives unions an `inline-radio` (few options) or `select` control.
- First story is `Playground` ("Play with every prop from the controls panel."), rendering `{...args}`.
- Then one story per realistic use case, each with a JSDoc comment explaining it — show the component in a product-like context (settings card, toolbar, form), not a bare list of variants.
- End with `CustomStyling`, overriding the stylesheet's `--okkly-<kebab>-*` variables inline on the component.
- Style wrappers inline with tokens (`var(--okkly-bg-surface-raised)`, `var(--okkly-border-subtle)`, `var(--okkly-text-secondary)`…).

### Tests (`<Name>.ct.tsx`)

- Import `test`/`expect` from `../../playwright/a11y` (never directly from Playwright) and `executeMatrixScreenshotTest` from `../../playwright/screenshots`.
- Declare option arrays with `as const satisfies readonly <Name>Variant[]` so a new union member is a type error until the tests cover it.
- A `test.describe("Screenshot tests", …)` block with one matrix per visual axis (variants, colors, sizes, states). Each matrix is one committed image and every cell is scanned by axe.
  - `fastNoIsolation: true` for static matrices.
  - Interaction rows (`"default" | "hover" | "active" | "focus-visible"`) need isolation plus `hooks.beforeEach` calling `useFocusStateHooks` from `../../playwright/matrix`.
  - Portalled content: `screenshotTarget: "page"`, a small `test.use({ viewport })`, and query off `page`, not the mount root.
  - `context.disabledAccessibilityRules` only with a comment explaining why the rule cannot hold for the mounted fragment.
- Behaviour tests named `should …`, each body marked with `// ARRANGE`, `// ACT`, `// ASSERT` comments. Cover: role and accessible name, default classes, each modifier (use `component.update(…)` to flip props), events, keyboard interaction, disabled/edge states. Group related cases with `test.describe("<prop>", …)`.
- Use `MOCK_PLAYWRIGHT_ICON` / `MOCK_PLAYWRIGHT_IMAGE_URL` + `defineImageMockRoutes` instead of real icons or network images — non-component imports run in Node, where `@okkly/icons` does not resolve.
- Props that cannot be serialized (a DOM `anchorEl`, a render prop that must return synchronously) need a wrapper in `src/playwright/fixtures/`, as `AnchoredOverlay.tsx` does.
- Screenshots are compared only on CI's Linux image; locally they are skipped. Don't commit locally generated baselines — they come from the **Update Playwright screenshots** workflow.

### Export (`src/index.ts`)

Append at the end, matching the existing blocks:

```ts
export { <Name> } from "./components/<Name>/<Name>";
export type { <Name>Props, <Name>Variant } from "./components/<Name>/<Name>";
```

### Changeset

Create `.changeset/<kebab-name>.md` by hand — `minor` (new feature on a 0.x package; `major` is blocked by CI). If `create-design-component` added the stylesheet in the same change, list `"@okkly/design-system": minor` here too rather than writing a second changeset:

```md
---
"@okkly/react": minor
---

Add `<Name>`, <one sentence on what it is and the API it mirrors>.
```

## Verify

Run from the repo root and fix everything before reporting done:

```bash
pnpm --filter @okkly/react typecheck
pnpm --filter @okkly/react exec playwright test src/components/<Name>
pnpm lint
pnpm exec prettier --check packages/react/src/components/<Name> packages/react/src/index.ts .changeset
```

Tests must pass with no retries (the config has `retries: 0`); a flaky test gets fixed, not re-run. If Chromium is missing, run `pnpm --filter @okkly/react exec playwright install chromium` first. Offer to start Storybook (`pnpm --filter @okkly/react storybook`) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(react): add the <Name> component`.
