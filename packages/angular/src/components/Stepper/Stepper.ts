import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { iconCheck } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";

export type StepperColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "done" | "active" | "pending";

/** One step in the flow. */
export interface StepperStep {
  /** Visible text. */
  label: string;
  /** Supporting text shown under the label. */
  description?: string;
  /** Marks the step as optional. */
  optional?: boolean;
}

function getStepState(index: number, activeStep: number): StepState {
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}

/**
 * Props follow MUI's Stepper API (https://mui.com/material-ui/api/stepper/)
 * loosely, mirroring `@okkly/react`'s `<Stepper>` name-for-name:
 * `orientation`/`activeStep`/`alternativeLabel`/`color`. Deliberate gaps:
 * react's `steps[].label`/`description` accept any `ReactNode` — here they're
 * plain strings, the same call `OkklyBreadcrumbs`'s `items` already made —
 * and there's no `StepButton`/clickable jump in v1, matching react.
 *
 * Presentational only: advancing `activeStep` is the caller's job.
 */
@Component({
  selector: "okkly-stepper",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, OkklyIcon],
  host: {
    class: "okkly-component okkly-stepper",
    "[class]": "modifiers()",
    role: "list",
  },
  templateUrl: "./Stepper.html",
})
export class OkklyStepper {
  /**
   * Ordered steps in the flow.
   *
   * @default undefined
   */
  readonly steps = input.required<StepperStep[]>();
  /**
   * Zero-based index of the active step.
   *
   * @default undefined
   */
  readonly activeStep = input.required<number>();
  /**
   * Orientation.
   *
   * @default "horizontal"
   */
  readonly orientation = input<StepperOrientation>("horizontal");
  /**
   * When true, labels sit below the step dots in horizontal mode.
   *
   * @default true
   */
  readonly alternativeLabel = input(true, { transform: booleanAttribute });
  /**
   * Color.
   *
   * @default "primary"
   */
  readonly color = input<StepperColor>("primary");

  protected readonly iconCheck = iconCheck;

  protected readonly modifiers = computed(() =>
    [
      `okkly-stepper--${this.orientation()}`,
      this.alternativeLabel() &&
        this.orientation() === "horizontal" &&
        "okkly-stepper--alternative-label",
      this.color() !== "primary" && `okkly-stepper--color-${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  /** Whether a step's track+content layout stacks (vertical, or horizontal with alternativeLabel) rather than running inline. */
  protected readonly stacked = computed(
    () => this.orientation() === "vertical" || this.alternativeLabel(),
  );

  protected stepState(index: number): StepState {
    return getStepState(index, this.activeStep());
  }

  protected isLast(index: number): boolean {
    return index === this.steps().length - 1;
  }

  protected connectorActive(index: number): boolean {
    return index < this.activeStep();
  }
}
