"use client";

import { forwardRef, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import "@okkly/design-system/components/FAB/FAB.scss";
import { useRipple } from "@okkly/react-hooks";
import { Ripple } from "../Ripple/Ripple";
import type { FabProps } from "./FAB.types";

export const Fab = forwardRef<HTMLButtonElement | HTMLAnchorElement, FabProps>(function Fab(
  {
    variant = "standard",
    color = "primary",
    size = "medium",
    icon,
    label,
    disableRipple = false,
    disabled = false,
    className,
    href,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const setRef = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const showRipple = !disableRipple && !disabled;
  const { ripples, events, hideRipple } = useRipple(localRef);

  const classes = [
    "okkly-component",
    "okkly-fab",
    variant !== "standard" && `okkly-fab--${variant}`,
    color !== "primary" && `okkly-fab--color-${color}`,
    label != null && "okkly-fab--extended",
    size !== "medium" && `okkly-fab--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {showRipple && <Ripple ripples={ripples} onRippleEnd={hideRipple} />}
      <span className="okkly-fab__icon" aria-hidden="true">
        {icon}
      </span>
      {label != null && <span className="okkly-fab__label okkly-truncation-ellipsis">{label}</span>}
    </>
  );

  if (href) {
    return (
      <a
        ref={setRef as (node: HTMLAnchorElement | null) => void}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        className={classes}
        {...(showRipple ? events : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={setRef as (node: HTMLButtonElement | null) => void}
      type="button"
      disabled={disabled}
      className={classes}
      {...(showRipple ? events : {})}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});
