"use client";

import { useEffect, useRef } from "react";
import { clamp } from "../../helpers/eq";
import type { EQLevelMeterProps } from "./ParametricEQ.types";

/** The meter shows 0 dBFS at the top down to this at the bottom. */
const METER_FLOOR = -30;
const METER_TICKS = [0, -6, -12, -24];
/** How fast a level falls after a peak, in dB per second. */
const RELEASE = 24;
const PEAK_HOLD_MS = 1000;

/** Distance from the top of the meter, as a percentage. */
const dbToTop = (db: number) => clamp(db / METER_FLOOR, 0, 1) * 100;

export function EQLevelMeter({ meter, outputGain }: EQLevelMeterProps) {
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const peakRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Levels change every frame, so they're written straight to the DOM rather
  // than through state — re-rendering the whole EQ 60 times a second for two
  // bars would be wasteful.
  useEffect(() => {
    const getLevels = meter?.getLevels;
    const shown = [-Infinity, -Infinity];
    const peaks = [-Infinity, -Infinity];
    const peakTimes = [0, 0];
    let last = performance.now();
    let frame = 0;

    const paint = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      const levels = getLevels?.() ?? [-Infinity, -Infinity];
      for (let channel = 0; channel < 2; channel++) {
        const level = levels[channel];
        shown[channel] = Math.max(level, shown[channel] - RELEASE * elapsed);
        if (level >= peaks[channel] || now - peakTimes[channel] > PEAK_HOLD_MS) {
          peaks[channel] = Math.max(level, peaks[channel] - RELEASE * elapsed);
          if (level >= peaks[channel]) peakTimes[channel] = now;
        }
        const fill = fillRefs.current[channel];
        const peak = peakRefs.current[channel];
        if (fill) fill.style.clipPath = `inset(${dbToTop(shown[channel])}% 0 0 0)`;
        if (peak) {
          peak.style.top = `${dbToTop(peaks[channel])}%`;
          peak.style.opacity = peaks[channel] > METER_FLOOR ? "1" : "0";
        }
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [meter]);

  return (
    <div className="okkly-parametric-eq__meter" aria-hidden="true">
      <div className="okkly-parametric-eq__meter-scale">
        {METER_TICKS.map((tick) => (
          <span
            key={tick}
            className="okkly-parametric-eq__meter-tick"
            style={{ top: `${dbToTop(tick)}%` }}
          >
            {tick}
          </span>
        ))}
      </div>
      {[0, 1].map((channel) => (
        <div key={channel} className="okkly-parametric-eq__meter-bar">
          <div
            ref={(element) => {
              fillRefs.current[channel] = element;
            }}
            className="okkly-parametric-eq__meter-fill"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          />
          <div
            ref={(element) => {
              peakRefs.current[channel] = element;
            }}
            className="okkly-parametric-eq__meter-peak"
            style={{ opacity: 0 }}
          />
        </div>
      ))}
      <div className="okkly-parametric-eq__meter-gain" style={{ top: `${dbToTop(outputGain)}%` }}>
        <span className="okkly-parametric-eq__meter-gain-handle" />
        <span className="okkly-parametric-eq__meter-gain-label">{outputGain.toFixed(1)}</span>
      </div>
    </div>
  );
}
