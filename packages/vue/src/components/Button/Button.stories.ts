import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "./Button.vue";
import type { ButtonProps } from "./Button.vue";

/** `iconArrowRight` from `@okkly/icons`, inlined so the stories pull in no build-time import. */
const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>`;

/** `label` fills the default slot; everything else is a prop. */
type ButtonArgs = ButtonProps & { label: string };

/**
 * Renders the component with `label` split back out of the args, so it lands in
 * the default slot instead of falling through to the element as an attribute.
 */
const render = (body: string) => (args: ButtonArgs) => ({
  components: { Button },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `<Button v-bind="props">${body}</Button>`,
});

/**
 * Primary action control for forms, dialogs, and toolbars. Pick variant and color for emphasis — one primary action per view.
 *
 * Renders a native `<button>`, or an `<a>` when given an `href`. Icons are the
 * `start-icon` / `end-icon` slots; the label is the default slot.
 */
const meta: Meta<ButtonArgs> = {
  title: "Control/Button",
  component: Button,
  args: {
    label: "Button",
    variant: "primary",
    color: "primary",
    shape: "pill",
    size: "medium",
    fullWidth: false,
    loading: false,
    loadingPosition: "center",
    disabled: false,
    disableRipple: false,
  },
  argTypes: {
    label: { control: "text", description: "Projected content — the button's label." },
    variant: {
      control: "select",
      options: ["primary", "gradient", "secondary", "soft", "ghost", "glass"],
    },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    shape: { control: "inline-radio", options: ["pill", "rounded"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    loadingPosition: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  render: render(`{{ label }}`),
};

export default meta;
type Story = StoryObj<ButtonArgs>;

/**
 * This example shows the primary appearance.
 */
export const Primary: Story = {
  render: render(`{{ label }}<template #end-icon>${arrow}</template>`),
};
/**
 * This example shows the gradient variant.
 */
export const Gradient: Story = {
  args: { variant: "gradient" },
  render: render(`{{ label }}<template #end-icon>${arrow}</template>`),
};
/**
 * This example shows the secondary appearance.
 */
export const Secondary: Story = { args: { variant: "secondary" } };
/**
 * This example shows the soft variant.
 */
export const Soft: Story = { args: { variant: "soft" } };
/**
 * This example shows the ghost variant.
 */
export const Ghost: Story = { args: { variant: "ghost" } };
/**
 * This example shows the glass variant.
 */
export const Glass: Story = {
  args: { variant: "glass" },
  render: render(`{{ label }}<template #end-icon>${arrow}</template>`),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: render(`{{ label }}<template #end-icon>${arrow}</template>`),
};
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };

/**
 * This example shows where the spinner sits relative to the label. `start` and
 * `end` take over the matching icon slot; `center` dims the label and overlays
 * the spinner.
 */
export const LoadingPositions: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ positions: ["start", "center", "end"] as const }),
    template: `
      <div style="display: flex; gap: 12px">
        <Button v-for="position in positions" :key="position" loading :loading-position="position">
          {{ position }}
        </Button>
      </div>`,
  }),
};

/**
 * This example shows both icon slots. An unfilled slot renders nothing, so no
 * gap is reserved for an icon that was not passed.
 */
export const WithIcons: Story = {
  render: render(
    `<template #start-icon>${arrow}</template>{{ label }}<template #end-icon>${arrow}</template>`,
  ),
};

/**
 * This example shows the full-width layout.
 */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => ({
    components: { Button },
    setup() {
      const { label, ...props } = args;
      return { label, props };
    },
    template: `
      <div style="width: 320px">
        <Button v-bind="props">{{ label }}<template #end-icon>${arrow}</template></Button>
      </div>`,
  }),
};

/**
 * This example shows the component used as a link. A disabled anchor drops its
 * href and reports `aria-disabled`.
 */
export const AsLink: Story = {
  args: { label: "Get in touch", href: "https://okryshto.dev" },
  render: render(`{{ label }}<template #end-icon>${arrow}</template>`),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({
      colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as const,
    }),
    template: `
      <div style="display: flex; gap: 12px">
        <Button v-for="color in colors" :key="color" :color="color">
          {{ color }}<template #end-icon>${arrow}</template>
        </Button>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; align-items: center; gap: 12px">
        <Button v-for="size in sizes" :key="size" :size="size">
          Button<template #end-icon>${arrow}</template>
        </Button>
      </div>`,
  }),
};

/**
 * This example shows both shapes.
 */
export const Shapes: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ shapes: ["pill", "rounded"] as const }),
    template: `
      <div style="display: flex; align-items: center; gap: 12px">
        <Button v-for="shape in shapes" :key="shape" :shape="shape">{{ shape }}</Button>
      </div>`,
  }),
};
