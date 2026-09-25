import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import {
  OkklyButtonGroup,
  OkklyButtonGroupAction,
  OkklyButtonGroupIcon,
  OkklyButtonGroupMenuItem,
} from "./ButtonGroup";
import type { ButtonGroupColor, ButtonGroupVariant } from "./ButtonGroup";

/** Every input the Playground binds. */
type ButtonGroupArgs = {
  variant: ButtonGroupVariant;
  color: ButtonGroupColor;
  disabled: boolean;
  menuAriaLabel: string;
};

const log =
  "margin: 0; padding-left: 16px; color: var(--okkly-text-secondary); font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)";
const column = "display: flex; flex-direction: column; gap: 12px; align-items: flex-start";

/**
 * A split button: one main action plus a chevron menu of variants of that
 * same action. For a row of independent toggle buttons (view filters,
 * Day/Week/Month, and the like), use `SegmentedToggle` instead — that's the
 * dedicated selection control.
 *
 * The main action is a `<button okklyButtonGroupAction>` and each menu entry a
 * `<button okklyButtonGroupMenuItem>`, each with its own `(click)`; the chevron
 * appears once there is at least one menu item.
 */
const meta: Meta<ButtonGroupArgs> = {
  title: "Control/ButtonGroup",
  component: OkklyButtonGroup,
  decorators: [
    moduleMetadata({
      imports: [
        OkklyButtonGroup,
        OkklyButtonGroupAction,
        OkklyButtonGroupIcon,
        OkklyButtonGroupMenuItem,
      ],
    }),
  ],
  args: {
    variant: "primary",
    color: "primary",
    disabled: false,
    menuAriaLabel: "Open menu",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <okkly-button-group [variant]="variant" [color]="color" [disabled]="disabled" [menuAriaLabel]="menuAriaLabel">
        <button okklyButtonGroupAction>Save</button>
        <button okklyButtonGroupMenuItem>Save as…</button>
        <button okklyButtonGroupMenuItem>Save &amp; publish</button>
      </okkly-button-group>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonGroupArgs>;

/**
 * A split button is one action, not two. The left segment fires the default
 * variant immediately on click; the chevron only reveals *other variants of
 * that same action* — never unrelated commands. If the menu repeated the
 * main label verbatim, that would be a smell: it'd mean the menu item is
 * redundant, not an alternative. Here `Save` stays the one-click default and
 * the menu holds only the two things you'd otherwise need a second control for.
 */
export const Primary: Story = {};

/**
 * This example shows dante.
 */
export const Dante: Story = {
  render: () => ({
    template: `
      <okkly-button-group color="dante">
        <button okklyButtonGroupAction>Boost</button>
        <button okklyButtonGroupMenuItem>Boost now</button>
        <button okklyButtonGroupMenuItem>Schedule boost</button>
      </okkly-button-group>`,
  }),
};

/**
 * This example shows secondary (outlined).
 */
export const Secondary: Story = {
  render: () => ({
    template: `
      <okkly-button-group variant="secondary">
        <button okklyButtonGroupAction>Export</button>
        <button okklyButtonGroupMenuItem>Export as CSV</button>
        <button okklyButtonGroupMenuItem>Export as PDF</button>
      </okkly-button-group>`,
  }),
};

/**
 * Git client pattern: the left segment commits with your last-used option;
 * the chevron swaps in `Commit & push` or `Amend last commit` without
 * touching the default for next time. Clicking the main segment vs. picking
 * a menu item both funnel into the same handler so the log below shows
 * exactly one action fired, whichever way you triggered it.
 */
export const CommitAndPush: Story = {
  render: () => ({
    props: {
      log: [] as string[],
      run(this: { log: string[] }, action: string) {
        this.log = [`${new Date().toLocaleTimeString()} — ${action}`, ...this.log].slice(0, 4);
      },
    },
    template: `
      <div style="${column}">
        <okkly-button-group>
          <button okklyButtonGroupAction (click)="run('Commit')">Commit</button>
          <button okklyButtonGroupMenuItem (click)="run('Commit & push')">Commit &amp; push</button>
          <button okklyButtonGroupMenuItem (click)="run('Amend last commit')">Amend last commit</button>
        </okkly-button-group>
        <ul style="${log}">
          @for (entry of log; track entry) {
            <li>{{ entry }}</li>
          } @empty {
            <li>No action yet — click the button or open the menu.</li>
          }
        </ul>
      </div>`,
  }),
};

/**
 * Email-client pattern: `Send` is the one-click default, the chevron offers
 * `Send later` and `Save as draft` as variants of the same compose action —
 * not a shortcut to unrelated screens. Each option is wired to its own
 * handler so you can see the main segment and the menu both resolve to a
 * single, real outcome.
 */
export const SendEmail: Story = {
  render: () => ({
    props: { status: null as string | null },
    template: `
      <div style="${column}">
        <okkly-button-group color="indigo">
          <button okklyButtonGroupAction (click)="status = 'Sent now'">Send</button>
          <button okklyButtonGroupMenuItem (click)="status = 'Scheduled to send later'">Send later…</button>
          <button okklyButtonGroupMenuItem (click)="status = 'Saved as draft'">Save as draft</button>
        </okkly-button-group>
        <p style="${log}; padding-left: 0">{{ status ?? "Nothing sent yet." }}</p>
      </div>`,
  }),
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
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        @for (color of colors; track color) {
          <okkly-button-group [color]="color">
            <button okklyButtonGroupAction style="text-transform: capitalize">{{ color }}</button>
            <button okklyButtonGroupMenuItem>Option A</button>
            <button okklyButtonGroupMenuItem>Option B</button>
          </okkly-button-group>
        }
      </div>`,
  }),
};
