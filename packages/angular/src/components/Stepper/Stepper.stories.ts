import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyStepper } from "./Stepper";
import type { StepperColor, StepperOrientation, StepperStep } from "./Stepper";

const surface = `
  background: var(--okkly-bg-surface-raised);
  border: 1px solid var(--okkly-border-subtle);
  border-radius: 12px;
  padding: 24px;
  width: 560px;
  font-family: var(--okkly-font-family-sans);
  color: var(--okkly-text-primary);
`;

const checkoutSteps: StepperStep[] = [
  { label: "Cart", description: "3 items" },
  { label: "Delivery", description: "Address & courier" },
  { label: "Payment", description: "Card or invoice" },
  { label: "Confirmation" },
];

/** Every input the template below binds. */
type StepperArgs = {
  steps: StepperStep[];
  activeStep: number;
  orientation: StepperOrientation;
  alternativeLabel: boolean;
  color: StepperColor;
};

const bindings = `
    [steps]="steps"
    [activeStep]="activeStep"
    [orientation]="orientation"
    [alternativeLabel]="alternativeLabel"
    [color]="color"`;

/**
 * Progress through an ordered flow. `activeStep` is a plain index: everything
 * before it renders as done, the step itself is current, the rest are pending.
 *
 * The component is presentational — advancing is your flow's job, as in the
 * checkout story below.
 */
const meta: Meta<StepperArgs> = {
  title: "Navigation/Stepper",
  component: OkklyStepper,
  decorators: [moduleMetadata({ imports: [OkklyStepper, OkklyButton] })],
  args: {
    steps: [
      { label: "Cart" },
      { label: "Delivery" },
      { label: "Payment" },
      { label: "Confirmation" },
    ],
    activeStep: 1,
    orientation: "horizontal",
    alternativeLabel: true,
    color: "primary",
  },
  argTypes: {
    steps: { control: false },
    activeStep: { control: { type: "number", min: 0, max: 4 } },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: (args) => ({
    props: args,
    template: `<div style="${surface}"><okkly-stepper${bindings} /></div>`,
  }),
};

export default meta;
type Story = StoryObj<StepperArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A checkout wizard driving the stepper from real navigation buttons — the
 * usual way it appears in a product.
 */
export const CheckoutWizard: Story = {
  render: () => ({
    props: { steps: checkoutSteps, step: 0 },
    template: `
      <div style="${surface}; display: grid; gap: 24px">
        <okkly-stepper [steps]="steps" [activeStep]="step" />
        <div style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); text-align: center">
          {{ step === steps.length - 1 ? "All done — the order is on its way." : "Step " + (step + 1) + " of " + steps.length }}
        </div>
        <div style="display: flex; gap: 12px; justify-content: center">
          <button okklyButton variant="ghost" [disabled]="step === 0" (click)="step = step - 1">Back</button>
          <button okklyButton [disabled]="step === steps.length - 1" (click)="step = step + 1">
            {{ step === steps.length - 2 ? "Place order" : "Continue" }}
          </button>
        </div>
      </div>`,
  }),
};

/**
 * Vertical layout fits a sidebar and gives each step room for a description.
 */
export const Vertical: Story = {
  render: () => ({
    props: {
      steps: [
        { label: "Repository connected", description: "github.com/lovelycentury/orbit" },
        { label: "Pipeline configured", description: "Build, test, and lint stages" },
        { label: "Environment variables", description: "3 of 5 secrets provided" },
        {
          label: "First deploy",
          description: "Runs once the steps above are green",
          optional: true,
        },
      ],
    },
    template: `
      <div style="${surface}; width: 360px">
        <okkly-stepper orientation="vertical" [activeStep]="2" [steps]="steps" />
      </div>`,
  }),
};

/**
 * `alternativeLabel={false}` puts the label beside the dot instead of under it
 * — a compact header strip for narrow layouts.
 */
export const InlineLabels: Story = {
  render: () => ({
    props: {
      steps: [{ label: "Draft" }, { label: "In review" }, { label: "Published" }],
    },
    template: `
      <div style="${surface}">
        <okkly-stepper [alternativeLabel]="false" [activeStep]="1" [steps]="steps" />
      </div>`,
  }),
};

/**
 * How the three step states read: everything before `activeStep` is checked
 * off, the active one is highlighted, the rest stay muted.
 */
export const States: Story = {
  render: () => ({
    props: { steps: checkoutSteps, activeSteps: [0, 2, 4] },
    template: `
      <div style="${surface}; display: grid; gap: 28px">
        @for (activeStep of activeSteps; track activeStep) {
          <okkly-stepper [steps]="steps" [activeStep]="activeStep" />
        }
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); text-align: center">
          start · mid-flow · finished (activeStep past the last index)
        </span>
      </div>`,
  }),
};

/**
 * Optional steps are marked in the label so users know they can skip them.
 */
export const OptionalSteps: Story = {
  render: () => ({
    props: {
      steps: [{ label: "Account" }, { label: "Company", optional: true }, { label: "Billing" }],
    },
    template: `
      <div style="${surface}">
        <okkly-stepper [activeStep]="1" [steps]="steps" />
      </div>`,
  }),
};

/**
 * Every accent tone the dots and connectors support.
 */
export const Colors: Story = {
  render: () => ({
    props: {
      colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as StepperColor[],
      stepsFor: (color: StepperColor): StepperStep[] => [
        { label: color },
        { label: "Second" },
        { label: "Third" },
        { label: "Fourth" },
      ],
    },
    template: `
      <div style="${surface}; display: grid; gap: 28px">
        @for (color of colors; track color) {
          <okkly-stepper [color]="color" [activeStep]="2" [steps]="stepsFor(color)" />
        }
      </div>`,
  }),
};
