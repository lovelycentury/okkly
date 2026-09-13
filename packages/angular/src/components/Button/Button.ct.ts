import { test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button";

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

const icon = (slot: "okklyButtonStartIcon" | "okklyButtonEndIcon") =>
  MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg ${slot}`);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Button (variants)",
    columns: VARIANTS,
    rows: INTERACTION_ROWS,
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => `<button okklyButton variant="${column}">Button</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyButton variant="${row}" color="${column}">Button</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Button (sizes)",
    columns: SIZES,
    rows: ["pill", "rounded", "with-icons", "full-width"],
    fastNoIsolation: true,
    component: (column, row) => {
      const shape = row === "rounded" ? "rounded" : "pill";
      const fullWidth = row === "full-width" ? " fullWidth" : "";
      const withIcons = row === "with-icons";
      return `<button okklyButton size="${column}" shape="${shape}"${fullWidth}>${
        withIcons ? icon("okklyButtonStartIcon") : ""
      }Button${withIcons ? icon("okklyButtonEndIcon") : ""}</button>`;
    },
  });

  executeMatrixScreenshotTest({
    name: "Button (states)",
    columns: ["default", "disabled", "loading"],
    rows: ["center", "start", "end"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyButton${column === "disabled" ? " disabled" : ""}${
        column === "loading" ? " loading" : ""
      } loadingPosition="${row}">Button</button>`,
  });
});
