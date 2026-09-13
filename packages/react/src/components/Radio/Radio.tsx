"use client";

import { forwardRef, useContext, useId } from "react";
import "@okkly/design-system/components/Radio/Radio.scss";
import { RadioGroupContext } from "../RadioGroup/RadioGroupContext";
import type { RadioProps } from "./Radio.types";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { checked, value, name, size, color, disabled = false, label, className, id, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isGrouped = group !== null;
  const finalName = name ?? group?.name;
  const finalChecked = isGrouped ? group.value === value : checked;
  const finalDisabled = disabled || (group?.disabled ?? false);
  const finalSize = size ?? group?.size ?? "medium";
  const finalColor = color ?? group?.color ?? "primary";

  const classes = [
    "okkly-component",
    "okkly-radio",
    finalColor !== "primary" && `okkly-radio--color-${finalColor}`,
    finalSize !== "medium" && `okkly-radio--${finalSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okkly-radio__control">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="okkly-radio__input"
          name={finalName}
          value={value}
          checked={finalChecked}
          disabled={finalDisabled}
          onChange={(event) => {
            if (isGrouped && value !== undefined) group.onSelect(value);
            onChange?.(event, event.target.checked);
          }}
          {...rest}
        />
        <span className="okkly-radio__circle" aria-hidden="true" />
      </span>
      {label && <span className="okkly-radio__label">{label}</span>}
    </label>
  );
});
