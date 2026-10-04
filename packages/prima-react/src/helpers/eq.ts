import type { EQBand, EQFilterType } from "../components/ParametricEQ/ParametricEQ.types";

export const MIN_Q = 0.1;
export const MAX_Q = 18;

/** Filter types whose `gain` changes the response; the rest ignore it. */
export const GAIN_FILTER_TYPES: ReadonlySet<EQFilterType> = new Set([
  "peaking",
  "lowshelf",
  "highshelf",
]);

/**
 * Filter types whose `q` changes the response. Web Audio's shelves are fixed
 * at a slope of 1 and ignore `Q`, so the curve drawn here does too — otherwise
 * the graph would show a slope the audio never plays.
 */
export const Q_FILTER_TYPES: ReadonlySet<EQFilterType> = new Set([
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
  "peaking",
]);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Position of `frequency` on a log axis from `min` to `max`, as 0–1. */
export const frequencyToRatio = (frequency: number, min: number, max: number) =>
  Math.log(frequency / min) / Math.log(max / min);

export const ratioToFrequency = (ratio: number, min: number, max: number) =>
  min * (max / min) ** ratio;

/** Whether the band is heard: not off, not muted, and soloed when any band is. */
export const isBandActive = (band: EQBand, anySolo: boolean) =>
  band.type !== "off" && !band.muted && (!anySolo || !!band.solo);

/**
 * Magnitude response of one band at `frequency`, in dB.
 *
 * Uses the biquad coefficients the Web Audio spec defines for
 * `BiquadFilterNode` (the Audio EQ Cookbook, with shelves at S = 1), so the
 * curve matches what `useParametricEQ` plays. `q` is always linear here; the
 * hook converts it to dB for the low/high-pass nodes, which take `Q` in dB.
 */
export function bandResponse(band: EQBand, frequency: number, sampleRate: number): number {
  if (band.type === "off") return 0;

  const nyquist = sampleRate / 2;
  const f0 = clamp(band.frequency, 1, nyquist - 1);
  const w0 = (2 * Math.PI * f0) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const q = clamp(band.q, MIN_Q, MAX_Q);
  const alpha = sin / (2 * q);
  const A = 10 ** (band.gain / 40);
  const alphaS = (sin / 2) * Math.SQRT2;
  const sqrtA2alpha = 2 * Math.sqrt(A) * alphaS;

  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;
  switch (band.type) {
    case "lowpass":
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = b0;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "highpass":
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = b0;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "bandpass":
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "notch":
      b0 = 1;
      b1 = -2 * cos;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
      break;
    case "peaking":
      b0 = 1 + alpha * A;
      b1 = -2 * cos;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cos;
      a2 = 1 - alpha / A;
      break;
    case "lowshelf":
      b0 = A * (A + 1 - (A - 1) * cos + sqrtA2alpha);
      b1 = 2 * A * (A - 1 - (A + 1) * cos);
      b2 = A * (A + 1 - (A - 1) * cos - sqrtA2alpha);
      a0 = A + 1 + (A - 1) * cos + sqrtA2alpha;
      a1 = -2 * (A - 1 + (A + 1) * cos);
      a2 = A + 1 + (A - 1) * cos - sqrtA2alpha;
      break;
    case "highshelf":
      b0 = A * (A + 1 + (A - 1) * cos + sqrtA2alpha);
      b1 = -2 * A * (A - 1 + (A + 1) * cos);
      b2 = A * (A + 1 + (A - 1) * cos - sqrtA2alpha);
      a0 = A + 1 - (A - 1) * cos + sqrtA2alpha;
      a1 = 2 * (A - 1 - (A + 1) * cos);
      a2 = A + 1 - (A - 1) * cos - sqrtA2alpha;
      break;
  }

  const w = (2 * Math.PI * clamp(frequency, 0, nyquist)) / sampleRate;
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cos2W = Math.cos(2 * w);
  const sin2W = Math.sin(2 * w);
  const numRe = b0 + b1 * cosW + b2 * cos2W;
  const numIm = b1 * sinW + b2 * sin2W;
  const denRe = a0 + a1 * cosW + a2 * cos2W;
  const denIm = a1 * sinW + a2 * sin2W;
  const magnitudeSquared = (numRe ** 2 + numIm ** 2) / (denRe ** 2 + denIm ** 2);

  // A notch or cut reaches -∞ dB at its centre; floor it so paths stay finite.
  return Math.max(-120, 10 * Math.log10(magnitudeSquared));
}

/** Summed response of every active band at `frequency`, in dB. */
export function totalResponse(
  bands: readonly EQBand[],
  frequency: number,
  sampleRate: number,
): number {
  const anySolo = bands.some((band) => band.solo);
  let total = 0;
  for (const band of bands) {
    if (isBandActive(band, anySolo)) total += bandResponse(band, frequency, sampleRate);
  }
  return total;
}

/** `210 Hz`, `3 kHz`, `12.5 kHz`. */
export function formatFrequency(frequency: number): string {
  if (frequency >= 1000) {
    const khz = frequency / 1000;
    return `${Number(khz.toFixed(khz >= 10 ? 1 : 2))} kHz`;
  }
  return `${Math.round(frequency)} Hz`;
}

/** `+4.5 dB`, `-9.2 dB`, `0.0 dB`. */
export function formatGain(gain: number): string {
  const rounded = Math.round(gain * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)} dB`;
}

export const formatQ = (q: number) => `Q ${q.toFixed(1)}`;

let bandCount = 0;
/** An id unique within the page, for bands added on the graph. */
export const createBandId = () => `band-${Date.now().toString(36)}-${(bandCount++).toString(36)}`;
