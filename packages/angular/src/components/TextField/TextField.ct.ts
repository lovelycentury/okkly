import { test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { TextFieldColor, TextFieldSize } from "./TextField";

const COLORS = [
  "primary",
  "secondary",
  "dante",
  "violet",
  "ember",
  "ice",
  "contrast",
] as const satisfies readonly TextFieldColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly TextFieldSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TextField (states)",
    columns: ["default", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) =>
      `<okkly-text-field label="Email" placeholder="you@example.com"${
        column === "filled" ? ' value="hello@okkly.dev"' : ""
      }${column === "error" ? ' error helperText="That address looks wrong"' : ""}${
        column === "disabled" ? " disabled" : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "TextField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required", "no-label"],
    fastNoIsolation: true,
    component: (column, row) => {
      const color = (COLORS as readonly string[]).includes(row) ? row : "primary";
      return `<okkly-text-field label="Email" size="${column}" color="${color}"${
        row === "required" ? " required" : ""
      }${row === "no-label" ? " hideLabel" : ""} placeholder="you@example.com" />`;
    },
  });
});
