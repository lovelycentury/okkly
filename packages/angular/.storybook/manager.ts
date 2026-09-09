import { addons } from "storybook/manager-api";
import { okklyTheme } from "./theme";

addons.setConfig({
  theme: okklyTheme,
  sidebar: {
    showRoots: true,
  },
});
