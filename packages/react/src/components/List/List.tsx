"use client";

import { forwardRef, type MouseEvent } from "react";
import "@okkly/design-system/components/List/List.scss";
import type { ListProps, ListItemProps, ListItemTextProps, ListItemIconProps } from "./List.types";

export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { dense = false, disablePadding = false, subheader, children, className, ...rest },
  ref,
) {
  const classes = [
    "okkly-component",
    "okkly-list",
    dense && "okkly-list--dense",
    disablePadding && "okkly-list--disable-padding",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul ref={ref} className={classes} {...rest}>
      {subheader && <li className="okkly-list__subheader">{subheader}</li>}
      {children}
    </ul>
  );
});

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  {
    children,
    selected = false,
    disabled = false,
    button = false,
    startIcon,
    secondaryAction,
    dense = false,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const isInteractive = button || !!onClick;

  const denseClass = dense ? "okkly-list-item--dense" : "";
  const selectedClass = selected ? "okkly-list-item--selected" : "";
  const disabledClass = disabled ? "okkly-list-item--disabled" : "";

  if (isInteractive) {
    const containerClasses = [
      "okkly-list-item",
      "okkly-list-item--container",
      denseClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const buttonClasses = ["okkly-list-item", "okkly-list-item--button", denseClass, selectedClass]
      .filter(Boolean)
      .join(" ");

    return (
      <li ref={ref} className={containerClasses} {...rest}>
        {/* A real button already fires `click` on Enter and Space — a keydown
            handler on top of it is either dead code or a double invocation. */}
        <button
          type="button"
          className={buttonClasses}
          disabled={disabled}
          onClick={onClick as (event: MouseEvent<HTMLButtonElement>) => void}
        >
          {startIcon && <span className="okkly-list-item__leading">{startIcon}</span>}
          <span className="okkly-list-item__content">{children}</span>
        </button>
        {secondaryAction && <span className="okkly-list-item__trailing">{secondaryAction}</span>}
      </li>
    );
  }

  const itemClasses = ["okkly-list-item", denseClass, selectedClass, disabledClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={ref} className={itemClasses} {...rest}>
      {startIcon && <span className="okkly-list-item__leading">{startIcon}</span>}
      <span className="okkly-list-item__content">{children}</span>
      {secondaryAction && <span className="okkly-list-item__trailing">{secondaryAction}</span>}
    </li>
  );
});

export function ListItemText({ primary, secondary, className, ...rest }: ListItemTextProps) {
  const classes = ["okkly-list-item__text", className].filter(Boolean).join(" ");

  return (
    <span className={classes} {...rest}>
      {primary !== undefined && <span className="okkly-list-item__primary">{primary}</span>}
      {secondary !== undefined && <span className="okkly-list-item__secondary">{secondary}</span>}
    </span>
  );
}

export function ListItemIcon({ children, className, ...rest }: ListItemIconProps) {
  const classes = ["okkly-list-item__icon", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true" {...rest}>
      {children}
    </span>
  );
}
