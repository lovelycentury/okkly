import type { EQBand, EQFilterType, EQPreset } from "./ParametricEQ.types";

type BandSpec = [type: EQFilterType, frequency: number, gain: number, q: number];

const preset = (key: string, name: string, description: string, specs: BandSpec[]): EQPreset => ({
  name,
  description,
  bands: specs.map(([type, frequency, gain, q], i): EQBand => ({
    id: `${key}-${i + 1}`,
    type,
    frequency,
    gain,
    q,
  })),
});

/** Starting points for common jobs, from flat to surgical. */
export const PARAMETRIC_EQ_PRESETS = {
  flat: preset("flat", "Flat / Reset", "No bands — the signal passes untouched.", []),
  reference: preset(
    "reference",
    "Reference",
    "Low-shelf lift · mid ripple · air shelf — the plugin at rest.",
    [
      ["lowshelf", 45, 2.5, 0.7],
      ["peaking", 120, -1.5, 1.2],
      ["peaking", 210, 4.5, 1.4],
      ["peaking", 750, -3.5, 1.2],
      ["peaking", 2200, 2.5, 1],
      ["peaking", 5200, -1.5, 1.2],
      ["highshelf", 12000, 3, 0.7],
    ],
  ),
  vocal: preset(
    "vocal",
    "Vocal — Clarity",
    "HPF @80 · de-mud @250 · presence @3k · air shelf @12k.",
    [
      ["highpass", 80, 0, 0.9],
      ["peaking", 250, -3, 1.4],
      ["peaking", 500, -0.5, 1],
      ["peaking", 1100, 0.5, 1],
      ["peaking", 3000, 4.7, 1.9],
      ["peaking", 6500, 1, 1.2],
      ["highshelf", 12000, 1.5, 0.7],
    ],
  ),
  kick: preset(
    "kick",
    "Kick — Punch",
    "Sub boom @55 · cut mud @400 · beater click @3.5k · tame top.",
    [
      ["peaking", 55, 4.6, 2.6],
      ["peaking", 110, -1.5, 1.4],
      ["peaking", 400, -4, 1.2],
      ["peaking", 800, -1, 1],
      ["peaking", 3500, 3, 1.1],
      ["peaking", 6000, 0, 1],
      ["lowpass", 9000, 0, 0.7],
    ],
  ),
  smiley: preset("smiley", "Smiley — Loudness", "Bass & treble up, mids scooped.", [
    ["lowshelf", 30, 4.5, 1.4],
    ["peaking", 200, -2, 0.9],
    ["peaking", 500, -3, 0.8],
    ["peaking", 1500, -2, 0.9],
    ["peaking", 6000, 3, 0.9],
    ["peaking", 10000, 4, 1],
    ["highshelf", 16000, 6, 0.7],
  ]),
  telephone: preset(
    "telephone",
    "Telephone",
    "Bandpass 300 Hz–3 kHz — vintage phone / radio effect.",
    [
      ["highpass", 300, 0, 0.9],
      ["peaking", 500, 1.5, 1.2],
      ["peaking", 1000, 4.7, 1.4],
      ["peaking", 1800, 2, 1.4],
      ["lowpass", 3000, 0, 0.9],
    ],
  ),
  deMud: preset("de-mud", "De-mud", "One surgical narrow cut @300 Hz — kill the boxiness.", [
    ["highpass", 35, 0, 0.7],
    ["peaking", 300, -9.2, 7.2],
    ["peaking", 800, -1, 1],
    ["peaking", 1500, 0, 1],
    ["peaking", 4000, 0, 1],
    ["peaking", 6500, 0.5, 1],
    ["highshelf", 12000, 0.5, 0.7],
  ]),
  resonant: preset("resonant", "Resonant", "Bands pulled opposite ways — a jagged zig-zag curve.", [
    ["peaking", 50, 7, 3],
    ["peaking", 120, -6, 3],
    ["peaking", 300, 8, 3],
    ["peaking", 835, -8, 3.3],
    ["peaking", 2200, 8, 3],
    ["peaking", 5000, -6, 3],
    ["peaking", 10000, 7, 3],
  ]),
} satisfies Record<string, EQPreset>;

export type ParametricEQPresetKey = keyof typeof PARAMETRIC_EQ_PRESETS;
