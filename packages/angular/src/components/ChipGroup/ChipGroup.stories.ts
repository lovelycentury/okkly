import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyChip } from "../Chip/Chip";
import { OkklyChipGroup, OkklyChipGroupOption } from "./ChipGroup";
import type { ChipGroupColor } from "./ChipGroup";

/** Every input the default render binds. */
type ChipGroupArgs = {
  disabled: boolean;
  exclusive: boolean;
  color: ChipGroupColor;
};

/**
 * Row of chips that manage single or multi selection together. Mark each chip
 * `okklyChipGroupOption` with its value and bind the selection with `[(value)]`;
 * chips without the marker are left alone.
 */
const meta: Meta<ChipGroupArgs> = {
  title: "Control/ChipGroup",
  component: OkklyChipGroup,
  decorators: [moduleMetadata({ imports: [OkklyChipGroup, OkklyChipGroupOption, OkklyChip] })],
  args: {
    disabled: false,
    exclusive: false,
    color: "primary",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    exclusive: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
};

export default meta;
type Story = StoryObj<ChipGroupArgs>;

/**
 * This example shows removable tags.
 */
export const RemovableTags: Story = {
  render: () => ({
    props: { tags: ["Design", "Engineering", "Operations"] },
    template: `
      <okkly-chip-group>
        @for (tag of tags; track tag) {
          <okkly-chip [label]="tag" removable (removed)="tags.splice(tags.indexOf(tag), 1)" />
        }
      </okkly-chip-group>`,
  }),
};

/**
 * This example shows filter multi.
 */
export const FilterMulti: Story = {
  name: "Interactive (multi filter)",
  render: () => ({
    props: { value: ["design"] },
    template: `
      <okkly-chip-group [(value)]="value">
        <okkly-chip okklyChipGroupOption="design" label="Design" />
        <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
        <okkly-chip okklyChipGroupOption="operations" label="Operations" />
      </okkly-chip-group>`,
  }),
};

/**
 * This example shows filter exclusive.
 */
export const FilterExclusive: Story = {
  name: "Interactive (exclusive)",
  render: () => ({
    props: { value: "design" },
    template: `
      <okkly-chip-group exclusive [(value)]="value">
        <okkly-chip okklyChipGroupOption="design" label="Design" />
        <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
        <okkly-chip okklyChipGroupOption="operations" label="Operations" />
      </okkly-chip-group>`,
  }),
};

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        @for (color of colors; track color) {
          <okkly-chip-group [color]="color" [value]="[color]">
            <okkly-chip [okklyChipGroupOption]="color" [label]="color" />
            <okkly-chip [okklyChipGroupOption]="color + '-other'" label="Other" />
          </okkly-chip-group>
        }
      </div>`,
  }),
};

/**
 * This example shows children escape hatch: chips without `okklyChipGroupOption`
 * keep their own state and events.
 */
export const ChildrenEscapeHatch: Story = {
  name: "Children (escape hatch)",
  render: () => ({
    template: `
      <okkly-chip-group>
        <okkly-chip label="Custom A" />
        <okkly-chip label="Custom B" removable />
        <okkly-chip label="Custom C" selected clickable />
      </okkly-chip-group>`,
  }),
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    props: args,
    template: `
      <okkly-chip-group [disabled]="disabled" [exclusive]="exclusive" [color]="color">
        <okkly-chip okklyChipGroupOption="design" label="Design" selected />
        <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
      </okkly-chip-group>`,
  }),
};
