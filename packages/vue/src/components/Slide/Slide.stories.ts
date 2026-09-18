import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Slide from "./Slide.vue";

/**
 * Enters and exits along one edge — the transition behind a drawer, a toast, a
 * bottom sheet. Direction is where it comes *from*; it leaves the same way.
 *
 * Props follow MUI's Slide.
 */
const meta: Meta<typeof Slide> = {
  title: "Helpers/Transitions/Slide",
  component: Slide,
  args: {
    in: true,
    appear: true,
    direction: "up",
    keepMounted: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    direction: { control: "inline-radio", options: ["up", "down", "left", "right"] },
    keepMounted: { control: "boolean" },
    timeout: { control: false },
    easing: { control: false },
    container: { control: false },
  },
  render: (args) => ({
    components: { Slide },
    setup() {
      return { args, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Slide v-bind="args">
          <div :style="panelStyle">Toggle \`in\` from the controls panel.</div>
        </Slide>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Slide>;

const surfaceStyle = {
  overflow: "hidden",
  padding: "8px",
  width: "420px",
  height: "160px",
  border: "var(--okkly-1px-in-rem) dashed var(--okkly-border-default)",
  borderRadius: "12px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panelStyle = {
  padding: "20px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "14px",
  background: "var(--okkly-bg-surface-raised)",
  color: "var(--okkly-text-secondary)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A bottom sheet: `direction="up"`, anchored to the bottom of its container by
 * the story's own layout, not by Slide.
 */
export const ABottomSheet: Story = {
  name: "A bottom sheet",
  render: () => ({
    components: { Button, Slide },
    setup() {
      const open = ref(false);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-family: var(--okkly-font-family-sans)">
        <Button size="small" variant="secondary" @click="open = !open">
          {{ open ? 'Close' : 'Open' }} the sheet
        </Button>
        <div :style="{ ...surfaceStyle, display: 'flex', alignItems: 'flex-end' }">
          <Slide :in="open" direction="up" style="width: 100%">
            <div :style="{ ...panelStyle, width: '100%', boxSizing: 'border-box' }">
              Slides up from the bottom edge.
            </div>
          </Slide>
        </div>
      </div>`,
  }),
};

/**
 * All four directions, replayed together.
 */
export const Directions: Story = {
  render: () => ({
    components: { Button, Slide },
    setup() {
      const open = ref(true);
      const directions = ["up", "down", "left", "right"] as const;
      return { open, directions, surfaceStyle, panelStyle };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; font-family: var(--okkly-font-family-sans)">
        <Button size="small" variant="secondary" @click="open = !open">Toggle all four</Button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
          <div v-for="direction in directions" :key="direction" :style="surfaceStyle">
            <Slide :in="open" :direction="direction">
              <div :style="panelStyle">{{ direction }}</div>
            </Slide>
          </div>
        </div>
      </div>`,
  }),
};
