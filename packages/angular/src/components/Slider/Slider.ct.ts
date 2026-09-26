import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { SliderColor, SliderSize } from "./Slider";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SliderColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SliderSize[];

const MARKS = `[{ value: 0, label: '0' }, { value: 20, label: '20' }, { value: 37, label: '37' }, { value: 100, label: '100' }]`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Slider (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem">
        <okkly-slider [value]="40" color="${column}" size="${row}" aria-label="Volume" />
      </div>`,
  });

  executeMatrixScreenshotTest({
    name: "Slider (variants)",
    columns: ["single", "range", "discrete", "custom-marks"],
    rows: ["default", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => {
      const disabled = row === "disabled" ? " disabled" : "";
      const slider =
        column === "range"
          ? `<okkly-slider [value]="[25, 75]"${disabled} aria-label="Range" />`
          : column === "discrete"
            ? `<okkly-slider [value]="40" discrete step="10"${disabled} aria-label="Volume" />`
            : column === "custom-marks"
              ? `<okkly-slider [value]="20" discrete [marks]="${MARKS}"${disabled} aria-label="Volume" />`
              : `<okkly-slider [value]="40"${disabled} aria-label="Volume" />`;
      return `<div style="width: 12rem; padding-bottom: ${column === "custom-marks" ? "1.5rem" : "0"}">${slider}</div>`;
    },
  });
});

/** A real 200px-wide track, so the click maths is the browser's. */
const onTrack = (slider: string) => `<div style="width: 200px">${slider}</div>`;

test("should render with the default classes and no size/color modifiers", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-slider [value]="30" aria-label="Volume" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-slider");
  await expect(component).not.toHaveAttribute("aria-label");
  const thumb = component.getByRole("slider");
  await expect(thumb).toHaveAccessibleName("Volume");
  await expect(thumb).toHaveAttribute("aria-valuenow", "30");
  await expect(thumb).toHaveAttribute("aria-valuemin", "0");
  await expect(thumb).toHaveAttribute("aria-valuemax", "100");
});

test("should start at min without a value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-slider min="10" aria-label="Volume" />`);

  // ASSERT
  await expect(component.getByRole("slider")).toHaveAttribute("aria-valuenow", "10");
});

test("should step with keyboard navigation", async ({ mountTemplate, page, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="30" aria-label="Volume" (changeCommitted)="record('commit', $event)" />`,
  );
  const input = component.getByRole("slider");

  // ACT
  await input.focus();
  await page.keyboard.press("ArrowRight");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "31");

  // ACT
  await page.keyboard.press("ArrowLeft");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "30");
  expect(await recordedEvents("commit")).toEqual([31, 30]);
});

test("should jump by shiftStep, and to the ends with Home and End", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-slider [value]="30" aria-label="Volume" />`);
  const input = component.getByRole("slider");

  // ACT
  await input.focus();
  await page.keyboard.press("Shift+ArrowRight");

  // ASSERT — a tenth of the range by default.
  await expect(input).toHaveAttribute("aria-valuenow", "40");

  // ACT
  await page.keyboard.press("End");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "100");

  // ACT
  await page.keyboard.press("Home");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "0");
});

test("should jump when the track is clicked", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    onTrack(
      `<okkly-slider [value]="10" (valueChange)="record('value', $event)" aria-label="Volume" />`,
    ),
  );
  const slider = component.locator(".okkly-slider");
  const box = (await slider.boundingBox())!;

  // ACT — three quarters along the track.
  await slider.click({ position: { x: box.width * 0.75, y: box.height / 2 } });

  // ASSERT
  const last = (await recordedEvents("value")).at(-1) as number;
  expect(last).toBeGreaterThanOrEqual(70);
  expect(last).toBeLessThanOrEqual(80);
});

test("should follow a drag and commit where it ends", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    onTrack(
      `<okkly-slider [value]="0" (changeCommitted)="record('commit', $event)" aria-label="Volume" />`,
    ),
  );
  const slider = component.locator(".okkly-slider");
  const box = (await slider.boundingBox())!;
  const y = box.y + box.height / 2;

  // ACT
  await page.mouse.move(box.x + 1, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, y, { steps: 5 });
  await page.mouse.move(box.x + box.width * 0.5, y, { steps: 5 });
  await page.mouse.up();

  // ASSERT
  const value = Number(await component.getByRole("slider").getAttribute("aria-valuenow"));
  expect(value).toBeGreaterThanOrEqual(45);
  expect(value).toBeLessThanOrEqual(55);
  expect(await recordedEvents("commit")).toEqual([value]);
});

