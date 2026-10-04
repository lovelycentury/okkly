"use client";

import {
  forwardRef,
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "@okkly/design-system/components/Knob/Knob.scss";
import { clamp } from "../../helpers/eq";
import type { KnobProps, KnobScale } from "./Knob.types";

const START_ANGLE = -135;
const SWEEP = 270;
/** Pixels of vertical drag that turn the knob from end to end. */
const DRAG_RANGE = 200;
const FINE_DRAG_RANGE = 1000;

const toRatio = (value: number, min: number, max: number, scale: KnobScale) =>
  scale === "log" ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min || 1);

const fromRatio = (ratio: number, min: number, max: number, scale: KnobScale) =>
  scale === "log" ? min * (max / min) ** ratio : min + ratio * (max - min);

/** Point on a circle centred in the 40×40 viewBox; 0° is straight up. */
const polar = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: 20 + radius * Math.cos(radians), y: 20 + radius * Math.sin(radians) };
};

const arc = (from: number, to: number, radius: number) => {
  const start = polar(from, radius);
  const end = polar(to, radius);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

export const Knob = forwardRef<HTMLDivElement, KnobProps>(function Knob(
  {
    value,
    onChange,
    min = 0,
    max = 1,
    defaultValue,
    scale = "linear",
    label,
    formatValue,
    size = "medium",
    disabled = false,
    className,
    ...rest
  },
  ref,
) {
  const labelId = useId();
  const drag = useRef<{ y: number; ratio: number } | null>(null);

  const ratio = clamp(toRatio(value, min, max, scale), 0, 1);
  const angle = START_ANGLE + ratio * SWEEP;
  const indicator = polar(angle, 8.5);

  const commit = (nextRatio: number) => {
    const next = fromRatio(clamp(nextRatio, 0, 1), min, max, scale);
    if (next !== value) onChange?.(next);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    drag.current = { y: event.clientY, ratio };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const range = event.shiftKey ? FINE_DRAG_RANGE : DRAG_RANGE;
    commit(drag.current.ratio + (drag.current.y - event.clientY) / range);
  };

  const handlePointerUp = () => {
    drag.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = event.shiftKey ? 0.001 : 0.01;
    const steps: Record<string, number> = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: 0.1,
      PageDown: -0.1,
      Home: -1,
      End: 1,
    };
    if (!(event.key in steps)) return;
    event.preventDefault();
    commit(ratio + steps[event.key]);
  };

  return (
    <div
      ref={ref}
      className={[
        "okkly-component",
        "okkly-knob",
        size !== "medium" && `okkly-knob--${size}`,
        disabled && "okkly-knob--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div
        className="okkly-knob__dial"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={label ? labelId : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        aria-valuetext={formatValue?.(value)}
        aria-disabled={disabled || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => {
          if (!disabled && defaultValue !== undefined) onChange?.(defaultValue);
        }}
      >
        <svg className="okkly-knob__svg" viewBox="0 0 40 40" aria-hidden="true">
          <path className="okkly-knob__track" d={arc(START_ANGLE, START_ANGLE + SWEEP, 18)} />
          {ratio > 0.002 && <path className="okkly-knob__value" d={arc(START_ANGLE, angle, 18)} />}
          <circle className="okkly-knob__body" cx="20" cy="20" r="13.5" />
          <circle className="okkly-knob__indicator" cx={indicator.x} cy={indicator.y} r="2" />
        </svg>
      </div>
      {label && (
        <span id={labelId} className="okkly-knob__label">
          {label}
        </span>
      )}
    </div>
  );
});
