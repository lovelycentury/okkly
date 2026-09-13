"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "@okkly/design-system/components/TextArea/TextArea.scss";
import type { TextAreaProps } from "./TextArea.types";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    hideLabel = false,
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    disabled = false,
    rows = 3,
    maxRows,
    autosize = false,
    maxLength,
    resize = "vertical",
    required = false,
    className,
    id,
    value,
    defaultValue,
    onChange,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const counterId = maxLength != null ? `${inputId}-counter` : undefined;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    defaultValue != null ? String(defaultValue) : "",
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : uncontrolledValue;
  const charCount = currentValue.length;

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const syncHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !autosize) {
      return;
    }

    el.style.height = "auto";

    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    const paddingBlock =
      Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const borderBlock =
      Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);

    const minHeight = rows * lineHeight + paddingBlock + borderBlock;
    let nextHeight = Math.max(el.scrollHeight, minHeight);

    if (maxRows != null) {
      const maxHeight = maxRows * lineHeight + paddingBlock + borderBlock;
      nextHeight = Math.min(nextHeight, maxHeight);
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    } else {
      el.style.overflowY = "hidden";
    }

    el.style.height = `${nextHeight}px`;
  }, [autosize, maxRows, rows]);

  useLayoutEffect(() => {
    syncHeight();
  }, [syncHeight, currentValue, rows, maxRows]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setUncontrolledValue(event.target.value);
    }
    onChange?.(event);
  };

  const classes = [
    "okkly-component",
    "okkly-text-area",
    color !== "primary" && `okkly-text-area--color-${color}`,
    size !== "medium" && `okkly-text-area--${size}`,
    error && "okkly-text-area--error",
    fullWidth && "okkly-text-area--full-width",
    autosize && "okkly-text-area--autosize",
    resize !== "vertical" && `okkly-text-area--resize-${resize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const describedBy = [helperId, counterId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;
  const showFooter = Boolean(helperText || maxLength != null);

  return (
    <div className={classes}>
      {label && (
        <label
          htmlFor={inputId}
          className={`okkly-text-area__label${hideLabel ? " okkly-text-area__label--hidden" : ""}`}
        >
          {label}
          {required && (
            <span className="okkly-text-area__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="okkly-text-area__control">
        <textarea
          ref={setTextareaRef}
          id={inputId}
          className="okkly-text-area__textarea"
          rows={rows}
          disabled={disabled}
          required={required}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          {...rest}
        />
      </div>
      {showFooter && (
        <div className="okkly-text-area__footer">
          {helperText && (
            <span id={helperId} className="okkly-text-area__helper">
              {helperText}
            </span>
          )}
          {maxLength != null && (
            <span id={counterId} className="okkly-text-area__counter">
              {charCount} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
