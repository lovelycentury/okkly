"use client";

import { useState } from "react";
import "@okkly/design-system/components/SegmentedToggle/SegmentedToggle.scss";
import type { SegmentedToggleProps } from "./SegmentedToggle.types";

function normalizeDefault(exclusive: boolean, defaultValue?: string | string[]): string | string[] {
  if (defaultValue !== undefined) return defaultValue;
  return exclusive ? "" : [];
}

function isSegmentActive(
  current: string | string[],
  segmentValue: string,
  exclusive: boolean,
): boolean {
  if (exclusive) return current === segmentValue;
  return Array.isArray(current) && current.includes(segmentValue);
}

export function SegmentedToggle({
  items,
  value,
  defaultValue,
  onChange,
  exclusive = true,
  color = "primary",
  disabled = false,
  className,
}: SegmentedToggleProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(() =>
    normalizeDefault(exclusive, defaultValue),
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const commit = (next: string | string[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleSegmentClick = (segmentValue: string) => {
    if (exclusive) {
      commit(segmentValue);
      return;
    }

    const selected = Array.isArray(currentValue) ? [...currentValue] : [];
    const index = selected.indexOf(segmentValue);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(segmentValue);
    commit(selected);
  };

  const classes = [
    "okkly-component",
    "okkly-segmented-toggle",
    color !== "primary" && `okkly-segmented-toggle--color-${color}`,
    disabled && "okkly-segmented-toggle--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group">
      {items.map((item) => {
        const active = isSegmentActive(currentValue, item.value, exclusive);
        return (
          <button
            key={item.value}
            type="button"
            className={[
              "okkly-segmented-toggle__segment",
              active && "okkly-segmented-toggle__segment--active",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled || item.disabled}
            aria-pressed={active}
            onClick={() => handleSegmentClick(item.value)}
          >
            {item.icon && (
              <span className="okkly-segmented-toggle__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
