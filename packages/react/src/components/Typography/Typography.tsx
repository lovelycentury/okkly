"use client";

import { forwardRef, type ElementType, type Ref } from "react";
import "@okkly/design-system/components/Typography/Typography.scss";
import type {
  TypographyVariant,
  TypographyVariantElement,
  TypographyProps,
} from "./Typography.types";

/**
 * The editorial type scale, and the element each step renders as by default.
 * This map is the single source of truth: `TypographyVariant` is inferred from
 * its keys, so adding a step here (and its `&--<key>` block in Typography.scss)
 * is the whole change — no union to keep in sync.
 *
 * Mirrors TYPE_TOKENS in packages/figma-plugin/src/tokens/typography.ts.
 */
export const TYPOGRAPHY_VARIANTS = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h2",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-md": "span",
  "label-sm": "span",
  caption: "span",
  overline: "span",
  "mono-sm": "code",
} as const satisfies Record<string, ElementType>;

const DEFAULT_VARIANT = "body-md" satisfies TypographyVariant;

function TypographyImpl<E extends ElementType = TypographyVariantElement<typeof DEFAULT_VARIANT>>(
  {
    as,
    variant = DEFAULT_VARIANT,
    color = "inherit",
    align = "inherit",
    gutterBottom = false,
    noWrap = false,
    className,
    ...rest
  }: TypographyProps<E>,
  ref: Ref<Element>,
) {
  const Component = (as ?? TYPOGRAPHY_VARIANTS[variant]) as ElementType;

  const classes = [
    "okkly-component",
    "okkly-typography",
    variant !== DEFAULT_VARIANT && `okkly-typography--${variant}`,
    color !== "inherit" && `okkly-typography--color-${color}`,
    align !== "inherit" && `okkly-typography--align-${align}`,
    gutterBottom && "okkly-typography--gutter-bottom",
    noWrap && "okkly-typography--no-wrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Component {...rest} ref={ref} className={classes} />;
}

/**
 * Text primitive for the whole scale, from `display-2xl` down to `mono-sm`.
 *
 * `forwardRef` erases generics, so the cast restores the polymorphic signature:
 * without it every call site would collapse to the default element's props.
 */
export const Typography = forwardRef(TypographyImpl) as <E extends ElementType = "p">(
  props: TypographyProps<E> & { ref?: Ref<Element> },
) => ReturnType<typeof TypographyImpl>;