test("should snap to step marks when discrete", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    onTrack(
      `<okkly-slider [value]="20" discrete step="10" (valueChange)="record('value', $event)" aria-label="Volume" />`,
    ),
  );
  const slider = component.locator(".okkly-slider");
  const box = (await slider.boundingBox())!;

  // ASSERT — one mark per step, inclusive of both ends.
  await expect(component.locator(".okkly-slider__mark")).toHaveCount(11);
  await expect(component.locator(".okkly-slider__mark--active")).toHaveCount(3);

  // ACT
  await slider.click({ position: { x: box.width * 0.72, y: box.height / 2 } });

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(70);
});

test("should navigate mark to mark with the keyboard when discrete", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="30" discrete step="10" aria-label="Volume" />`,
  );
  const input = component.getByRole("slider");

  // ACT
  await input.focus();
  await page.keyboard.press("ArrowRight");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "40");

  // ACT
  await page.keyboard.press("ArrowLeft");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "30");
});

test("should restrict values to custom marks when discrete", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    onTrack(
      `<okkly-slider [value]="20" discrete [marks]="${MARKS}" (valueChange)="record('value', $event)" aria-label="Temp" />`,
    ),
  );
  const slider = component.locator(".okkly-slider");
  const box = (await slider.boundingBox())!;

  // ASSERT
  await expect(component.locator(".okkly-slider__mark-label")).toHaveText(["0", "20", "37", "100"]);

  // ACT — 40% along lands between the 37 and 100 marks, nearest 37.
  await slider.click({ position: { x: box.width * 0.4, y: box.height / 2 } });

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(37);
});

test("should render a range slider with two thumbs", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-slider [value]="[25, 75]" aria-label="Price" />`);
  const sliders = component.getByRole("slider");

  // ASSERT
  await expect(sliders).toHaveCount(2);
  await expect(sliders.nth(0)).toHaveAttribute("aria-valuenow", "25");
  await expect(sliders.nth(1)).toHaveAttribute("aria-valuenow", "75");

  // ACT
  await sliders.nth(1).focus();
  await page.keyboard.press("ArrowLeft");

  // ASSERT
  await expect(sliders.nth(1)).toHaveAttribute("aria-valuenow", "74");
});

test("should name every range thumb with aria-label", async ({ mountTemplate }) => {
  // ARRANGE — without getAriaLabel, each thumb falls back to aria-label.
  const component = await mountTemplate(`<okkly-slider [value]="[25, 75]" aria-label="Price" />`);

  // ASSERT
  await expect(component.getByRole("slider", { name: "Price" })).toHaveCount(2);
});

test("should show the value label as valueLabelDisplay asks", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="42" [valueLabelDisplay]="state().display" aria-label="Volume" />`,
    { display: "on" },
  );
  const label = component.locator(".okkly-slider__value-label");

  // ASSERT
  await expect(label).toHaveText("42");

  // ACT
  await update({ display: "off" });

  // ASSERT
  await expect(label).toHaveCount(0);

  // ACT
  await update({ display: "auto" });
  await component.page().keyboard.press("Tab");

  // ASSERT — shown while the thumb has keyboard focus.
  await expect(label).toHaveText("42");
});

test("should fill past the thumb with an inverted track", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="30" track="inverted" aria-label="Volume" />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-slider--track-inverted/);
  await expect(component.locator(".okkly-slider__track")).toHaveCount(0);
  const segment = component.locator(".okkly-slider__track-inverted");
  await expect(segment).toHaveCount(1);
  await expect(segment).toHaveAttribute("style", /left: 30%; width: 70%/);
});

test("should lay out vertically", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="60" orientation="vertical" aria-label="Volume" />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-slider--vertical/);
  await expect(component.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
  await expect(component.locator(".okkly-slider__thumb")).toHaveAttribute("style", /bottom: 60%/);
});

test("should disable interaction when disabled", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="20" disabled (valueChange)="record('value', $event)" aria-label="Volume" />`,
  );
  const input = component.getByRole("slider");

  // ASSERT
  await expect(input).toBeDisabled();
  await expect(component).toHaveAttribute("aria-disabled", "true");

  // ACT — a disabled input cannot take focus, so press the key at the page level.
  await page.keyboard.press("ArrowRight");
  await component.click({ force: true });

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "20");
  expect(await recordedEvents("value")).toEqual([]);
});

test("should apply size and color modifiers only for non-default values", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-slider [value]="30" [size]="state().size" [color]="state().color" aria-label="Volume" />`,
    { size: "small", color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-slider--small/);
  await expect(component).toHaveClass(/okkly-slider--color-dante/);

  // ACT
  await update({ size: "medium", color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-slider--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-slider--color-/);
});
