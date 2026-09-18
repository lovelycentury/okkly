import type { Component } from "vue";
import type { TYPOGRAPHY_VARIANTS } from "./Typography.vue";

/** `"display-2xl" | "h1" | "body-md" | …` — inferred from `TYPOGRAPHY_VARIANTS`. */
export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS;

export type TypographyColor =
  "inherit" | "primary" | "secondary" | "muted" | "accent" | "success" | "warning" | "danger";

export type TypographyAlign = "inherit" | "left" | "center" | "right" | "justify";

/**
 * Props follow MUI's Typography API (https://mui.com/material-ui/api/typography/),
 * mirroring `@okkly/react`'s `<Typography>` name-for-name: `variant`/`color`/
 * `align`/`gutterBottom`/`noWrap`/`as` all match. The scale is this design
 * system's editorial one (`display-*`, `label-*`, `mono-sm`) rather than
 * MUI's `subtitle`/`button` steps, and there is no `variantMapping` prop —
 * the mapping lives in `TYPOGRAPHY_VARIANTS` (exported from `Typography.vue`)
 * and `as` overrides it per call site.
 *
 * Vue-forced differences: `children` becomes the default slot. `as` takes a
 * tag name or a component, the same shape as `Box`'s own `as`, rather than
 * React's per-element prop inference (`as="a"` accepting `href` and nothing
 * else) — Vue's type system has no equivalent of `ComponentPropsWithoutRef<E>`
 * for a runtime-resolved `:is`, so whatever attributes the chosen element
 * takes simply fall through unchecked.
 */
export interface TypographyProps {
  /**
   * Step in the type scale. Sets size, line height, weight and tracking, and
   * picks the default element.
   *
   * @default "body-md"
   */
  variant?: TypographyVariant;
  /**
   * Text colour. `"inherit"` keeps whatever the surface already sets.
   *
   * @default "inherit"
   */
  color?: TypographyColor;
  /**
   * Horizontal alignment.
   *
   * @default "inherit"
   */
  align?: TypographyAlign;
  /**
   * Adds a bottom margin proportional to the step's own font size.
   *
   * @default false
   */
  gutterBottom?: boolean;
  /**
   * Clips overflowing text to one line with an ellipsis.
   *
   * @default false
   */
  noWrap?: boolean;
  /**
   * Element to render, overriding the variant's default tag.
   *
   * @default the variant's default tag — see `TYPOGRAPHY_VARIANTS`
   */
  as?: string | Component;
}
