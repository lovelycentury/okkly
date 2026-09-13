"use client";

import { useId, useState } from "react";
import "@okkly/design-system/components/RadioGroup/RadioGroup.scss";

import { RadioGroupContext } from "./RadioGroupContext";
import type { RadioGroupProps } from "./RadioGroup.types";

/**
 * Groups `Radio` children via context — nest them directly rather than
 * passing an options array, matching MUI's RadioGroup composition pattern
 * (https://mui.com/material-ui/react-radio-button/#radio-group).
 */
export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = "medium",
  color = "primary",
  label,
  children,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleSelect = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const classes = ["okkly-component", "okkly-radio-group", className].filter(Boolean).join(" ");

  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value: currentValue,
        onSelect: handleSelect,
        disabled,
        size,
        color,
      }}
    >
      <div
        role="radiogroup"
        aria-label={typeof label === "string" ? label : undefined}
        className={classes}
      >
        {label && <span className="okkly-radio-group__label">{label}</span>}
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
