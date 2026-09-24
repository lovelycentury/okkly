import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from "@angular/core";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
export type SkeletonAnimation = "pulse" | "wave" | false;

/** A numeric attribute (`width="200"`) reads as the pixels a binding (`[width]="200"`) passes. */
function numeric(value: number | string | undefined): number | string | undefined {
  return typeof value === "string" && /^\d*\.?\d+$/.test(value) ? Number(value) : value;
}

/** Pixels become rem against the 16px root; strings pass through as CSS. */
function toCssLength(value: number | string | undefined): string | null {
  if (value === undefined) return null;
  return typeof value === "number" ? `${value / 16}rem` : value;
}

/**
 * Inputs mirror `@okkly/react`'s `<Skeleton>` name-for-name — `variant`,
 * `width`, `height`, `animation` — which follows MUI's Skeleton API
 * (https://mui.com/material-ui/api/skeleton/). Angular Material has no
 * skeleton.
 *
 * Deliberate gaps: none beyond React's own — the host is the placeholder
 * itself, always `aria-hidden`; announce the wait once on the container with
 * `aria-busy="true"`. As with `okklyBox`, a numeric attribute (`width="200"`)
 * reads as pixels, and `animation="false"` as `false`.
 */
@Component({
  selector: "okkly-skeleton",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-skeleton",
    "[class]": "modifiers()",
    "aria-hidden": "true",
    "[style.--okkly-skeleton-width]": "cssWidth()",
    "[style.--okkly-skeleton-height]": "cssHeight()",
  },
  template: "",
})
export class OkklySkeleton {
  /**
   * Placeholder shape.
   *
   * @default "text"
   */
  readonly variant = input<SkeletonVariant>("text");
  /**
   * Explicit width — a number is pixels, a string any CSS length.
   *
   * @default undefined
   */
  readonly width = input<number | string | undefined, number | string | undefined>(undefined, {
    transform: numeric,
  });
  /**
   * Explicit height — a number is pixels, a string any CSS length.
   *
   * @default undefined
   */
  readonly height = input<number | string | undefined, number | string | undefined>(undefined, {
    transform: numeric,
  });
  /**
   * Shimmer effect — `pulse`, `wave`, or `false` for none.
   *
   * @default "pulse"
   */
  readonly animation = input<SkeletonAnimation, SkeletonAnimation | "false">("pulse", {
    transform: (value) => (value === "false" ? false : value),
  });

  protected readonly cssWidth = computed(() => toCssLength(this.width()));
  protected readonly cssHeight = computed(() => toCssLength(this.height()));

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "text" && `okkly-skeleton--${this.variant()}`,
      this.animation() && `okkly-skeleton--${this.animation()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
