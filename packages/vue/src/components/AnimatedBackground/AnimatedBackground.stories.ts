import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AnimatedBackground from "./AnimatedBackground.vue";
import type { AnimatedBackgroundProps } from "./AnimatedBackground.types";

/**
 * Full-bleed atmospheric scene for dark canvases — nebulae, stars, and subtle motion. Intended as a page backdrop, not a content card.
 */
const meta: Meta<AnimatedBackgroundProps> = {
  title: "Media/AnimatedBackground",
  component: AnimatedBackground,
  args: {
    preset: "aurora",
    quality: "medium",
    parallax: true,
    fireworks: true,
    respectReducedMotion: true,
    scrim: true,
  },
  argTypes: {
    preset: { control: "inline-radio", options: ["aurora", "midnight", "neon", "void"] },
    quality: { control: "inline-radio", options: ["low", "medium", "high"] },
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    () => ({
      template: `<div style="position: relative; width: 100%; height: 100vh"><story /></div>`,
    }),
  ],
};

export default meta;
type Story = StoryObj<AnimatedBackgroundProps>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  name: "Legibility — content over scrim",
  render: (args) => ({
    components: { AnimatedBackground },
    setup: () => ({ args }),
    template: `
      <AnimatedBackground v-bind="args">
        <div style="position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 620px; padding: 0 48px; color: #ecedef; font-family: ui-sans-serif, -apple-system, Segoe UI, Inter, sans-serif">
          <p style="font: 500 11px/1 ui-monospace, monospace; letter-spacing: 0.18em; text-transform: uppercase; color: #5ee6c1; margin: 0 0 22px">
            07 · Backgrounds — live
          </p>
          <h1 style="font-size: clamp(38px, 6.5vw, 76px); line-height: 1.02; letter-spacing: -0.035em; font-weight: 700; margin: 0 0 24px; color: #fff">
            Content stays legible over motion
          </h1>
          <p style="font-size: 20px; line-height: 1.6; color: #c9cbd1; margin: 0 0 32px">
            Nebulae, stars, a falling spark, a distant beacon, micro-fireworks and grain — one SVG
            driven by CSS keyframes. No canvas, no render loop, no runtime dependency.
          </p>
          <p style="font: 500 11px/1 ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #6e7075">
            Switch preset and quality in the controls panel
          </p>
        </div>
      </AnimatedBackground>`,
  }),
};
