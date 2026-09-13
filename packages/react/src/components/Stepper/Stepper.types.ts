import type { HTMLAttributes, ReactNode } from "react";

export type StepperColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type StepperOrientation = "horizontal" | "vertical";

export interface StepperStep {
  /** Step label. */
  label: ReactNode;
  /** Supporting text shown under the label. */
  description?: ReactNode;
  /** Marks the step as optional. */
  optional?: boolean;
}

/**
 * Props follow MUI's Stepper API (https://mui.com/material-ui/api/stepper/) loosely:
 * `orientation`/`activeStep`/`alternativeLabel` match name-for-name. Deliberate
 * gaps: steps come from an `items`-style `steps` array (not `Step` children),
 * `color` uses okkly tone names, and there's no `StepButton` / clickable jump in v1.
 */
export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Ordered steps in the flow.
   *
   * @default undefined
   * @type {StepperStep[]}
   */
  steps: StepperStep[];
  /**
   * Zero-based index of the active step.
   *
   * @default undefined
   * @type {number}
   */
  activeStep: number;
  /**
   * Orientation.
   *
   * @default "horizontal"
   * @type {StepperOrientation}
   */
  orientation?: StepperOrientation;
  /**
   * When true, labels sit below the step dots in horizontal mode.
   *
   * @default true
   * @type {boolean}
   */
  alternativeLabel?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   * @type {StepperColor}
   */
  color?: StepperColor;
}

export type StepState = "done" | "active" | "pending";
