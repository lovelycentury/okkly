import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { TYPOGRAPHY_VARIANTS } from "./Typography";

/** `"display-2xl" | "h1" | "body-md" | …` — inferred from {@link TYPOGRAPHY_VARIANTS}. */
export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS;

/** The tag a variant falls back to when `as` is omitted. */
export type TypographyVariantElement<V extends TypographyVariant> = (typeof TYPOGRAPHY_VARIANTS)[V];

export type TypographyColor =
  "inherit" | "primary" | "secondary" | "muted" | "accent" | "success" | "warning" | "danger";

export type TypographyAlign = "inherit" | "left" | "center" | "right" | "justify";

/**
 * Props follow MUI's Typography API (https://mui.com/material-ui/api/typography/):
 * `variant`/`align`/`color`/`gutterBottom`/`noWrap` match name-for-name. Deliberate gaps:
 * the polymorphic prop is `as`, not MUI's `component`; the scale is this design system's
 * editorial one (`display-*`, `label-*`, `mono-sm`) rather than MUI's `subtitle`/`button`
 * steps; and there is no `variantMapping` prop — the mapping lives in
 * {@link TYPOGRAPHY_VARIANTS} and `as` overrides it per call site.
 */
export type TypographyOwnProps = {
  /**
   * Step in the type scale. Sets size, line height, weight and tracking, and
   * picks the default element.
   *
   * @default "body-md"
   * @type {TypographyVariant}
   */
  variant?: TypographyVariant;
  /**
   * Text colour. `"inherit"` keeps whatever the surface already sets.
   *
   * @default "inherit"
   * @type {TypographyColor}
   */
  color?: TypographyColor;
  /**
   * Horizontal alignment.
   *
   * @default "inherit"
   * @type {TypographyAlign}
   */
  align?: TypographyAlign;
  /**
   * Adds a bottom margin proportional to the step's own font size.
   *
   * @default false
   * @type {boolean}
   */
  gutterBottom?: boolean;
  /**
   * Clips overflowing text to one line with an ellipsis.
   *
   * @default false
   * @type {boolean}
   */
  noWrap?: boolean;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
};

/**
 * `as` swaps the rendered element and re-infers the props with it: `as="a"`
 * accepts `href`, `as="label"` accepts `htmlFor`, and the `ref` narrows to the
 * matching element type. Omit it and the variant's default tag is used.
 */
export type TypographyProps<E extends ElementType = ElementType> = TypographyOwnProps & {
  /**
   * Element to render.
   *
   * @default the variant's default tag — see TYPOGRAPHY_VARIANTS
   * @type {ElementType}
   */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof TypographyOwnProps | "as">;
