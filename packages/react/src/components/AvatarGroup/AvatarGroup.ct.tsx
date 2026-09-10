import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { AvatarGroup } from "./AvatarGroup";
import { Avatar } from "../Avatar/Avatar";
import type { AvatarGroupSize, AvatarGroupSpacing } from "./AvatarGroup";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly AvatarGroupSize[];
const SPACINGS = ["dense", "default", "loose"] as const satisfies readonly AvatarGroupSpacing[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "AvatarGroup (sizes)",
    columns: SIZES,
    rows: SPACINGS,
    fastNoIsolation: true,
    component: (column, row) => (
      <AvatarGroup size={column} spacing={row}>
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
      </AvatarGroup>
    ),
  });

  executeMatrixScreenshotTest({
    name: "AvatarGroup (overflow)",
    columns: ["under-max", "over-max", "total"],
    rows: ["ring", "no-ring"],
    fastNoIsolation: true,
    component: (column, row) => (
      <AvatarGroup
        ring={row === "ring"}
        max={column === "over-max" ? 3 : undefined}
        total={column === "total" ? 12 : undefined}
        hues={["mint", "dante", "indigo"]}
      >
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
        <Avatar initials="LN" />
      </AvatarGroup>
    ),
  });
});

test("should render every child when the count is under max", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup>
      <Avatar initials="OK" />
      <Avatar initials="AB" />
      <Avatar initials="MK" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveCount(0);
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup>
      <Avatar initials="OK" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-avatar-group/);
  await expect(component).not.toHaveClass(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
});

test("should collapse extra members into a +N chip", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup max={3}>
      <Avatar initials="OK" />
      <Avatar initials="AB" />
      <Avatar initials="MK" />
      <Avatar initials="LN" />
      <Avatar initials="TS" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+3");
});

test("should use total for the +N chip even when the children fit under max", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup total={12}>
      <Avatar initials="OK" />
      <Avatar initials="AB" />
      <Avatar initials="MK" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+9");
});

test("should override every member's size", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup size="lg">
      <Avatar initials="OK" size="sm" />
      <Avatar initials="AB" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar")).toHaveCount(2);
  for (const avatar of await component.locator(".okkly-avatar").all()) {
    await expect(avatar).toHaveClass(/okkly-avatar--lg/);
  }
});

test("should cycle hues across members", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup hues={["mint", "dante", "indigo"]}>
      <Avatar initials="OK" />
      <Avatar initials="AB" />
      <Avatar initials="MK" />
      <Avatar initials="LN" />
    </AvatarGroup>,
  );
  const avatars = component.locator(".okkly-avatar");

  // ASSERT — "mint" is the default tone and so carries no modifier at all.
  await expect(avatars.nth(0)).not.toHaveClass(/okkly-avatar--color/);
  await expect(avatars.nth(1)).toHaveClass(/okkly-avatar--color-dante/);
  await expect(avatars.nth(2)).toHaveClass(/okkly-avatar--color-indigo/);
  await expect(avatars.nth(3)).not.toHaveClass(/okkly-avatar--color/);
});

test("should apply the size, spacing and no-ring modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AvatarGroup size="md" spacing="loose" ring={false}>
      <Avatar initials="OK" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar-group--md/);
  await expect(component).toHaveClass(/okkly-avatar-group--loose/);
  await expect(component).toHaveClass(/okkly-avatar-group--no-ring/);

  // ACT
  await component.update(
    <AvatarGroup size="sm" spacing="default" ring>
      <Avatar initials="OK" />
    </AvatarGroup>,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
});
