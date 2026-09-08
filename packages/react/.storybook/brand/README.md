# Storybook brand assets

The sidebar mark is the **horizontal lockup** — the emblem in its `multi` tone
(mint→dante) beside the `okkly` wordmark. Geometry matches the `Logo`
component's `filled` variant, so the chrome and the component never drift.

| File         | Use                                                    |
| ------------ | ------------------------------------------------------ |
| `logo.svg`   | Default (`theme.ts` → `brandImage: "/brand/logo.svg"`) |
| `logo.png`   | Raster export of the same lockup, 2x (optional)        |
| `emblem.svg` | Emblem only, no wordmark                               |

Colors are inlined rather than tokenised: Storybook's manager loads these files
standalone, outside the app's stylesheet, so `var(--okkly-*)` would not resolve.

Replace `logo.svg` (or point `brandImage` at `logo.png`) to swap the sidebar
logo. Keep the background transparent and the artwork readable on `#0a0a0b`.

The browser-tab favicons live in `../favicon/` and are served at the root by
`staticDirs`; `manager-head.html` links them.
