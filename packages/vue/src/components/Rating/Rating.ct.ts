import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Rating from "./Rating.vue";
import type { RatingColor, RatingIcon, RatingSize } from "./Rating.types";

const COLORS = [
  "warning",
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly RatingColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly RatingSize[];
const ICONS = ["star", "heart"] as const satisfies readonly RatingIcon[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Rating (colors)",
    columns: COLORS,
    rows: ICONS,
    fastNoIsolation: true,
    component: Rating,
    args: (column, row) => ({
      props: {
        modelValue: 3.5,
        color: column,
        icon: row,
        precision: 0.5,
        readOnly: true,
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Rating (states)",
    columns: SIZES,
    rows: ["empty", "half", "full", "with-label", "disabled"],
    fastNoIsolation: true,
    component: Rating,
    args: (column, row) => ({
      props: {
        size: column,
        precision: 0.5,
        readOnly: row !== "disabled",
        disabled: row === "disabled",
        modelValue: row === "empty" ? 0 : row === "half" ? 2.5 : row === "full" ? 5 : 4.5,
      } as never,
      slots: row === "with-label" ? { label: "4.8 · 128 reviews" } : undefined,
    }),
  });
});

test("should render the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, { props: { modelValue: 4, readOnly: true } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-rating--read-only/);
  await expect(component).not.toHaveClass(/okkly-rating--color-/);
  await expect(component).not.toHaveClass(/okkly-rating--(small|large)/);
});

test("should render max star buttons when interactive", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, { props: { modelValue: 2 } as never });

  // ASSERT
  await expect(component.getByRole("button")).toHaveCount(5);
});

test("should render half-filled stars for fractional values", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 2.5, readOnly: true } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-rating__icon--half")).toHaveCount(1);
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(2);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 4, size: "small", readOnly: true } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-rating--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-rating--(small|large)/);
});

test("should apply a color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 4, color: "primary", readOnly: true } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-rating--color-primary/);

  // ACT
  await component.update({ props: { color: "warning" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-rating--color-/);
});

test("should fire update:modelValue with the half the pointer landed on", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE — the default precision is 0.5, so each star is two targets and it
  // is the pointer's x position that decides which one.
  const component = await mount(Rating, {
    props: { modelValue: 2 } as never,
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });
  const fourth = component.getByRole("button", { name: "4 Stars" });
  const box = (await fourth.boundingBox())!;

  // ACT
  await fourth.click({ position: { x: box.width * 0.75, y: box.height / 2 } });

  // ASSERT
  expect(changes.at(-1)).toBe(4);

  // ACT
  await fourth.click({ position: { x: box.width * 0.25, y: box.height / 2 } });

  // ASSERT
  expect(changes.at(-1)).toBe(3.5);
});

test("should fire update:modelValue with whole stars at precision 1", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 2, precision: 1 } as never,
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });
  const fourth = component.getByRole("button", { name: "4 Stars" });
  const box = (await fourth.boundingBox())!;

  // ACT — the left half of the star now counts as the whole star.
  await fourth.click({ position: { x: box.width * 0.25, y: box.height / 2 } });

  // ASSERT
  expect(changes).toEqual([4]);
});

test("should clear the value when the active star is clicked again", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 3, precision: 1 } as never,
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("button", { name: "3 Stars" }).click();

  // ASSERT
  expect(changes).toEqual([null]);
});

test("should update in uncontrolled mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { defaultValue: 2, precision: 1 } as never,
  });

  // ACT
  await component.getByRole("button", { name: "4 Stars" }).click();

  // ASSERT
  await expect(
    component.getByRole("button", { name: "4 Stars" }).locator(".okkly-rating__icon--full"),
  ).toBeAttached();
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(4);
});

test("should render trailing label text", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 4.5, readOnly: true } as never,
    slots: { label: "4.8 · 128 reviews" },
  });

  // ASSERT
  await expect(component.locator(".okkly-rating__label")).toHaveText("4.8 · 128 reviews");
});

test("should not render buttons when readOnly", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, { props: { modelValue: 4, readOnly: true } as never });

  // ASSERT
  await expect(component.getByRole("button")).toHaveCount(0);
});

test("should disable interaction when disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Rating, {
    props: { modelValue: 3, disabled: true } as never,
    on: { "update:modelValue": () => {} },
  });

  // ASSERT — with no buttons rendered there is nothing left to click.
  await expect(component).toHaveClass(/okkly-rating--disabled/);
  await expect(component.getByRole("button")).toHaveCount(0);
});
