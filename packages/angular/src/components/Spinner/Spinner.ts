import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
} from "@angular/core";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

const SIZE_RADIUS: Record<SpinnerSize, number> = {
  small: 10,
  medium: 14,
  large: 20,
};

/**
 * Inputs mirror `@okkly/react`'s `<Spinner>` name-for-name — `size`, `color`,
 * `thickness` — which follows MUI's CircularProgress API in spirit. Angular
 * Material's `mat-spinner` is the precedent for the element selector.
 *
 * Deliberate gaps: always indeterminate (no `mode`/`value` — that is
 * `OkklyProgress`'s job), and the host's `aria-label` is an input aliased to
 * the attribute, so `<okkly-spinner aria-label="Loading projects">` replaces
 * the default "Loading" instead of competing with it.
 */
@Component({
  selector: "okkly-spinner",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-spinner",
    "[class]": "modifiers()",
    role: "status",
    "[attr.aria-label]": "ariaLabel()",
  },
  template: `
    <svg class="okkly-spinner__svg" [attr.viewBox]="geometry().viewBox">
      <circle
        class="okkly-spinner__track"
        [attr.cx]="geometry().radius"
        [attr.cy]="geometry().radius"
        [attr.r]="geometry().normalizedRadius"
        fill="none"
        [attr.stroke-width]="geometry().stroke"
      />
      <circle
        class="okkly-spinner__arc"
        [attr.cx]="geometry().radius"
        [attr.cy]="geometry().radius"
        [attr.r]="geometry().normalizedRadius"
        fill="none"
        [attr.stroke-width]="geometry().stroke"
        [attr.stroke-dasharray]="geometry().dashArray"
        [attr.stroke-dashoffset]="geometry().dashOffset"
      />
    </svg>
  `,
})
export class OkklySpinner {
  /**
   * Diameter preset.
   *
   * @default "medium"
   */
  readonly size = input<SpinnerSize>("medium");
  /**
   * Accent or feedback tone.
   *
   * @default "primary"
   */
  readonly color = input<SpinnerColor>("primary");
  /**
   * Ring stroke width in pixels at the preset's own size. Overrides the preset.
   *
   * @default undefined
   */
  readonly thickness = input<number | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)),
  });
  /**
   * Accessible name of the status region. Say what is loading.
   *
   * @default "Loading"
   */
  readonly ariaLabel = input("Loading", { alias: "aria-label" });

  protected readonly geometry = computed(() => {
    const radius = SIZE_RADIUS[this.size()];
    const stroke =
      this.thickness() ?? (this.size() === "small" ? 2.5 : this.size() === "large" ? 4 : 3);
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    return {
      radius,
      stroke,
      normalizedRadius,
      viewBox: `0 0 ${radius * 2} ${radius * 2}`,
      dashArray: `${circumference * 0.25} ${circumference}`,
      dashOffset: circumference * 0.75,
    };
  });

  protected readonly modifiers = computed(() =>
    [
      this.size() !== "medium" && `okkly-spinner--${this.size()}`,
      this.color() !== "primary" && `okkly-spinner--${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
