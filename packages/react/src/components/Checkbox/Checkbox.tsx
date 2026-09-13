"use client";

import { forwardRef, useContext, useEffect, useId, useRef } from "react";
import "@okkly/design-system/components/Checkbox/Checkbox.scss";
import { CheckboxGroupContext } from "../CheckboxGroup/CheckboxGroupContext";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    value,
    name,
    indeterminate = false,
    size,
    color,
    disabled = false,
    label,
    className,
    id,
    onChange,
    ...rest
  },
  forwardedRef,
) {
  const group = useContext(CheckboxGroupContext);
  const localRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isGrouped = group !== null;
  const finalName = name ?? group?.name;
  const finalChecked = isGrouped ? value !== undefined && group.value.includes(value) : checked;
  const finalDisabled = disabled || (group?.disabled ?? false);
  const finalSize = size ?? group?.size ?? "medium";
  const finalColor = color ?? group?.color ?? "primary";

  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRef = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const classes = [
    "okkly-component",
    "okkly-checkbox",
    finalColor !== "primary" && `okkly-checkbox--color-${finalColor}`,
    finalSize !== "medium" && `okkly-checkbox--${finalSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okkly-checkbox__control">
        <input
          ref={setRef}
          id={inputId}
          type="checkbox"
          className="okkly-checkbox__input"
          name={finalName}
          value={value}
          checked={finalChecked}
          disabled={finalDisabled}
          onChange={(event) => {
            if (isGrouped && value !== undefined) group.onToggle(value, event.target.checked);
            onChange?.(event, event.target.checked);
          }}
          {...rest}
        />
        <span className="okkly-checkbox__box" aria-hidden="true">
          <svg
            className="okkly-checkbox__check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <svg
            className="okkly-checkbox__minus"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        </span>
      </span>
      {label && <span className="okkly-checkbox__label">{label}</span>}
    </label>
  );
});
