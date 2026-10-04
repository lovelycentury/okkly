# @okkly/prima-react

React music and audio components for the Okryshto design system — parametric
equalizers, reverbs and other effect controls.

```bash
pnpm add @okkly/prima-react react react-dom
```

## Workbench

Storybook lives in this package. Stories sit next to their component as
`*.stories.tsx` and render from `src`, so a change shows up without rebuilding.

```bash
pnpm storybook prima-react                        # from the repo root, on :6010
pnpm --filter @okkly/prima-react storybook:build  # static build → storybook-static/
```

Stories never ship: `files` publishes only `dist`, and `tsconfig.build.json`
excludes `*.stories.*`.

## Tests

```bash
pnpm --filter @okkly/prima-react test   # vitest
```
