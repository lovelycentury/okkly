import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { AvatarGroupSize, AvatarGroupSpacing } from "./AvatarGroup";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly AvatarGroupSize[];
const SPACINGS = ["dense", "default", "loose"] as const satisfies readonly AvatarGroupSpacing[];

/** One `*okklyAvatarGroupItem` member per initials. */
const members = (...initials: string[]) =>
  initials.map((value) => `<okkly-avatar *okklyAvatarGroupItem initials="${value}" />`).join("");

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "AvatarGroup (sizes)",
    columns: SIZES,
    rows: SPACINGS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-avatar-group size="${column}" spacing="${row}">${members("OK", "AB", "MK")}</okkly-avatar-group>`,
  });

  executeMatrixScreenshotTest({
    name: "AvatarGroup (overflow)",
    columns: ["under-max", "over-max", "total"],
    rows: ["ring", "no-ring"],
    fastNoIsolation: true,
    component: (column, row) => {
      const max = column === "over-max" ? ` max="3"` : "";
      const total = column === "total" ? ` total="12"` : "";
      return `<okkly-avatar-group ring="${row === "ring"}"${max}${total} [hues]="['mint', 'dante', 'indigo']">${members(
        "OK",
        "AB",
        "MK",
        "LN",
      )}</okkly-avatar-group>`;
    },
  });
});

test("should render every member when the count is under max", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group>${members("OK", "AB", "MK")}</okkly-avatar-group>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__item > .okkly-avatar")).toHaveCount(3);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveCount(0);
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group>${members("OK")}</okkly-avatar-group>`,
  );

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-avatar-group");
});

test("should collapse extra members into a +N chip", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group max="3">${members("OK", "AB", "MK", "LN", "TS")}</okkly-avatar-group>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+3");
});

test("should use total for the +N chip even when the members fit under max", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group total="12">${members("OK", "AB", "MK")}</okkly-avatar-group>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB", "MK"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+9");
});

test("should follow members added and removed through @for", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group max="3">
      @for (initials of state().people; track initials) {
        <okkly-avatar *okklyAvatarGroupItem [initials]="initials" />
      }
    </okkly-avatar-group>`,
    { people: ["OK", "AB"] },
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB"]);

  // ACT
  await update({ people: ["OK", "AB", "MK", "LN"] });

  // ASSERT
  await expect(component.locator(".okkly-avatar__initials")).toHaveText(["OK", "AB"]);
  await expect(component.locator(".okkly-avatar-group__overflow")).toHaveText("+2");
});

test("should override every member's size", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group size="lg">
      <okkly-avatar *okklyAvatarGroupItem initials="OK" size="sm" />
      <okkly-avatar *okklyAvatarGroupItem initials="AB" />
    </okkly-avatar-group>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-avatar")).toHaveCount(2);
  for (const avatar of await component.locator(".okkly-avatar").all()) {
    await expect(avatar).toHaveClass(/okkly-avatar--lg/);
  }
});

test("should cycle hues across members", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group [hues]="['mint', 'dante', 'indigo']">${members("OK", "AB", "MK", "LN")}</okkly-avatar-group>`,
  );
  const avatars = component.locator(".okkly-avatar");

  // ASSERT — "mint" is the default tone and so carries no modifier at all.
  await expect(avatars.nth(0)).not.toHaveClass(/okkly-avatar--color/);
  await expect(avatars.nth(1)).toHaveClass(/okkly-avatar--color-dante/);
  await expect(avatars.nth(2)).toHaveClass(/okkly-avatar--color-indigo/);
  await expect(avatars.nth(3)).not.toHaveClass(/okkly-avatar--color/);
});

test("should apply the size, spacing and no-ring modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-avatar-group [size]="state().size" [spacing]="state().spacing" [ring]="state().ring">${members("OK")}</okkly-avatar-group>`,
    { size: "md", spacing: "loose", ring: false },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar-group--md/);
  await expect(component).toHaveClass(/okkly-avatar-group--loose/);
  await expect(component).toHaveClass(/okkly-avatar-group--no-ring/);

  // ACT
  await update({ size: "sm", spacing: "default", ring: true });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
});

test("should leave a standalone avatar's own size and colour alone", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-avatar initials="OK" size="lg" color="dante" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-avatar--lg/);
  await expect(component).toHaveClass(/okkly-avatar--color-dante/);
});
