"use client";

import { forwardRef, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import "@okkly/design-system/components/Button/Button.scss";
import { useRipple } from "@okkly/react-hooks";
import { Ripple } from "../Ripple/Ripple";
import type { ButtonProps } from "./Button.types";

const Spinner = () => (
  <span className="okkly-button__spinner" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="42 100"
      />
    </svg>
  </span>
);

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      color = "primary",
      shape = "pill",
      size = "medium",
      fullWidth = false,
      disableRipple = false,
      loading = false,
      loadingPosition = "center",
      disabled = false,
      startIcon,
      endIcon,
      children,
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

    const isDisabled = disabled || loading;
    const showRipple = !disableRipple && !isDisabled;
    const { ripples, events, hideRipple } = useRipple(localRef);

    const classes = [
      "okkly-component",
      "okkly-button",
      `okkly-button--${variant}`,
      color !== "primary" && `okkly-button--color-${color}`,
      shape === "rounded" && "okkly-button--rounded",
      size !== "medium" && `okkly-button--${size}`,
      fullWidth && "okkly-button--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const spinner = loading ? <Spinner /> : null;

    const content = (
      <>
        {showRipple && <Ripple ripples={ripples} onRippleEnd={hideRipple} />}
        {loadingPosition === "start" && spinner}
        {loadingPosition !== "start" && startIcon && (
          <span className="okkly-button__icon">{startIcon}</span>
        )}
        <span
          className={`okkly-button__label okkly-truncation-ellipsis${loading && loadingPosition === "center" ? " okkly-button__label--hidden" : ""}`}
        >
          {children}
        </span>
        {loadingPosition !== "end" && endIcon && (
          <span className="okkly-button__icon">{endIcon}</span>
        )}
        {loadingPosition === "end" && spinner}
        {loading && loadingPosition === "center" && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {spinner}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <a
          ref={setRef as (node: HTMLAnchorElement | null) => void}
          href={isDisabled ? undefined : href}
          aria-disabled={isDisabled || undefined}
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
        disabled={isDisabled}
        className={classes}
        {...(showRipple ? events : {})}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
