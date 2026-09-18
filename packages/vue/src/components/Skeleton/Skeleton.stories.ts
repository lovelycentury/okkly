import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Skeleton from "./Skeleton.vue";
import type { SkeletonProps } from "./Skeleton.types";

/**
 * A grey stand-in for content that hasn't arrived. Its job is to hold the exact
 * space the real thing will take, so nothing jumps when the data lands — build
 * the placeholder from the same layout as the loaded view rather than from a
 * generic stack of bars.
 *
 * Every skeleton is `aria-hidden`, because a screen reader has nothing to gain
 * from "loading rectangle". Announce the wait once, on the container, with
 * `aria-busy="true"`.
 */
const meta: Meta<SkeletonProps> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: {
    variant: "text",
    animation: "pulse",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "circular", "rectangular", "rounded"] },
    animation: { control: "inline-radio", options: ["pulse", "wave", false] },
    width: { control: "text" },
    height: { control: "text" },
  },
  render: (args) => ({
    components: { Skeleton },
    setup: () => ({ args, surface }),
    template: `<div :style="surface"><Skeleton v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<SkeletonProps>;

const surface = {
  display: "grid",
  gap: "12px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const card =
  "width: 420px; padding: 18px; border-radius: 14px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); font-family: var(--okkly-font-family-sans)";

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The four shapes. `text` takes the height of a line of body copy; the other
 * three carry their own defaults, which `width` and `height` override.
 */
export const Variants: Story = {
  render: () => ({
    components: { Skeleton },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Skeleton variant="text" />
        <Skeleton variant="circular" />
        <Skeleton variant="rectangular" :height="64" />
        <Skeleton variant="rounded" :height="64" />
      </div>`,
  }),
};

/**
 * A comment row, mid-load: avatar, name, two lines of body. The last line is
 * short on purpose — a paragraph placeholder made of equal bars reads as a table.
 */
export const ListItem: Story = {
  name: "List item",
  render: () => ({
    components: { Skeleton },
    setup: () => ({ card, rows: [0, 1, 2] }),
    template: `
      <div :style="card" aria-busy="true" aria-label="Loading comments">
        <div v-for="row in rows" :key="row" style="display: flex; gap: 14px; padding-block: 10px">
          <Skeleton variant="circular" :width="40" :height="40" />
          <div style="flex: 1; display: grid; gap: 8px">
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>
      </div>`,
  }),
};

/**
 * The same card in both states. Flip between them and nothing moves — that is
 * the test a placeholder has to pass.
 */
export const MatchingTheLoadedView: Story = {
  name: "Matching the loaded view",
  render: () => ({
    components: { Skeleton },
    setup: () => ({ card }),
    template: `
      <div style="display: flex; gap: 20px; flex-wrap: wrap">
        <div :style="card" aria-busy="true" aria-label="Loading project">
          <Skeleton variant="rounded" :height="120" />
          <div style="display: grid; gap: 10px; margin-top: 14px">
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
        </div>
        <div :style="card">
          <div style="height: 120px; border-radius: 14px; background: linear-gradient(135deg, var(--okkly-accent-primary), var(--okkly-accent-secondary))" />
          <div style="display: grid; gap: 6px; margin-top: 14px">
            <strong style="font-size: var(--okkly-font-size-md)">Night drive vol. 2</strong>
            <p style="margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
              Twelve tracks recorded between Kyiv and Berlin, mixed over one very long winter.
            </p>
          </div>
        </div>
      </div>`,
  }),
};

/**
 * `pulse` fades the block, `wave` sweeps a highlight across it, and `false`
 * leaves it still. Under `prefers-reduced-motion` the pulse slows down and the
 * wave stops entirely.
 */
export const Animations: Story = {
  render: () => ({
    components: { Skeleton },
    setup: () => ({
      surface,
      rows: [
        { label: "pulse", animation: "pulse" },
        { label: "wave", animation: "wave" },
        { label: "none", animation: false },
      ],
    }),
    template: `
      <div :style="surface">
        <div v-for="row in rows" :key="row.label" style="display: grid; gap: 8px">
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">{{ row.label }}</span>
          <Skeleton variant="rounded" :height="56" :animation="row.animation" />
        </div>
      </div>`,
  }),
};

/**
 * `width` and `height` take a number (pixels) or any CSS length, so a placeholder
 * can track a fluid layout as easily as a fixed one.
 */
export const Sizing: Story = {
  render: () => ({
    components: { Skeleton },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Skeleton variant="text" :width="120" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" width="100%" height="4rem" />
        <div style="display: flex; gap: 10px">
          <Skeleton variant="circular" :width="28" :height="28" />
          <Skeleton variant="circular" :width="40" :height="40" />
          <Skeleton variant="circular" :width="56" :height="56" />
        </div>
      </div>`,
  }),
};
