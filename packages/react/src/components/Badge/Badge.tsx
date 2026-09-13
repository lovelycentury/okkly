"use client";

import { type ReactNode } from "react";
import "@okkly/design-system/components/Badge/Badge.scss";
import type { BadgeVariant, BadgeProps } from "./Badge.types";

function formatContent(content: ReactNode, max: number): ReactNode {
  if (content == null || content === false) return null;
  if (typeof content === "number") {
    if (content === 0) return null;
    if (content > max) return `${max}+`;
  }
  return content;
}

function shouldHide(content: ReactNode, invisible: boolean, variant: BadgeVariant) {
  if (invisible) return true;
  if (variant === "dot") return false;
  return content == null || content === false || content === 0;
}

export function Badge({
  badgeContent,
  children,
  color,
  variant = "standard",
  max = 99,
  invisible = false,
  overlap = "circular",
  anchorOrigin = { vertical: "top", horizontal: "right" },
  className,
}: BadgeProps) {
  const formatted = variant === "dot" ? null : formatContent(badgeContent, max);
  const hidden = shouldHide(formatted, invisible, variant);
  const standalone = children == null;

  const rootClasses = [
    "okkly-component",
    "okkly-badge",
    standalone && "okkly-badge--standalone",
    overlap === "rectangular" && "okkly-badge--overlap-rectangular",
    color && `okkly-badge--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "okkly-badge__content",
    variant === "dot" && "okkly-badge__content--dot",
    hidden && "okkly-badge__content--invisible",
    !standalone && `okkly-badge__content--${anchorOrigin.vertical}`,
    !standalone && `okkly-badge__content--${anchorOrigin.horizontal}`,
  ]
    .filter(Boolean)
    .join(" ");

  const badgeNode = (
    <span
      className={contentClasses}
      data-testid="badge-content"
      aria-hidden={variant === "dot" || hidden ? true : undefined}
    >
      {variant === "standard" ? formatted : null}
    </span>
  );

  if (standalone) {
    return <span className={rootClasses}>{badgeNode}</span>;
  }

  return (
    <span className={rootClasses}>
      <span className="okkly-badge__anchor">{children}</span>
      {badgeNode}
    </span>
  );
}
