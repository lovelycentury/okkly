---
name: create-angular-component
description: Scaffold a new component in @okkly/angular following the package's structure — a standalone, zoneless, signal-input component (.ts + .html), a Storybook story documented through Compodoc, Playwright component tests with matrix screenshots, the stylesheet registration, the public export, a README section, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, scaffold, or port (from @okkly/react) an Angular component in packages/angular.
argument-hint: <ComponentName> [what it does / which @okkly/react or Angular Material component it mirrors]
---

# Create an Angular component

Build `$ARGUMENTS` as a new component in `packages/angular`, matching how the existing components are laid out. If no name was given, ask for one (PascalCase) and a one-line description before starting.

## Components vs. directives

The package splits its source in two, by what the class's _public_ API is:

- `packages/angular/src/components/<Name>/` — the class is (or its public export centers on) an `@Component`: it owns its markup, whether that's a `templateUrl` (`Button`, `Field`, `Modal`, `Popover`, `Popper`, `TextField`) or, for one that decorates a native element, the content the host already renders (`Button` again — `button[okklyButton]`). Marker directives a component projects through (`OkklyButtonStartIcon`…) stay in its file and folder; they don't move it to `directives/`.
- `packages/angular/src/directives/<Name>/` — the public export is an `@Directive` with no template of its own: it puts classes/bindings on whatever element the consumer already wrote, the way `okklyBox` does. Precedent: `Box`, `Ripple`, `Tooltip` (its `[okklyTooltip]` directive is the public API; the `OkklyTooltipPanel` component it opens is an internal implementation detail that stays in the same folder), `Typography`.

Decide this before step 1 below — it picks which of the two paths every other instruction in this file means by `packages/angular/src/components/<Name>/` or `.../directives/<Name>/`. When unsure, check whether `@okkly/react`'s version needs `as`/polymorphism (`Box`, `Typography` do — no Angular `as`, so the consumer picks the element, so it's a directive) or owns real markup (most components do).

## Styles come first

The component's look lives in `@okkly/design-system`, not in this package. If `packages/design-system/src/components/<Name>/<Name>.scss` does not exist yet, run the **`create-design-component`** skill for it first, then continue here. The Angular component only decides which `okkly-<kebab>` classes go on which element.

## Port, don't reinvent

`@okkly/react` is the reference implementation, and most components already exist there. If `packages/react/src/components/<Name>/<Name>.tsx` exists, this is a port:

- Inputs follow **Angular Material's API** where the two designs overlap (selector style, `disabled`, `disableRipple`, output names), and mirror **`@okkly/react`** name-for-name for everything specific to this design system (`variant`, `color`, `size`…). The union types keep React's names (`<Name>Variant`, `<Name>Size`…).
- The rendered DOM — element, classes, modifiers, `aria-*` wiring, keyboard handling — matches React's, so the same stylesheet produces the same result.
- The differences are listed in the component's doc comment (see Conventions).
- The behaviours React's `<Name>.ct.tsx` tests (`should …`) are the checklist for this package's `<Name>.ct.ts`, and its screenshot matrices are copied axis for axis.
- The stories mirror React's `<Name>.stories.tsx`: same `title`, same story names in the same order, so the workbenches read the same.

## Read before writing

