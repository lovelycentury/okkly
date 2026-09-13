"use client";

import { forwardRef } from "react";
import { iconX } from "@okkly/icons";
import "@okkly/design-system/components/Alert/Alert.scss";
import { SeverityIcon } from "../SeverityIcon/SeverityIcon";
import type { SeverityIconSeverity } from "../SeverityIcon/SeverityIcon.types";
import type { AlertSeverity, AlertProps } from "./Alert.types";

const SEVERITY_ICON_MAP: Record<AlertSeverity, SeverityIconSeverity> = {
  success: "success",
  info: "primary",
  warning: "warning",
  danger: "danger",
  dante: "primary",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    severity = "info",
    variant = "standard",
    title,
    children,
    onClose,
    icon,
    action,
    className,
    ...rest
  },
  forwardedRef,
) {
  const showIcon = icon !== false;
  const iconSeverity = SEVERITY_ICON_MAP[severity];

  const classes = [
    "okkly-component",
    "okkly-alert",
    severity !== "info" && `okkly-alert--${severity}`,
    variant === "outlined" && "okkly-alert--outlined",
    variant === "filled" && "okkly-alert--filled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={forwardedRef} role="alert" className={classes} {...rest}>
      {showIcon && (
        <span className="okkly-alert__icon">
          {icon ?? <SeverityIcon severity={iconSeverity} size="small" shape="rounded" />}
        </span>
      )}
      <div className="okkly-alert__content">
        {title && <p className="okkly-alert__title">{title}</p>}
        {children && <p className="okkly-alert__message">{children}</p>}
      </div>
      {action && <span className="okkly-alert__action">{action}</span>}
      {onClose && (
        <button type="button" className="okkly-alert__close" aria-label="Close" onClick={onClose}>
          <span dangerouslySetInnerHTML={{ __html: iconX }} />
        </button>
      )}
    </div>
  );
});
