/// <reference types="svelte" />
/// <reference types="vite/client" />

// Style imports are side-effect only — the workbench's Vite builder turns them
// into injected CSS, and `build:styles` compiles the published sheet.
declare module "*.css";
declare module "*.scss";
