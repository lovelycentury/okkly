import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklySeverityIcon, OkklySeverityIconGlyph } from "./SeverityIcon";
import type { SeverityIconSeverity, SeverityIconShape, SeverityIconSize } from "./SeverityIcon";

/** `iconTrash` / `iconUpload` from `@okkly/icons`, inlined with the glyph marker. */
const trash = `<svg okklySeverityIconGlyph viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
const upload = `<svg okklySeverityIconGlyph viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>`;

/** Every input the Playground binds. */
type SeverityIconArgs = {
  severity: SeverityIconSeverity;
  size: SeverityIconSize;
  shape: SeverityIconShape;
  label: string | undefined;
};

const surface =
  "display: flex; align-items: center; gap: 20px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const caption = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)";

/**
 * A tinted chip holding a status glyph. `Alert`, `Snackbar`, and `EmptyState`
 * build on it, and it stands on its own wherever a row or a dialog needs one
 * symbol to carry the outcome.
 *
 * Colour is the only thing it says, and colour alone says nothing to a screen
 * reader — so an icon without a `label` is treated as decoration and hidden.
 * Pass `label` only when the surrounding text doesn't already carry the meaning.
 */
const meta: Meta<SeverityIconArgs> = {
  title: "Feedback/SeverityIcon",
  component: OkklySeverityIcon,
  decorators: [moduleMetadata({ imports: [OkklySeverityIcon, OkklySeverityIconGlyph] })],
  args: {
    severity: "info",
    size: "medium",
    shape: "circle",
    label: undefined,
  },
  argTypes: {
    severity: {
      control: "select",
      options: ["success", "info", "warning", "danger", "primary", "neutral"],
    },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    shape: { control: "inline-radio", options: ["circle", "rounded"] },
    label: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-severity-icon [severity]="severity" [size]="size" [shape]="shape" [label]="label" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SeverityIconArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The six tones and the glyph each one defaults to. `info` is the informational
 * indigo used by `Alert`; `primary` is the same shape in the brand mint, for
 * chips that aren't reporting a status at all.
 */
export const Severities: Story = {
  render: () => ({
    props: { severities: ["success", "info", "warning", "danger", "primary", "neutral"] },
    template: `
      <div style="${surface}; flex-wrap: wrap; gap: 24px">
        @for (severity of severities; track severity) {
          <div style="display: grid; justify-items: center; gap: 10px">
            <okkly-severity-icon [severity]="severity" />
            <span style="${caption}">{{ severity }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * A deploy log: the icon is the whole status column, so it carries a `label` and
 * is announced alongside the row it belongs to.
 */
export const InAList: Story = {
  name: "In a list",
  render: () => ({
    props: {
      rows: [
        {
          severity: "success",
          label: "Succeeded",
          title: "main → production",
          meta: "2 min ago · 41s",
        },
        {
          severity: "danger",
          label: "Failed",
          title: "feat/animated-background",
          meta: "18 min ago · 12s",
        },
        {
          severity: "warning",
          label: "Succeeded with warnings",
          title: "chore/deps",
          meta: "1 h ago · 1m 04s",
        },
        {
          severity: "neutral",
          label: "Queued",
          title: "docs/storybook",
          meta: "waiting for a runner",
        },
      ],
    },
    template: `
      <div style="width: 460px; padding: 8px; border-radius: 14px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); font-family: var(--okkly-font-family-sans)">
        @for (row of rows; track row.title) {
          <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px">
            <okkly-severity-icon [severity]="row.severity" size="small" [label]="row.label" />
            <div style="display: grid; gap: 2px">
              <span style="font-size: var(--okkly-font-size-sm)">{{ row.title }}</span>
              <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">{{ row.meta }}</span>
            </div>
          </div>
        }
      </div>`,
  }),
};

/**
 * The confirmation dialog pattern: a large chip at the top sets the temperature
 * of the question before the user reads a word of it.
 */
export const InADialog: Story = {
  name: "In a dialog",
  render: () => ({
    template: `
      <div style="display: grid; justify-items: center; gap: 12px; width: 360px; padding: 26px 24px; border-radius: 16px; border: 1px solid var(--okkly-border-subtle); background: var(--okkly-bg-surface); text-align: center; font-family: var(--okkly-font-family-sans)">
        <okkly-severity-icon severity="danger" size="large">${trash}</okkly-severity-icon>
        <strong style="font-size: var(--okkly-font-size-lg)">Delete this project?</strong>
        <p style="margin: 0; ${caption}">
          Night drive vol. 2 and its 12 tracks will be removed. This can't be undone.
        </p>
      </div>`,
  }),
};

/**
 * `size` scales the chip and its glyph together, and `shape` switches between the
 * circle used for status and the rounded square used for object icons.
 */
export const SizesAndShapes: Story = {
  name: "Sizes and shapes",
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${surface}; gap: 32px">
        <div style="${surface}; gap: 14px">
          @for (size of sizes; track size) {
            <okkly-severity-icon severity="success" [size]="size" />
          }
        </div>
        <div style="${surface}; gap: 14px">
          @for (size of sizes; track size) {
            <okkly-severity-icon severity="info" [size]="size" shape="rounded" />
          }
        </div>
      </div>`,
  }),
};

/**
 * A projected `okklySeverityIconGlyph` replaces the default glyph while keeping the
 * tint — how the dialog above gets a bin instead of a cross.
 */
export const CustomIcon: Story = {
  name: "Custom icon",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-severity-icon severity="primary">${upload}</okkly-severity-icon>
        <okkly-severity-icon severity="danger">${trash}</okkly-severity-icon>
        <okkly-severity-icon severity="neutral" shape="rounded">${upload}</okkly-severity-icon>
      </div>`,
  }),
};
