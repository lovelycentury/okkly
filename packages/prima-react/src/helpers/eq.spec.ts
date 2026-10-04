import { describe, expect, it } from "vitest";
import {
  bandResponse,
  formatFrequency,
  formatGain,
  frequencyToRatio,
  ratioToFrequency,
  totalResponse,
} from "./eq";
import type { EQBand } from "../components/ParametricEQ/ParametricEQ.types";

const SR = 48000;
const band = (patch: Partial<EQBand>): EQBand => ({
  id: "b",
  type: "peaking",
  frequency: 1000,
  gain: 0,
  q: 1,
  ...patch,
});

describe("bandResponse", () => {
  it("should reach the band's gain at its centre for a peaking band", () => {
    expect(bandResponse(band({ gain: 6 }), 1000, SR)).toBeCloseTo(6, 3);
    expect(bandResponse(band({ gain: -9 }), 1000, SR)).toBeCloseTo(-9, 3);
  });

  it("should stay flat far from a peaking band's centre", () => {
    expect(Math.abs(bandResponse(band({ gain: 6, q: 4 }), 50, SR))).toBeLessThan(0.1);
  });

  it("should be -3 dB at the corner of a Butterworth low pass", () => {
    const lowpass = band({ type: "lowpass", q: Math.SQRT1_2 });
    expect(bandResponse(lowpass, 1000, SR)).toBeCloseTo(-3.01, 1);
    expect(bandResponse(lowpass, 20, SR)).toBeCloseTo(0, 1);
  });

  it("should reach half the gain at a shelf's corner and the full gain beyond it", () => {
    const shelf = band({ type: "lowshelf", gain: 12 });
    expect(bandResponse(shelf, 1000, SR)).toBeCloseTo(6, 1);
    expect(bandResponse(shelf, 20, SR)).toBeCloseTo(12, 0);
  });

  it("should cut deep at a notch's centre", () => {
    expect(bandResponse(band({ type: "notch", q: 5 }), 1000, SR)).toBeLessThan(-60);
  });

  it("should be flat for an off band", () => {
    expect(bandResponse(band({ type: "off", gain: 12 }), 1000, SR)).toBe(0);
  });
});

describe("totalResponse", () => {
  const bands = [band({ id: "a", gain: 6 }), band({ id: "b", gain: 3, frequency: 8000, q: 4 })];

  it("should sum the active bands", () => {
    expect(totalResponse(bands, 1000, SR)).toBeCloseTo(
      bandResponse(bands[0], 1000, SR) + bandResponse(bands[1], 1000, SR),
      6,
    );
  });

  it("should skip muted bands", () => {
    expect(totalResponse([{ ...bands[0], muted: true }], 1000, SR)).toBe(0);
  });

  it("should hear only soloed bands when any band is soloed", () => {
    const soloed = [bands[0], { ...bands[1], solo: true }];
    expect(totalResponse(soloed, 8000, SR)).toBeCloseTo(bandResponse(bands[1], 8000, SR), 6);
  });
});

describe("frequency axis", () => {
  it("should round-trip between frequency and log ratio", () => {
    expect(frequencyToRatio(20, 20, 20000)).toBe(0);
    expect(frequencyToRatio(20000, 20, 20000)).toBeCloseTo(1, 10);
    expect(ratioToFrequency(frequencyToRatio(440, 20, 20000), 20, 20000)).toBeCloseTo(440, 6);
  });
});

describe("formatting", () => {
  it("should format frequencies and gains like the design", () => {
    expect(formatFrequency(210)).toBe("210 Hz");
    expect(formatFrequency(3000)).toBe("3 kHz");
    expect(formatFrequency(12500)).toBe("12.5 kHz");
    expect(formatGain(4.54)).toBe("+4.5 dB");
    expect(formatGain(-9.2)).toBe("-9.2 dB");
    expect(formatGain(0)).toBe("0.0 dB");
  });
});
