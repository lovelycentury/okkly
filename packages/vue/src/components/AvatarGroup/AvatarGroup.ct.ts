import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import AvatarGroupFixture from "../../playwright/fixtures/AvatarGroupFixture.vue";
import AvatarGroup from "./AvatarGroup.vue";
import type { AvatarGroupSize, AvatarGroupSpacing } from "./AvatarGroup.types";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly AvatarGroupSize[];
const SPACINGS = ["dense", "default", "loose"] as const satisfies readonly AvatarGroupSpacing[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "AvatarGroup (sizes)",
    columns: SIZES,
    rows: SPACINGS,
    fastNoIsolation: true,
    component: AvatarGroupFixture,
    args: (column, row) => ({
      props: { size: column, spacing: row, initials: ["OK", "AB", "MK"] } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "AvatarGroup (overflow)",
    columns: ["under-max", "over-max", "total"],
    rows: ["ring", "no-ring"],
    fastNoIsolation: true,
    component: AvatarGroupFixture,
    args: (column, row) => ({
      props: {
        ring: row === "ring",
        max: column === "over-max" ? 3 : undefined,
        total: column === "total" ? 12 : undefined,
        hues: ["mint", "dante", "indigo"],
        initials: ["OK", "AB", "MK", "LN"],
      } as never,
    }),
  });
});

test("should render every child when the count is under max", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { initials: ["OK", "AB", "MK"] } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveCount(0);
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, { props: { initials: ["OK"] } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-avatar-group/);
  await expect(component).not.toHaveClass(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
});

test("should collapse extra members into a +N chip", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { max: 3, initials: ["OK", "AB", "MK", "LN", "TS"] } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+3");
});

test("should use total for the +N chip even when the children fit under max", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { total: 12, initials: ["OK", "AB", "MK"] } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+9");
});

test("should override every member's size", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { size: "lg", initials: ["OK", "AB"] } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-avatar")).toHaveCount(2);
  for (const avatar of await component.locator(".okkly-avatar").all()) {
    await expect(avatar).toHaveClass(/okkly-avatar--lg/);
  }
});

test("should cycle hues across members", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { hues: ["mint", "dante", "indigo"], initials: ["OK", "AB", "MK", "LN"] } as never,
  });
  const avatars = component.locator(".okkly-avatar");

  // ASSERT — "mint" is the default tone and so carries no modifier at all.
  await expect(avatars.nth(0)).not.toHaveClass(/okkly-avatar--color/);
  await expect(avatars.nth(1)).toHaveClass(/okkly-avatar--color-dante/);
  await expect(avatars.nth(2)).toHaveClass(/okkly-avatar--color-indigo/);
  await expect(avatars.nth(3)).not.toHaveClass(/okkly-avatar--color/);
});

test("should apply the size, spacing and no-ring modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(AvatarGroupFixture, {
    props: { size: "md", spacing: "loose", ring: false, initials: ["OK"] } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar-group--md/);
  await expect(component).toHaveClass(/okkly-avatar-group--loose/);
  await expect(component).toHaveClass(/okkly-avatar-group--no-ring/);

  // ACT
  await component.update({
    props: { size: "sm", spacing: "default", ring: true, initials: ["OK"] } as never,
  });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
});

test("should render an empty stack with no children", async ({ mount }) => {
  // ARRANGE — every other test drives AvatarGroup through the fixture, since
  // mounting real `Avatar` children needs a real component tree; this one
  // pins that an empty default slot doesn't error.
  const component = await mount(AvatarGroup);

  // ASSERT
  await expect(component.locator(".okkly-avatar-group__item")).toHaveCount(0);
});
