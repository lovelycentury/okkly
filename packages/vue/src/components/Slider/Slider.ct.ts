import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Slider from "./Slider.vue";
import type { SliderColor, SliderSize } from "./Slider.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SliderColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SliderSize[];

const MARKS = [
  { value: 0, label: "0" },
  { value: 20, label: "20" },
  { value: 37, label: "37" },
  { value: 100, label: "100" },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Slider (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Slider,
    args: (column, row) => ({
      props: {
        defaultValue: 40,
        color: column,
        size: row,
        "aria-label": "Volume",
        style: "width: 10rem",
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Slider (variants)",
    columns: ["single", "range", "discrete", "custom-marks"],
    rows: ["default", "disabled"],
    fastNoIsolation: true,
    component: Slider,
    args: (column, row) => {
      const disabled = row === "disabled";

      if (column === "range") {
        return {
          props: {
            defaultValue: [25, 75],
            disabled,
            getAriaLabel: (index: number) => `Thumb ${index + 1}`,
            style: "width: 12rem",
          } as never,
        };
      }

      return {
        props: {
          defaultValue: column === "custom-marks" ? 20 : 40,
          discrete: column !== "single",
          step: column === "discrete" ? 10 : undefined,
          marks: column === "custom-marks" ? MARKS : undefined,
          disabled,
          "aria-label": "Volume",
          style: `width: 12rem; padding-bottom: ${column === "custom-marks" ? "1.5rem" : "0"}`,
        } as never,
      };
    },
  });
});

test("should render with the default classes and no size/color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 30, "aria-label": "Volume" } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-slider/);
  await expect(component).not.toHaveClass(/okkly-slider--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-slider--color-/);
  await expect(component.getByRole("slider")).toHaveAccessibleName("Volume");
});

test("should step with keyboard navigation", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 30, "aria-label": "Volume" } as never,
  });
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
});

test("should jump when the track is clicked", async ({ mount }) => {
  const changes: (number | number[])[] = [];

  // ARRANGE — a real 200px-wide track, so the click maths is the browser's.
  const component = await mount(Slider, {
    props: { defaultValue: 10, "aria-label": "Volume" } as never,
    on: { "update:modelValue": (value: unknown) => changes.push(value as number) },
  });
  await component.evaluate((el: HTMLElement) => {
    el.style.width = "200px";
  });
  const box = (await component.boundingBox())!;

  // ACT — three quarters along the track.
  await component.click({ position: { x: box.width * 0.75, y: box.height / 2 } });

  // ASSERT
  const last = changes.at(-1) as number;
  expect(last).toBeGreaterThanOrEqual(70);
  expect(last).toBeLessThanOrEqual(80);
});

test("should snap to step marks when discrete", async ({ mount }) => {
  const changes: (number | number[])[] = [];

  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 20, discrete: true, step: 10, "aria-label": "Volume" } as never,
    on: { "update:modelValue": (value: unknown) => changes.push(value as number) },
  });
  await component.evaluate((el: HTMLElement) => {
    el.style.width = "200px";
  });
  const box = (await component.boundingBox())!;

  // ASSERT — one mark per step, inclusive of both ends.
  await expect(component.locator(".okkly-slider__mark")).toHaveCount(11);

  // ACT
  await component.click({ position: { x: box.width * 0.72, y: box.height / 2 } });

  // ASSERT
  expect(changes.at(-1)).toBe(70);
});

test("should navigate mark to mark with the keyboard when discrete", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 30, discrete: true, step: 10, "aria-label": "Volume" } as never,
  });
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

test("should restrict values to custom marks when discrete", async ({ mount }) => {
  const changes: (number | number[])[] = [];

  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 20, discrete: true, marks: MARKS, "aria-label": "Temp" } as never,
    on: { "update:modelValue": (value: unknown) => changes.push(value as number) },
  });
  await component.evaluate((el: HTMLElement) => {
    el.style.width = "200px";
  });
  const box = (await component.boundingBox())!;

  // ACT — 40% along lands between the 37 and 100 marks, nearest 37.
  await component.click({ position: { x: box.width * 0.4, y: box.height / 2 } });

  // ASSERT
  expect(changes.at(-1)).toBe(37);
});

test("should render a range slider with two thumbs", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slider, {
    props: {
      defaultValue: [25, 75],
      getAriaLabel: (index: number) => `Thumb ${index + 1}`,
    } as never,
  });
  const sliders = component.getByRole("slider");

  // ASSERT
  await expect(sliders).toHaveCount(2);
  await expect(sliders.nth(0)).toHaveAttribute("aria-valuenow", "25");
  await expect(sliders.nth(1)).toHaveAttribute("aria-valuenow", "75");
});

test("should disable interaction when disabled", async ({ mount, page }) => {
  const changes: (number | number[])[] = [];

  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 20, disabled: true, "aria-label": "Volume" } as never,
    on: { "update:modelValue": (value: unknown) => changes.push(value as number) },
  });
  const input = component.getByRole("slider");

  // ASSERT
  await expect(input).toBeDisabled();

  // ACT — a disabled input cannot take focus, so press the key at the page level.
  await page.keyboard.press("ArrowRight");

  // ASSERT
  await expect(input).toHaveAttribute("aria-valuenow", "20");
  expect(changes).toEqual([]);
});

test("should apply size and color modifiers only for non-default values", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slider, {
    props: { defaultValue: 30, size: "small", color: "dante", "aria-label": "Volume" } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-slider--small/);
  await expect(component).toHaveClass(/okkly-slider--color-dante/);

  // ACT
  await component.update({ props: { size: "medium", color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-slider--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-slider--color-/);
});
