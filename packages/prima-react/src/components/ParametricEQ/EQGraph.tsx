"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GAIN_FILTER_TYPES,
  MAX_Q,
  MIN_Q,
  Q_FILTER_TYPES,
  bandResponse,
  clamp,
  formatFrequency,
  formatGain,
  formatQ,
  frequencyToRatio,
  isBandActive,
  ratioToFrequency,
  totalResponse,
} from "../../helpers/eq";
import type { EQBand, EQGraphProps } from "./ParametricEQ.types";

const FREQUENCY_GRID = [50, 100, 500, 1000, 5000, 10000];
const GAIN_GRID = [12, 0, -12];
/** Analyzer tilt around 1 kHz, so pink noise reads flat — as in most EQ plugins. */
const SPECTRUM_TILT_DB_PER_OCTAVE = 4.5;
/** Semitone step for the arrow keys; Shift moves an octave. */
const SEMITONE = 2 ** (1 / 12);

export const BAND_COLOR_COUNT = 8;
export const bandColorStyle = (index: number) =>
  ({
    "--okkly-parametric-eq-band-color": `var(--okkly-parametric-eq-band-${(index % BAND_COLOR_COUNT) + 1})`,
  }) as CSSProperties;

const formatAxisFrequency = (frequency: number) =>
  frequency >= 1000 ? `${frequency / 1000}k` : String(frequency);

