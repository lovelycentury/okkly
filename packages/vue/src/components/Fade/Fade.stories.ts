import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Fade from "./Fade.vue";

/**
 * Opacity only: the plainest transition in the family, for content that should
 * simply be there or not, with no motion cue about where it came from. Prefer
 * `Grow` or `Zoom` when the thing appearing belongs *to* something else on the
 * page — a menu, a popover — and the direction of travel matters.
 *
 * Props follow MUI's Fade. The default slot must be a single element; `Fade`
 * writes its class, style and opacity onto it directly through Vue's
 * `<Transition>` hooks rather than cloning it, which is React's mechanism and
 * has no Vue equivalent.
 */
const meta: Meta<typeof Fade> = {
  title: "Helpers/Transitions/Fade",
  component: Fade,
  args: {
    in: true,
    appear: true,
    keepMounted: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    keepMounted: { control: "boolean" },
    timeout: { control: false },
    easing: { control: false },
  },
  render: (args) => ({
    components: { Fade },
    setup() {
      return { args, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Fade v-bind="args">
          <div :style="panelStyle">Toggle \`in\` from the controls panel.</div>
        </Fade>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Fade>;

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
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * `keepMounted` keeps the panel in the DOM, hidden with `display: none` once it
 * closes, instead of removing it — worth it when the content is expensive to
 * build or holds state you do not want to lose.
 */
export const Toggle: Story = {
  render: () => ({
    components: { Button, Fade },
    setup() {
      const open = ref(false);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = !open">
          {{ open ? 'Hide' : 'Show' }}
        </Button>
        <Fade :in="open" keep-mounted>
          <div :style="panelStyle">Stays in the DOM while hidden — inspect it.</div>
        </Fade>
      </div>`,
  }),
};

/**
 * A fixed `timeout` — a number for both directions, or `{ enter, exit }` for a
 * quick appearance and a slower dismissal.
 */
export const Timeouts: Story = {
  render: () => ({
    components: { Button, Fade },
    setup() {
      const open = ref(true);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="open = !open">Toggle both</Button>
        <Fade :in="open" :timeout="150">
          <div :style="panelStyle">150ms</div>
        </Fade>
        <Fade :in="open" :timeout="{ enter: 100, exit: 600 }">
          <div :style="panelStyle">Fast in, slow out</div>
        </Fade>
      </div>`,
  }),
};
