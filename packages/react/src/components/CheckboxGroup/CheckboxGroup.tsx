"use client";

import { useId, useState } from "react";
import "@okkly/design-system/components/CheckboxGroup/CheckboxGroup.scss";

import { CheckboxGroupContext } from "./CheckboxGroupContext";
import type { CheckboxGroupProps } from "./CheckboxGroup.types";

/**
 * Groups `Checkbox` children via context — nest them directly rather than
 * passing an options array, mirroring RadioGroup's composition pattern
 * (multi-select instead of single). Deliberate gaps vs a hypothetical MUI
 * FormGroup: owns `value`/`onChange` as `string[]`, propagates size/color.
 */
export function CheckboxGroup({
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
}: CheckboxGroupProps) {
  const generatedName = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const currentValue = value ?? internalValue;

  const handleToggle = (option: string, checked: boolean) => {
    const next = checked
      ? currentValue.includes(option)
        ? currentValue
        : [...currentValue, option]
      : currentValue.filter((item) => item !== option);

    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const classes = ["okkly-component", "okkly-checkbox-group", className].filter(Boolean).join(" ");

  return (
    <CheckboxGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value: currentValue,
        onToggle: handleToggle,
        disabled,
        size,
        color,
      }}
    >
      <div
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        className={classes}
      >
        {label && <span className="okkly-checkbox-group__label">{label}</span>}
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}