1. Confirm the name is free: neither `packages/angular/src/components/<Name>/` nor `packages/angular/src/directives/<Name>/` must exist.
2. Read `packages/angular/src/components/Button/` — `Button.ts`, `Button.html`, `Button.stories.ts`, `Button.ct.ts` — the reference for every component convention below, and `packages/angular/src/directives/Box/Box.ts` for the directive shape if this one has no `as` and needs it. [templates.md](templates.md) is a starting point, not a substitute; where they differ, follow the existing code.
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables.
4. If porting, read the React component, its stories and its `.ct.tsx`, and fetch the matching Angular Material API page if there is one.
5. Reuse before inventing: existing directives (`OkklyRipple`) and `@okkly/shared` — the framework-neutral half every package shares (a component's prop types and prop-to-class logic, as for Box, plus `bem`/`clamp`/`uniqueId`/`debounce`); anything the four framework packages would each repeat belongs there. Behaviour React attaches through a hook becomes a **directive** in `src/directives/<Name>/<Name>.ts`, applied as a `hostDirectives` entry where a component needs it.

## Files to create

Below, `<dir>` is `components` or `directives`, per the split above.

| File                                                  | Purpose                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/angular/src/<dir>/<Name>/<Name>.ts`         | The component or directive (and any marker directives it projects)        |
| `packages/angular/src/<dir>/<Name>/<Name>.html`       | Its template (`templateUrl`) — components only; a pure directive has none |
| `packages/angular/src/<dir>/<Name>/<Name>.stories.ts` | Storybook stories = the docs page                                         |
| `packages/angular/src/<dir>/<Name>/<Name>.ct.ts`      | Playwright component tests + matrix screenshots                           |
| `packages/angular/src/styles.scss`                    | `@use` the component's stylesheet                                         |
| `packages/angular/.storybook/preview.ts`              | Import the same stylesheet for the workbench                              |
| `packages/angular/src/index.ts`                       | Append the export block                                                   |
| `packages/angular/README.md`                          | A `## <Name>` section, like `## Button`                                   |
| `.changeset/angular-<kebab-name>.md`                  | `minor` bump for `@okkly/angular`                                         |

A template of a few lines may stay inline (`template:`), but anything with control flow goes in `<Name>.html`. Tests and stories never ship — `tsconfig.build.json` excludes them, from the build and from Compodoc alike.

### Registering the stylesheet (both places, always)

Components here import no stylesheet — ng-packagr does not bundle global CSS. The published `style.css` is compiled from `src/styles.scss`, and the workbench imports the same list — keep them in step:

```scss
// packages/angular/src/styles.scss — read off disk, so the `src/` path
@use "@okkly/design-system/src/components/<Name>/<Name>.scss";
```

```ts
// packages/angular/.storybook/preview.ts — resolved by Vite, so the public export path
import "@okkly/design-system/components/<Name>/<Name>.scss";
```

Also add the stylesheet of every design-system component this one renders (e.g. `Ripple`) if it is not listed yet.

## Conventions

### Component (`<Name>.ts` + `<Name>.html`)

- Standalone (the default — no `standalone: true`), `ChangeDetectionStrategy.OnPush`, and `ViewEncapsulation.None` with Button's comment: every rule lives in the design system as a global BEM class, so scoping attributes only add noise.
- The package is **zoneless**. All state is signals: `input()` / `input.required()`, `computed()`, `signal()`, `model()`, `output()`, `contentChild()`/`viewChild()`. No decorators (`@Input`, `@HostBinding`…), no `NgZone`, no `ChangeDetectorRef.markForCheck` workarounds.
- Naming: the class is `Okkly<Name>`; union types stay unprefixed (`<Name>Variant`). Selector:
  - a component that **decorates a native interactive element** uses an attribute selector, as Angular Material does — `button[okkly<Name>], a[okkly<Name>]` (see `Button.ts`), and lives in `components/`;
  - a component that owns its markup uses an element selector — `okkly-<kebab>` — and lives in `components/`;
  - a directive with no markup of its own, applied to whatever element the consumer wrote, uses `[okkly<Name>]` and lives in `directives/` (see `Box.ts`).
- Classes go on the host through `host`: `class: "okkly-component okkly-<kebab>"` for the static ones, `"[class]": "modifiers()"` for a `computed` string of modifiers, emitted only for **non-default** values. A consumer's own `class` merges with both. Use only class names the stylesheet defines.
- Put a doc comment on the class naming the APIs it follows (Angular Material where they overlap, `@okkly/react` otherwise) and listing the **deliberate gaps**.
- Every input gets a JSDoc block with a one-line description and `@default` — Compodoc reads them into the docs page. Boolean inputs use `input(false, { transform: booleanAttribute })` so `<okkly-x disabled>` works.
- Mapping React's API:
  - `children` → default `<ng-content />`; other `ReactNode` props (`startIcon`, `action`…) → projected content tagged with a marker directive (`[okkly<Name>StartIcon]`), queried with `contentChild`, exported alongside the component.
  - Callback props for events the host element already fires (`onClick`) → nothing; consumers bind `(click)` on the host.
  - Component-specific callbacks (`onClose`, `onChange`) → `output()` named like Angular Material's equivalent, or React's name minus `on`, lowercased.
  - A controlled `value` + `onChange` pair → `model()`, so consumers can `[(value)]` it.
- Host bindings in `host: { … }` for `aria-*`, `disabled`, `tabindex`, and listeners — not `@HostBinding`/`@HostListener`. Services and element refs via `inject()`.
- Accessibility is part of the component: correct native element or role, `aria-*` wiring, keyboard support. Generated ids come from a module-level counter (`okkly-<kebab>-${nextId++}`) until the package settles on something else.
- `styles:` only for markup this package invents and the design system therefore cannot know about (like `.okkly-button__loader`). Everything else belongs in the stylesheet.

### Story (`<Name>.stories.ts`) — this is the docs

- `Meta`/`StoryObj`/`moduleMetadata` from `@storybook/angular`; `component: Okkly<Name>`, and a `moduleMetadata({ imports: [...] })` decorator with the component and its marker directives.
- Stories render **templates**, so projected content is written inline. Declare a `<Name>Args` type (every input bound, plus `label` for the projected content) and a shared `bindings` string, as `Button.stories.ts` does.
- Descriptions and defaults come from the sources via Compodoc (`documentation.json`, regenerated by `docs:json`); `argTypes` only declares controls. `booleanAttribute` inputs need an explicit `control: "boolean"` and `table: { defaultValue: { summary: "false" } }` — Storybook cannot infer them from the compiled `input()` call. Hide public-but-derived members with `parameters: { controls: { exclude: [...] } }`.
- The JSDoc above `const meta` becomes the page description. `title` uses an existing sidebar group — the same one React uses.
- If not porting: first story `Playground` ("Play with every prop from the controls panel."), then one story per realistic use case with a JSDoc comment, ending with `CustomStyling`, which overrides the `--okkly-<kebab>-*` variables inline on the component.
- Control flow in templates uses `@for`/`@if`, never `*ngFor`/`*ngIf`.

### Tests (`<Name>.ct.ts`)

Tests run in a real Chromium through Playwright, against the stylesheet the package ships — the same setup as `@okkly/react`'s `.ct.tsx`, with a template string where React writes JSX.

- Import `test`/`expect` from `../../playwright/harness` (never directly from Playwright) and `executeMatrixScreenshotTest` from `../../playwright/screenshots`.
- Mount with the `mountTemplate(template, state?)` fixture. Every public export of the package is in scope, and it returns the template's root element. The harness around it:
  - an input the test changes later is bound to `state().<key>` (`[size]="state().size"`), its starting value passed in `state`, and flipped with the `update({ … })` fixture — the counterpart of React's `component.update()`;
  - an output is reported with `record('<name>', $event)` in the template and read back with `recordedEvents("<name>")` — the counterpart of a callback prop. Record serializable values only.
- Declare option arrays with `as const satisfies readonly <Name>Variant[]` so a new union member is a type error until the tests cover it.
- A `test.describe("Screenshot tests", …)` block with one matrix per visual axis (variants, colors, sizes, states), as in `Button.ct.ts`. A matrix that shows hover/focus/active uses `hooks.beforeEach` with `useFocusStateHooks` and stays isolated; a purely static one may set `fastNoIsolation: true`.
- Behaviour tests named `should …`, each body marked with `// ARRANGE`, `// ACT`, `// ASSERT` comments. Cover: role and accessible name, default classes, each modifier, projected content, outputs, keyboard interaction, disabled/edge states. Group related cases with `test.describe("<input>", …)`.
- Drive the component the way a user does — `click()`, `page.mouse`, `pressSequentially()` — rather than dispatching synthetic events.

### Export (`src/index.ts`)

```ts
export { Okkly<Name> } from "./<dir>/<Name>/<Name>";
export type { <Name>Variant, <Name>Size } from "./<dir>/<Name>/<Name>";
```

Export marker directives next to the component (`export { Okkly<Name>, Okkly<Name>StartIcon } …`).

### Changeset

`.changeset/angular-<kebab-name>.md`, `minor` (`major` is blocked by CI on 0.x packages). If `create-design-component` added the stylesheet in the same change, list `"@okkly/design-system": minor` here too:

```md
---
"@okkly/angular": minor
---

Add `Okkly<Name>` (`<selector>`), <one sentence on what it is>.
```

## Verify

Run from the repo root and fix everything before reporting done:

```bash
pnpm --filter @okkly/angular typecheck
pnpm --filter @okkly/angular exec playwright test src/<dir>/<Name>
pnpm --filter @okkly/angular build
pnpm lint
pnpm exec prettier --check packages/angular .changeset
```

`build` is not optional: `typecheck` is plain `tsc`, while ng-packagr's AOT compile is what type-checks the templates (`strictTemplates`) and compiles `styles.scss`. Then check `dist/okkly-angular.css` contains `.okkly-<kebab>`. Tests must pass with no retries (the config has `retries: 0`); if Chromium is missing, run `pnpm --filter @okkly/angular exec playwright install chromium` first. Screenshots are compared only on CI's Linux image — locally they are skipped — so new baselines come from the `Update Angular Playwright screenshots` workflow. Offer to start Storybook (`pnpm storybook angular`, port 6007) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(angular): add the <Name> component`.
