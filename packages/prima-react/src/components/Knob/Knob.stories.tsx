import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Knob } from "./Knob";
import { formatFrequency, formatGain } from "../../helpers/eq";

/**
 * A rotary control for one continuous value — frequency, gain, Q, output.
 * Drag up/down (Shift for fine), use the arrow keys, or double-click to reset.
 */
const meta = {
  title: "Controls/Knob",
  component: Knob,
  args: {
    value: 0.5,
    min: 0,
    max: 1,
    scale: "linear",
    label: "Mix",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    scale: { control: "inline-radio", options: ["linear", "log"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Play with every prop from the controls panel. */
export const Playground: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Knob {...args} value={value} onChange={setValue} />;
  },
};

/** A band's controls: log frequency, bipolar gain that resets to 0, log Q. */
export const BandControls: Story = {
  render: function Render() {
    const [frequency, setFrequency] = useState(1000);
    const [gain, setGain] = useState(4.5);
    const [q, setQ] = useState(1.4);
    return (
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "1.25rem 1.5rem",
          borderRadius: "1rem",
          border: "1px solid var(--okkly-border-subtle)",
          background: "var(--okkly-bg-surface)",
        }}
      >
        <Knob
          label="Freq"
          scale="log"
          min={20}
          max={20000}
          value={frequency}
          defaultValue={1000}
          formatValue={formatFrequency}
          onChange={setFrequency}
        />
        <Knob
          label="Gain"
          min={-18}
          max={18}
          value={gain}
          defaultValue={0}
          formatValue={formatGain}
          onChange={setGain}
        />
        <Knob
          label="BW"
          scale="log"
          min={0.1}
          max={18}
          value={q}
          defaultValue={1}
          onChange={setQ}
        />
      </div>
    );
  },
};

/** Sizes, side by side. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "end" }}>
      <Knob size="small" label="Small" value={0.3} />
      <Knob label="Medium" value={0.6} />
      <Knob size="large" label="Large" value={0.9} />
      <Knob label="Disabled" value={0.5} disabled />
    </div>
  ),
};

/** Retuned through the `--okkly-knob-*` variables. */
export const CustomStyling: Story = {
  render: (args) => (
    <Knob
      {...args}
      style={
        {
          "--okkly-knob-tone": "var(--okkly-accent-dante)",
          "--okkly-knob-size": "4rem",
          "--okkly-knob-stroke-width": "2",
        } as CSSProperties
      }
    />
  ),
};
