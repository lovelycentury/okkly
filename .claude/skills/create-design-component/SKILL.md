---
name: create-design-component
description: Create a component stylesheet in @okkly/design-system — the framework-neutral BEM SCSS and CSS-variable API that @okkly/react, @okkly/vue and the other framework packages import. Use when asked to add or scaffold a component's styles in packages/design-system, and before building a new component in any framework package whose stylesheet does not exist yet.
argument-hint: <ComponentName> [what it looks like / which states and variants it has]
---

# Create a design-system component

Create the stylesheet for `$ARGUMENTS` in `packages/design-system`. If no name was given, ask for one (PascalCase) and its variants/states before starting.

The stylesheet is the single source of a component's look. Every framework package imports it as-is (`import "@okkly/design-system/components/<Name>/<Name>.scss"`), so it must not assume any one framework — it only defines classes and CSS variables; the framework components decide which classes to put on which element.

## Read before writing

1. Confirm the name is free: `packages/design-system/src/components/<Name>/` must not exist.
2. Read the existing stylesheet closest in shape to the new one — `Divider.scss` (static), `Button.scss` (interactive states, variants × colors), `Tooltip.scss`/`Popover.scss` (overlays), `TextField.scss` (form fields) — and follow it where it differs from [templates.md](templates.md).
3. Check what already exists before writing new rules:
   - tokens in `src/styles/tokens/` (`colors.css`, `typography.css`, `tokens.generated.css`) and `src/styles/root.scss` (e.g. `--okkly-1px-in-rem`);
   - mixins in `src/styles/mixins/` — `layers`, `field`, `text`, `sizes`, `density`, `visibility`, `normalize`.
4. If there is a Figma design for the component, pull the values from it and map them to existing tokens rather than copying raw hex/px values.

## File to create

`packages/design-system/src/components/<Name>/<Name>.scss` — nothing else. Component folders hold only their stylesheet; the `exports` map (`"./components/*"`) publishes it automatically, and nothing needs registering in `styles/index.scss` (that file is global tokens/reset only and must stay free of component styles).

## Conventions

- Start with `@use "../../styles/mixins/layers.scss";` and wrap every rule in `.okkly-<kebab> { @include layers.component() { … } }`. Never open a raw `@layer` — the mixin re-declares the layer order so code-split chunks cannot invert the cascade (see the comment in `mixins/layers.scss`).
- The block name is `okkly-<kebab-name>`; framework components always also put `okkly-component` on the root, which scopes the reset — don't restyle that class.
- **CSS-variable API first.** Declare `--okkly-<kebab>-<property>` variables at the top of the block, seeded from design tokens (`var(--okkly-…)`), then use only those variables in the rules below. They are the public styling API (consumers override them on the element), so name them for what they control, not where they're used.
- Modifiers retune variables rather than re-declaring properties: `&--small { --okkly-<kebab>-padding: 0.5rem; }`.
- Never hard-code colors or font sizes; use tokens. Plain `rem` values are fine for component-specific spacing and radii.
- BEM only: `&--modifier`, `&__element`, `&__element--modifier`. No element selectors except when styling native parts you can't class (e.g. `svg`, `::before`).
- Default values get **no** modifier class — the frameworks emit a modifier only for non-default props (`--small`, `--large`, but no `--medium`). Style the default on the block itself.
- States: style `:hover`, `:active`, `:focus-visible` and `:disabled` / `[aria-disabled="true"]` on the block. Focus must be visible.
- Use logical properties (`margin-inline-start`, `padding-inline`) so RTL works.
- Comment the non-obvious — why a rule exists (e.g. "`<hr>` is normalized to `height: 0`…"), not what it does.

## Changeset

A new stylesheet is a feature: `"@okkly/design-system": minor` (`major` is blocked by CI on 0.x packages). When this runs as part of creating a framework component, list both packages in that component's single changeset instead of writing a separate one:

```md
---
"@okkly/design-system": minor
---

Add the `<Name>` component styles, with the `--okkly-<kebab>-*` CSS-variable API.
```

## Verify

```bash
pnpm --filter @okkly/design-system exec sass --no-source-map src/components/<Name>/<Name>.scss > /dev/null
pnpm exec prettier --check packages/design-system/src/components/<Name>
```

The compile must succeed with no warnings, and the output should begin with the `@layer okkly.reset, …` ordering statement. Visual checks happen in the framework package's Storybook and tests — via `create-react-component`, `create-vue-component`, `create-angular-component`, or `create-svelte-component`.
