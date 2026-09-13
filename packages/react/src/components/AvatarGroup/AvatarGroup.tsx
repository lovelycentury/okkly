"use client";

import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import "@okkly/design-system/components/AvatarGroup/AvatarGroup.scss";
import type { AvatarProps } from "../Avatar/Avatar.types";
import type { AvatarGroupProps } from "./AvatarGroup.types";

export function AvatarGroup({
  children,
  max = 5,
  total,
  size = "sm",
  spacing = "default",
  ring = true,
  hues = ["mint"],
  className,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const effectiveTotal = total ?? items.length;
  const renderedCount = items.length > max ? Math.max(max - 1, 0) : items.length;
  const overflowCount = effectiveTotal - renderedCount;

  const classes = [
    "okkly-component",
    "okkly-avatar-group",
    size !== "sm" && `okkly-avatar-group--${size}`,
    spacing !== "default" && `okkly-avatar-group--${spacing}`,
    !ring && "okkly-avatar-group--no-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {items.slice(0, renderedCount).map((child, index) => (
        <span className="okkly-avatar-group__item" key={child.key ?? index}>
          {cloneElement(child, { size, color: hues[index % hues.length] })}
        </span>
      ))}
      {overflowCount > 0 && (
        <span className="okkly-avatar-group__item">
          <span className="okkly-avatar-group__overflow">+{overflowCount}</span>
        </span>
      )}
    </div>
  );
}
