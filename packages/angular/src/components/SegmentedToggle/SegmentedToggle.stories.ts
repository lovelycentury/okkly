import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import {
  iconBold,
  iconCalendar,
  iconGrid,
  iconItalic,
  iconList,
  iconUnderline,
} from "@okkly/icons";
import { OkklySegmentedToggle } from "./SegmentedToggle";
import type { SegmentedToggleColor, SegmentedToggleItem } from "./SegmentedToggle";

/** Every input the template below binds. */
type SegmentedToggleArgs = {
  items: SegmentedToggleItem[];
  value?: string | string[];
  exclusive: boolean;
  color: SegmentedToggleColor;
  disabled: boolean;
};

const RANGE: SegmentedToggleItem[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const FORMATTING: SegmentedToggleItem[] = [
  { value: "bold", icon: iconBold, ariaLabel: "Bold" },
  { value: "italic", icon: iconItalic, ariaLabel: "Italic" },
  { value: "underline", icon: iconUnderline, ariaLabel: "Underline" },
];

const column = "display: flex; flex-direction: column; gap: 16px; align-items: flex-start";
const caption =
  "margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)";

/**
 * Exclusive segments in one control — view modes, filters, or short option sets.
 */
const meta: Meta<SegmentedToggleArgs> = {
  title: "Control/SegmentedToggle",
  component: OkklySegmentedToggle,
  decorators: [moduleMetadata({ imports: [OkklySegmentedToggle] })],
  args: {
    items: RANGE,
    value: "week",
    exclusive: true,
    color: "primary",
    disabled: false,
  },
  argTypes: {
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    items: { control: false },
    exclusive: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  parameters: { controls: { exclude: ["modifiers"] } },
  render: (args) => ({
    props: args,
    template: `
      <okkly-segmented-toggle
        [items]="items"
        [(value)]="value"
        [exclusive]="exclusive"
        [color]="color"
        [disabled]="disabled"
      />`,
  }),
};

export default meta;
type Story = StoryObj<SegmentedToggleArgs>;

/**
 * This example shows range.
 */
export const Range: Story = {};

/**
 * This example shows view picker.
 */
export const ViewPicker: Story = {
  args: {
    value: "list",
    items: [
      { label: "List", value: "list", icon: iconList },
      { label: "Board", value: "board", icon: iconGrid },
      { label: "Calendar", value: "calendar", icon: iconCalendar },
    ],
  },
};

/**
 * This example shows icon only. Each segment needs an `ariaLabel`.
 */
export const IconOnly: Story = {
  args: {
    value: "grid",
    items: [
      { value: "grid", icon: iconGrid, ariaLabel: "Grid view" },
      { value: "list", icon: iconList, ariaLabel: "List view" },
    ],
  },
};

/**
 * This example shows multi select.
 */
export const MultiSelect: Story = {
  name: "Toggle group (multi)",
  args: {
    exclusive: false,
    value: ["bold", "italic"],
    items: FORMATTING,
  },
};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: {
    color: "dante",
    value: "week",
    items: RANGE,
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"], items: RANGE },
    template: `
      <div style="${column}">
        @for (color of colors; track color) {
          <okkly-segmented-toggle [color]="color" value="week" [items]="items" />
        }
      </div>`,
  }),
};

/**
 * This example shows interactive.
 */
export const Interactive: Story = {
  render: () => ({
    props: { period: "week", items: RANGE },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-segmented-toggle color="dante" [items]="items" [(value)]="period" />
        <p style="${caption}">Selected: {{ period }}</p>
      </div>`,
  }),
};

/**
 * This example shows interactive multi.
 */
export const InteractiveMulti: Story = {
  name: "Interactive (multi)",
  render: () => ({
    props: { formatting: ["bold"], items: FORMATTING },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-segmented-toggle [exclusive]="false" [(value)]="formatting" [items]="items" />
        <p style="${caption}">Active: {{ formatting.length ? formatting.join(", ") : "none" }}</p>
      </div>`,
  }),
};
