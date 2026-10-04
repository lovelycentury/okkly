import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Introduction/Overview",
  tags: ["!autodocs"],
} satisfies Meta;

export default meta;

export const Overview: StoryObj<typeof meta> = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <h1>prima.react</h1>
      <p>
        React components for music and audio — parametric equalizers, reverbs and other effect
        controls — built on the okkly design tokens.
      </p>
    </div>
  ),
};
