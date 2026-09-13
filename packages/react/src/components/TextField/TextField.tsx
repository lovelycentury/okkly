"use client";

import { forwardRef, useId } from "react";
import "@okkly/design-system/components/TextField/TextField.scss";
import { Field, getFieldIds } from "../Field/Field";
import type { TextFieldProps } from "./TextField.types";

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    disabled = false,
    required = false,
    startAdornment,
    endAdornment,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { helperId } = getFieldIds(inputId, Boolean(label), Boolean(helperText));

  return (
    <Field
      block="okkly-text-field"
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      required={required}
      size={size}
      color={color}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      className={className}
    >
      <input
        ref={ref}
        id={inputId}
        className="okkly-text-field__input"
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={[helperId, ariaDescribedBy].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
    </Field>
  );
});
