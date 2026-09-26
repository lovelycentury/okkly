import { expect, test } from "../../playwright/harness";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import type { PhotoRadius, PhotoSize, PhotoVariant } from "./Photo";

const VARIANTS = [
  "plain",
  "framed",
  "scrim",
  "noir",
  "cutout",
] as const satisfies readonly PhotoVariant[];
const SIZES = ["sm", "md", "lg"] as const satisfies readonly PhotoSize[];
const RADII = ["none", "sm", "md", "lg", "xl"] as const satisfies readonly PhotoRadius[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Photo (variants)",
    columns: VARIANTS,
    rows: ["with-image", "placeholder", "with-caption"],
    hooks: {
      beforeEach: async (_component, page) => defineImageMockRoutes(page),
    },
    component: (column, row) => {
      const image = row === "placeholder" ? "" : ` image="${MOCK_PLAYWRIGHT_IMAGE_URL}"`;
      const caption = row === "with-caption" ? ` caption="Oleksii K."` : "";
      return `<okkly-photo variant="${column}" alt="Portrait"${image}${caption} />`;
    },
  });

  executeMatrixScreenshotTest({
    name: "Photo (sizes and radius)",
    columns: SIZES,
    rows: RADII,
    hooks: {
      beforeEach: async (_component, page) => defineImageMockRoutes(page),
    },
    component: (column, row) =>
      `<okkly-photo size="${column}" radius="${row}" alt="Portrait" image="${MOCK_PLAYWRIGHT_IMAGE_URL}" />`,
  });
});

test("should render the plain style with no radius modifier by default", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-photo image="${MOCK_PLAYWRIGHT_IMAGE_URL}" alt="Test" />`,
  );

  // ASSERT
  await expect(component).toHaveAttribute(
    "class",
    "okkly-component okkly-photo okkly-photo--plain okkly-photo--size-md",
  );
  await expect(component.getByRole("img", { name: "Test" })).toHaveClass(/okkly-photo__image/);
});

test("should apply the radius modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Test" radius="lg" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--radius-lg/);
});

test("should apply the size modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Test" size="sm" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--size-sm/);
});

test("should show a silhouette placeholder when the image is missing", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Placeholder" />`);

  // ASSERT
  await expect(component.getByRole("img", { name: "Placeholder" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
  await expect(component.locator(".okkly-photo__silhouette")).toBeAttached();
});

test("should fall back to the placeholder after a load error", async ({ mountTemplate, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-photo image="${MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL}" alt="Broken" />`,
  );

  // ASSERT
  await expect(component.getByRole("img", { name: "Broken" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
});

test("should retry a new image after a failed one", async ({ mountTemplate, page, update }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(`<okkly-photo [image]="state().image" alt="Retry" />`, {
    image: MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  });
  await expect(component.locator(".okkly-photo__placeholder")).toBeVisible();

  // ACT
  await update({ image: MOCK_PLAYWRIGHT_IMAGE_URL });

  // ASSERT
  await expect(component.locator(".okkly-photo__image")).toBeVisible();
});

test("should replace the silhouette with a projected fallback", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-photo alt="Anna Berg"><span okklyPhotoFallback class="initials">AB</span></okkly-photo>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-photo__placeholder .initials")).toHaveText("AB");
  await expect(component.locator(".okkly-photo__silhouette")).toHaveCount(0);
});

test("should render the caption for the scrim variant", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-photo alt="Test" variant="scrim" caption="Oleksii K." />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-photo__caption")).toHaveText("Oleksii K.");
});

test("should bring its own scrim when a caption sits on the plain variant", async ({
  mountTemplate,
}) => {
  // ARRANGE — the caption is light text laid straight onto the photo, so it
  // pulls the scrim in rather than being silently dropped.
  const component = await mountTemplate(
    `<okkly-photo alt="Test" variant="plain" caption="Oleksii K." />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-photo__caption")).toHaveText("Oleksii K.");
  await expect(component).toHaveClass(/okkly-photo--scrim/);
  await expect(component.locator(".okkly-photo__scrim-layer")).toBeAttached();
});

test("should apply the noir and scrim modifiers for the noir variant", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-photo alt="Test" variant="noir" caption="Oleksii K." />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--noir/);
  await expect(component).toHaveClass(/okkly-photo--scrim/);
  await expect(component.locator(".okkly-photo__noir-top")).toBeAttached();
});

test("should apply the transparent modifier for the cutout variant", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Test" variant="cutout" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--transparent/);
});

test("should drop the scrim and noir overlays when transparent", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Test" variant="noir" transparent />`);

  // ASSERT — `okkly-photo--noir` is still there, but only as the variant name:
  // a transparent cutout has no surface to lay a scrim or a noir wash over.
  await expect(component).toHaveClass(/okkly-photo--transparent/);
  await expect(component).not.toHaveClass(/okkly-photo--scrim/);
  await expect(component.locator(".okkly-photo__noir-top")).toHaveCount(0);
});

test("should show the image immediately when loading is not requested", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-photo image="${MOCK_PLAYWRIGHT_IMAGE_URL}" alt="Test" />`,
  );

  // ASSERT
  await expect(component.getByAltText("Test")).toBeVisible();
  await expect(component.getByAltText("Test")).not.toHaveCSS("opacity", "0");
  await expect(component.locator(".okkly-photo__skeleton")).toHaveCount(0);
});

test("should drop the skeleton once a loading image arrives", async ({ mountTemplate, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-photo image="${MOCK_PLAYWRIGHT_IMAGE_URL}" alt="Test" loading />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-photo__skeleton")).toHaveCount(0);
  await expect(component.getByAltText("Test")).not.toHaveCSS("opacity", "0");
});

test("should keep the silhouette rather than a skeleton when loading with no image", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-photo alt="Placeholder" loading />`);

  // ASSERT
  await expect(component.getByRole("img", { name: "Placeholder" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
  await expect(component.locator(".okkly-photo__skeleton")).toHaveCount(0);
});
