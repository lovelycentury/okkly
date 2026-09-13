"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "@okkly/design-system/components/ButtonGroup/ButtonGroup.scss";
import type { ButtonGroupProps } from "./ButtonGroup.types";

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function ButtonGroup({
  action,
  variant = "primary",
  menu = [],
  color = "primary",
  disabled = false,
  menuAriaLabel = "Open menu",
  className,
}: ButtonGroupProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleChevronKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const closeAndFocusChevron = () => {
    setOpen(false);
    chevronRef.current?.focus();
  };

  const classes = [
    "okkly-component",
    "okkly-button-group",
    variant === "secondary" && "okkly-button-group--secondary",
    color !== "primary" && `okkly-button-group--color-${color}`,
    disabled && "okkly-button-group--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={classes}>
      <button
        type="button"
        className="okkly-button-group__segment"
        disabled={disabled || action.disabled}
        onClick={action.onClick}
      >
        {action.icon && (
          <span className="okkly-button-group__icon" aria-hidden="true">
            {action.icon}
          </span>
        )}
        {action.label}
      </button>
      {menu.length > 0 && (
        <button
          ref={chevronRef}
          type="button"
          className="okkly-button-group__segment okkly-button-group__chevron"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={menuAriaLabel}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleChevronKeyDown}
        >
          <span className="okkly-button-group__chevron-icon" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </button>
      )}
      {open && (
        <div className="okkly-button-group__menu" role="menu">
          {menu.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              className="okkly-button-group__menu-item"
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                closeAndFocusChevron();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
