"use client";

import { forwardRef, useId, useRef, useState } from "react";
import "@okkly/design-system/components/ParametricEQ/ParametricEQ.scss";
import { useControllableState } from "@okkly/react-hooks";
import {
  GAIN_FILTER_TYPES,
  MAX_Q,
  MIN_Q,
  Q_FILTER_TYPES,
  clamp,
  createBandId,
  formatFrequency,
  formatGain,
} from "../../helpers/eq";
import { Knob } from "../Knob/Knob";
import { EQGraph } from "./EQGraph";
import { EQLevelMeter } from "./EQLevelMeter";
import type { EQBand, EQFilterType, ParametricEQProps } from "./ParametricEQ.types";

/** Picker order and short labels, as on the hardware-style picker. */
export const EQ_FILTER_TYPE_LABELS = {
  lowpass: { short: "LP", long: "Low pass" },
  bandpass: { short: "BP", long: "Band pass" },
  highpass: { short: "HP", long: "High pass" },
  notch: { short: "Notch", long: "Notch" },
  lowshelf: { short: "LS", long: "Low shelf" },
  peaking: { short: "PK", long: "Peaking" },
  highshelf: { short: "HS", long: "High shelf" },
  off: { short: "Off", long: "Bypass" },
} as const satisfies Record<EQFilterType, { short: string; long: string }>;

/** The analyzer floor the toolbar chip cycles through, in dBFS. */
const SPECTRUM_FLOORS = [-90, -120, -60];
const OUTPUT_GAIN_RANGE = { min: -24, max: 12 };

