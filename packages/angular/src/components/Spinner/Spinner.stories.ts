import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklySpinner } from "./Spinner";
import type { SpinnerColor, SpinnerSize } from "./Spinner";

/** Every input the Playground binds. */
type SpinnerArgs = {
  size: SpinnerSize;
  color: SpinnerColor;
  thickness: number | undefined;
};

const COLORS: SpinnerColor[] = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
];

const surface =
  "display: flex; align-items: center; gap: 24px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const caption = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/**
 * An indeterminate loading ring for waits too short or too unpredictable to
 * measure. When you can compute a percentage, reach for `Progress` instead — and
 * when the shape of the incoming content is known, `Skeleton` beats both, because
 * it doesn't move the layout when the data lands.
 *
 * The ring is a `role="status"` region labelled “Loading”. Override `aria-label`
 * to say what is loading; if the spinner sits inside a button that already says
 * so, hide it with `aria-hidden` rather than announcing twice.
 */
const meta: Meta<SpinnerArgs> = {
  title: "Feedback/Spinner",
  component: OkklySpinner,
  decorators: [moduleMetadata({ imports: [OkklySpinner, OkklyButton] })],
  args: {
    size: "medium",
    color: "primary",
    thickness: undefined,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: COLORS },
    thickness: { control: { type: "range", min: 1, max: 8, step: 0.5 } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-spinner [size]="size" [color]="color" [thickness]="thickness" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SpinnerArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The three presets. `small` is sized to sit inside a button or a table cell,
 * `large` to hold the centre of an empty panel.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${surface}">
        @for (size of sizes; track size) {
          <div style="display: grid; justify-items: center; gap: 10px">
            <okkly-spinner [size]="size" />
            <span style="${caption}">{{ size }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * A panel waiting on its first response: the spinner is centred, labelled, and
 * paired with a line of copy so the wait has an explanation.
 */
export const LoadingPanel: Story = {
  name: "Loading a panel",
  render: () => ({
    template: `
      <div style="display: grid; place-items: center; gap: 14px; width: 420px; height: 220px; border-radius: 14px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); font-family: var(--okkly-font-family-sans)">
        <okkly-spinner size="large" aria-label="Loading your projects" />
        <span style="${caption}">Loading your projects…</span>
      </div>`,
  }),
};

/**
 * Inside a control, the surrounding text is already the label — so the ring is
 * marked `aria-hidden` to keep it from being announced a second time.
 */
export const InlineWithText: Story = {
  name: "Inline with text",
  render: () => ({
    template: `
      <div style="${surface}; flex-direction: column; align-items: flex-start; gap: 16px">
        <span style="display: inline-flex; align-items: center; gap: 10px; ${caption}">
          <okkly-spinner size="small" aria-hidden="true" />
          Checking availability…
        </span>
        <button okklyButton variant="soft" aria-busy="true">
          <span style="display: inline-flex; align-items: center; gap: 8px">
            <okkly-spinner size="small" aria-hidden="true" />
            Publishing
          </span>
        </button>
      </div>`,
  }),
};

/**
 * `thickness` overrides the preset stroke — thinner for a delicate inline ring,
 * heavier when the spinner has to carry a whole empty panel.
 */
export const Thickness: Story = {
  render: () => ({
    props: { thicknesses: [1.5, 3, 5] },
    template: `
      <div style="${surface}">
        @for (thickness of thicknesses; track thickness) {
          <div style="display: grid; justify-items: center; gap: 10px">
            <okkly-spinner size="large" [thickness]="thickness" />
            <span style="${caption}">{{ thickness }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * Every tone. The track is a tint of the same colour, so a spinner reads on any
 * background you put it on.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: COLORS },
    template: `
      <div style="${surface}; flex-wrap: wrap; gap: 20px">
        @for (color of colors; track color) {
          <div style="display: grid; justify-items: center; gap: 8px">
            <okkly-spinner [color]="color" />
            <span style="${caption}">{{ color }}</span>
          </div>
        }
      </div>`,
  }),
};
