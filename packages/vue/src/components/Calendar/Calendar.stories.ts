import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Calendar from "./Calendar.vue";
import type { CalendarProps, CalendarTone } from "./Calendar.types";

const TONES = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly CalendarTone[];

// A fixed month keeps every story's grid identical between runs, which is what
// makes them comparable at all. The one exception is `Today`, which has to open
// on the real current month — see its comment.
const demoMonth = new Date(2024, 10, 1); // November 2024
const demoSelected = new Date(2024, 10, 12);
const demoRange: [Date, Date] = [new Date(2024, 10, 12), new Date(2024, 10, 21)];

/**
 * Month grid. Two modes, and the story names say which one they are in:
 *
 * - **Single** — `mode="single"` (the default). One date; `v-model` updates
 *   on every click.
 * - **Range** — `mode="range"`. A start/end pair; the first click arms the
 *   start, `v-model` updates on the second with the pair already ordered.
 *
 * Note that `Bounds (min / max)` is *not* a mode — `min`/`max` limit what is
 * selectable in either of them.
 *
 * The accent is the `color` prop, the same named palette Button/Chip use.
 * Today's date stays dante regardless of `color`, because it marks "you are
 * here" rather than a selection.
 */
const meta: Meta<CalendarProps> = {
  title: "Control/Calendar",
  component: Calendar,
  args: {
    weekStart: "mon",
  },
  argTypes: {
    weekStart: { control: "inline-radio", options: ["mon", "sun"] },
    mode: { control: "inline-radio", options: ["single", "range"] },
    color: { control: "select", options: TONES },
  },
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, demoMonth }),
    template: `<Calendar v-bind="args" :model-value="null" :month="demoMonth" />`,
  }),
};

export default meta;
type Story = StoryObj<CalendarProps>;

/**
 * Every prop as a control, including `color`.
 */
export const Playground: Story = {
  args: { weekStart: "mon", color: "primary" },
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, demoMonth, demoSelected }),
    template: `<Calendar v-bind="args" :model-value="demoSelected" :month="demoMonth" />`,
  }),
};

/* ---------------------------------------------------------------- Single */

/** Nothing selected. */
export const SingleDefault: Story = {
  name: "Single — Default",
};

/** One date committed. */
export const SingleSelected: Story = {
  name: "Single — Selected",
  render: () => ({
    components: { Calendar },
    setup: () => ({ demoMonth, demoSelected }),
    template: `<Calendar :model-value="demoSelected" :month="demoMonth" />`,
  }),
};

/** `v-model` updates on every click. */
export const SingleInteractive: Story = {
  name: "Single — Interactive",
  render: () => ({
    components: { Calendar },
    setup() {
      const month = ref(demoMonth);
      const value = ref<Date | null>(null);
      return { month, value };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <Calendar v-model:month="month" v-model="value" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ value ? value.toDateString() : "Click a day, the header to pick year/month, or the arrows." }}
        </p>
      </div>`,
  }),
};

/* ----------------------------------------------------------------- Range */

/** Both ends solid, the days between them tinted. */
export const RangeCommitted: Story = {
  name: "Range — Committed",
  render: () => ({
    components: { Calendar },
    setup: () => ({ demoMonth, demoRange }),
    template: `<Calendar mode="range" :model-value="demoRange" :month="demoMonth" />`,
  }),
};

/**
 * A range running off both edges of the visible month. The leading and trailing
 * days of the adjacent months are real dates in the range and paint as such,
 * without either being mistaken for an end of it — the ends are matched by date,
 * never by position in the grid.
 */
export const RangeAcrossMonths: Story = {
  name: "Range — Across months",
  render: () => ({
    components: { Calendar },
    setup: () => ({
      demoMonth,
      range: [new Date(2024, 9, 29), new Date(2024, 11, 3)] as [Date, Date],
    }),
    template: `<Calendar mode="range" :model-value="range" :month="demoMonth" />`,
  }),
};

/** Two clicks. Clicking backwards works — the pair arrives ordered. */
export const RangeInteractive: Story = {
  name: "Range — Interactive",
  render: () => ({
    components: { Calendar },
    setup() {
      const month = ref(demoMonth);
      const range = ref<[Date, Date] | null>(null);
      return { month, range };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <Calendar mode="range" v-model:month="month" v-model="range" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ range ? \`\${range[0].toDateString()} → \${range[1].toDateString()}\` : "Click a start date, then an end date." }}
        </p>
      </div>`,
  }),
};

/* ----------------------------------------------------------------- State */

/**
 * The only story without a fixed month: today's marker can only be seen on the
 * month that contains today. Its dante colouring is deliberately off the accent
 * tone — "you are here" is not "this is picked" — so it reads the same whatever
 * the calendar is tinted with.
 */
export const Today: Story = {
  name: "Today",
  render: () => ({
    components: { Calendar },
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <Calendar />
        <Calendar color="violet" />
      </div>`,
  }),
};

/** Every named accent, side by side — the same palette Button/Chip use. */
export const Colors: Story = {
  render: () => ({
    components: { Calendar },
    setup: () => ({ demoSelected, tones: TONES }),
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap">
        <Calendar v-for="tone in tones" :key="tone" :model-value="demoSelected" :color="tone" />
      </div>`,
  }),
};

/**
 * `min`/`max` bound what is selectable — unreachable days are struck through,
 * and the year and month grids disable what they cannot lead to. This is not a
 * mode: it applies to single and range alike.
 */
export const Bounds: Story = {
  name: "Bounds (min / max)",
  render: () => ({
    components: { Calendar },
    setup: () => ({
      demoSelected,
      min: new Date(2024, 10, 5),
      max: new Date(2024, 10, 22),
      demoMonth,
    }),
    template: `<Calendar :model-value="demoSelected" :min="min" :max="max" :month="demoMonth" />`,
  }),
};

/** Sunday-first weekday order. */
export const WeekStartSunday: Story = {
  name: "Week starts Sunday",
  render: () => ({
    components: { Calendar },
    setup: () => ({ demoSelected, demoMonth }),
    template: `<Calendar week-start="sun" :model-value="demoSelected" :month="demoMonth" />`,
  }),
};
