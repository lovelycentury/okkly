import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Grow from "./Grow.vue";

/**
 * Scale and opacity together: the child starts at 75% and slightly squashed, and
 * settles into place as it fades in. It is the transition for things that come
 * *from* somewhere — a menu out of its trigger, a popover off its anchor, a card
 * out of the row it belongs to. `Popover` is built on this.
 *
 * The direction is `transform-origin`, which defaults to the centre. Set it to
 * the corner nearest the trigger and the panel appears to unfold from it.
 *
 * Props follow MUI's Grow.
 */
const meta: Meta<typeof Grow> = {
  title: "Helpers/Transitions/Grow",
  component: Grow,
  args: {
    in: true,
    appear: true,
    keepMounted: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    keepMounted: { control: "boolean" },
    timeout: { control: "select", options: ["auto", 150, 300, 800] },
    easing: { control: false },
  },
  render: (args) => ({
    components: { Grow },
    setup() {
      return { args, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Grow v-bind="args">
          <div :style="panelStyle">Toggle \`in\` from the controls panel.</div>
        </Grow>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Grow>;

const surfaceStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "420px",
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
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * What it is for: a menu unfolding from the button that opened it. The
 * `transform-origin` is the top-left corner — the corner touching the trigger.
 */
export const AMenu: Story = {
  name: "A menu",
  render: () => ({
    components: { Button, Grow },
    setup() {
      const open = ref(false);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, gap: '8px' }">
        <Button size="small" variant="secondary" @click="open = !open">
          {{ open ? 'Close' : 'Open' }} the menu
        </Button>
        <Grow :in="open" style="transform-origin: top left">
          <div :style="{ ...panelStyle, padding: '6px', width: '220px' }">
            <div style="padding: 10px 14px">Duplicate</div>
            <div style="padding: 10px 14px">Move to…</div>
            <div style="padding: 10px 14px">Rename</div>
            <div style="padding: 10px 14px">Delete</div>
          </div>
        </Grow>
      </div>`,
  }),
};

/**
 * `"auto"` scales the duration with the child's height, so a four-line panel and
 * a one-line one feel like the same gesture. A fixed number gives them the same
 * clock instead, which makes the tall one look slow and the short one abrupt.
 */
export const AutoDuration: Story = {
  name: "Auto duration",
  render: () => ({
    components: { Button, Grow },
    setup() {
      const open = ref(true);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, width: '560px' }">
        <Button size="small" variant="secondary" @click="open = !open">Replay both columns</Button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start">
          <Grow :in="open" timeout="auto">
            <div :style="panelStyle">Short, auto.</div>
          </Grow>
          <Grow :in="open" :timeout="300">
            <div :style="panelStyle">Short, 300ms.</div>
          </Grow>
          <Grow :in="open" timeout="auto">
            <div :style="panelStyle">
              Tall, auto. Four lines of copy, enough for the derived duration to pull ahead of the
              short panel next to it — and both still feel like one speed.
            </div>
          </Grow>
          <Grow :in="open" :timeout="300">
            <div :style="panelStyle">
              Tall, 300ms. The same four lines on a fixed clock, arriving faster than its own size
              suggests and reading as clipped.
            </div>
          </Grow>
        </div>
      </div>`,
  }),
};
