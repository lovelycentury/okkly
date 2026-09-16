import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Spinner from "./Spinner.vue";
import type { SpinnerColor, SpinnerProps } from "./Spinner.types";

const surfaceStyle =
  "display: flex; align-items: center; gap: 24px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const captionStyle = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/**
 * An indeterminate loading ring for waits too short or too unpredictable to
 * measure.
 *
 * The ring is a `role="status"` region labelled "Loading". Override
 * `aria-label` to say what is loading; if the spinner sits inside a button
 * that already says so, hide it with `aria-hidden` rather than announcing
 * twice.
 */
const meta: Meta<SpinnerProps> = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: {
    size: "medium",
    color: "primary",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    thickness: { control: { type: "range", min: 1, max: 8, step: 0.5 } },
  },
  render: (args) => ({
    components: { Spinner },
    setup: () => ({ args }),
    template: `<div style="${surfaceStyle}"><Spinner v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<SpinnerProps>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The three presets.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="${surfaceStyle}">
        <div v-for="size in sizes" :key="size" style="display: grid; justify-items: center; gap: 10px">
          <Spinner :size="size" />
          <span style="${captionStyle}">{{ size }}</span>
        </div>
      </div>`,
  }),
};

/**
 * A panel waiting on its first response.
 */
export const LoadingPanel: Story = {
  name: "Loading a panel",
  render: () => ({
    components: { Spinner },
    template: `
      <div style="display: grid; place-items: center; gap: 14px; width: 420px; height: 220px; border-radius: 14px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); font-family: var(--okkly-font-family-sans)">
        <Spinner size="large" aria-label="Loading your projects" />
        <span style="${captionStyle}">Loading your projects…</span>
      </div>`,
  }),
};

/**
 * Inside a control, the surrounding text is already the label — so the ring
 * is marked `aria-hidden` to keep it from being announced a second time.
 */
export const InlineWithText: Story = {
  name: "Inline with text",
  render: () => ({
    components: { Spinner },
    template: `
      <div style="${surfaceStyle}; flex-direction: column; align-items: flex-start; gap: 16px">
        <span style="display: inline-flex; align-items: center; gap: 10px; ${captionStyle}">
          <Spinner size="small" aria-hidden="true" />
          Checking availability…
        </span>
      </div>`,
  }),
};

/**
 * `thickness` overrides the preset stroke.
 */
export const Thickness: Story = {
  render: () => ({
    components: { Spinner },
    setup: () => ({ thicknesses: [1.5, 3, 5] }),
    template: `
      <div style="${surfaceStyle}">
        <div v-for="thickness in thicknesses" :key="thickness" style="display: grid; justify-items: center; gap: 10px">
          <Spinner size="large" :thickness="thickness" />
          <span style="${captionStyle}">{{ thickness }}</span>
        </div>
      </div>`,
  }),
};

/**
 * Every tone.
 */
export const Colors: Story = {
  render: () => ({
    components: { Spinner },
    setup: () => ({
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ] satisfies SpinnerColor[],
    }),
    template: `
      <div style="${surfaceStyle}; flex-wrap: wrap; gap: 20px">
        <div v-for="color in colors" :key="color" style="display: grid; justify-items: center; gap: 8px">
          <Spinner :color="color" />
          <span style="${captionStyle}">{{ color }}</span>
        </div>
      </div>`,
  }),
};
