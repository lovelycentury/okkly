import { expect, test } from "../../playwright/a11y";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import { Photo } from "./Photo";
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
    component: (column, row) => (
      <Photo
        variant={column}
        alt="Portrait"
        image={row === "placeholder" ? undefined : MOCK_PLAYWRIGHT_IMAGE_URL}
        caption={row === "with-caption" ? "Oleksii K." : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Photo (sizes and radius)",
    columns: SIZES,
    rows: RADII,
    hooks: {
      beforeEach: async (_component, page) => defineImageMockRoutes(page),
    },
    component: (column, row) => (
      <Photo size={column} radius={row} alt="Portrait" image={MOCK_PLAYWRIGHT_IMAGE_URL} />
    ),
  });
});

test("should render the plain style with no radius modifier by default", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(<Photo image={MOCK_PLAYWRIGHT_IMAGE_URL} alt="Test" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-photo--plain/);
  await expect(component).toHaveClass(/okkly-photo--size-md/);
  await expect(component).not.toHaveClass(/okkly-photo--radius-/);
});

test("should apply the radius modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" radius="lg" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--radius-lg/);
});

test("should apply the size modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" size="sm" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--size-sm/);
});

test("should show a silhouette placeholder when the image is missing", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Placeholder" />);

  // ASSERT
  await expect(component.getByRole("img", { name: "Placeholder" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
});

test("should fall back to the placeholder after a load error", async ({ mount, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(<Photo image={MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL} alt="Broken" />);

  // ASSERT
  await expect(component.getByRole("img", { name: "Broken" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
});

test("should render the caption for the scrim variant", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" variant="scrim" caption="Oleksii K." />);

  // ASSERT
  await expect(component.locator(".okkly-photo__caption")).toHaveText("Oleksii K.");
});

test("should bring its own scrim when a caption sits on the plain variant", async ({ mount }) => {
  // ARRANGE — the caption is light text laid straight onto the photo, so it
  // pulls the scrim in rather than being silently dropped.
  const component = await mount(<Photo alt="Test" variant="plain" caption="Oleksii K." />);

  // ASSERT
  await expect(component.locator(".okkly-photo__caption")).toHaveText("Oleksii K.");
  await expect(component).toHaveClass(/okkly-photo--scrim/);
});

test("should apply the noir and scrim modifiers for the noir variant", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" variant="noir" caption="Oleksii K." />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--noir/);
  await expect(component).toHaveClass(/okkly-photo--scrim/);
});

test("should apply the transparent modifier for the cutout variant", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" variant="cutout" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-photo--transparent/);
});

test("should drop the scrim and noir overlays when transparent", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Photo alt="Test" variant="noir" transparent />);

  // ASSERT — `okkly-photo--noir` is still there, but only as the variant name:
  // a transparent cutout has no surface to lay a scrim or a noir wash over, so
  // neither overlay is added on top of it.
  await expect(component).toHaveClass(/okkly-photo--transparent/);
  await expect(component).not.toHaveClass(/okkly-photo--scrim/);
  const classes = await component.evaluate((element) => element.className);
  expect(classes.match(/okkly-photo--noir/g)).toHaveLength(1);
});

test("should show the image immediately when loading is not requested", async ({ mount, page }) => {
  // ARRANGE — the image used to be held invisible waiting for an `onLoad` the
  // caller never asked for.
  await defineImageMockRoutes(page);
  const component = await mount(<Photo image={MOCK_PLAYWRIGHT_IMAGE_URL} alt="Test" />);

  // ASSERT
  await expect(component.getByAltText("Test")).toBeVisible();
  await expect(component.getByAltText("Test")).not.toHaveCSS("opacity", "0");
});

test("should keep the silhouette rather than a skeleton when loading with no image", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(<Photo alt="Placeholder" loading />);

  // ASSERT
  await expect(component.getByRole("img", { name: "Placeholder" })).toHaveClass(
    /okkly-photo__placeholder/,
  );
  await expect(component.locator(".okkly-photo__skeleton")).toHaveCount(0);
});
