"use client";

import { forwardRef } from "react";
import "@okkly/design-system/components/Spinner/Spinner.scss";
import type { SpinnerSize, SpinnerProps } from "./Spinner.types";

const SIZE_RADIUS: Record<SpinnerSize, number> = {
  small: 10,
  medium: 14,
  large: 20,
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "medium", color = "primary", thickness, className, ...rest },
  forwardedRef,
) {
  const radius = SIZE_RADIUS[size];
  const stroke = thickness ?? (size === "small" ? 2.5 : size === "large" ? 4 : 3);
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const dashOffset = circumference * 0.75;

  const classes = [
    "okkly-component",
    "okkly-spinner",
    size !== "medium" && `okkly-spinner--${size}`,
    color !== "primary" && `okkly-spinner--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={forwardedRef} role="status" aria-label="Loading" className={classes} {...rest}>
      <svg className="okkly-spinner__svg" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          className="okkly-spinner__track"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="okkly-spinner__arc"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.25} ${circumference}`}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </span>
  );
});
