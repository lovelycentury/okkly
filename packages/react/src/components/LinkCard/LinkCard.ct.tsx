import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { LinkCard } from "./LinkCard";
import type { LinkCardColor, LinkCardSize } from "./LinkCard";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly LinkCardColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly LinkCardSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "LinkCard (colors)",
    columns: COLORS,
    rows: ["featured", "plain"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "18rem" }}>
        <LinkCard
          title="Writing"
          subtitle="Notes on interface craft"
          meta="essays"
          color={column}
          featured={row === "featured"}
          href="#test-section"
        />
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "LinkCard (sizes)",
    columns: SIZES,
    rows: ["default", "hover", "focus-visible", "static"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) => (
      <div style={{ width: "18rem" }}>
        <LinkCard
          title="Writing"
          subtitle="Notes on interface craft"
          size={column}
          href={row === "static" ? undefined : "#test-section"}
        />
      </div>
    ),
  });
});

test("should render the title, subtitle and meta", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <LinkCard title="Writing" subtitle="Notes on interface craft & systems" meta="essays" />,
  );

  // ASSERT
  await expect(component).toContainText("Writing");
  await expect(component).toContainText("Notes on interface craft & systems");
  await expect(component).toContainText("essays");
});

test("should omit the subtitle when it is not provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" />);

  // ASSERT
  await expect(component).not.toContainText("Notes on");
});

test("should render an <a> when href is provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" href="#test-section" />);

  // ASSERT
  await expect(component).toHaveRole("link");
  await expect(component).toHaveAttribute("href", "#test-section");
});

test("should render a <div> without href", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" />);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("DIV");
});

test("should apply the featured modifier and render a leading dot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Selected Work" featured />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--featured/);
  await expect(component.locator(".okkly-link-card__dot")).toBeAttached();
});

test("should not render a dot when not featured", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" />);

  // ASSERT
  await expect(component.locator(".okkly-link-card__dot")).toHaveCount(0);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" featured color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--color-dante/);

  // ACT
  await component.update(<LinkCard title="Writing" featured color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-link-card--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--small/);

  // ACT
  await component.update(<LinkCard title="Writing" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-link-card--(small|large)/);
});

test("should fire onClick on the anchor when href is set", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <LinkCard title="Writing" href="#test-section" onClick={() => (clicks += 1)} />,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test.describe("without href, with onClick", () => {
  // Button, not link: there is no destination to go to, and the row answers to
  // Space, which links do not.
  test("should get button semantics and the interactive modifier", async ({ mount }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(<LinkCard title="Writing" onClick={() => (clicks += 1)} />);

    // ASSERT
    await expect(component).toHaveRole("button");
    await expect(component).toHaveClass(/okkly-link-card--interactive/);
    await expect(component).toHaveAttribute("tabindex", "0");

    // ACT
    await component.click();

    // ASSERT
    expect(clicks).toBe(1);
  });

  test("should fire onClick on Enter and Space", async ({ mount, page }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(<LinkCard title="Writing" onClick={() => (clicks += 1)} />);

    // ACT
    await component.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");

    // ASSERT
    expect(clicks).toBe(2);
  });
});

test("should have no link or button semantics when static", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" />);

  // ASSERT
  await expect(component).not.toHaveAttribute("role");
  await expect(component).not.toHaveAttribute("tabindex");
});

test("should apply a custom className", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<LinkCard title="Writing" className="custom" />);

  // ASSERT
  await expect(component).toHaveClass(/custom/);
});
