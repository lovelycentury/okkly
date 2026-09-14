# @okkly/shared

The framework-neutral half of the Okryshto components: what `@okkly/react`,
`@okkly/vue`, `@okkly/svelte` and `@okkly/angular` would otherwise each repeat.
A component's contract — its prop types and the logic that turns props into the
classes and CSS variables `@okkly/design-system` styles — lives here once, and
every framework package wraps it in its own idiom.

You rarely import it directly: the framework packages depend on it and re-export
the types their components take.

```bash
pnpm add @okkly/shared
```

## Box

- **Types** — `BoxSystemProps` (the 37 MUI-style system props, documented), and
  the values they take: `BoxSpacing`, `BoxSize`, `BoxColor`/`BoxColorToken`,
  `BoxDisplay`, `BoxFlexDirection`, `BoxFlexWrap`, `BoxAlign`, `BoxJustify`, and
  `BoxResponsive<T>` for one value per viewport (`md`) or container (`@md`)
  breakpoint.
- **`resolveBoxSystemProps(props)`** — splits a Box's props into the classes and
  CSS variables `Box.scss` reads, and everything else, which the element keeps.
- **`BOX_BREAKPOINTS`, `BOX_CONTAINER_BREAKPOINTS`, `BOX_SYSTEM_PROPS`** — the
  breakpoint scales and the prop table, kept in step with the stylesheets.

```ts
import { resolveBoxSystemProps } from "@okkly/shared";

resolveBoxSystemProps({ p: 2, display: { base: "block", "@md": "flex" }, id: "x" });
// {
//   className: "okkly-box--p okkly-box--display okkly-box--display-cq-md",
//   style: {
//     "--okkly-box-p": "calc(2 * var(--okkly-space-unit))",
//     "--okkly-box-display": "block",
//     "--okkly-box-display-cq-md": "flex",
//   },
//   rest: { id: "x" },
// }
```

## `@okkly/shared/testing`

The data the framework packages' component tests share, so all four are held
to the same behaviour and render the same screenshots: `BOX_SYSTEM_PROP_CASES`
(each system prop and the CSS it must compute to), `BOX_MATRICES` (every Box
screenshot matrix, cell by cell), and the layouts the breakpoint tests use. It
is not meant for application code.
