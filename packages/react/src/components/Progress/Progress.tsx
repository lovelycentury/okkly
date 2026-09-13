"use client";

import { forwardRef } from "react";
import "@okkly/design-system/components/Progress/Progress.scss";
import type { ProgressProps } from "./Progress.types";

function clampValue(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    variant = "determinate",
    type = "linear",
    color = "primary",
    size = "medium",
    showLabel = false,
    className,
    ...rest
  },
  forwardedRef,
) {
  const clamped = clampValue(value);
  const isIndeterminate = variant === "indeterminate";

  const classes = [
    "okkly-component",
    "okkly-progress",
    `okkly-progress--${type}`,
    isIndeterminate && "okkly-progress--indeterminate",
    size !== "medium" && `okkly-progress--${size}`,
    color !== "primary" && `okkly-progress--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (type === "circular") {
    const diameter = size === "small" ? 40 : size === "large" ? 72 : 56;
    const stroke = size === "small" ? 4 : size === "large" ? 6 : 5;
    const radius = diameter / 2 - stroke / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = isIndeterminate
      ? circumference * 0.75
      : circumference - (clamped / 100) * circumference;

    return (
      <div
        ref={forwardedRef}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={classes}
        {...rest}
      >
        <div className="okkly-progress__circular">
          <svg className="okkly-progress__svg" viewBox={`0 0 ${diameter} ${diameter}`}>
            <circle
              className="okkly-progress__circle-track"
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
            />
            <circle
              className="okkly-progress__circle-bar"
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          {showLabel && !isIndeterminate && (
            <span className="okkly-progress__label">{Math.round(clamped)}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={forwardedRef}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={classes}
      {...rest}
    >
      <div className="okkly-progress__track">
        {!isIndeterminate && (
          <div className="okkly-progress__bar" style={{ width: `${clamped}%` }} />
        )}
        {isIndeterminate && <div className="okkly-progress__bar" />}
      </div>
    </div>
  );
});
