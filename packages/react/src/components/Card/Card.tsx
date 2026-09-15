"use client";

import "@okkly/design-system/components/Card/Card.scss";
import type {
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardActionsProps,
  CardMediaProps,
} from "./Card.types";

export function Card({
  raised = false,
  padding = "md",
  variant = "solid",
  color = "primary",
  interactive = false,
  children,
  className,
  ...rest
}: CardProps) {
  const effectiveVariant = raised && variant === "solid" ? "raised" : variant;

  const classes = [
    "okkly-component",
    "okkly-card",
    effectiveVariant !== "solid" && `okkly-card--${effectiveVariant}`,
    padding !== "md" && `okkly-card--padding-${padding}`,
    color !== "primary" && effectiveVariant === "aura" && `okkly-card--color-${color}`,
    interactive && "okkly-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subheader,
  action,
  avatar,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  const classes = ["okkly-card__header", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {avatar && <div className="okkly-card__avatar">{avatar}</div>}
      <div className="okkly-card__heading">
        {title !== undefined && <h3 className="okkly-card__title">{title}</h3>}
        {subheader !== undefined && <p className="okkly-card__subheader">{subheader}</p>}
        {children}
      </div>
      {action && <div className="okkly-card__action">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className, ...rest }: CardContentProps) {
  const classes = ["okkly-card__content", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardActions({ children, className, ...rest }: CardActionsProps) {
  const classes = ["okkly-card__actions", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardMedia({ height = 150, className, style, alt = "", ...rest }: CardMediaProps) {
  const cssHeight = typeof height === "number" ? `${height / 16}rem` : height;

  const classes = ["okkly-card__media", className].filter(Boolean).join(" ");

  return <img className={classes} alt={alt} style={{ height: cssHeight, ...style }} {...rest} />;
}
