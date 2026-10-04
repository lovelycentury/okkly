import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ParametricEQ } from "./ParametricEQ";
import { useParametricEQ } from "./useParametricEQ";
import { PARAMETRIC_EQ_PRESETS, type ParametricEQPresetKey } from "./presets";
import { createDemoMeter } from "../../storybook/demoMeter";
import type { EQBand, ParametricEQProps } from "./ParametricEQ.types";

/**
 * A 7-band-style parametric equalizer with draggable nodes over a live
 * spectrum. Drag a node for frequency and gain, scroll over it for Q,
 * double-click empty space to add a band and press Delete to remove one.
 * Pair it with `useParametricEQ` to process real audio.
 */
const meta = {
  title: "Equalizers/ParametricEQ",
  component: ParametricEQ,
  args: {
    title: "Reference",
    maxBands: 8,
    minFrequency: 20,
    maxFrequency: 20000,
    gainRange: 18,
    sampleRate: 48000,
  },
  argTypes: {
    bands: { control: false },
    defaultBands: { control: false },
    meter: { control: false },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ParametricEQ>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The EQ with its own band state and a demo spectrum that follows the curve. */
function DemoEQ({
  preset,
  defaultSelectedBandId,
  ...props
}: Omit<ParametricEQProps, "bands" | "onBandsChange" | "meter"> & {
  preset: ParametricEQPresetKey;
}) {
  const [bands, setBands] = useState<EQBand[]>(PARAMETRIC_EQ_PRESETS[preset].bands);
  const latest = useRef(bands);
  latest.current = bands;
  const meter = useMemo(() => createDemoMeter(() => latest.current), []);
  const [selected, setSelected] = useState<string | null>(
    defaultSelectedBandId ?? PARAMETRIC_EQ_PRESETS[preset].bands[2]?.id ?? null,
  );
  return (
    <ParametricEQ
      {...props}
      bands={bands}
      onBandsChange={setBands}
      selectedBandId={selected}
      onSelectedBandChange={setSelected}
      meter={meter}
    />
  );
}

/** A use case: a heading, a line on what it is for, then the EQ. */
function UseCase({ preset, selected }: { preset: ParametricEQPresetKey; selected?: number }) {
  const { name, description, bands } = PARAMETRIC_EQ_PRESETS[preset];
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ color: "var(--okkly-text-secondary)", fontSize: "0.875rem" }}>
          {description}
        </div>
      </div>
      <DemoEQ
        preset={preset}
        title={name.split(" — ")[0]}
        defaultSelectedBandId={bands[selected ?? 0]?.id}
        onClose={() => {}}
      />
    </div>
  );
}

/** Play with every prop from the controls panel. */
export const Playground: Story = {
  render: (args) => <DemoEQ {...args} preset="reference" onClose={() => {}} />,
};

/**
 * Real audio through `useParametricEQ`: a synth chord, pink noise, or any
 * audio file from your disk (it never leaves the browser). The spectrum and
 * meter read the hook's analysers, and every edit is audible.
 */
export const WithAudio: Story = {
  render: function Render() {
    const [context, setContext] = useState<AudioContext | null>(null);
    const [source, setSource] = useState<"chord" | "noise" | "file">("chord");
    const [file, setFile] = useState<File | null>(null);
    const [bands, setBands] = useState<EQBand[]>(PARAMETRIC_EQ_PRESETS.reference.bands);
    const [outputGain, setOutputGain] = useState(-6);
    const eq = useParametricEQ({ context, bands, outputGain });

    useEffect(() => {
      if (!context || !eq.input || !eq.output) return;
      // Connecting the same pair twice is a no-op, and the hook disconnects
      // its output when the context goes, so there is nothing to undo here.
      eq.output.connect(context.destination);
      if (source === "file") return file ? playFile(context, eq.input, file) : undefined;
      return source === "noise" ? playPinkNoise(context, eq.input) : playChord(context, eq.input);
    }, [context, eq.input, eq.output, source, file]);

    useEffect(() => () => void context?.close(), [context]);

    const buttonStyle = (active = false) => ({
      padding: "0.375rem 0.875rem",
      border: `1px solid ${active ? "var(--okkly-accent-primary)" : "var(--okkly-border-default)"}`,
      borderRadius: 999,
      background: "var(--okkly-bg-surface-raised)",
      color: active ? "var(--okkly-accent-primary)" : "var(--okkly-text-primary)",
      font: "inherit",
      fontSize: "0.8125rem",
      cursor: "pointer",
    });

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            style={buttonStyle()}
            disabled={source === "file" && !file}
            onClick={() => setContext(context ? null : new AudioContext())}
          >
            {context ? "Stop" : "Play"}
          </button>
          <button
            type="button"
            style={buttonStyle(source === "chord")}
            aria-pressed={source === "chord"}
            onClick={() => setSource("chord")}
          >
            Synth chord
          </button>
          <button
            type="button"
            style={buttonStyle(source === "noise")}
            aria-pressed={source === "noise"}
            onClick={() => setSource("noise")}
          >
            Pink noise
          </button>
          <label style={buttonStyle(source === "file")}>
            {file ? file.name : "Load file…"}
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (!picked) return;
                setFile(picked);
                setSource("file");
                // Start right away; picking a file counts as the user gesture.
                if (!context) setContext(new AudioContext());
              }}
            />
          </label>
          <span style={{ color: "var(--okkly-text-muted)", fontSize: "0.8125rem" }}>
            Mind your volume — output starts at -6 dB.
          </span>
        </div>
        <ParametricEQ
          title={source === "file" && file ? file.name.replace(/\.[^.]+$/, "") : "Live"}
          bands={bands}
          onBandsChange={setBands}
          outputGain={outputGain}
          onOutputGainChange={setOutputGain}
          meter={eq}
          sampleRate={context?.sampleRate ?? 48000}
        />
      </div>
    );
  },
};

