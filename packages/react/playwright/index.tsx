// Mount harness for the Playwright component tests. Components import their
// own component SCSS, but the `--okkly-*` design tokens are global — load them
// once here, exactly as `.storybook/preview.tsx` and a real app entry do.
import "@okkly/design-system/styles/index.scss";
import "./index.css";