export const ParametricEQ = forwardRef<HTMLDivElement, ParametricEQProps>(function ParametricEQ(
  {
    bands: bandsProp,
    defaultBands = [],
    onBandsChange,
    selectedBandId: selectedBandIdProp,
    defaultSelectedBandId,
    onSelectedBandChange,
    outputGain: outputGainProp,
    defaultOutputGain = 0,
    onOutputGainChange,
    meter,
    title,
    onClose,
    maxBands = 8,
    minFrequency = 20,
    maxFrequency = 20000,
    gainRange = 18,
    sampleRate = 48000,
    className,
    ...rest
  },
  ref,
) {
  const titleId = useId();
  const [bands, setBands] = useControllableState({
    value: bandsProp,
    defaultValue: defaultBands,
    onChange: onBandsChange,
  });
  const [rawSelectedId, setSelectedId] = useControllableState<string | null>({
    value: selectedBandIdProp,
    defaultValue: defaultSelectedBandId ?? (bandsProp ?? defaultBands)[0]?.id ?? null,
    onChange: onSelectedBandChange,
  });
  const [outputGain, setOutputGain] = useControllableState({
    value: outputGainProp,
    defaultValue: defaultOutputGain,
    onChange: onOutputGainChange,
  });
  const [floorIndex, setFloorIndex] = useState(0);

  // Several edits can land before the next render (a fast drag, a wheel
  // burst), so each one builds on the latest bands rather than on the render's.
  const latestBands = useRef(bands);
  latestBands.current = bands;
  const commitBands = (next: EQBand[]) => {
    latestBands.current = next;
    setBands(next);
  };

  const selectedIndex = bands.findIndex((band) => band.id === rawSelectedId);
  const selected = selectedIndex === -1 ? null : bands[selectedIndex];
  const selectedId = selected?.id ?? null;

  const select = (id: string | null) => {
    if (id !== selectedId) setSelectedId(id);
  };

  const updateBand = (id: string, patch: Partial<EQBand>) => {
    commitBands(latestBands.current.map((band) => (band.id === id ? { ...band, ...patch } : band)));
  };

  const addBand = (band: Omit<EQBand, "id">) => {
    const id = createBandId();
    commitBands([...latestBands.current, { ...band, id }]);
    setSelectedId(id);
  };

  const removeBand = (id: string) => {
    const current = latestBands.current;
    const index = current.findIndex((band) => band.id === id);
    const next = current.filter((band) => band.id !== id);
    commitBands(next);
    if (id === selectedId) setSelectedId(next[Math.min(index, next.length - 1)]?.id ?? null);
  };

  const spectrumFloor = SPECTRUM_FLOORS[floorIndex];

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={titleId}
      className={["okkly-component", "okkly-parametric-eq", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="okkly-parametric-eq__header">
        <h3 id={titleId} className="okkly-parametric-eq__title">
          Parametric EQ
          {title != null && <> · {title}</>}
        </h3>
        {onClose && (
          <button
            type="button"
            className="okkly-parametric-eq__close"
            aria-label="Close"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
      </div>

      <div className="okkly-parametric-eq__body">
        <div className="okkly-parametric-eq__toolbar">
          <span className="okkly-parametric-eq__range">
            {formatFrequency(minFrequency)} – {formatFrequency(maxFrequency)}
          </span>
          <button
            type="button"
            className="okkly-parametric-eq__chip"
            aria-label={`Analyzer floor ${spectrumFloor} dB`}
            title="Analyzer floor"
            onClick={() => setFloorIndex((floorIndex + 1) % SPECTRUM_FLOORS.length)}
          >
            {spectrumFloor} dB
          </button>
        </div>

        <EQGraph
          bands={bands}
          selectedBandId={selectedId}
          onSelect={select}
          onBandChange={updateBand}
          onAdd={addBand}
          onRemove={removeBand}
          canAdd={bands.length < maxBands}
          meter={meter}
          spectrumFloor={spectrumFloor}
          minFrequency={minFrequency}
          maxFrequency={maxFrequency}
          gainRange={gainRange}
          sampleRate={sampleRate}
        />

        <div className="okkly-parametric-eq__output">
          <EQLevelMeter meter={meter} outputGain={outputGain} />
          <Knob
            label="Out"
            value={outputGain}
            min={OUTPUT_GAIN_RANGE.min}
            max={OUTPUT_GAIN_RANGE.max}
            defaultValue={0}
            formatValue={formatGain}
            onChange={setOutputGain}
          />
        </div>

        <div className="okkly-parametric-eq__controls">
          <div
            className="okkly-parametric-eq__types"
            role="radiogroup"
            aria-label={selected ? `Band ${selectedIndex + 1} filter type` : "Filter type"}
          >
            {(Object.keys(EQ_FILTER_TYPE_LABELS) as EQFilterType[]).map((type) => {
              const isActive = selected?.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={EQ_FILTER_TYPE_LABELS[type].long}
                  disabled={!selected}
                  className={[
                    "okkly-parametric-eq__type",
                    isActive && "okkly-parametric-eq__type--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selected && updateBand(selected.id, { type })}
                >
                  {EQ_FILTER_TYPE_LABELS[type].short}
                </button>
              );
            })}
          </div>

          <div className="okkly-parametric-eq__knobs">
            <Knob
              label="Freq"
              scale="log"
              value={selected?.frequency ?? 1000}
              min={minFrequency}
              max={maxFrequency}
              formatValue={formatFrequency}
              disabled={!selected || selected.type === "off"}
              onChange={(frequency) => selected && updateBand(selected.id, { frequency })}
            />
            <Knob
              label="Gain"
              value={selected?.gain ?? 0}
              min={-gainRange}
              max={gainRange}
              defaultValue={0}
              formatValue={formatGain}
              disabled={!selected || !GAIN_FILTER_TYPES.has(selected.type)}
              onChange={(gain) => selected && updateBand(selected.id, { gain })}
            />
            <Knob
              label="BW"
              scale="log"
              value={clamp(selected?.q ?? 1, MIN_Q, MAX_Q)}
              min={MIN_Q}
              max={MAX_Q}
              defaultValue={1}
              formatValue={(q) => `Q ${q.toFixed(2)}`}
              disabled={!selected || !Q_FILTER_TYPES.has(selected.type)}
              onChange={(q) => selected && updateBand(selected.id, { q })}
            />
          </div>

          <div className="okkly-parametric-eq__toggles">
            <button
              type="button"
              className="okkly-parametric-eq__toggle"
              aria-pressed={!!selected?.muted}
              disabled={!selected}
              onClick={() => selected && updateBand(selected.id, { muted: !selected.muted })}
            >
              Mute
            </button>
            <button
              type="button"
              className="okkly-parametric-eq__toggle"
              aria-pressed={!!selected?.solo}
              disabled={!selected}
              onClick={() => selected && updateBand(selected.id, { solo: !selected.solo })}
            >
              Solo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