export function EQGraph({
  bands,
  selectedBandId,
  onSelect,
  onBandChange,
  onAdd,
  onRemove,
  canAdd,
  meter,
  spectrumFloor,
  minFrequency,
  maxFrequency,
  gainRange,
  sampleRate,
}: EQGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setSize({ width: root.clientWidth, height: root.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const xOf = (frequency: number) =>
    frequencyToRatio(frequency, minFrequency, maxFrequency) * width;
  const yOf = (gain: number) => height / 2 - (gain / gainRange) * (height / 2);
  const frequencyAt = (x: number) =>
    ratioToFrequency(clamp(x / width, 0, 1), minFrequency, maxFrequency);
  const gainAt = (y: number) =>
    clamp(((height / 2 - y) / (height / 2)) * gainRange, -gainRange, gainRange);

  // One sample every 2px is smoother than the eye can tell apart.
  const sampleFrequencies = useMemo(() => {
    const count = Math.max(2, Math.ceil(width / 2));
    return Array.from({ length: count + 1 }, (_, i) =>
      ratioToFrequency(i / count, minFrequency, maxFrequency),
    );
  }, [width, minFrequency, maxFrequency]);

  const toPath = (gains: number[]) =>
    gains
      .map((gain, i) => {
        const x = (i / (gains.length - 1)) * width;
        // Keep deep cuts just past the edge rather than miles below it.
        const y = clamp(yOf(gain), -4, height + 4);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const curvePath = toPath(sampleFrequencies.map((f) => totalResponse(bands, f, sampleRate)));

  const selectedIndex = bands.findIndex((band) => band.id === selectedBandId);
  const selected = selectedIndex === -1 ? null : bands[selectedIndex];
  const anySolo = bands.some((band) => band.solo);

  const nodeY = (band: EQBand) =>
    GAIN_FILTER_TYPES.has(band.type)
      ? yOf(band.gain)
      : clamp(yOf(totalResponse(bands, band.frequency, sampleRate)), 0, height);

  let selectedLayer = null;
  if (selected && selected.type !== "off" && width > 0) {
    const response = sampleFrequencies.map((f) => bandResponse(selected, f, sampleRate));
    const line = toPath(response);
    const zero = yOf(0);
    selectedLayer = (
      <g style={bandColorStyle(selectedIndex)}>
        <path
          className="okkly-parametric-eq__band-fill"
          d={`${line} L${width} ${zero} L0 ${zero} Z`}
        />
        <path className="okkly-parametric-eq__band-mirror" d={toPath(response.map((g) => -g))} />
        <line
          className="okkly-parametric-eq__band-guide"
          x1={xOf(selected.frequency)}
          x2={xOf(selected.frequency)}
          y1={0}
          y2={height}
        />
        <line className="okkly-parametric-eq__band-guide" x1={0} x2={width} y1={zero} y2={zero} />
        {GAIN_FILTER_TYPES.has(selected.type) && (
          <line
            className="okkly-parametric-eq__band-guide"
            x1={0}
            x2={width}
            y1={yOf(selected.gain)}
            y2={yOf(selected.gain)}
          />
        )}
      </g>
    );
  }

  // ── Spectrum ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const getSpectrum = meter?.getSpectrum;
    if (!canvas || !getSpectrum || width === 0) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // Computed colours come back as `rgb(r, g, b)`; canvas can't take color-mix().
    const [r = 94, g = 230, b = 193] = (getComputedStyle(canvas).color.match(/\d+(\.\d+)?/g) ?? [])
      .slice(0, 3)
      .map(Number);
    const fill = context.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.26)`);
    fill.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.04)`);

    const step = 3;
    const columns = Math.ceil(width / step) + 1;
    const levels = new Float32Array(columns);
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const spectrum = getSpectrum();
      context.clearRect(0, 0, width, height);
      if (!spectrum) return;
      const { data, sampleRate: rate } = spectrum;
      const binWidth = rate / 2 / data.length;

      for (let column = 0; column < columns; column++) {
        const lo = ratioToFrequency((column * step - step / 2) / width, minFrequency, maxFrequency);
        const hi = ratioToFrequency((column * step + step / 2) / width, minFrequency, maxFrequency);
        const from = Math.max(0, Math.floor(lo / binWidth));
        const to = Math.min(data.length - 1, Math.max(from, Math.ceil(hi / binWidth)));
        let peak = -Infinity;
        for (let bin = from; bin <= to; bin++) peak = Math.max(peak, data[bin]);
        const centre = Math.sqrt(lo * hi);
        levels[column] = peak + SPECTRUM_TILT_DB_PER_OCTAVE * Math.log2(centre / 1000);
      }

      context.beginPath();
      context.moveTo(0, height);
      for (let column = 0; column < columns; column++) {
        const level = clamp((levels[column] - spectrumFloor) / -spectrumFloor, 0, 1);
        context.lineTo(column * step, height - level * height);
      }
      context.lineTo(width, height);
      context.closePath();
      context.fillStyle = fill;
      context.fill();
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [meter, width, height, spectrumFloor, minFrequency, maxFrequency]);

  // ── Interaction ─────────────────────────────────────────────────────────
  const drag = useRef<string | null>(null);

  const pointerPosition = (event: { clientX: number; clientY: number }) => {
    const rect = rootRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleNodePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, band: EQBand) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = band.id;
    onSelect(band.id);
  };

  const handleNodePointerMove = (event: ReactPointerEvent<HTMLButtonElement>, band: EQBand) => {
    if (drag.current !== band.id) return;
    const { x, y } = pointerPosition(event);
    onBandChange(band.id, {
      frequency: frequencyAt(x),
      ...(GAIN_FILTER_TYPES.has(band.type) && { gain: gainAt(y) }),
    });
  };

  const handleNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, band: EQBand) => {
    const coarse = event.shiftKey;
    const patch: Partial<EQBand> = {};
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        const factor = coarse ? 2 : SEMITONE;
        const next = event.key === "ArrowRight" ? band.frequency * factor : band.frequency / factor;
        patch.frequency = clamp(next, minFrequency, maxFrequency);
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
        if (!GAIN_FILTER_TYPES.has(band.type)) return;
        patch.gain = clamp(
          band.gain + (event.key === "ArrowUp" ? 1 : -1) * (coarse ? 3 : 0.5),
          -gainRange,
          gainRange,
        );
        break;
      case "PageUp":
      case "PageDown":
        if (!Q_FILTER_TYPES.has(band.type)) return;
        patch.q = clamp(band.q * (event.key === "PageUp" ? 1.25 : 0.8), MIN_Q, MAX_Q);
        break;
      case "Delete":
      case "Backspace":
        event.preventDefault();
        onRemove(band.id);
        // The focused node is gone; hand focus to the band selected in its place.
        requestAnimationFrame(() =>
          rootRef.current
            ?.querySelector<HTMLElement>(".okkly-parametric-eq__node--selected")
            ?.focus(),
        );
        return;
      default:
        return;
    }
    event.preventDefault();
    onBandChange(band.id, patch);
  };

  // React registers wheel listeners as passive, so the page would scroll too.
  const wheelState = useRef({ bands, selectedBandId, onBandChange });
  wheelState.current = { bands, selectedBandId, onBandChange };
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handleWheel = (event: WheelEvent) => {
      const {
        bands: current,
        selectedBandId: selectedId,
        onBandChange: change,
      } = wheelState.current;
      const nodeId = (event.target as HTMLElement).closest<HTMLElement>("[data-band-id]")?.dataset
        .bandId;
      const band = current.find((b) => b.id === (nodeId ?? selectedId));
      if (!band || !Q_FILTER_TYPES.has(band.type)) return;
      event.preventDefault();
      change(band.id, { q: clamp(band.q * Math.exp(-event.deltaY * 0.0015), MIN_Q, MAX_Q) });
    };
    root.addEventListener("wheel", handleWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleWheel);
  }, []);

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!canAdd || (event.target as HTMLElement).closest("[data-band-id]")) return;
    const { x, y } = pointerPosition(event);
    onAdd({ type: "peaking", frequency: frequencyAt(x), gain: gainAt(y), q: 1 });
  };

  let tooltip = null;
  if (selected && width > 0) {
    const x = clamp(xOf(selected.frequency), 90, width - 90);
    const y = nodeY(selected);
    const parts = [formatFrequency(selected.frequency)];
    if (GAIN_FILTER_TYPES.has(selected.type)) parts.push(formatGain(selected.gain));
    if (Q_FILTER_TYPES.has(selected.type)) parts.push(formatQ(selected.q));
    tooltip = (
      <div
        className={["okkly-parametric-eq__tooltip", y < 56 && "okkly-parametric-eq__tooltip--below"]
          .filter(Boolean)
          .join(" ")}
        style={{ left: x, top: y }}
        aria-hidden="true"
      >
        {parts.map((part, i) => (
          <span key={part}>
            {i > 0 && <span className="okkly-parametric-eq__tooltip-separator">·&nbsp;&nbsp;</span>}
            {part}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="okkly-parametric-eq__graph" onDoubleClick={handleDoubleClick}>
      <canvas ref={canvasRef} className="okkly-parametric-eq__spectrum" aria-hidden="true" />
      {width > 0 && (
        <svg
          className="okkly-parametric-eq__plot"
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          {FREQUENCY_GRID.filter((f) => f > minFrequency && f < maxFrequency).map((f) => (
            <g key={f}>
              <line
                className="okkly-parametric-eq__grid-line"
                x1={xOf(f)}
                x2={xOf(f)}
                y1={0}
                y2={height}
              />
              <text
                className="okkly-parametric-eq__axis-label"
                x={xOf(f)}
                y={height - 8}
                textAnchor="middle"
              >
                {formatAxisFrequency(f)}
              </text>
            </g>
          ))}
          {GAIN_GRID.filter((g) => Math.abs(g) < gainRange).map((g) => (
            <g key={g}>
              <line
                className={[
                  "okkly-parametric-eq__grid-line",
                  g === 0 && "okkly-parametric-eq__grid-line--zero",
                ]
                  .filter(Boolean)
                  .join(" ")}
                x1={0}
                x2={width}
                y1={yOf(g)}
                y2={yOf(g)}
              />
              <text className="okkly-parametric-eq__axis-label" x={8} y={yOf(g) - 5}>
                {g > 0 ? `+${g}` : g}
              </text>
            </g>
          ))}
          {selectedLayer}
          <path className="okkly-parametric-eq__curve" d={curvePath} />
        </svg>
      )}
      {width > 0 &&
        bands.map((band, index) => {
          const isSelected = band.id === selectedBandId;
          const description = [
            band.type,
            formatFrequency(band.frequency),
            GAIN_FILTER_TYPES.has(band.type) && formatGain(band.gain),
            Q_FILTER_TYPES.has(band.type) && formatQ(band.q),
            band.muted && "muted",
            band.solo && "solo",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <button
              key={band.id}
              type="button"
              data-band-id={band.id}
              className={[
                "okkly-parametric-eq__node",
                isSelected && "okkly-parametric-eq__node--selected",
                !isBandActive(band, anySolo) && "okkly-parametric-eq__node--inactive",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ ...bandColorStyle(index), left: xOf(band.frequency), top: nodeY(band) }}
              aria-label={`Band ${index + 1}: ${description}`}
              aria-pressed={isSelected}
              onPointerDown={(event) => handleNodePointerDown(event, band)}
              onPointerMove={(event) => handleNodePointerMove(event, band)}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onFocus={() => onSelect(band.id)}
              onKeyDown={(event) => handleNodeKeyDown(event, band)}
            >
              {index + 1}
            </button>
          );
        })}
      {tooltip}
    </div>
  );
}
