import { expect, test } from "../../playwright/a11y";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import { Avatar } from "./Avatar";
import type { AvatarColor, AvatarSize } from "./Avatar";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly AvatarSize[];
const COLORS = ["mint", "dante", "indigo"] as const satisfies readonly AvatarColor[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Avatar (sizes)",
    columns: SIZES,
    rows: ["circle", "rounded", "online", "offline"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Avatar
        initials="OK"
        size={column}
        shape={row === "rounded" ? "rounded" : "circle"}
        status={row === "online" || row === "offline" ? row : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Avatar (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => <Avatar initials="OK" color={column} size={row} />,
  });
});

test("should render initials when there is no image", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" />);

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("OK");
});

test("should truncate initials to two characters", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="Oleksii" />);

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("Ol");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-avatar/);
  await expect(component).not.toHaveClass(/okkly-avatar--(sm|lg)/);
  await expect(component).not.toHaveClass(/okkly-avatar--rounded/);
  await expect(component).not.toHaveClass(/okkly-avatar--color-(dante|indigo)/);
});

test("should apply a size modifier only for non-md sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" size="sm" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--sm/);

  // ACT
  await component.update(<Avatar initials="OK" size="md" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar--(sm|lg)/);
});

test("should apply the rounded shape modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" shape="rounded" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--rounded/);
});

test("should apply a color modifier only for non-mint colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="AB" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--color-dante/);

  // ACT
  await component.update(<Avatar initials="AB" color="mint" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar--color-(dante|indigo)/);
});

test("should render an image when src is set, hiding the initials", async ({ mount, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(
    <Avatar src={MOCK_PLAYWRIGHT_IMAGE_URL} initials="OK" alt="Oleksii" />,
  );

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Oleksii");
  await expect(component.locator(".okkly-avatar__image")).toBeVisible();
  await expect(component.locator(".okkly-avatar__initials")).toHaveCount(0);
});

test("should fall back to initials when the image fails to load", async ({ mount, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(
    <Avatar src={MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL} initials="OK" alt="Oleksii" />,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText("OK");
  await expect(component.locator(".okkly-avatar__image")).toHaveCount(0);
});

test("should expose role=img and an accessible name only when alt is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" alt="Oleksii" />);

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Oleksii");

  // ACT
  await component.update(<Avatar initials="OK" />);

  // ASSERT
  await expect(component).not.toHaveAttribute("role");
});

test("should render the status dot only when a status is given", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Avatar initials="OK" />);

  // ASSERT
  await expect(component.locator(".okkly-avatar__status")).toHaveCount(0);

  // ACT
  await component.update(<Avatar initials="OK" status="online" />);

  // ASSERT
  await expect(component.locator(".okkly-avatar__status")).toBeAttached();
  await expect(component.locator(".okkly-avatar__status")).not.toHaveClass(
    /okkly-avatar__status--offline/,
  );

  // ACT
  await component.update(<Avatar initials="OK" status="offline" />);

  // ASSERT
  await expect(component.locator(".okkly-avatar__status--offline")).toBeAttached();
});
