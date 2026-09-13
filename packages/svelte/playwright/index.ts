// Mount harness for the Playwright component tests. Svelte components don't
// self-import their stylesheet (see styles.scss's header comment), so — unlike
// @okkly/react's equivalent file — every component under test needs its own
// stylesheet imported here explicitly, alongside the global design tokens.
import "@okkly/design-system/styles/index.scss";
import "@okkly/design-system/components/TextField/TextField.scss";
import "./index.css";
