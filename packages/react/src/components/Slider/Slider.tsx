"use client";

import { forwardRef, useMemo, useState } from "react";
import { useSlider, valueToPercent } from "@okkly/react-hooks";
import "@okkly/design-system/components/Slider/Slider.scss";
import type { SliderProps } from "./Slider.types";

function isRangeValue(value: number | number[] | undefined): value is number[] {
  return Array.isArray(value);
}

function resolveInitialValue(
  isRange: boolean,
  min: number,
  max: number,
  defaultValue?: number | number[],
): number | number[] {
  if (defaultValue !== undefined) return defaultValue;
  return isRange ? [min + (max - min) * 0.25, min + (max - min) * 0.75] : min;
}

function formatValueLabel(value: number): string {
  return String(value);
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    onChangeCommitted,
    min = 0,
    max = 100,
    step = 1,
    marks = false,
    orientation = "horizontal",
    disabled = false,
    color = "primary",
    size = "medium",
    valueLabelDisplay = "off",
    discrete = false,
    shiftStep,
    getAriaLabel,
    getAriaValueText,
    track = "normal",
    valueLabelFormat = formatValueLabel,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  forwardedRef,
) {
  const isRange = isRangeValue(value) || isRangeValue(defaultValue);
  const [internalValue, setInternalValue] = useState<number | number[]>(() =>
    resolveInitialValue(isRange, min, max, defaultValue),
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (next: number | number[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(new Event("change") as Event, next);
  };

  const handleCommit = (next: number | number[]) => {
    onChangeCommitted?.(new Event("change") as Event, next);
  };

  const slider = useSlider({
    value: currentValue ?? (isRange ? [min, max] : min),
    min,
    max,
    step,
    discrete,
    shiftStep,
    disabled,
    marks,
    orientation,
    label: ariaLabel,
    getAriaLabel,
    getAriaValueText,
    onChange: handleChange,
    onCommit: handleCommit,
  });

  const {
    values,
    isDragging,
    activeThumbIndex,
    focusedThumbIndex,
    marksList,
    isMarkActive,
    valueToPercent: toPercent,
    getRootProps,
    getRailProps,
    getTrackProps,
    getThumbContainerProps,
    getThumbInputProps,
    getMarkProps,
    getMarkLabelProps,
  } = slider;

  const rootProps = getRootProps();
  const trackProps = getTrackProps();

  const invertedTracks = useMemo(() => {
    if (track !== "inverted") return null;

    if (!slider.isRange) {
      const start = toPercent(values[0] ?? min);
      return [{ offset: start, length: 100 - start }];
    }

    const lo = Math.min(...values);
    const hi = Math.max(...values);
    return [
      { offset: 0, length: toPercent(lo) },
      { offset: toPercent(hi), length: 100 - toPercent(hi) },
    ];
  }, [max, min, slider.isRange, toPercent, track, values]);

  const showValueLabel = (index: number) => {
    if (valueLabelDisplay === "off") return false;
    if (valueLabelDisplay === "on") return true;
    return isDragging || activeThumbIndex === index || focusedThumbIndex === index;
  };

  const classes = [
    "okkly-component",
    "okkly-slider",
    size !== "medium" && `okkly-slider--${size}`,
    color !== "primary" && `okkly-slider--color-${color}`,
    orientation === "vertical" && "okkly-slider--vertical",
    disabled && "okkly-slider--disabled",
    track === "inverted" && "okkly-slider--track-inverted",
    track === "none" && "okkly-slider--track-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const axis = orientation === "vertical" ? "bottom" : "left";
  const axisSize = orientation === "vertical" ? "height" : "width";

  const setRootRef = (node: HTMLDivElement | null) => {
    rootProps.ref.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <div
      {...rest}
      {...rootProps}
      ref={setRootRef}
      className={classes}
      aria-disabled={disabled || undefined}
    >
      <div className="okkly-slider__rail" {...getRailProps()} />

      {track === "normal" && <div className="okkly-slider__track" {...trackProps} />}

      {invertedTracks?.map((segment, index) => (
        <div
          key={`inverted-${index}`}
          className="okkly-slider__track-inverted"
          role="presentation"
          aria-hidden
          style={{
            [axis]: `${segment.offset}%`,
            [axisSize]: `${segment.length}%`,
          }}
        />
      ))}

      {marksList.length > 0 && (
        <div className="okkly-slider__marks">
          {marksList.map((mark) => (
            <div key={mark.value}>
              <div
                className={[
                  "okkly-slider__mark",
                  isMarkActive(mark.value) && "okkly-slider__mark--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                {...getMarkProps(mark)}
              />
              {mark.label && (
                <span className="okkly-slider__mark-label" {...getMarkLabelProps(mark)}>
                  {mark.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {values.map((thumbValue, index) => {
        const thumbContainerProps = getThumbContainerProps(index, thumbValue);
        const inputProps = getThumbInputProps(index, thumbValue);

        return (
          <div
            key={index}
            className={[
              "okkly-slider__thumb",
              (activeThumbIndex === index || focusedThumbIndex === index) &&
                "okkly-slider__thumb--active",
            ]
              .filter(Boolean)
              .join(" ")}
            {...thumbContainerProps}
          >
            {showValueLabel(index) && (
              <span className="okkly-slider__value-label">
                {valueLabelFormat(thumbValue, index)}
              </span>
            )}
            <span className="okkly-slider__handle" aria-hidden="true" />
            <input className="okkly-slider__input" {...inputProps} />
          </div>
        );
      })}
    </div>
  );
});

export { valueToPercent };
