import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { RatingColor, RatingIcon, RatingSize } from "./Rating";

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
    component: (column, row) =>
      `<okkly-rating [value]="3.5" color="${column}" icon="${row}" precision="0.5" readOnly />`,
  });

  executeMatrixScreenshotTest({
    name: "Rating (states)",
    columns: SIZES,
    rows: ["empty", "half", "full", "with-label", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-rating size="${column}" precision="0.5"${
        row === "disabled" ? " disabled" : " readOnly"
      } [value]="${row === "empty" ? 0 : row === "half" ? 2.5 : row === "full" ? 5 : 4.5}"${
        row === "with-label" ? ` label="4.8 · 128 reviews"` : ""
      } />`,
  });
});

test("should render the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="4" readOnly />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-rating--read-only/);
  await expect(component).not.toHaveClass(/okkly-rating--color-/);
  await expect(component).not.toHaveClass(/okkly-rating--(small|large)/);
});

test("should be an image named by its score when read-only", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="4" readOnly />`);

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("4 of 5");
});

test("should render max star buttons in a radiogroup when interactive", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="2" name="score" />`);

  // ASSERT
  await expect(component).toHaveRole("radiogroup");
  await expect(component.getByRole("button")).toHaveCount(5);
  await expect(component.getByRole("button", { name: "1 Star", exact: true })).toHaveAttribute(
    "name",
    "score",
  );
});

test("should render half-filled stars for fractional values", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="2.5" readOnly />`);

  // ASSERT
  await expect(component.locator(".okkly-rating__icon--half")).toHaveCount(1);
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(2);
  await expect(component.locator(".okkly-rating__icon--half .okkly-rating__icon-fill")).toHaveCount(
    1,
  );
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="4" [size]="state().size" readOnly />`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-rating--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-rating--(small|large)/);
});

test("should apply a color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="4" [color]="state().color" readOnly />`,
    { color: "primary" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-rating--color-primary/);

  // ACT
  await update({ color: "warning" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-rating--color-/);
});

test("should emit the half the pointer landed on", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE — the default precision is 0.5, so each star is two targets and it
  // is the pointer's x position that decides which one.
  const component = await mountTemplate(
    `<okkly-rating [value]="2" (valueChange)="record('value', $event)" />`,
  );
  const fourth = component.getByRole("button", { name: "4 Stars" });
  const box = (await fourth.boundingBox())!;

  // ACT
  await fourth.click({ position: { x: box.width * 0.75, y: box.height / 2 } });

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(4);

  // ACT
  await fourth.click({ position: { x: box.width * 0.25, y: box.height / 2 } });

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(3.5);
});

test("should emit whole stars at precision 1", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="2" precision="1" (valueChange)="record('value', $event)" />`,
  );
  const fourth = component.getByRole("button", { name: "4 Stars" });
  const box = (await fourth.boundingBox())!;

  // ACT — the left half of the star now counts as the whole star.
  await fourth.click({ position: { x: box.width * 0.25, y: box.height / 2 } });

  // ASSERT
  expect(await recordedEvents("value")).toEqual([4]);
});

test("should preview the hovered score and restore it on leave", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="1" precision="1" />`);

  // ACT
  await component.getByRole("button", { name: "4 Stars" }).hover();

  // ASSERT
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(4);

  // ACT
  await page.mouse.move(700, 500);

  // ASSERT
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(1);
});

test("should clear the value when the active star is clicked again", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="3" precision="1" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "3 Stars" }).click();

  // ASSERT
  expect(await recordedEvents("value")).toEqual([null]);
});

test("should step with the arrow keys", async ({ mountTemplate, page, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="2" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "1 Star", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");

  // ASSERT
  expect(await recordedEvents("value")).toEqual([2.5, 3, 2.5]);
});

test("should update without a binding", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="2" precision="1" />`);

  // ACT
  await component.getByRole("button", { name: "4 Stars" }).click();
  await component.page().mouse.move(700, 500);

  // ASSERT
  await expect(component.locator(".okkly-rating__icon--full")).toHaveCount(4);
});

test("should render a custom glyph template", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="1.5" readOnly>
      <ng-template okklyRatingIcon><b class="glyph">●</b></ng-template>
    </okkly-rating>`,
  );

  // ASSERT — five glyphs, plus the fill layer of the half one.
  await expect(component.locator(".glyph")).toHaveCount(6);
  await expect(component.locator("svg")).toHaveCount(0);
});

test("should render trailing label text", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-rating [value]="4.5" label="4.8 · 128 reviews" readOnly />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-rating__label")).toHaveText("4.8 · 128 reviews");
});

test("should not render buttons when readOnly", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="4" readOnly />`);

  // ASSERT
  await expect(component.getByRole("button")).toHaveCount(0);
});

test("should disable interaction when disabled", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-rating [value]="3" disabled />`);

  // ASSERT — with no buttons rendered there is nothing left to click.
  await expect(component).toHaveClass(/okkly-rating--disabled/);
  await expect(component.getByRole("button")).toHaveCount(0);
});
