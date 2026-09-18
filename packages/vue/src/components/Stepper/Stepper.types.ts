export type StepperColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "done" | "active" | "pending";

/**
 * Vue-forced difference from React's `StepperStep`: `label` and
 * `description` narrow from `ReactNode` to `string`. There is no slot
 * equivalent here since this whole object, not just one field of it, is a
 * plain data prop.
 */
export interface StepperStep {
  /** Step label. */
  label: string;
  /** Supporting text shown under the label. */
  description?: string;
  /** Marks the step as optional. */
  optional?: boolean;
}

/**
 * Props follow MUI's Stepper API (https://mui.com/material-ui/api/stepper/)
 * loosely, mirroring `@okkly/react`'s `<Stepper>` name-for-name:
 * `orientation`/`activeStep`/`alternativeLabel` match name-for-name.
 * Deliberate gaps carried over from React: steps come from an `items`-style
 * `steps` array (not `Step` children), `color` uses okkly tone names, and
 * there's no `StepButton` / clickable jump in v1.
 *
 * Purely presentational — there's no controlled/uncontrolled distinction to
 * make Vue-idiomatic: `activeStep` stays a plain required prop, same as
 * React. `className` is dropped — a consumer's `class` merges onto the root
 * automatically.
 */
export interface StepperProps {
  /**
   * Ordered steps in the flow.
   *
   * @default undefined
   */
  steps: StepperStep[];
  /**
   * Zero-based index of the active step.
   *
   * @default undefined
   */
  activeStep: number;
  /**
   * Orientation.
   *
   * @default "horizontal"
   */
  orientation?: StepperOrientation;
  /**
   * When true, labels sit below the step dots in horizontal mode.
   *
   * @default true
   */
  alternativeLabel?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   */
  color?: StepperColor;
}
