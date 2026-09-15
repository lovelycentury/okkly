// For Storybook's react-docgen only. It resolves an import through the
// `resolve` package, which ignores `exports` and — with no `main` in
// package.json — falls back to an `index.*` at the package root, finding this
// file and, through it, the documented sources. Everything else (Vite,
// TypeScript, Node) goes through `exports` to `dist`, and this file is not
// published (`files` lists `dist` only). Without it, @okkly/react's Controls
// table would lose the description of every Box system prop.
export * from "./src/index";
