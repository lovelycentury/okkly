import { expect, test } from "../../playwright/harness";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import type { AvatarColor, AvatarSize } from "./Avatar";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly AvatarSize[];
const COLORS = ["mint", "dante", "indigo"] as const satisfies readonly AvatarColor[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Avatar (sizes)",
    columns: SIZES,
    rows: ["circle", "rounded", "online", "offline"],
    fastNoIsolation: true,
    component: (column, row) => {
      const shape = row === "rounded" ? "rounded" : "circle";
      const status = row === "online" || row === "offline" ? ` status="${row}"` : "";
      return `<okkly-avatar initials="OK" size="${column}" shape="${shape}"${status} />`;
    },
  });

  executeMatrixScreenshotTest({
    name: "Avatar (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => `<okkly-avatar initials="OK" color="${column}" size="${row}" />`,
  });
});

test("should render initials when there is no image", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" />`);

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("OK");
});

test("should truncate initials to two characters", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="Oleksii" />`);

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("Ol");
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-avatar");
});

test("should apply a size modifier only for non-md sizes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" [size]="state().size" />`, {
    size: "sm",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--sm/);

  // ACT
  await update({ size: "md" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar--(sm|lg)/);
});

test("should apply the rounded shape modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" shape="rounded" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--rounded/);
});

test("should apply a color modifier only for non-mint colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="AB" [color]="state().color" />`, {
    color: "dante",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--color-dante/);

  // ACT
  await update({ color: "mint" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar--color-(dante|indigo)/);
});

test("should render an image when src is set, hiding the initials", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-avatar src="${MOCK_PLAYWRIGHT_IMAGE_URL}" initials="OK" alt="Oleksii" color="dante" />`,
  );

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Oleksii");
  await expect(component.locator(".okkly-avatar__image")).toBeVisible();
  await expect(component.locator(".okkly-avatar__initials")).toHaveCount(0);
  await expect(component).not.toHaveClass(/okkly-avatar--color-/);
});

test("should fall back to initials when the image fails to load", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<okkly-avatar src="${MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL}" initials="OK" alt="Oleksii" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("OK");
  await expect(component.locator(".okkly-avatar__image")).toHaveCount(0);
});

test("should retry a new src after a failed one", async ({ mountTemplate, page, update }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(`<okkly-avatar [src]="state().src" initials="OK" />`, {
    src: MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  });
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("OK");

  // ACT
  await update({ src: MOCK_PLAYWRIGHT_IMAGE_URL });

  // ASSERT
  await expect(component.locator(".okkly-avatar__image")).toBeVisible();
});

test("should expose role=img and an accessible name only when alt is set", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" [alt]="state().alt" />`, {
    alt: "Oleksii",
  });

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Oleksii");

  // ACT
  await update({ alt: undefined });

  // ASSERT
  await expect(component).not.toHaveAttribute("role");
  await expect(component).not.toHaveAttribute("aria-label");
});

test("should render the status dot only when a status is given", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar initials="OK" [status]="state().status" />`,
    { status: undefined },
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__status")).toHaveCount(0);

  // ACT
  await update({ status: "online" });

  // ASSERT
  await expect(component.locator(".okkly-avatar__status")).toBeAttached();
  await expect(component.locator(".okkly-avatar__status")).not.toHaveClass(
    /okkly-avatar__status--offline/,
  );

  // ACT
  await update({ status: "offline" });

  // ASSERT
  await expect(component.locator(".okkly-avatar__status--offline")).toBeAttached();
});
