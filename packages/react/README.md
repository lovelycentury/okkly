# @okkly/react

React component library for the Okryshto design system.

```bash
pnpm add @okkly/react react react-dom
```

```tsx
import { Button } from "@okkly/react";
import "@okkly/react/style.css";

export function App() {
  return <Button variant="primary">Click me</Button>;
}
```

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.tsx` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm --filter @okkly/react storybook         # dev server on :6006
pnpm --filter @okkly/react storybook:build   # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.*`.

## Tests

Components are tested with [Playwright component testing][ct]: each one is
mounted in a real Chromium and driven the way a user would drive it, so the
assertions run against the CSS the package actually ships. A component's tests
sit next to it as `*.ct.tsx`, one file per component.

```bash
pnpm --filter @okkly/react test:playwright   # component tests
pnpm --filter @okkly/react test              # vitest, for the pure helpers
```

`playwright/index.html` is the mount harness; it loads the design tokens once,
exactly as an app entry point does. Shared helpers live in `src/playwright`:
`a11y.ts` configures axe, `screenshots.tsx` wires it into the screenshot runs,
and `fixtures/` holds small wrapper components for props that cannot cross the
Node↔browser boundary — a DOM `anchorEl`, or a render prop that has to return
synchronously.

### Screenshots

Each component also has one or more **matrix screenshots**: a single committed
image holding every variant of a component in a labelled grid, so a visual
regression shows up as one changed cell rather than a wall of near-identical
files. Every cell is scanned by axe as it is captured, so a component is only
signed off once it both looks right and reads right.

Baselines are pixel-exact per platform, so they are generated on CI's pinned
Linux image and never on a developer's machine — locally the comparison is
skipped entirely (`ignoreSnapshots`). To create or refresh them, run the
**Update Playwright screenshots** workflow; it opens a PR with the new images.

[ct]: https://playwright.dev/docs/test-components
