---
name: create-angular-component
description: Scaffold a new component in @okkly/angular following the package's structure — a standalone, zoneless, signal-input component (.ts + .html), a Storybook story documented through Compodoc, Vitest + TestBed tests, the stylesheet registration, the public export, a README section, and a changeset. Styles come from @okkly/design-system via the create-design-component skill. Use when asked to create, add, scaffold, or port (from @okkly/react) an Angular component in packages/angular.
argument-hint: <ComponentName> [what it does / which @okkly/react or Angular Material component it mirrors]
---

# Create an Angular component

Build `$ARGUMENTS` as a new component in `packages/angular`, matching how the existing components are laid out. If no name was given, ask for one (PascalCase) and a one-line description before starting.

## Styles come first

The component's look lives in `@okkly/design-system`, not in this package. If `packages/design-system/src/components/<Name>/<Name>.scss` does not exist yet, run the **`create-design-component`** skill for it first, then continue here. The Angular component only decides which `okkly-<kebab>` classes go on which element.

## Port, don't reinvent

`@okkly/react` is the reference implementation, and most components already exist there. If `packages/react/src/components/<Name>/<Name>.tsx` exists, this is a port:

- Inputs follow **Angular Material's API** where the two designs overlap (selector style, `disabled`, `disableRipple`, output names), and mirror **`@okkly/react`** name-for-name for everything specific to this design system (`variant`, `color`, `size`…). The union types keep React's names (`<Name>Variant`, `<Name>Size`…).
- The rendered DOM — element, classes, modifiers, `aria-*` wiring, keyboard handling — matches React's, so the same stylesheet produces the same result.
- The differences are listed in the component's doc comment (see Conventions).
- The behaviours React's `<Name>.ct.tsx` tests (`should …`) are the checklist for this package's spec.
- The stories mirror React's `<Name>.stories.tsx`: same `title`, same story names in the same order, so the workbenches read the same.

## Read before writing

1. Confirm the name is free: `packages/angular/src/components/<Name>/` must not exist.
2. Read `packages/angular/src/components/Button/` — `Button.ts`, `Button.html`, `Button.stories.ts`, `Button.spec.ts` — and `Ripple/Ripple.ts`, the reference for every convention below. [templates.md](templates.md) is a starting point, not a substitute; where they differ, follow the existing code.
3. Read the component's stylesheet to learn its block, element and modifier classes and its `--okkly-<kebab>-*` variables.
4. If porting, read the React component, its stories and its `.ct.tsx`, and fetch the matching Angular Material API page if there is one.
5. Reuse before inventing: existing directives (`OkklyRipple`) and `@okkly/helpers`. Behaviour React attaches through a hook becomes a **directive** in `src/components/<Name>/<Name>.ts`, applied as a `hostDirectives` entry where a component needs it.

## Files to create

| File                                                       | Purpose                                               |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `packages/angular/src/components/<Name>/<Name>.ts`         | The component (and any marker directives it projects) |
| `packages/angular/src/components/<Name>/<Name>.html`       | Its template (`templateUrl`)                          |
| `packages/angular/src/components/<Name>/<Name>.stories.ts` | Storybook stories = the component's docs page         |
| `packages/angular/src/components/<Name>/<Name>.spec.ts`    | Vitest + TestBed tests                                |
| `packages/angular/src/styles.scss`                         | `@use` the component's stylesheet                     |
| `packages/angular/.storybook/preview.ts`                   | Import the same stylesheet for the workbench          |
| `packages/angular/src/index.ts`                            | Append the export block                               |
| `packages/angular/README.md`                               | A `## <Name>` section, like `## Button`               |
| `.changeset/angular-<kebab-name>.md`                       | `minor` bump for `@okkly/angular`                     |

A template of a few lines may stay inline (`template:`), but anything with control flow goes in `<Name>.html`. Specs and stories never ship — `tsconfig.build.json` excludes them, from the build and from Compodoc alike.

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
  - a component that **decorates a native interactive element** uses an attribute selector, as Angular Material does — `button[okkly<Name>], a[okkly<Name>]` (see `Button.ts`);
  - a component that owns its markup uses an element selector — `okkly-<kebab>`.
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

### Tests (`<Name>.spec.ts`)

- `describe`/`it`/`expect`/`vi` from `vitest` (no globals). The zoneless TestBed environment is already wired in `vitest.setup.ts`.
- Render through a test-local `Host` component whose state is **signals** (the comment in `Button.spec.ts` explains why), and a `render(patch)` helper that patches the host and calls `fixture.detectChanges()`.
- One `describe("Okkly<Name>", …)`, test names in the present tense, as in `Button.spec.ts`. Cover: content, default classes, each modifier, projected slots, outputs (bind them to `vi.fn()` on the host), keyboard interaction, disabled/edge states.
- The environment is jsdom: there is no layout, so assert classes and attributes, not sizes.

### Export (`src/index.ts`)

```ts
export { Okkly<Name> } from "./components/<Name>/<Name>";
export type { <Name>Variant, <Name>Size } from "./components/<Name>/<Name>";
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
pnpm --filter @okkly/angular test
pnpm --filter @okkly/angular build
pnpm lint
pnpm exec prettier --check packages/angular .changeset
```

`build` is not optional: `typecheck` is plain `tsc`, while ng-packagr's AOT compile is what type-checks the templates (`strictTemplates`) and compiles `styles.scss`. Then check `dist/okkly-angular.css` contains `.okkly-<kebab>`. Offer to start Storybook (`pnpm storybook angular`, port 6007) so the user can check the docs page.

When committing (only if asked), follow the repo convention, e.g. `:sparkles: feat(angular): add the <Name> component`.
