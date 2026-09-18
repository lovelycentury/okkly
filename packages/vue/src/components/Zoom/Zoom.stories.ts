import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Button from "../Button/Button.vue";
import Zoom from "./Zoom.vue";

/**
 * Scale only, from nothing: the child grows out of a single point rather than
 * arriving already sized. Good for a floating action button, a badge, anything
 * that should feel like it popped into place rather than opened.
 *
 * Props follow MUI's Zoom.
 */
const meta: Meta<typeof Zoom> = {
  title: "Helpers/Transitions/Zoom",
  component: Zoom,
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
    components: { Zoom },
    setup() {
      return { args, surfaceStyle, badgeStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Zoom v-bind="args">
          <div :style="badgeStyle">+</div>
        </Zoom>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof Zoom>;

const surfaceStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const badgeStyle = {
  display: "grid",
  placeItems: "center",
  width: "56px",
  height: "56px",
  borderRadius: "999px",
  background: "var(--okkly-accent-primary)",
  color: "var(--okkly-text-inverse, #fff)",
  fontSize: "1.5rem",
  boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.4)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A floating action button that pops in once the page has settled, rather than
 * being there from the first paint.
 */
export const AFloatingButton: Story = {
  name: "A floating action button",
  render: () => ({
    components: { Button, Zoom },
    setup() {
      const shown = ref(true);
      return { shown, surfaceStyle, badgeStyle };
    },
    template: `
      <div :style="surfaceStyle">
        <Button size="small" variant="secondary" @click="shown = !shown">Toggle</Button>
        <Zoom :in="shown">
          <div :style="badgeStyle">+</div>
        </Zoom>
      </div>`,
  }),
};
