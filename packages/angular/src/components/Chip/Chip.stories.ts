import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyChip, OkklyChipIcon } from "./Chip";
import type { ChipSize, ChipVariant } from "./Chip";

/** `iconStar` from `@okkly/icons`, inlined so the marker attribute is visible in the snippet. */
const starIcon = `<svg okklyChipIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.3a.5.5 0 0 1 .9 0l2.3 4.7 5.2.7a.5.5 0 0 1 .3.9l-3.8 3.6.9 5.2a.5.5 0 0 1-.8.5L12 20.3l-4.6 2.4a.5.5 0 0 1-.8-.5l.9-5.2-3.8-3.6a.5.5 0 0 1 .3-.9l5.2-.7z"/></svg>`;

/** Every input the template below binds. */
type ChipArgs = {
  label: string;
  variant: ChipVariant;
  size: ChipSize;
  selected: boolean;
  dot: boolean;
  removable: boolean;
  clickable: boolean;
  disabled: boolean;
};

const bindings = `
    [label]="label"
    [variant]="variant"
    [size]="size"
    [selected]="selected"
    [dot]="dot"
    [removable]="removable"
    [clickable]="clickable"
    [disabled]="disabled"`;

const chip = (icon = "") => ({ template: `<okkly-chip${bindings}>${icon}</okkly-chip>` });

/**
 * Compact filter, tag, or choice token. Use ChipGroup for exclusive or multi-select filters.
 *
 * Set `clickable` to make it a toggle: it becomes a focusable `role="button"` with
 * `aria-pressed`, and Enter/Space fire the same `(click)` a mouse does. The trailing ×
 * emits `removed`.
 */
const meta: Meta<ChipArgs> = {
  title: "Control/Chip",
  component: OkklyChip,
  decorators: [moduleMetadata({ imports: [OkklyChip, OkklyChipIcon] })],
  args: {
    label: "Fintech",
    variant: "glass",
    size: "medium",
    selected: false,
    dot: false,
    removable: false,
    clickable: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: ["glass", "solid", "outline", "accent", "dante"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    selected: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    dot: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    removable: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    clickable: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({ props: args, ...chip() }),
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
export const Selected: Story = { args: { selected: true, clickable: true } };
/**
 * This example shows the component with an icon.
 */
export const WithIcon: Story = {
  args: { label: "Starred" },
  render: (args) => ({ props: args, ...chip(starIcon) }),
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
    props: { variants: ["glass", "solid", "outline", "accent", "dante"] },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        @for (variant of variants; track variant) {
          <okkly-chip [variant]="variant" [label]="variant" />
        }
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; align-items: center; gap: 12px">
        @for (size of sizes; track size) {
          <okkly-chip [size]="size" [label]="size" />
        }
      </div>`,
  }),
};

/**
 * This example shows filter toggle.
 */
export const FilterToggle: Story = {
  name: "Interactive (filter toggle)",
  render: () => ({
    props: { selected: false },
    template: `<okkly-chip label="Toggle me" clickable [selected]="selected" (click)="selected = !selected" />`,
  }),
};

/**
 * This example shows removable group.
 */
export const RemovableGroup: Story = {
  name: "Removable group",
  render: () => ({
    props: { tags: ["Design", "Engineering", "Operations"] },
    template: `
      <div style="display: flex; gap: 8px">
        @for (tag of tags; track tag) {
          <okkly-chip
            [label]="tag" removable [removeLabel]="'Remove ' + tag"
            (removed)="tags.splice(tags.indexOf(tag), 1)"
          />
        }
      </div>`,
  }),
};
