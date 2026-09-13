"use client";

import { forwardRef, useId, useRef } from "react";
import "@okkly/design-system/components/Switch/Switch.scss";
import type { SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked,
    size = "medium",
    color = "primary",
    disabled = false,
    label,
    className,
    id,
    onChange,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const setRef = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const classes = [
    "okkly-component",
    "okkly-switch",
    color !== "primary" && `okkly-switch--color-${color}`,
    size !== "medium" && `okkly-switch--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okkly-switch__control">
        <input
          ref={setRef}
          id={inputId}
          type="checkbox"
          role="switch"
          className="okkly-switch__input"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(event) => onChange?.(event, event.target.checked)}
          {...rest}
        />
        <span className="okkly-switch__track" aria-hidden="true">
          <span className="okkly-switch__thumb" />
        </span>
      </span>
      {label && <span className="okkly-switch__label">{label}</span>}
    </label>
  );
});
