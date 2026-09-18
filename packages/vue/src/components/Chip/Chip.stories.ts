import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Chip from "./Chip.vue";
import type { ChipProps } from "./Chip.types";

/** `iconStar` from `@okkly/icons`, inlined so the stories pull in no build-time import. */
const starIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6L22 9.3l-5 4.7 1.4 7-6.4-3.6-6.4 3.6 1.4-7-5-4.7 7.1-.7z" /></svg>`;

/** `label` fills the default slot; everything else is a prop. */
type ChipArgs = ChipProps & { label?: string };

/**
 * Renders the component with `label` split back out of the args, so it lands
 * in the default slot instead of falling through as an attribute.
 */
const render = (body: string) => (args: ChipArgs) => ({
  components: { Chip },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `<Chip v-bind="props">${body}</Chip>`,
});

/**
 * Compact filter, tag, or choice token. Use ChipGroup for exclusive or multi-select filters.
 */
const meta: Meta<ChipArgs> = {
  title: "Control/Chip",
  component: Chip,
  args: {
    label: "Fintech",
    variant: "glass",
    size: "medium",
    selected: false,
    dot: false,
    removable: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text", description: "Default slot — the chip's text." },
    variant: { control: "select", options: ["glass", "solid", "outline", "accent", "dante"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: render(`{{ label }}`),
};

export default meta;
type Story = StoryObj<ChipArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows solid.
 */
export const Solid: Story = { args: { variant: "solid" } };
/**
 * This example shows outline.
 */
export const Outline: Story = { args: { variant: "outline" } };
/**
 * This example shows accent.
 */
export const Accent: Story = { args: { variant: "accent", dot: true, label: "New" } };
/**
 * This example shows dante.
 */
export const Dante: Story = { args: { variant: "dante", dot: true, label: "Signature" } };
/**
 * This example shows selected.
 */
export const Selected: Story = {
  args: { selected: true },
  render: render(`{{ label }}`),
};
/**
 * This example shows the component with an icon.
 */
export const WithIcon: Story = {
  args: { label: "Starred" },
  render: render(`{{ label }}<template #icon>${starIcon}</template>`),
};
/**
 * This example shows removable.
 */
export const Removable: Story = { args: { removable: true, label: "Mobile" } };
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, removable: true } };

/**
 * This example shows every available variant.
 */
export const Variants: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ variants: ["glass", "solid", "outline", "accent", "dante"] as const }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <Chip v-for="variant in variants" :key="variant" :variant="variant">{{ variant }}</Chip>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; align-items: center; gap: 12px">
        <Chip v-for="size in sizes" :key="size" :size="size">{{ size }}</Chip>
      </div>`,
  }),
};

/**
 * This example shows filter toggle.
 */
export const FilterToggle: Story = {
  name: "Interactive (filter toggle)",
  render: () => ({
    components: { Chip },
    setup() {
      const selected = ref(false);
      return { selected };
    },
    template: `<Chip :selected="selected" @click="selected = !selected">Toggle me</Chip>`,
  }),
};

/**
 * This example shows removable group.
 */
export const RemovableGroup: Story = {
  name: "Removable group",
  render: () => ({
    components: { Chip },
    setup() {
      const tags = ref(["Design", "Engineering", "Operations"]);
      const remove = (tag: string) => {
        tags.value = tags.value.filter((entry) => entry !== tag);
      };
      return { tags, remove };
    },
    template: `
      <div style="display: flex; gap: 8px">
        <Chip v-for="tag in tags" :key="tag" removable @remove="remove(tag)">{{ tag }}</Chip>
      </div>`,
  }),
};
