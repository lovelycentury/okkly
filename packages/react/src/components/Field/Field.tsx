"use client";

import type { FieldProps } from "./Field.types";

/**
 * The shared shell behind TextField, Select and Autocomplete: label row,
 * bordered control box with optional adornments, and helper text.
 *
 * Internal on purpose — it is not exported from the package. It exists to stop
 * the three components from re-implementing (and slowly disagreeing about)
 * focus rings, error colours and label spacing, not to become a public
 * layout primitive. Its styling counterpart is the `field.shell` SCSS mixin.
 */
export function Field({
  block,
  id,
  label,
  hideLabel = false,
  required = false,
  size = "medium",
  color = "primary",
  error = false,
  helperText,
  disabled = false,
  fullWidth = false,
  startAdornment,
  endAdornment,
  htmlFor,
  controlProps,
  className,
  children,
}: FieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const labelId = label ? `${id}-label` : undefined;

  const classes = [
    "okkly-component",
    block,
    color !== "primary" && `${block}--color-${color}`,
    size !== "medium" && `${block}--${size}`,
    error && `${block}--error`,
    disabled && `${block}--disabled`,
    fullWidth && `${block}--full-width`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const { className: controlClassName, ...restControlProps } = controlProps ?? {};

  return (
    <div className={classes}>
      {label && (
        <label
          id={labelId}
          htmlFor={htmlFor === false ? undefined : (htmlFor ?? id)}
          className={`${block}__label${hideLabel ? ` ${block}__label--hidden` : ""}`}
        >
          {label}
          {required && (
            <span className={`${block}__required`} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={[`${block}__control`, controlClassName].filter(Boolean).join(" ")}
        {...restControlProps}
      >
        {startAdornment && <span className={`${block}__adornment`}>{startAdornment}</span>}
        {children}
        {endAdornment && <span className={`${block}__adornment`}>{endAdornment}</span>}
      </div>

      {helperText && (
        <span id={helperId} className={`${block}__helper`}>
          {helperText}
        </span>
      )}
    </div>
  );
}

/** Ids `Field` derives from the control id, so callers can wire aria attributes to them. */
export function getFieldIds(id: string, hasLabel: boolean, hasHelperText: boolean) {
  return {
    labelId: hasLabel ? `${id}-label` : undefined,
    helperId: hasHelperText ? `${id}-helper` : undefined,
  };
}
