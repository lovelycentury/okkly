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
        // The menu is absolutely positioned, so grow the box to keep it in frame.
        await adjustSizeToAbsolutePosition(component);
      },
    },
    component: (column, row) =>
      // The open cell keeps the menu in place so it lands inside the captured frame.
      `<okkly-button-group variant="${row}"${column === "disabled" ? " disabled" : ""}${
        column === "open" ? " disablePortal" : ""
      }>
        <button okklyButtonGroupAction>Commit</button>
        ${
          column === "no-menu"
            ? ""
            : `<button okklyButtonGroupMenuItem>Commit and push</button><button okklyButtonGroupMenuItem>Commit amended</button>`
        }
      </okkly-button-group>`,
  });
});

test("should render the main action and a chevron toggle", async ({ mountTemplate, page }) => {
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
  await expect(page.getByRole("menu")).toHaveCount(0);
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

test("should open the dropdown when the chevron is clicked", async ({ mountTemplate, page }) => {
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
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveText(["Save as…", "Save & publish"]);
  await expect(component.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("should paint the dropdown outside the pill instead of clipping it", async ({
  mountTemplate,
  page,
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
  const item = page.getByRole("menuitem", { name: "Save as…" });
  const hit = await item.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return element.contains(top);
  });
  expect(hit).toBe(true);
});

test("should fire click and close the dropdown when a menu item is picked", async ({
  mountTemplate,
  page,
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
  await page.getByRole("menuitem", { name: "Save as…" }).click();

  // ASSERT
  expect(await recordedEvents("saveAs")).toHaveLength(1);
  await expect(page.getByRole("menu")).toHaveCount(0);
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
  await expect(page.getByRole("menu")).toBeVisible();

  // ACT
  await page.mouse.click(0, 0);

  // ASSERT
  await expect(page.getByRole("menu")).toHaveCount(0);
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
  await expect(page.getByRole("menu")).toHaveCount(0);
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

test.describe("popover", () => {
  const template = `<okkly-button-group>
    <button okklyButtonGroupAction>Save</button>
    <button okklyButtonGroupMenuItem>Save as…</button>
    <button okklyButtonGroupMenuItem disabled>Save a copy</button>
    <button okklyButtonGroupMenuItem>Save &amp; publish</button>
  </okkly-button-group>`;

  test("should open the menu in a portalled popover that grows in", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    const component = await mountTemplate(template);

    // ACT
    await component.getByRole("button", { name: "Open menu" }).click();

    // ASSERT
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const placement = await menu.evaluate((element) => ({
      inGroup: !!element.closest("okkly-button-group"),
      paper: !!element.closest(".okkly-popover__paper.okkly-button-group__menu-paper"),
    }));
    expect(placement.inGroup).toBe(false);
    expect(placement.paper).toBe(true);
  });

  test("should keep the menu in place with disablePortal", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-button-group disablePortal>
        <button okklyButtonGroupAction>Save</button>
        <button okklyButtonGroupMenuItem>Save as…</button>
      </okkly-button-group>`,
    );

    // ACT
    await component.getByRole("button", { name: "Open menu" }).click();

    // ASSERT
    await expect(component.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menu")).toHaveCount(1);
  });

  test("should focus the first enabled item on open and move with the arrow keys", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    const component = await mountTemplate(template);
    const items = page.getByRole("menuitem");

    // ACT
    await component.getByRole("button", { name: "Open menu" }).click();

    // ASSERT
    await expect(items.nth(0)).toBeFocused();

    // ACT — the disabled item in between is skipped.
    await page.keyboard.press("ArrowDown");

    // ASSERT
    await expect(items.nth(2)).toBeFocused();

    // ACT — and the list wraps around.
    await page.keyboard.press("ArrowDown");

    // ASSERT
    await expect(items.nth(0)).toBeFocused();

    // ACT
    await page.keyboard.press("End");

    // ASSERT
    await expect(items.nth(2)).toBeFocused();
  });

  test("should open from the chevron with ArrowDown", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(template);

    // ACT
    await component.getByRole("button", { name: "Open menu" }).focus();
    await page.keyboard.press("ArrowDown");

    // ASSERT
    await expect(page.getByRole("menuitem").first()).toBeFocused();
  });

  test("should close on Escape and Tab and hand focus back to the chevron", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    const component = await mountTemplate(template);
    const chevron = component.getByRole("button", { name: "Open menu" });

    for (const key of ["Escape", "Tab"]) {
      // ACT
      await chevron.click();
      await expect(page.getByRole("menuitem").first()).toBeFocused();
      await page.keyboard.press(key);

      // ASSERT
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(chevron).toBeFocused();
    }
  });

  test("should toggle closed from the chevron rather than reopening", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    const component = await mountTemplate(template);
    const chevron = component.getByRole("button", { name: "Open menu" });

    // ACT
    await chevron.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await chevron.click();

    // ASSERT
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(chevron).toHaveAttribute("aria-expanded", "false");
  });
});
