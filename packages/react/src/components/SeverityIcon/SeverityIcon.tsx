"use client";

import { type ReactNode } from "react";
import "@okkly/design-system/components/SeverityIcon/SeverityIcon.scss";
import type { SeverityIconSeverity, SeverityIconProps } from "./SeverityIcon.types";

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const InfoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" />
    <path d="M12 7h.01" />
  </svg>
);

const WarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const DangerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const DEFAULT_ICONS: Record<SeverityIconSeverity, () => ReactNode> = {
  success: CheckIcon,
  info: InfoIcon,
  warning: WarningIcon,
  danger: DangerIcon,
  primary: InfoIcon,
  neutral: InfoIcon,
};

export function SeverityIcon({
  severity = "info",
  size = "medium",
  shape = "circle",
  icon,
  label,
  className,
}: SeverityIconProps) {
  const DefaultIcon = DEFAULT_ICONS[severity];

  const classes = [
    "okkly-component",
    "okkly-severity-icon",
    severity !== "info" && `okkly-severity-icon--${severity}`,
    size !== "medium" && `okkly-severity-icon--${size}`,
    shape === "rounded" && "okkly-severity-icon--rounded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Colour is the only thing this component says, and colour alone says nothing
  // to a screen reader — so a labelled icon is exposed as an image, and an
  // unlabelled one is decoration that would otherwise be announced as a nameless
  // graphic.
  return (
    <span className={classes} role="img" aria-label={label} aria-hidden={label ? undefined : true}>
      <span className="okkly-severity-icon__icon">{icon ?? <DefaultIcon />}</span>
    </span>
  );
}
