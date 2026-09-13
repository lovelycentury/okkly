"use client";

import {
  forwardRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import "@okkly/design-system/components/Rating/Rating.scss";
import type { RatingIcon, RatingPrecision, RatingProps } from "./Rating.types";

const StarOutline = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z" />
  </svg>
);

const StarFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.77l-5.86 3.08 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z" />
  </svg>
);

const HeartOutline = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z" />
  </svg>
);

const HeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 21s-6.5-4.35-9-8.35C1.5 10.5 2.5 6.5 6 5.5c2-.6 4 .5 6 2.5 2-2 4-3.1 6-2.5 3.5 1 4.5 5 3 7.15C18.5 16.65 12 21 12 21z" />
  </svg>
);

function defaultGetLabelText(value: number): string {
  return `${value} Star${value !== 1 ? "s" : ""}`;
}

function starKind(displayValue: number, index: number): "full" | "half" | "empty" {
  const position = index + 1;
  if (displayValue >= position) return "full";
  if (displayValue >= position - 0.5) return "half";
  return "empty";
}

function valueFromPointer(
  event: MouseEvent<HTMLButtonElement>,
  index: number,
  precision: RatingPrecision,
): number {
  if (precision === 1) return index + 1;
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  return ratio <= 0.5 ? index + 0.5 : index + 1;
}

export const Rating = forwardRef<HTMLSpanElement, RatingProps>(function Rating(
  {
    value,
    defaultValue = null,
    onChange,
    max = 5,
    precision = 0.5,
    size = "medium",
    color = "warning",
    icon = "star",
    readOnly = false,
    disabled = false,
    label,
    name,
    getLabelText = defaultGetLabelText,
    className,
  },
  forwardedRef,
) {
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const displayValue = hoverValue ?? currentValue ?? 0;

  const commit = (event: SyntheticEvent, next: number | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(event, next);
  };

  const handleItemClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || disabled) return;
    const next = valueFromPointer(event, index, precision);
    if (next === currentValue) commit(event, null);
    else commit(event, next);
  };

  const handleItemMove = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || disabled) return;
    setHoverValue(valueFromPointer(event, index, precision));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (readOnly || disabled) return;
    const step = precision;
    const base = currentValue ?? 0;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      commit(event, Math.min(max, base + step));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      commit(event, Math.max(0, base - step) || null);
    }
  };

  const renderBuiltInIcon = (kind: "full" | "half" | "empty", glyph: RatingIcon) => {
    const Outline = glyph === "heart" ? HeartOutline : StarOutline;
    const Filled = glyph === "heart" ? HeartFilled : StarFilled;

    if (kind === "full") {
      return (
        <span className="okkly-rating__icon okkly-rating__icon--full" aria-hidden="true">
          <Filled />
        </span>
      );
    }

    if (kind === "half") {
      return (
        <span className="okkly-rating__icon okkly-rating__icon--half" aria-hidden="true">
          <Outline />
          <span className="okkly-rating__icon-fill">
            <Filled />
          </span>
        </span>
      );
    }

    return (
      <span className="okkly-rating__icon" aria-hidden="true">
        <Outline />
      </span>
    );
  };

  const renderCustomIcon = (kind: "full" | "half" | "empty", customIcon: ReactNode) => {
    if (kind === "full") {
      return (
        <span className="okkly-rating__icon okkly-rating__icon--full" aria-hidden="true">
          {customIcon}
        </span>
      );
    }

    if (kind === "half") {
      return (
        <span className="okkly-rating__icon okkly-rating__icon--half" aria-hidden="true">
          {customIcon}
          <span className="okkly-rating__icon-fill">{customIcon}</span>
        </span>
      );
    }

    return (
      <span className="okkly-rating__icon" aria-hidden="true">
        {customIcon}
      </span>
    );
  };

  const isBuiltInGlyph = (glyph: RatingIcon | ReactNode): glyph is RatingIcon =>
    glyph === "star" || glyph === "heart";

  const renderIcon = (kind: "full" | "half" | "empty") => {
    if (isBuiltInGlyph(icon)) return renderBuiltInIcon(kind, icon);
    return renderCustomIcon(kind, icon);
  };

  const classes = [
    "okkly-component",
    "okkly-rating",
    color !== "warning" && `okkly-rating--color-${color}`,
    size !== "medium" && `okkly-rating--${size}`,
    readOnly && "okkly-rating--read-only",
    disabled && "okkly-rating--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactive = !readOnly && !disabled;

  return (
    <span
      ref={forwardedRef}
      className={classes}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? undefined : `${displayValue} of ${max}`}
      onMouseLeave={() => setHoverValue(null)}
    >
      <span className="okkly-rating__stars">
        {Array.from({ length: max }, (_, index) => {
          const kind = starKind(displayValue, index);
          const itemValue = index + 1;

          if (!interactive) {
            return (
              <span key={index} className="okkly-rating__item" aria-hidden="true">
                {renderIcon(kind)}
              </span>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className="okkly-rating__item"
              name={name}
              aria-label={getLabelText(itemValue)}
              onClick={(event) => handleItemClick(event, index)}
              onMouseMove={(event) => handleItemMove(event, index)}
              onKeyDown={(event) => handleKeyDown(event)}
            >
              {renderIcon(kind)}
            </button>
          );
        })}
      </span>
      {label && <span className="okkly-rating__label">{label}</span>}
    </span>
  );
});
