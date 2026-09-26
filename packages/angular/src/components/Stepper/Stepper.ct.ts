import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { StepperColor, StepperOrientation, StepperStep } from "./Stepper";

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

/**
 * The steps as an Angular template expression. `JSON.stringify` can't be used
 * directly inside a double-quoted attribute — its own double quotes would
 * prematurely close the attribute — so this mirrors `Breadcrumbs.ct.ts`'s
 * `literal()` helper and emits single-quoted object literal syntax instead.
 */
const stepsLiteral = (steps: readonly StepperStep[]) =>
  `[${steps
    .map(
      (step) =>
        `{ label: '${step.label}'${step.description ? `, description: '${step.description}'` : ""}${step.optional ? ", optional: true" : ""} }`,
    )
    .join(", ")}]`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Stepper (colors)",
    columns: COLORS,
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: (column, row) => `
      <div style="width: ${row === "vertical" ? "14rem" : "26rem"}">
        <okkly-stepper
          [steps]="${stepsLiteral(STEPS)}"
          [activeStep]="1"
          color="${column}"
          orientation="${row}"
        />
      </div>
    `,
  });

  executeMatrixScreenshotTest({
    name: "Stepper (states)",
    columns: ["first", "middle", "last", "complete"],
    rows: ["alternative-label", "inline-label", "optional"],
    fastNoIsolation: true,
    component: (column, row) => {
      const steps = row === "optional" ? STEPS.map((step) => ({ ...step, optional: true })) : STEPS;
      return `
        <div style="width: 26rem">
          <okkly-stepper
            [steps]="${stepsLiteral(steps)}"
            [activeStep]="${["first", "middle", "last", "complete"].indexOf(column)}"
            [alternativeLabel]="${row === "alternative-label"}"
          />
        </div>
      `;
    },
  });
});

test("should render every step label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="1" />`,
    {
      steps: STEPS,
    },
  );

  // ASSERT
  await expect(component).toContainText("Account");
  await expect(component).toContainText("Shipping");
  await expect(component).toContainText("Payment");
});

test("should render with no modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="0" />`,
    {
      steps: STEPS,
    },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-stepper--horizontal/);
  await expect(component).toHaveClass(/okkly-stepper--alternative-label/);
  await expect(component).not.toHaveClass(/okkly-stepper--color-/);
  await expect(component).not.toHaveClass(/okkly-stepper--vertical/);
});

test("should mark completed, active and pending steps", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="1" />`,
    {
      steps: STEPS,
    },
  );
  const steps = component.locator(".okkly-stepper__step");

  // ASSERT
  await expect(steps.nth(0)).toHaveClass(/okkly-stepper__step--done/);
  await expect(steps.nth(1)).toHaveClass(/okkly-stepper__step--active/);
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(2)).not.toHaveClass(/okkly-stepper__step--(done|active)/);
});

test("should apply the orientation, alternativeLabel and color modifiers", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper
      [steps]="state().steps"
      [activeStep]="0"
      [orientation]="state().orientation"
      [alternativeLabel]="state().alternativeLabel"
      [color]="state().color"
    />`,
    { steps: STEPS, orientation: "vertical", alternativeLabel: true, color: "primary" },
  );

  // ASSERT — a vertical stepper never uses the alternative label layout.
  await expect(component).toHaveClass(/okkly-stepper--vertical/);
  await expect(component).not.toHaveClass(/okkly-stepper--alternative-label/);

  // ACT
  await update({ orientation: "horizontal", alternativeLabel: false });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-stepper--alternative-label/);

  // ACT
  await update({ color: "dante" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-stepper--color-dante/);
});

test("should show a check for completed steps and a number for the active one", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="2" />`,
    {
      steps: STEPS,
    },
  );

  // ASSERT
  await expect(component.locator(".okkly-stepper__dot--done")).toHaveCount(2);
  await expect(component.locator(".okkly-stepper__dot--active")).toHaveText("3");
});

test("should show the optional marker text", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="0" />`,
    {
      steps: [{ label: "Review", optional: true }],
    },
  );

  // ASSERT
  await expect(component).toContainText("(optional)");
});

test("should render connectors between steps but not after the last one", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stepper [steps]="state().steps" [activeStep]="1" />`,
    {
      steps: STEPS,
    },
  );

  // ASSERT
  await expect(component.locator(".okkly-stepper__connector")).toHaveCount(STEPS.length - 1);
});
