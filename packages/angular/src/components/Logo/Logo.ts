import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

export type LogoLayout = "compact" | "horizontal" | "stacked";
export type LogoTone = "multi" | "mint" | "indigo" | "dante" | "violet" | "ember";
export type LogoVariant = "filled" | "outlined" | "pure";

/**
 * The mark is authored at 72×72 in Figma; every number below is in that space,
 * so the geometry can be compared against the source export line for line.
 */
const VB = 72;
const STROKE = 3.375;

/** Ring inset by half a stroke so the outline sits flush inside the box. */
const RING_R = VB / 2 - STROKE / 2;

/**
 * The glyph's own bounds, stroke included, padded to a square on its narrow
 * axis: the ink spans x 20.8125–52.875 and y 20.8125–54.5625, which half a
 * stroke either side grows to 35.4375 × 37.125.
 */
const GLYPH_BOX = { x: 18.28125, y: 19.125, size: 37.125 };

/**
 * Cropping to the glyph magnifies everything by VB/size, so pre-shrink the
 * stroke by the same factor and `pure` carries the weight the others do.
 */
const PURE_STROKE = (STROKE * GLYPH_BOX.size) / VB;

let nextId = 0;

/**
 * The brand lockup — the disc mark in three treatments, with an optional
 * wordmark. Inputs mirror `@okkly/react`'s `<Logo>` name-for-name — `layout`,
 * `variant`, `tone`, `label`, `showLabel`, `size`. Neither MUI nor Angular
 * Material has one.
 *
 * Deliberate gaps: none beyond the element — the host is `okkly-logo` where
 * React renders a `<div>`; the stylesheet makes it `inline-flex` either way.
 */
@Component({
  selector: "okkly-logo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-logo",
    "[class]": "modifiers()",
    "[style.--okkly-logo-emblem-size]": "emblemSize()",
  },
  templateUrl: "./Logo.html",
})
export class OkklyLogo {
  /**
   * Lockup arrangement.
   *
   * @default "horizontal"
   */
  readonly layout = input<LogoLayout>("horizontal");
  /**
   * Container treatment: filled disc, outlined ring, or the bare glyph.
   *
   * @default "filled"
   */
  readonly variant = input<LogoVariant>("filled");
  /**
   * Emblem colourway. `multi` is the brand gradient.
   *
   * @default "multi"
   */
  readonly tone = input<LogoTone>("multi");
  /**
   * Wordmark text.
   *
   * @default "okkly"
   */
  readonly label = input("okkly");
  /**
   * Whether the wordmark shows.
   *
   * @default true
   */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /**
   * Overrides the emblem size — a number is pixels, a string any CSS length. Unset: compact 24px, others 48px.
   *
   * @default undefined
   */
  readonly size = input<number | string>();

  protected readonly gradientId = `okkly-logo-gradient-${nextId++}`;
  protected readonly vb = VB;
  protected readonly stroke = STROKE;
  protected readonly ringRadius = RING_R;

  protected readonly isMulti = computed(() => this.tone() === "multi");
  // "multi" keeps the signature mint→dante sweep; every other tone is flat, so
  // it paints straight from the tone variable and needs no gradient at all.
  protected readonly ink = computed(() =>
    this.isMulti() ? `url(#${this.gradientId})` : "var(--okkly-logo-tone)",
  );
  protected readonly viewBox = computed(() =>
    this.variant() === "pure"
      ? `${GLYPH_BOX.x} ${GLYPH_BOX.y} ${GLYPH_BOX.size} ${GLYPH_BOX.size}`
      : `0 0 ${VB} ${VB}`,
  );
  protected readonly glyphStroke = computed(() =>
    this.variant() === "filled" ? "var(--okkly-logo-ink)" : this.ink(),
  );
  protected readonly glyphStrokeWidth = computed(() =>
    this.variant() === "pure" ? PURE_STROKE : STROKE,
  );

  protected readonly emblemSize = computed(() => {
    const size = this.size();
    if (size === undefined || size === "" || size === 0) return null;
    return typeof size === "number" ? `${size}px` : size;
  });

  protected readonly modifiers = computed(() =>
    [
      this.layout() !== "horizontal" && `okkly-logo--${this.layout()}`,
      this.variant() !== "filled" && `okkly-logo--${this.variant()}`,
      !this.isMulti() && `okkly-logo--tone-${this.tone()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
