import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from "@angular/core";

export type ProgressVariant = "determinate" | "indeterminate";
export type ProgressType = "linear" | "circular";
export type ProgressSize = "small" | "medium" | "large";
export type ProgressColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Inputs mirror `@okkly/react`'s `<Progress>` name-for-name — `value`
 * (0–100), `variant`, `type`, `color`, `size`, `showLabel` — which follows
 * MUI's LinearProgress / CircularProgress APIs.
 *
 * Deliberate gaps: Angular Material splits this into `mat-progress-bar` and
 * `mat-progress-spinner` and calls the variant `mode`; this design keeps one
 * element with a `type` switch and React's `variant` name, and has no
 * `buffer`/`query` modes. The host is the `role="progressbar"` element and
 * carries no name of its own — pass `aria-label` or `aria-labelledby`.
 */
@Component({
  selector: "okkly-progress",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-progress",
    "[class]": "modifiers()",
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "[attr.aria-valuenow]": "isIndeterminate() ? null : clamped()",
  },
  templateUrl: "./Progress.html",
})
export class OkklyProgress {
  /**
   * Progress value, 0–100. Ignored when `variant="indeterminate"`.
   *
   * @default 0
   */
  readonly value = input(0, { transform: (value: unknown) => numberAttribute(value, 0) });
  /**
   * Known vs unknown duration.
   *
   * @default "determinate"
   */
  readonly variant = input<ProgressVariant>("determinate");
  /**
   * Linear bar or circular ring.
   *
   * @default "linear"
   */
  readonly type = input<ProgressType>("linear");
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   */
  readonly color = input<ProgressColor>("primary");
  /**
   * Track / ring thickness preset.
   *
   * @default "medium"
   */
  readonly size = input<ProgressSize>("medium");
  /**
   * Show the percentage inside a determinate circular ring.
   *
   * @default false
   */
  readonly showLabel = input(false, { transform: booleanAttribute });

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly isIndeterminate = computed(() => this.variant() === "indeterminate");
  protected readonly percentLabel = computed(() => Math.round(this.clamped()));

  protected readonly ring = computed(() => {
    const size = this.size();
    const diameter = size === "small" ? 40 : size === "large" ? 72 : 56;
    const stroke = size === "small" ? 4 : size === "large" ? 6 : 5;
    const radius = diameter / 2 - stroke / 2;
    const circumference = radius * 2 * Math.PI;
    return {
      center: diameter / 2,
      radius,
      stroke,
      circumference,
      viewBox: `0 0 ${diameter} ${diameter}`,
      offset: this.isIndeterminate()
        ? circumference * 0.75
        : circumference - (this.clamped() / 100) * circumference,
    };
  });

  protected readonly modifiers = computed(() =>
    [
      `okkly-progress--${this.type()}`,
      this.isIndeterminate() && "okkly-progress--indeterminate",
      this.size() !== "medium" && `okkly-progress--${this.size()}`,
      this.color() !== "primary" && `okkly-progress--${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
