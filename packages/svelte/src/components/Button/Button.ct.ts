import { test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Button from "./Button.svelte";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button.svelte";

const VARIANTS = [
  "primary",
  "gradient",
  "secondary",
  "soft",
  "ghost",
  "glass",
] as const satisfies readonly ButtonVariant[];
const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly ButtonColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ButtonSize[];

const INTERACTION_ROWS = ["default", "hover", "active", "focus-visible"] as const;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Button (variants)",
    columns: VARIANTS,
    rows: INTERACTION_ROWS,
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Button,
    args: (column) => ({ props: { variant: column }, slots: { children: "Button" } }),
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: { variant: row, color: column },
      slots: { children: "Button" },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Button (sizes)",
    columns: SIZES,
    rows: ["pill", "rounded", "with-icons", "full-width"],
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: {
        size: column,
        shape: row === "rounded" ? "rounded" : "pill",
        fullWidth: row === "full-width",
      },
      slots: {
        children: "Button",
        ...(row === "with-icons"
          ? { startIcon: MOCK_PLAYWRIGHT_ICON, endIcon: MOCK_PLAYWRIGHT_ICON }
          : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Button (states)",
    columns: ["default", "disabled", "loading"],
    rows: ["center", "start", "end"],
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: {
        disabled: column === "disabled",
        loading: column === "loading",
        loadingPosition: row,
      },
      slots: { children: "Button" },
    }),
  });
});
