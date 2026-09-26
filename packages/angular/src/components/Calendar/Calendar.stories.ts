import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyCalendar } from "./Calendar";
import type { CalendarMode, CalendarTone, CalendarValue, CalendarWeekStart } from "./Calendar";

/** Every input the template below binds. */
type CalendarArgs = {
  mode: CalendarMode;
  value: CalendarValue | null;
  month?: Date;
  min?: Date;
  max?: Date;
  weekStart: CalendarWeekStart;
  locale: string;
  color: CalendarTone;
};

const bindings = `
    [mode]="mode"
    [(value)]="value"
    [(month)]="month"
    [min]="min"
    [max]="max"
    [weekStart]="weekStart"
    [locale]="locale"
    [color]="color"`;

const dateControl = { control: false } as const;

/**
 * A month card for picking a date or a date range — day, month and year grids.
 */
const meta: Meta<CalendarArgs> = {
  title: "Control/Calendar",
  component: OkklyCalendar,
  decorators: [moduleMetadata({ imports: [OkklyCalendar] })],
  args: {
    mode: "single",
    value: null,
    month: undefined,
    min: undefined,
    max: undefined,
    weekStart: "mon",
    locale: "en-US",
    color: "primary",
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"] },
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    value: dateControl,
    month: dateControl,
    min: dateControl,
    max: dateControl,
  },
  render: (args) => ({ props: args, template: `<okkly-calendar${bindings} />` }),
};

export default meta;
type Story = StoryObj<CalendarArgs>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows a range selection — the first click arms a start, the
 * second commits the ordered pair.
 */
export const RangeMode: Story = {
  name: 'mode="range"',
  args: {
    mode: "range",
    value: [new Date(2024, 5, 10), new Date(2024, 5, 18)],
    month: new Date(2024, 5, 1),
  },
};

/**
 * This example shows `min`/`max` bounds — unreachable days, months and years
 * are all disabled.
 */
export const MinMaxBounds: Story = {
  name: "min / max",
  args: {
    value: new Date(2024, 5, 15),
    month: new Date(2024, 5, 1),
    min: new Date(2024, 5, 5),
    max: new Date(2024, 5, 25),
  },
};

/**
 * This example shows the week starting on Sunday instead of Monday.
 */
export const WeekStartSunday: Story = {
  name: 'weekStart="sun"',
  args: { weekStart: "sun" },
};

/**
 * This example shows a non-English locale — the month title, weekday labels
 * and month-grid labels all follow it.
 */
export const Locale: Story = {
  args: { locale: "de-DE" },
};

/**
 * This example shows every available accent tone.
 */
export const Tones: Story = {
  render: () => ({
    props: {
      tones: ["primary", "dante", "indigo", "violet", "ember", "ice"] as CalendarTone[],
      value: new Date(2024, 5, 15),
      month: new Date(2024, 5, 1),
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        @for (tone of tones; track tone) {
          <okkly-calendar [color]="tone" [value]="value" [month]="month" />
        }
      </div>`,
  }),
};

/**
 * This example shows a calendar whose visible month lives entirely in the
 * parent.
 */
export const ControlledMonth: Story = {
  render: () => ({
    props: { month: new Date(2024, 0, 1) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-calendar [(month)]="month" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">Month: {{ month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }}</p>
      </div>`,
  }),
};

/**
 * This example overrides `--okkly-calendar-tone` inline instead of using `color`.
 */
export const CustomStyling: Story = {
  render: () => ({
    props: { value: new Date(2024, 5, 15), month: new Date(2024, 5, 1) },
    template: `<okkly-calendar [value]="value" [month]="month" style="--okkly-calendar-tone: #d946ef" />`,
  }),
};
