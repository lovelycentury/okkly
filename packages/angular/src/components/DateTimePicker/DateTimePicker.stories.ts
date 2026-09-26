import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import type { CalendarWeekStart } from "../Calendar/dates";
import type { TimePickerFormat } from "../TimePicker/TimePicker";
import { OkklyDateTimePicker, type DateTimePickerColor } from "./DateTimePicker";

/** Every input the template below binds. */
type DateTimePickerArgs = {
  value: Date | null;
  min?: Date;
  max?: Date;
  timeStep: number;
  format: TimePickerFormat;
  weekStart: CalendarWeekStart;
  color: DateTimePickerColor;
  locale: string;
  timezoneLabel?: string;
  summaryLabel: string;
  emptyLabel: string;
  confirmLabel: string;
};

const bindings = `
    [(value)]="value"
    [min]="min"
    [max]="max"
    [timeStep]="timeStep"
    [format]="format"
    [weekStart]="weekStart"
    [color]="color"
    [locale]="locale"
    [timezoneLabel]="timezoneLabel"
    [summaryLabel]="summaryLabel"
    [emptyLabel]="emptyLabel"
    [confirmLabel]="confirmLabel"`;

const dateControl = { control: false } as const;

/**
 * A fixed inline card combining a `Calendar` and a `TimePicker`, with a
 * summary + Confirm footer.
 */
const meta: Meta<DateTimePickerArgs> = {
  title: "Control/DateTimePicker",
  component: OkklyDateTimePicker,
  decorators: [moduleMetadata({ imports: [OkklyDateTimePicker] })],
  args: {
    value: null,
    min: undefined,
    max: undefined,
    timeStep: 1,
    format: "24h",
    weekStart: "mon",
    color: "primary",
    locale: "en-US",
    timezoneLabel: undefined,
    summaryLabel: "Selected time",
    emptyLabel: "No date selected",
    confirmLabel: "Confirm",
  },
  argTypes: {
    format: { control: "inline-radio", options: ["24h", "12h"] },
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
    value: dateControl,
    min: dateControl,
    max: dateControl,
  },
  render: (args) => ({ props: args, template: `<okkly-date-time-picker${bindings} />` }),
};

export default meta;
type Story = StoryObj<DateTimePickerArgs>;

/**
 * This example shows the default state — nothing picked yet.
 */
export const Default: Story = {};

/**
 * This example shows a value already picked.
 */
export const Filled: Story = {
  args: { value: new Date(2024, 5, 15, 14, 30) },
};

/**
 * This example shows the 12-hour hour wheel with an AM/PM column.
 */
export const TwelveHour: Story = {
  args: { format: "12h", value: new Date(2024, 5, 15, 14, 30) },
};

/**
 * This example shows a trailing timezone chip next to the summary.
 */
export const TimezoneChip: Story = {
  args: { value: new Date(2024, 5, 15, 14, 30), timezoneLabel: "GMT+2" },
};

/**
 * This example shows `min`/`max` bounds on the embedded calendar.
 */
export const MinMaxBounds: Story = {
  name: "min / max",
  args: {
    value: new Date(2024, 5, 15, 9, 0),
    min: new Date(2024, 5, 5),
    max: new Date(2024, 5, 25),
  },
};

/**
 * This example shows every available accent tone.
 */
export const Tones: Story = {
  render: () => ({
    props: {
      tones: ["primary", "dante", "indigo", "violet", "ember", "ice"] as DateTimePickerColor[],
      value: new Date(2024, 5, 15, 14, 30),
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        @for (tone of tones; track tone) {
          <okkly-date-time-picker [color]="tone" [value]="value" />
        }
      </div>`,
  }),
};

/**
 * This example shows a value that lives entirely in the parent, plus the
 * separate `(confirm)` event fired only by the Confirm button.
 */
export const Controlled: Story = {
  render: () => ({
    props: { value: null as Date | null, confirmed: null as Date | null },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <okkly-date-time-picker [(value)]="value" (confirm)="confirmed = $event" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">Confirmed: {{ confirmed ?? "none" }}</p>
      </div>`,
  }),
};
