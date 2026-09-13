"use client";

import "@okkly/design-system/components/EmptyState/EmptyState.scss";
import { SeverityIcon } from "../SeverityIcon/SeverityIcon";
import type { SeverityIconSeverity } from "../SeverityIcon/SeverityIcon.types";
import type { EmptyStateSize, EmptyStateColor, EmptyStateProps } from "./EmptyState.types";

const COLOR_SEVERITY: Record<EmptyStateColor, SeverityIconSeverity> = {
  primary: "primary",
  dante: "primary",
  indigo: "primary",
  danger: "danger",
};

const ICON_SIZE: Record<EmptyStateSize, "small" | "medium" | "large"> = {
  small: "small",
  medium: "large",
  large: "large",
};

export function EmptyState({
  title,
  description,
  icon,
  severity,
  color = "primary",
  action,
  size = "medium",
  className,
  ...rest
}: EmptyStateProps) {
  const iconSeverity = severity ?? COLOR_SEVERITY[color];

  const classes = [
    "okkly-component",
    "okkly-empty-state",
    size !== "medium" && `okkly-empty-state--${size}`,
    color !== "primary" && `okkly-empty-state--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {(icon || iconSeverity) && (
        <div className="okkly-empty-state__visual">
          <span className="okkly-empty-state__halo" aria-hidden="true" />
          <span className="okkly-empty-state__icon">
            {icon ?? <SeverityIcon severity={iconSeverity} size={ICON_SIZE[size]} shape="circle" />}
          </span>
        </div>
      )}
      <h4 className="okkly-empty-state__title">{title}</h4>
      {description && <p className="okkly-empty-state__description">{description}</p>}
      {action && <div className="okkly-empty-state__action">{action}</div>}
    </div>
  );
}
