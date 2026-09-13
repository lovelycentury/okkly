"use client";

import { forwardRef, useId } from "react";
import "@okkly/design-system/components/InlineAction/InlineAction.scss";
import type { InlineActionState, InlineActionProps } from "./InlineAction.types";

const Spinner = () => (
  <span className="okkly-inline-action__spinner" aria-hidden="true">
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

const ArrowRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const RefreshCwIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const InlineAction = forwardRef<HTMLInputElement, InlineActionProps>(function InlineAction(
  {
    value,
    placeholder,
    action = "Copy",
    actionIcon,
    size = "medium",
    color,
    fill = "filled",
    message,
    state = "default",
    readonly: readOnlyProp = false,
    loading = false,
    disabled = false,
    onAction,
    onChange,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = message ? `${inputId}-message` : undefined;

  const effectiveState: InlineActionState = disabled
    ? "disabled"
    : loading
      ? "loading"
      : readOnlyProp
        ? "readonly"
        : state;
  const isReadOnly = effectiveState === "readonly";
  const isLocked = disabled || isReadOnly;

  const classes = [
    "okkly-component",
    "okkly-inline-action",
    color && `okkly-inline-action--color-${color}`,
    fill !== "filled" && `okkly-inline-action--fill-${fill}`,
    size !== "medium" && `okkly-inline-action--${size}`,
    (effectiveState === "hover" ||
      effectiveState === "focus" ||
      effectiveState === "success" ||
      effectiveState === "error" ||
      effectiveState === "readonly") &&
      `okkly-inline-action--state-${effectiveState}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const buttonIcon =
    effectiveState === "loading" ? (
      <Spinner />
    ) : (
      <span className="okkly-inline-action__icon" aria-hidden="true">
        {isReadOnly ? (
          <LockIcon />
        ) : effectiveState === "success" ? (
          <CheckIcon />
        ) : effectiveState === "error" ? (
          <RefreshCwIcon />
        ) : (
          (actionIcon ?? <ArrowRightIcon />)
        )}
      </span>
    );

  const messageIcon =
    effectiveState === "loading" ? (
      <ClockIcon />
    ) : effectiveState === "success" ? (
      <CheckIcon />
    ) : effectiveState === "error" ? (
      <AlertTriangleIcon />
    ) : null;

  const messageClasses = [
    "okkly-inline-action__message",
    effectiveState === "success" && "okkly-inline-action__message--success",
    effectiveState === "error" && "okkly-inline-action__message--error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="okkly-inline-action__control">
        <input
          ref={ref}
          id={inputId}
          className="okkly-inline-action__input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadOnly}
          onChange={onChange}
          aria-describedby={messageId}
          {...rest}
        />
        <button
          type="button"
          className="okkly-inline-action__action"
          disabled={isLocked}
          onClick={isReadOnly ? undefined : onAction}
          aria-label={isReadOnly ? `${action} (locked)` : undefined}
        >
          <span>{action}</span>
          {buttonIcon}
        </button>
      </div>
      {message && (
        <span id={messageId} className={messageClasses}>
          {messageIcon && (
            <span className="okkly-inline-action__message-icon" aria-hidden="true">
              {messageIcon}
            </span>
          )}
          {message}
        </span>
      )}
    </div>
  );
});
