"use client";

import { forwardRef, type KeyboardEvent, type MouseEvent } from "react";
import "@okkly/design-system/components/Chip/Chip.scss";
import type { ChipProps } from "./Chip.types";

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  {
    label,
    variant = "glass",
    size = "medium",
    selected = false,
    dot = false,
    icon,
    removable = false,
    disabled = false,
    onClick,
    onRemove,
    removeLabel = "Remove",
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isInteractive = !!onClick && !disabled;

  const classes = [
    "okkly-component",
    "okkly-chip",
    variant !== "glass" && `okkly-chip--${variant}`,
    size !== "medium" && `okkly-chip--${size}`,
    selected && "okkly-chip--selected",
    isInteractive && "okkly-chip--interactive",
    disabled && "okkly-chip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!isInteractive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(event);
    }
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) return;
    onRemove?.(event);
  };

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick || onKeyDown ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {!icon && dot && <span className="okkly-chip__dot" aria-hidden="true" />}
      {icon && (
        <span className="okkly-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="okkly-chip__label okkly-truncation-ellipsis">{label}</span>
      {removable && (
        <button
          type="button"
          className="okkly-chip__remove"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={removeLabel}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
});
