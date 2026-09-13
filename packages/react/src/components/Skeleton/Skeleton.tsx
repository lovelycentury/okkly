"use client";

import { forwardRef, type CSSProperties } from "react";
import "@okkly/design-system/components/Skeleton/Skeleton.scss";
import type { SkeletonProps } from "./Skeleton.types";

function toCssLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value / 16}rem` : value;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = "text", width, height, animation = "pulse", className, style, ...rest },
  forwardedRef,
) {
  const classes = [
    "okkly-component",
    "okkly-skeleton",
    variant !== "text" && `okkly-skeleton--${variant}`,
    animation === "pulse" && "okkly-skeleton--pulse",
    animation === "wave" && "okkly-skeleton--wave",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cssVars: CSSProperties = {
    ...(width !== undefined && { "--okkly-skeleton-width": toCssLength(width) }),
    ...(height !== undefined && { "--okkly-skeleton-height": toCssLength(height) }),
    ...style,
  };

  return (
    <span
      ref={forwardedRef}
      aria-hidden="true"
      className={classes}
      style={Object.keys(cssVars).length > 0 ? cssVars : style}
      {...rest}
    />
  );
});