/** Vocal clean-up: high-pass, de-mud, presence and air. */
export const Vocal: Story = { render: () => <UseCase preset="vocal" selected={4} /> };

/** Kick drum: sub boom, mud cut, beater click, tamed top. */
export const Kick: Story = { render: () => <UseCase preset="kick" /> };

/** One narrow surgical cut — the selected band shows its own response in colour. */
export const DeMud: Story = { render: () => <UseCase preset="deMud" selected={1} /> };

/** Telephone / lo-fi: everything outside 300 Hz–3 kHz rolled off. */
export const Telephone: Story = { render: () => <UseCase preset="telephone" selected={2} /> };

/** Loudness "smiley" curve with a low shelf selected — shelves have no Q. */
export const Smiley: Story = { render: () => <UseCase preset="smiley" /> };

/** Bands pulled opposite ways, for a jagged curve. */
export const Resonant: Story = { render: () => <UseCase preset="resonant" selected={3} /> };

/** No bands yet — double-click the graph to add up to `maxBands`. */
export const Empty: Story = {
  render: (args) => <DemoEQ {...args} preset="flat" title="New" maxBands={4} />,
};

/** The palette and surfaces retuned through the `--okkly-parametric-eq-*` variables. */
export const CustomStyling: Story = {
  render: (args) => (
    <DemoEQ
      {...args}
      preset="reference"
      title="Custom"
      style={
        {
          "--okkly-parametric-eq-curve-color": "var(--okkly-accent-dante)",
          "--okkly-parametric-eq-spectrum-color": "var(--okkly-accent-violet)",
          "--okkly-parametric-eq-active-color": "var(--okkly-accent-ice)",
          "--okkly-parametric-eq-band-3": "var(--okkly-accent-ice)",
          "--okkly-parametric-eq-graph-height": "20rem",
        } as CSSProperties
      }
    />
  ),
};

/** Streams a local file through an `<audio>` element, looping, so long tracks start instantly. */
function playFile(context: AudioContext, destination: AudioNode, file: File) {
  const url = URL.createObjectURL(file);
  const audio = new Audio(url);
  audio.loop = true;
  const node = context.createMediaElementSource(audio);
  node.connect(destination);
  void audio.play();
  return () => {
    audio.pause();
    node.disconnect();
    URL.revokeObjectURL(url);
  };
}

function playPinkNoise(context: AudioContext, destination: AudioNode) {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    // Paul Kellet's refined pink-noise filter.
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
  }
  const node = context.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  node.connect(destination);
  node.start();
  return () => {
    node.stop();
    node.disconnect();
  };
}

function playChord(context: AudioContext, destination: AudioNode) {
  const gain = context.createGain();
  gain.gain.value = 0.08;
  gain.connect(destination);
  // A minor 9 spread over four octaves, so every band has something to shape.
  const oscillators = [55, 110, 164.81, 261.63, 392, 493.88, 659.25].map((frequency, i) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = (i % 2 ? 1 : -1) * 6;
    oscillator.connect(gain);
    oscillator.start();
    return oscillator;
  });
  return () => {
    for (const oscillator of oscillators) {
      oscillator.stop();
      oscillator.disconnect();
    }
    gain.disconnect();
  };
}
