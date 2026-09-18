import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Stepper from "./Stepper.vue";
import type { StepperColor, StepperOrientation, StepperStep } from "./Stepper.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly StepperColor[];
const ORIENTATIONS = ["horizontal", "vertical"] as const satisfies readonly StepperOrientation[];

const STEPS: StepperStep[] = [
  { label: "Account", description: "Sign in" },
  { label: "Shipping", description: "Address" },
  { label: "Payment" },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Stepper (colors)",
    columns: COLORS,
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: Stepper,
    args: (column, row) => ({
      props: {
        steps: STEPS,
        activeStep: 1,
        color: column,
        orientation: row,
        style: `width: ${row === "vertical" ? "14rem" : "26rem"}`,
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Stepper (states)",
    columns: ["first", "middle", "last", "complete"],
    rows: ["alternative-label", "inline-label", "optional"],
    fastNoIsolation: true,
    component: Stepper,
    args: (column, row) => ({
      props: {
        activeStep: ["first", "middle", "last", "complete"].indexOf(column),
        alternativeLabel: row === "alternative-label",
        steps: row === "optional" ? STEPS.map((step) => ({ ...step, optional: true })) : STEPS,
        style: "width: 26rem",
      } as never,
    }),
  });
});

test("should render every step label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, { props: { steps: STEPS, activeStep: 1 } as never });

  // ASSERT
  await expect(component).toContainText("Account");
  await expect(component).toContainText("Shipping");
  await expect(component).toContainText("Payment");
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, { props: { steps: STEPS, activeStep: 0 } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-stepper--horizontal/);
  await expect(component).toHaveClass(/okkly-stepper--alternative-label/);
  await expect(component).not.toHaveClass(/okkly-stepper--color-/);
  await expect(component).not.toHaveClass(/okkly-stepper--vertical/);
});

test("should mark completed, active and pending steps", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, { props: { steps: STEPS, activeStep: 1 } as never });
  const steps = component.locator(".okkly-stepper__step");

  // ASSERT
  await expect(steps.nth(0)).toHaveClass(/okkly-stepper__step--done/);
  await expect(steps.nth(1)).toHaveClass(/okkly-stepper__step--active/);
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(2)).not.toHaveClass(/okkly-stepper__step--(done|active)/);
});

test("should apply the orientation, alternativeLabel and color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, {
    props: { steps: STEPS, activeStep: 0, orientation: "vertical" } as never,
  });

  // ASSERT — a vertical stepper never uses the alternative label layout.
  await expect(component).toHaveClass(/okkly-stepper--vertical/);
  await expect(component).not.toHaveClass(/okkly-stepper--alternative-label/);

  // ACT
  await component.update({
    props: { steps: STEPS, activeStep: 0, alternativeLabel: false } as never,
  });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-stepper--alternative-label/);

  // ACT
  await component.update({ props: { steps: STEPS, activeStep: 0, color: "dante" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-stepper--color-dante/);
});

test("should show a check for completed steps and a number for the active one", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(Stepper, { props: { steps: STEPS, activeStep: 2 } as never });

  // ASSERT
  await expect(component.locator(".okkly-stepper__dot--done")).toHaveCount(2);
  await expect(component.locator(".okkly-stepper__dot--active")).toHaveText("3");
});

test("should show the optional marker text", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, {
    props: { steps: [{ label: "Review", optional: true }], activeStep: 0 } as never,
  });

  // ASSERT
  await expect(component).toContainText("(optional)");
});

test("should render connectors between steps but not after the last one", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Stepper, { props: { steps: STEPS, activeStep: 1 } as never });

  // ASSERT
  await expect(component.locator(".okkly-stepper__connector")).toHaveCount(STEPS.length - 1);
});
