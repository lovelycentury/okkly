import { totalResponse } from "../helpers/eq";
import type { EQBand, EQMeterSource } from "../components/ParametricEQ/ParametricEQ.types";

const SAMPLE_RATE = 48000;
const BINS = 2048;

/**
 * A stand-in for live audio in the stories that don't play sound: a drifting
 * pink-noise spectrum shaped by the current bands, so the analyzer and meter
 * react to edits without an `AudioContext`.
 */
export function createDemoMeter(getBands: () => readonly EQBand[]): EQMeterSource {
  const data = new Float32Array(BINS);
  const noise = new Float32Array(BINS);
  const binWidth = SAMPLE_RATE / 2 / BINS;

  return {
    getSpectrum: () => {
      const bands = getBands();
      for (let bin = 1; bin < BINS; bin++) {
        const frequency = bin * binWidth;
        // Slow random walk per bin, pulled back towards 0 so it never drifts off.
        noise[bin] = noise[bin] * 0.92 + (Math.random() - 0.5) * 3.2;
        // Falls at the analyzer's tilt, so it reads flat on the graph.
        const pink = -48 - 4.5 * Math.log2(frequency / 1000);
        data[bin] = pink + noise[bin] + totalResponse(bands, frequency, SAMPLE_RATE);
      }
      data[0] = data[1];
      return { data, sampleRate: SAMPLE_RATE };
    },
    getLevels: () => [-7 + Math.random() * 3, -8 + Math.random() * 3],
  };
}
