import type { Meta, StoryObj } from "@storybook/vue3-vite";
import StaticBackground from "./StaticBackground.vue";
import type { StaticBackgroundProps } from "./StaticBackground.types";

/**
 * SSR-safe atmospheric scene for dark canvases — nebulae, stars and grain, frozen on their resting frame. Intended as a page backdrop, not a content card.
 */
const meta: Meta<StaticBackgroundProps> = {
  title: "Media/StaticBackground",
  component: StaticBackground,
  args: {
    preset: "aurora",
    quality: "medium",
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
type Story = StoryObj<StaticBackgroundProps>;

/**
 * This example shows the default state.
 */
export const Default: Story = {
  name: "Legibility — content over scrim",
  render: (args) => ({
    components: { StaticBackground },
    setup: () => ({ args }),
    template: `
      <StaticBackground v-bind="args">
        <div style="position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 620px; padding: 0 48px; color: #ecedef; font-family: ui-sans-serif, -apple-system, Segoe UI, Inter, sans-serif">
          <p style="font: 500 11px/1 ui-monospace, monospace; letter-spacing: 0.18em; text-transform: uppercase; color: #5ee6c1; margin: 0 0 22px">
            07 · Backgrounds — static
          </p>
          <h1 style="font-size: clamp(38px, 6.5vw, 76px); line-height: 1.02; letter-spacing: -0.035em; font-weight: 700; margin: 0 0 24px; color: #fff">
            Content stays legible from the first paint
          </h1>
          <p style="font-size: 20px; line-height: 1.6; color: #c9cbd1; margin: 0 0 32px">
            Nebulae, stars and grain — one SVG, no animation, no client mount gate. Server-rendered
            markup is already the finished picture.
          </p>
          <p style="font: 500 11px/1 ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #6e7075">
            Switch preset and quality in the controls panel
          </p>
        </div>
      </StaticBackground>`,
  }),
};
