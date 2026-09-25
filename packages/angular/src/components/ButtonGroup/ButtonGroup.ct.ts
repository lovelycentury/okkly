import { expect, test } from "../../playwright/harness";
import { adjustSizeToAbsolutePosition } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { ButtonGroupColor, ButtonGroupVariant } from "./ButtonGroup";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly ButtonGroupColor[];
const VARIANTS = ["primary", "secondary"] as const satisfies readonly ButtonGroupVariant[];

const icon = MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg okklyButtonGroupIcon`);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ButtonGroup (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-button-group color="${column}" variant="${row}">
        <button okklyButtonGroupAction>${icon}Commit</button>
        <button okklyButtonGroupMenuItem>Commit and push</button>
      </okkly-button-group>`,
  });

  executeMatrixScreenshotTest({
    name: "ButtonGroup (states)",
    columns: ["default", "no-menu", "disabled", "open"],
    rows: VARIANTS,
    hooks: {
      beforeEach: async (component, _page, column) => {
        if (column !== "open") return;
        await component.getByRole("button", { name: "Open menu" }).click();
        // The dropdown is absolutely positioned, so grow the box to keep it in frame.
        await adjustSizeToAbsolutePosition(component);
      },
    },
    component: (column, row) =>
      `<okkly-button-group variant="${row}"${column === "disabled" ? " disabled" : ""}>
        <button okklyButtonGroupAction>Commit</button>
        ${
          column === "no-menu"
            ? ""
            : `<button okklyButtonGroupMenuItem>Commit and push</button><button okklyButtonGroupMenuItem>Commit amended</button>`
        }
      </okkly-button-group>`,
  });
});

test("should render the main action and a chevron toggle", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ASSERT
  const action = component.getByRole("button", { name: "Save", exact: true });
  await expect(action).toBeVisible();
  await expect(action).toHaveClass(/okkly-button-group__segment/);
  await expect(action).toHaveAttribute("type", "button");
  const chevron = component.getByRole("button", { name: "Open menu" });
  await expect(chevron).toHaveAttribute("aria-haspopup", "menu");
  await expect(chevron).toHaveAttribute("aria-expanded", "false");
  await expect(component.getByRole("menu")).toHaveCount(0);
});

test("should apply the color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group [color]="state().color"><button okklyButtonGroupAction>A</button></okkly-button-group>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button-group--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button-group--color-/);
});

test("should fire click for the main action", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group><button okklyButtonGroupAction (click)="record('save')">Save</button></okkly-button-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Save" }).click();

  // ASSERT
  expect(await recordedEvents("save")).toHaveLength(1);
});

test("should disable both segments when disabled is set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group disabled>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button-group--disabled/);
  await expect(component.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open menu" })).toBeDisabled();
});

test("should disable only the action when the action itself is disabled", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction disabled>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open menu" })).toBeEnabled();
});

test("should open the dropdown when the chevron is clicked", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
      <button okklyButtonGroupMenuItem>Save &amp; publish</button>
    </okkly-button-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();

  // ASSERT
  await expect(component.getByRole("menu")).toBeVisible();
  await expect(component.getByRole("menuitem")).toHaveText(["Save as…", "Save & publish"]);
  await expect(component.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("should paint the dropdown outside the pill instead of clipping it", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();

  // ASSERT — `toBeVisible` passes for a clipped element, so ask the browser what
  // is actually painted at the item's centre.
  const item = component.getByRole("menuitem", { name: "Save as…" });
  const hit = await item.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return element.contains(top);
  });
  expect(hit).toBe(true);
});

test("should fire click and close the dropdown when a menu item is picked", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem (click)="record('saveAs')">Save as…</button>
    </okkly-button-group>`,
  );
  const chevron = component.getByRole("button", { name: "Open menu" });

  // ACT
  await chevron.click();
  await component.getByRole("menuitem", { name: "Save as…" }).click();

  // ASSERT
  expect(await recordedEvents("saveAs")).toHaveLength(1);
  await expect(component.getByRole("menu")).toHaveCount(0);
  await expect(chevron).toBeFocused();
});

test("should close the dropdown on an outside click", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();

  // ASSERT
  await expect(component.getByRole("menu")).toBeVisible();

  // ACT
  await page.mouse.click(0, 0);

  // ASSERT
  await expect(component.getByRole("menu")).toHaveCount(0);
});

test("should close the dropdown on Escape", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group>
      <button okklyButtonGroupAction>Save</button>
      <button okklyButtonGroupMenuItem>Save as…</button>
    </okkly-button-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(component.getByRole("menu")).toHaveCount(0);
});

test("should apply the secondary variant modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group variant="secondary">
      <button okklyButtonGroupAction>Export</button>
      <button okklyButtonGroupMenuItem>CSV</button>
    </okkly-button-group>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button-group--secondary/);
});

test("should omit the chevron when there is no menu", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group><button okklyButtonGroupAction>Save</button></okkly-button-group>`,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Open menu" })).toHaveCount(0);
});

test("should hide the action's icon from assistive tech", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-button-group><button okklyButtonGroupAction>${icon}Commit</button></okkly-button-group>`,
  );

  // ASSERT
  const glyph = component.locator(".okkly-button-group__icon");
  await expect(glyph).toHaveAttribute("aria-hidden", "true");
  await expect(component.getByRole("button", { name: "Commit" })).toBeVisible();
});
