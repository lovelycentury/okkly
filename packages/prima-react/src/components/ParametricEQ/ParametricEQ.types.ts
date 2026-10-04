import type { HTMLAttributes, ReactNode } from "react";

/**
 * The response shape of a band. Every type except `"off"` maps to the
 * `BiquadFilterNode` type of the same name; `"off"` bypasses the band.
 */
export type EQFilterType =
  "lowpass" | "bandpass" | "highpass" | "notch" | "lowshelf" | "peaking" | "highshelf" | "off";

/** One band of the equalizer. */
export interface EQBand {
  /** Stable id; keeps a band's selection and audio node across re-renders. */
  id: string;
  /** Response shape. */
  type: EQFilterType;
  /** Centre or corner frequency, in Hz. */
  frequency: number;
  /** Boost or cut, in dB. Only peaking and shelf bands use it. */
  gain: number;
  /** Linear quality factor — higher is narrower. Shelves ignore it. */
  q: number;
  /** Bypass the band while the rest keep working. */
  muted?: boolean;
  /** Hear only soloed bands; every other band is bypassed. */
  solo?: boolean;
}

/** A spectrum frame: `getFloatFrequencyData` output plus its sample rate. */
export interface EQSpectrumFrame {
  /** Magnitude per FFT bin in dBFS, bins spread linearly from 0 Hz to Nyquist. */
  data: Float32Array;
  /** Sample rate the bins were measured at, in Hz. */
  sampleRate: number;
}

/**
 * Live audio readings the component draws — the spectrum behind the curve and
 * the output meter. `useParametricEQ` returns one; anything else with the same
 * shape (a recorded analysis, a test double) works too. Both are polled once a
 * frame while the component is mounted.
 */
export interface EQMeterSource {
  /** The current spectrum, or `null` while there is none. */
  getSpectrum?: () => EQSpectrumFrame | null;
  /** Left and right peak levels in dBFS, or `null` while there are none. */
  getLevels?: () => readonly [number, number] | null;
}

/** A named set of bands — see `PARAMETRIC_EQ_PRESETS`. */
export interface EQPreset {
  /** Display name. */
  name: string;
  /** What the preset is for, in a sentence. */
  description: string;
  /** The bands, ids included. */
  bands: EQBand[];
}

/**
 * A parametric equalizer: a frequency-response graph with draggable band
 * nodes over a live spectrum, a filter-type picker, knobs for the selected
 * band, and an output meter. Purely controlled UI — wire it to audio with
 * `useParametricEQ`, or to anything else through `bands` and `onBandsChange`.
 *
 * On the graph: drag a node to set frequency (x) and gain (y), scroll over it
 * to set Q, double-click empty space to add a band, and press Delete to
 * remove the selected one. Every node is also keyboard-operable.
 */
export interface ParametricEQProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The bands, controlled.
   * @type {EQBand[]}
   */
  bands?: EQBand[];
  /**
   * The initial bands when `bands` is not controlled.
   * @default []
   * @type {EQBand[]}
   */
  defaultBands?: EQBand[];
  /**
   * Called with the next bands on every edit — drag, knob, picker, add, remove.
   * @type {(bands: EQBand[]) => void}
   */
  onBandsChange?: (bands: EQBand[]) => void;
  /**
   * Id of the selected band, controlled.
   * @type {string | null}
   */
  selectedBandId?: string | null;
  /**
   * The initially selected band when `selectedBandId` is not controlled.
   * Defaults to the first band.
   * @type {string | null}
   */
  defaultSelectedBandId?: string | null;
  /**
   * Called when a different band is selected, or `null` when none is.
   * @type {(id: string | null) => void}
   */
  onSelectedBandChange?: (id: string | null) => void;
  /**
   * Output gain in dB, controlled — set with the OUT knob.
   * @type {number}
   */
  outputGain?: number;
  /**
   * The initial output gain when `outputGain` is not controlled.
   * @default 0
   * @type {number}
   */
  defaultOutputGain?: number;
  /**
   * Called when the OUT knob changes the output gain.
   * @type {(gain: number) => void}
   */
  onOutputGainChange?: (gain: number) => void;
  /**
   * Live readings for the spectrum and output meter. Without it both stay empty.
   * @type {EQMeterSource}
   */
  meter?: EQMeterSource;
  /**
   * Text after "Parametric EQ" in the header, e.g. the track or preset name.
   * @type {ReactNode}
   */
  title?: ReactNode;
  /**
   * Shows a close button in the header and calls this when it is pressed.
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * The most bands double-clicking the graph can add up to.
   * @default 8
   * @type {number}
   */
  maxBands?: number;
  /**
   * Lowest frequency on the graph, in Hz.
   * @default 20
   * @type {number}
   */
  minFrequency?: number;
  /**
   * Highest frequency on the graph, in Hz.
   * @default 20000
   * @type {number}
   */
  maxFrequency?: number;
  /**
   * The graph spans ±`gainRange` dB, and band gain is limited to it.
   * @default 18
   * @type {number}
   */
  gainRange?: number;
  /**
   * Sample rate the curve is computed at — match your `AudioContext`.
   * @default 48000
   * @type {number}
   */
  sampleRate?: number;
}

/** Props of the graph inside `ParametricEQ`. */
export interface EQGraphProps {
  bands: EQBand[];
  selectedBandId: string | null;
  onSelect: (id: string | null) => void;
  onBandChange: (id: string, patch: Partial<EQBand>) => void;
  onAdd: (band: Omit<EQBand, "id">) => void;
  onRemove: (id: string) => void;
  canAdd: boolean;
  meter?: EQMeterSource;
  spectrumFloor: number;
  minFrequency: number;
  maxFrequency: number;
  gainRange: number;
  sampleRate: number;
}

/** Props of the output meter inside `ParametricEQ`. */
export interface EQLevelMeterProps {
  meter?: EQMeterSource;
  outputGain: number;
}

/** Options for `useParametricEQ`. */
export interface UseParametricEQOptions {
  /** The context to build the filter chain on; `null` until audio starts. */
  context: BaseAudioContext | null;
  /** The bands to play — usually the same array `ParametricEQ` edits. */
  bands: readonly EQBand[];
  /** Output gain in dB. Defaults to 0. */
  outputGain?: number;
  /** FFT size of the spectrum analyser. Defaults to 8192. */
  fftSize?: number;
}

/** What `useParametricEQ` returns; pass it straight to `ParametricEQ`'s `meter`. */
export interface UseParametricEQReturn extends Required<EQMeterSource> {
  /** Connect the source here. `null` until `context` is set. */
  input: GainNode | null;
  /** Connect this to the destination. `null` until `context` is set. */
  output: GainNode | null;
  /** The post-EQ spectrum analyser, for custom visualisations. */
  analyser: AnalyserNode | null;
}
