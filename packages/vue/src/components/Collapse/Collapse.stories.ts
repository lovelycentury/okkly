import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Collapse from "./Collapse.vue";

/**
 * Height (or width) only, animated between `collapsedSize` and the content's own
 * size — an accordion panel, "show more", a details row. Unlike the rest of the
 * transition family it owns a wrapper of its own, so the content stays mounted by
 * default and there is nothing to clone.
 *
 * Props follow MUI's Collapse.
 */
const meta: Meta<typeof Collapse> = {
  title: "Helpers/Transitions/Collapse",
  component: Collapse,
  args: {
    in: true,
    appear: true,
    orientation: "vertical",
    unmountOnExit: false,
  },
  argTypes: {
    in: { control: "boolean" },
    appear: { control: "boolean" },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    unmountOnExit: { control: "boolean" },
    collapsedSize: { control: "text" },
    timeout: { control: false },
    easing: { control: false },
  },
  render: (args) => ({
    components: { Collapse },
    setup() {
      return { args, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Collapse v-bind="args">
          <div :style="panelStyle">Toggle \`in\` from the controls panel.</div>
        </Collapse>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Collapse>;

const surfaceStyle = {
  width: "360px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panelStyle = {
  padding: "16px",
  border: "var(--okkly-1px-in-rem) solid var(--okkly-border-subtle)",
  borderRadius: "10px",
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
 * "Show more": text stays in the DOM (`unmountOnExit` is off by default), only
 * its box collapses to nothing.
 */
export const ShowMore: Story = {
  name: "Show more",
  render: () => ({
    components: { Button, Collapse },
    setup() {
      const open = ref(false);
      return { open, surfaceStyle, panelStyle };
    },
    template: `
      <div :style="{ ...surfaceStyle, display: 'grid', gap: '8px' }">
        <p style="margin: 0">
          The first line is always visible. The rest expands below it, pushing nothing
          out of place while it grows.
        </p>
        <Collapse :in="open">
          <div :style="panelStyle">
            The part that was hidden. It was in the DOM the whole time — inspect it while
            collapsed.
          </div>
        </Collapse>
        <Button size="small" variant="ghost" @click="open = !open" style="justify-self: start">
          {{ open ? 'Show less' : 'Show more' }}
        </Button>
      </div>`,
  }),
};

/**
 * `orientation="horizontal"` collapses width instead of height — a sidebar
 * that tucks itself away rather than a panel that opens downward.
 */
export const Horizontal: Story = {
  render: () => ({
    components: { Button, Collapse },
    setup() {
      const open = ref(true);
      return { open };
    },
    template: `
      <div style="display: flex; align-items: flex-start; gap: 12px; font-family: var(--okkly-font-family-sans)">
        <Button size="small" variant="secondary" @click="open = !open">Toggle</Button>
        <Collapse :in="open" orientation="horizontal">
          <div style="padding: 16px; width: 200px; box-sizing: border-box; border: var(--okkly-1px-in-rem) solid var(--okkly-border-subtle); border-radius: 10px; background: var(--okkly-bg-surface-raised)">
            A sidebar panel.
          </div>
        </Collapse>
      </div>`,
  }),
};
