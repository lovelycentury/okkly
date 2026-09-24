// Style imports are side-effect only — Storybook's Vite builder turns them into
// injected CSS. Declared here rather than via `vite/client` so the package's
// type-check needs no bundler types.
declare module "*.css";
declare module "*.scss";

// Image imports in stories resolve to the asset's URL, as Vite serves it.
declare module "*.jpg" {
  const src: string;
  export default src;
}
