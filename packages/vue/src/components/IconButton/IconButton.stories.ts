import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IconButton from "./IconButton.vue";
import type { IconButtonColor, IconButtonProps } from "./IconButton.types";

/** `iconPlus`/`iconX` from `@okkly/icons`, inlined so the stories pull in no build-time import. */
const plusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>`;

/** `aria-label` isn't a declared prop, so it's typed here to reach argTypes. */
type IconButtonArgs = IconButtonProps & { "aria-label"?: string };

/**
 * Renders the component with the icon in the default slot.
 */
const render = (icon: string) => (args: IconButtonArgs) => ({
  components: { IconButton },
  setup() {
    return { args };
  },
  template: `<IconButton v-bind="args">${icon}</IconButton>`,
});

/**
 * Icon-only control for toolbars and dense UIs. Always provide an accessible name via `aria-label` or a Tooltip.
 */
const meta: Meta<IconButtonArgs> = {
  title: "Control/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Add",
    variant: "ghost",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "glass", "solid"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: render(plusIcon),
};

export default meta;
type Story = StoryObj<IconButtonArgs>;

/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = {};
/**
 * This example shows the glass variant.
 */
export const Glass: Story = { args: { variant: "glass" } };
/**
 * This example shows solid.
 */
export const Solid: Story = {
  args: { variant: "solid", "aria-label": "Close" },
  render: render(closeIcon),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { IconButton },
    setup: () => ({ sizes: ["small", "medium", "large"] as const, plusIcon }),
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        <IconButton v-for="size in sizes" :key="size" :size="size" :aria-label="'Add (' + size + ')'">${plusIcon}</IconButton>
      </div>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { IconButton },
    setup: () => ({
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
      ] as const satisfies readonly IconButtonColor[],
    }),
    template: `
      <div style="display: flex; gap: 16px">
        <IconButton
          v-for="color in colors"
          :key="color"
          :color="color"
          variant="glass"
          :aria-label="'Add (' + color + ')'"
        >${plusIcon}</IconButton>
      </div>`,
  }),
};

/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  args: { href: "https://okkly.dev", "aria-label": "Create" },
};
