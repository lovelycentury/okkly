import { expect, test } from "../../playwright/harness";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import type { CardPadding, CardVariant } from "./Card";

const VARIANTS = [
  "solid",
  "raised",
  "glass",
  "outline",
  "aura",
] as const satisfies readonly CardVariant[];
const PADDINGS = ["none", "sm", "md", "lg"] as const satisfies readonly CardPadding[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Card (variants)",
    columns: VARIANTS,
    rows: ["plain", "interactive"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-card variant="${column}"${row === "interactive" ? " interactive" : ""}>
        <okkly-card-content><div style="width: 10rem">A short card body.</div></okkly-card-content>
      </okkly-card>`,
  });

  executeMatrixScreenshotTest({
    name: "Card (padding)",
    columns: PADDINGS,
    rows: ["content-only", "full"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-card padding="${column}">
        ${row === "full" ? `<okkly-card-header title="Release 2.4" subheader="Shipped today" />` : ""}
        <okkly-card-content><div style="width: 10rem">A short card body.</div></okkly-card-content>
        ${
          row === "full"
            ? `<okkly-card-actions><button okklyButton size="small">Save</button></okkly-card-actions>`
            : ""
        }
      </okkly-card>`,
  });
});

test("should render without modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-card><okkly-card-content>Body</okkly-card-content></okkly-card>`,
  );

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-card");
});

test("should apply the variant and padding modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-card [raised]="state().raised" [variant]="state().variant" [padding]="state().padding">
      <okkly-card-content>Body</okkly-card-content>
    </okkly-card>`,
    { raised: true, variant: "solid", padding: "lg" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--raised/);
  await expect(component).toHaveClass(/okkly-card--padding-lg/);

  // ACT
  await update({ raised: false, variant: "glass", padding: "none" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--glass/);
  await expect(component).toHaveClass(/okkly-card--padding-none/);
  await expect(component).not.toHaveClass(/okkly-card--raised/);
});

test("should apply the color modifier only to the aura variant", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-card color="dante" [variant]="state().variant"><okkly-card-content>Body</okkly-card-content></okkly-card>`,
    { variant: "aura" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--color-dante/);

  // ACT
  await update({ variant: "glass" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-card--color-/);
});

test("should apply the interactive modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-card interactive><okkly-card-content>Body</okkly-card-content></okkly-card>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--interactive/);
});

test("should render the compound subcomponents", async ({ mountTemplate, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-card>
      <okkly-card-header title="Title" subheader="Sub">
        <button okklyButton okklyCardAction size="small">Go</button>
      </okkly-card-header>
      <img okklyCardMedia src="${MOCK_PLAYWRIGHT_IMAGE_URL}" alt="Cover" />
      <okkly-card-content>Content</okkly-card-content>
      <okkly-card-actions>
        <button okklyButton size="small">Save</button>
      </okkly-card-actions>
    </okkly-card>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-card__title")).toHaveText("Title");
  await expect(component.locator(".okkly-card__subheader")).toHaveText("Sub");
  await expect(component.getByRole("img", { name: "Cover" })).toHaveClass(/okkly-card__media/);
  await expect(component.locator(".okkly-card__content")).toContainText("Content");
  await expect(
    component.locator(".okkly-card__actions").getByRole("button", { name: "Save" }),
  ).toBeVisible();
  await expect(
    component.locator(".okkly-card__action").getByRole("button", { name: "Go" }),
  ).toBeVisible();
});

test.describe("header", () => {
  test("should leave out the slots it was not given", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-card-header title="Title only" />`);

    // ASSERT
    await expect(component.locator(".okkly-card__title")).toHaveText("Title only");
    await expect(component.locator(".okkly-card__subheader")).toHaveCount(0);
    await expect(component.locator(".okkly-card__avatar")).toHaveCount(0);
    await expect(component.locator(".okkly-card__action")).toHaveCount(0);
  });

  test("should put the avatar in its leading slot", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-card-header title="Title"><okkly-avatar okklyCardAvatar initials="OK" /></okkly-card-header>`,
    );

    // ASSERT
    await expect(component.locator(".okkly-card__avatar .okkly-avatar")).toBeVisible();
  });

  test("should not leave the title behind as a native tooltip", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-card-header title="Title" />`);

    // ASSERT
    await expect(component).not.toHaveAttribute("title");
  });
});

test.describe("media", () => {
  test("should default alt to empty and size the image from height", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    await defineImageMockRoutes(page);
    const component = await mountTemplate(
      `<img okklyCardMedia src="${MOCK_PLAYWRIGHT_IMAGE_URL}" height="200" />`,
    );

    // ASSERT
    await expect(component).toHaveAttribute("alt", "");
    await expect(component).toHaveCSS("height", "200px");
  });

  test("should default to a 150px height", async ({ mountTemplate, page }) => {
    // ARRANGE
    await defineImageMockRoutes(page);
    const component = await mountTemplate(
      `<img okklyCardMedia src="${MOCK_PLAYWRIGHT_IMAGE_URL}" />`,
    );

    // ASSERT
    await expect(component).toHaveCSS("height", "150px");
  });
});
