"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isBandActive } from "../../helpers/eq";
import type {
  EQBand,
  EQSpectrumFrame,
  UseParametricEQOptions,
  UseParametricEQReturn,
} from "./ParametricEQ.types";

/** Time constant for parameter changes — short enough to feel instant, long enough not to click. */
const RAMP = 0.012;

interface Graph {
  input: GainNode;
  output: GainNode;
  analyser: AnalyserNode;
  channels: [AnalyserNode, AnalyserNode];
  filters: Map<string, BiquadFilterNode>;
  chain: string;
}

/**
 * Runs `bands` through a chain of `BiquadFilterNode`s on `context`. Connect
 * your source to `input` and `output` to wherever it should go; pass the
 * return value to `ParametricEQ`'s `meter` for the spectrum and output meter.
 *
 * Bands that are off, muted, or not soloed while another band is are left out
 * of the chain. Shelves follow Web Audio and ignore `q`.
 */
export function useParametricEQ({
  context,
  bands,
  outputGain = 0,
  fftSize = 8192,
}: UseParametricEQOptions): UseParametricEQReturn {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    if (!context) return;
    const input = context.createGain();
    const output = context.createGain();
    const analyser = context.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.8;
    const splitter = context.createChannelSplitter(2);
    const channels: [AnalyserNode, AnalyserNode] = [
      context.createAnalyser(),
      context.createAnalyser(),
    ];
    output.connect(analyser);
    output.connect(splitter);
    channels.forEach((channel, i) => {
      channel.fftSize = 1024;
      splitter.connect(channel, i);
    });
    input.connect(output);
    const created: Graph = { input, output, analyser, channels, filters: new Map(), chain: "" };
    setGraph(created);
    return () => {
      for (const node of [
        input,
        output,
        analyser,
        splitter,
        ...channels,
        ...created.filters.values(),
      ]) {
        node.disconnect();
      }
      setGraph(null);
    };
  }, [context, fftSize]);

  useEffect(() => {
    if (!graph || !context) return;
    const now = context.currentTime;
    const anySolo = bands.some((band) => band.solo);

    for (const [id, filter] of graph.filters) {
      if (!bands.some((band) => band.id === id)) {
        filter.disconnect();
        graph.filters.delete(id);
      }
    }

    const active: BiquadFilterNode[] = [];
    for (const band of bands) {
      if (!isBandActive(band, anySolo)) continue;
      let filter = graph.filters.get(band.id);
      if (!filter) {
        filter = context.createBiquadFilter();
        graph.filters.set(band.id, filter);
      }
      applyBand(filter, band, now);
      active.push(filter);
    }

    // Rewire only when the set or order of active bands changed; parameter
    // edits ramp in place so dragging a node doesn't glitch the audio.
    const chain = bands
      .filter((band) => isBandActive(band, anySolo))
      .map((band) => band.id)
      .join("|");
    if (chain !== graph.chain) {
      graph.input.disconnect();
      for (const filter of graph.filters.values()) filter.disconnect();
      const nodes: AudioNode[] = [graph.input, ...active, graph.output];
      for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
      graph.chain = chain;
    }
  }, [graph, context, bands]);

  useEffect(() => {
    if (!graph || !context) return;
    graph.output.gain.setTargetAtTime(10 ** (outputGain / 20), context.currentTime, RAMP);
  }, [graph, context, outputGain]);

  const spectrumBuffer = useRef<Float32Array<ArrayBuffer> | null>(null);
  const levelBuffer = useRef<Float32Array<ArrayBuffer> | null>(null);

  return useMemo<UseParametricEQReturn>(() => {
    if (!graph || !context) {
      return {
        input: null,
        output: null,
        analyser: null,
        getSpectrum: () => null,
        getLevels: () => null,
      };
    }
    const { analyser, channels } = graph;
    return {
      input: graph.input,
      output: graph.output,
      analyser,
      getSpectrum: (): EQSpectrumFrame => {
        if (spectrumBuffer.current?.length !== analyser.frequencyBinCount) {
          spectrumBuffer.current = new Float32Array(analyser.frequencyBinCount);
        }
        analyser.getFloatFrequencyData(spectrumBuffer.current);
        return { data: spectrumBuffer.current, sampleRate: context.sampleRate };
      },
      getLevels: () => {
        const levels = channels.map((channel) => {
          if (levelBuffer.current?.length !== channel.fftSize) {
            levelBuffer.current = new Float32Array(channel.fftSize);
          }
          const buffer = levelBuffer.current;
          channel.getFloatTimeDomainData(buffer);
          let peak = 0;
          for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
          return peak > 0 ? 20 * Math.log10(peak) : -Infinity;
        });
        return [levels[0], levels[1]] as const;
      },
    };
  }, [graph, context]);
}

function applyBand(filter: BiquadFilterNode, band: EQBand, now: number) {
  if (band.type === "off") return;
  if (filter.type !== band.type) filter.type = band.type;
  const nyquist = filter.context.sampleRate / 2;
  filter.frequency.setTargetAtTime(Math.min(band.frequency, nyquist - 1), now, RAMP);
  filter.gain.setTargetAtTime(band.gain, now, RAMP);
  // Web Audio takes low/high-pass Q in dB (resonance); every other type takes it linear.
  const q = band.type === "lowpass" || band.type === "highpass" ? 20 * Math.log10(band.q) : band.q;
  filter.Q.setTargetAtTime(q, now, RAMP);
}
