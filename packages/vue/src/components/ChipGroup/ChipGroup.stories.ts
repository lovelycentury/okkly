import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Chip from "../Chip/Chip.vue";
import ChipGroup from "./ChipGroup.vue";
import type { ChipGroupColor, ChipGroupProps } from "./ChipGroup.types";

type ChipGroupArgs = ChipGroupProps & { modelValue?: string | string[] };

/**
 * Row of chips that manage single or multi selection together.
 */
const meta: Meta<ChipGroupArgs> = {
  title: "Control/ChipGroup",
  component: ChipGroup,
  args: {
    disabled: false,
    exclusive: false,
    color: "primary",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    modelValue: { control: false },
    items: { control: false },
  },
};

export default meta;
type Story = StoryObj<ChipGroupArgs>;

/**
 * This example shows removable tags.
 */
export const RemovableTags: Story = {
  render: () => ({
    components: { ChipGroup },
    setup() {
      const tags = ref(["Design", "Engineering", "Operations"]);
      const items = () =>
        tags.value.map((label) => ({
          label,
          onRemove: () => {
            tags.value = tags.value.filter((entry) => entry !== label);
          },
        }));
      return { items };
    },
    template: `<ChipGroup :items="items()" />`,
  }),
};

/**
 * This example shows filter multi.
 */
export const FilterMulti: Story = {
  name: "Interactive (multi filter)",
  render: () => ({
    components: { ChipGroup },
    setup() {
      const value = ref<string[]>(["design"]);
      const items = [
        { label: "Design", value: "design" },
        { label: "Engineering", value: "engineering" },
        { label: "Operations", value: "operations" },
      ];
      return { value, items };
    },
    template: `<ChipGroup v-model="value" :items="items" />`,
  }),
};

/**
 * This example shows filter exclusive.
 */
export const FilterExclusive: Story = {
  name: "Interactive (exclusive)",
  render: () => ({
    components: { ChipGroup },
    setup() {
      const value = ref("design");
      const items = [
        { label: "Design", value: "design" },
        { label: "Engineering", value: "engineering" },
        { label: "Operations", value: "operations" },
      ];
      return { value, items };
    },
    template: `<ChipGroup exclusive v-model="value" :items="items" />`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { ChipGroup },
    setup: () => ({
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
      ] as const satisfies readonly ChipGroupColor[],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <ChipGroup
          v-for="color in colors"
          :key="color"
          :color="color"
          :model-value="[color]"
          @update:model-value="() => {}"
          :items="[{ label: color, value: color }, { label: 'Other', value: color + '-other' }]"
        />
      </div>`,
  }),
};

/**
 * This example shows children escape hatch.
 */
export const ChildrenEscapeHatch: Story = {
  name: "Children (escape hatch)",
  render: () => ({
    components: { Chip, ChipGroup },
    template: `
      <ChipGroup>
        <Chip>Custom A</Chip>
        <Chip removable>Custom B</Chip>
        <Chip selected @click="() => {}">Custom C</Chip>
      </ChipGroup>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    items: [
      { label: "Design", value: "design", selected: true },
      { label: "Engineering", value: "engineering" },
    ],
  },
};
