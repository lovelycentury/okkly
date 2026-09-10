import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { adjustSizeToAbsolutePosition } from "../../playwright/matrix";
import { ButtonGroup } from "./ButtonGroup";
import { Icon } from "../Icon/Icon";
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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ButtonGroup (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) => (
      <ButtonGroup
        color={column}
        variant={row}
        action={{ label: "Commit", icon: <Icon icon={MOCK_PLAYWRIGHT_ICON} /> }}
        menu={[{ label: "Commit and push" }]}
      />
    ),
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
    component: (column, row) => (
      <ButtonGroup
        variant={row}
        disabled={column === "disabled"}
        action={{ label: "Commit" }}
        menu={
          column === "no-menu" ? [] : [{ label: "Commit and push" }, { label: "Commit amended" }]
        }
      />
    ),
  });
});

test("should render the main action and a chevron toggle", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Save" })).toBeVisible();
  const chevron = component.getByRole("button", { name: "Open menu" });
  await expect(chevron).toHaveAttribute("aria-haspopup", "menu");
  await expect(chevron).toHaveAttribute("aria-expanded", "false");
});

test("should apply the color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ButtonGroup action={{ label: "A" }} color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-button-group--color-dante/);

  // ACT
  await component.update(<ButtonGroup action={{ label: "A" }} color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button-group--color-/);
});

test("should fire onClick for the main action", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <ButtonGroup action={{ label: "Save", onClick: () => (clicks += 1) }} />,
  );

  // ACT
  await component.getByRole("button", { name: "Save" }).click();

  // ASSERT
  expect(clicks).toBe(1);
});

test("should disable both segments when disabled is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} disabled />,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Save" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open menu" })).toBeDisabled();
});

test("should open the dropdown when the chevron is clicked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup
      action={{ label: "Save" }}
      menu={[{ label: "Save as…" }, { label: "Save & publish" }]}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();

  // ASSERT
  await expect(component.getByRole("menu")).toBeVisible();
  await expect(component.getByRole("menuitem")).toHaveText(["Save as…", "Save & publish"]);
});

test("should fire onClick and close the dropdown when a menu item is picked", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <ButtonGroup
      action={{ label: "Save" }}
      menu={[{ label: "Save as…", onClick: () => (clicks += 1) }]}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();
  await component.getByRole("menuitem", { name: "Save as…" }).click();

  // ASSERT
  expect(clicks).toBe(1);
  await expect(component.getByRole("menu")).toHaveCount(0);
});

test("should close the dropdown on an outside click", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />,
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

test("should close the dropdown on Escape", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup action={{ label: "Save" }} menu={[{ label: "Save as…" }]} />,
  );

  // ACT
  await component.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(component.getByRole("menu")).toHaveCount(0);
});

test("should apply the secondary variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ButtonGroup variant="secondary" action={{ label: "Export" }} menu={[{ label: "CSV" }]} />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button-group--secondary/);
});

test("should omit the chevron when there is no menu", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ButtonGroup action={{ label: "Save" }} />);

  // ASSERT
  await expect(component.getByRole("button", { name: "Open menu" })).toHaveCount(0);
});
