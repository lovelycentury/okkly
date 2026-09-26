import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column, row) =>
      `<div style="width: 18rem">
        <a okklyLinkCard title="Writing" subtitle="Notes on interface craft" meta="essays"
          color="${column}"${row === "featured" ? " featured" : ""} href="#test-section"></a>
      </div>`,
  });

  executeMatrixScreenshotTest({
    name: "LinkCard (sizes)",
    columns: SIZES,
    rows: ["default", "hover", "focus-visible", "static"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) =>
      `<div style="width: 18rem">${
        row === "static"
          ? `<div okklyLinkCard title="Writing" subtitle="Notes on interface craft" size="${column}"></div>`
          : `<a okklyLinkCard title="Writing" subtitle="Notes on interface craft" size="${column}" href="#test-section"></a>`
      }</div>`,
  });
});

test("should render the title, subtitle and meta", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyLinkCard title="Writing" subtitle="Notes on interface craft &amp; systems" meta="essays"></div>`,
  );

  // ASSERT
  await expect(component.getByRole("heading", { level: 4 })).toHaveText("Writing");
  await expect(component).toContainText("Notes on interface craft & systems");
  await expect(component.locator(".okkly-link-card__meta")).toHaveText("essays");
  await expect(component).not.toHaveAttribute("title");
});

test("should omit the subtitle and meta when they are not provided", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyLinkCard title="Writing"></div>`);

  // ASSERT
  await expect(component.locator(".okkly-link-card__subtitle")).toHaveCount(0);
  await expect(component.locator(".okkly-link-card__meta")).toHaveCount(0);
  await expect(component.locator(".okkly-link-card__arrow")).toHaveAttribute("aria-hidden", "true");
});

test("should be a link on an anchor", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<a okklyLinkCard title="Writing" href="#test-section"></a>`,
  );

  // ASSERT
  await expect(component).toHaveRole("link");
  await expect(component).toHaveAttribute("href", "#test-section");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-link-card");
});

test("should apply the featured modifier and render a leading dot", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyLinkCard title="Selected Work" featured></div>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--featured/);
  await expect(component.locator(".okkly-link-card__dot")).toBeAttached();
});

test("should not render a dot when not featured", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyLinkCard title="Writing"></div>`);

  // ASSERT
  await expect(component.locator(".okkly-link-card__dot")).toHaveCount(0);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyLinkCard title="Writing" featured [color]="state().color"></div>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-link-card--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyLinkCard title="Writing" [size]="state().size"></div>`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-link-card--(small|large)/);
});

test("should fire click on the anchor", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<a okklyLinkCard title="Writing" href="#test-section" (click)="record('click')"></a>`,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(1);
});

test.describe("interactive", () => {
  // Button, not link: there is no destination to go to, and the row answers to
  // Space, which links do not.
  test("should get button semantics and the interactive modifier", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div okklyLinkCard title="Writing" interactive (click)="record('click')"></div>`,
    );

    // ASSERT
    await expect(component).toHaveRole("button");
    await expect(component).toHaveClass(/okkly-link-card--interactive/);
    await expect(component).toHaveAttribute("tabindex", "0");

    // ACT
    await component.click();

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(1);
  });

  test("should fire click on Enter and Space", async ({ mountTemplate, page, recordedEvents }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div okklyLinkCard title="Writing" interactive (click)="record('click')"></div>`,
    );

    // ACT
    await component.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(2);
  });

  test("should leave an anchor a link", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<a okklyLinkCard title="Writing" href="#test-section" interactive></a>`,
    );

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).not.toHaveAttribute("tabindex");
    await expect(component).not.toHaveClass(/okkly-link-card--interactive/);
  });
});

test("should have no link or button semantics when static", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyLinkCard title="Writing"></div>`);

  // ASSERT
  await expect(component).not.toHaveAttribute("role");
  await expect(component).not.toHaveAttribute("tabindex");
});

test("should keep the element's own class", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyLinkCard title="Writing" class="custom"></div>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-link-card/);
  await expect(component).toHaveClass(/custom/);
});
