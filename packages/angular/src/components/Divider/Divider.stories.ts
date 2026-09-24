import {
  componentWrapperDecorator,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from "@storybook/angular";
import { OkklyButton } from "../Button/Button";
import { OkklyDivider, OkklyDividerLabel } from "./Divider";
import type { DividerOrientation, DividerTextAlign, DividerVariant } from "./Divider";

/** Every input the Playground binds, plus `label` for the projected label. */
type DividerArgs = {
  label: string;
  orientation: DividerOrientation;
  variant: DividerVariant;
  flexItem: boolean;
  textAlign: DividerTextAlign;
};

const surface =
  "background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 16px; font-family: var(--okkly-font-family-sans)";

const row =
  "display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: var(--okkly-font-size-sm)";

/**
 * Hairline separator for lists, stacks and toolbars. Optional label sits on the
 * rule and can be aligned left, center or right.
 */
const meta: Meta<DividerArgs> = {
  title: "Data/Divider",
  component: OkklyDivider,
  decorators: [
    moduleMetadata({ imports: [OkklyDivider, OkklyDividerLabel, OkklyButton] }),
    componentWrapperDecorator(
      (story) => `<div style="width: 360px; color: var(--okkly-text-primary)">${story}</div>`,
    ),
  ],
  args: {
    label: "",
    orientation: "horizontal",
    variant: "fullWidth",
    flexItem: false,
    textAlign: "center",
  },
  argTypes: {
    label: { control: "text", description: "Projected label content." },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: { control: "inline-radio", options: ["fullWidth", "inset", "middle"] },
    textAlign: { control: "inline-radio", options: ["left", "center", "right"] },
    flexItem: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}; display: flex; min-height: 72px">
        <okkly-divider [orientation]="orientation" [variant]="variant" [flexItem]="flexItem" [textAlign]="textAlign">
          @if (label) {
            <span okklyDividerLabel>{{ label }}</span>
          }
        </okkly-divider>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<DividerArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A settings card: the rule separates rows without adding visual weight.
 */
export const SeparatedRows: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <div style="${row}">
          <span>Email notifications</span>
          <span style="color: var(--okkly-text-secondary)">On</span>
        </div>
        <okkly-divider />
        <div style="${row}">
          <span>Weekly digest</span>
          <span style="color: var(--okkly-text-secondary)">Monday</span>
        </div>
        <okkly-divider />
        <div style="${row}">
          <span>Product updates</span>
          <span style="color: var(--okkly-text-secondary)">Off</span>
        </div>
      </div>`,
  }),
};

/**
 * The classic sign-in split: a labelled divider between primary and social auth.
 */
export const WithLabel: Story = {
  render: () => ({
    template: `
      <div style="${surface}; display: flex; flex-direction: column; gap: 14px">
        <button okklyButton fullWidth>Continue with email</button>
        <okkly-divider><span okklyDividerLabel>or</span></okkly-divider>
        <button okklyButton fullWidth variant="secondary">Continue with GitHub</button>
        <button okklyButton fullWidth variant="ghost">Continue with Google</button>
      </div>`,
  }),
};

/**
 * Vertical dividers split a toolbar into groups of related actions.
 */
export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="${surface}; display: flex; align-items: center; gap: 12px; padding: 10px 14px; width: fit-content">
        <button okklyButton size="small" variant="ghost">Bold</button>
        <button okklyButton size="small" variant="ghost">Italic</button>
        <okkly-divider orientation="vertical" flexItem />
        <button okklyButton size="small" variant="ghost">Link</button>
        <button okklyButton size="small" variant="ghost">Code</button>
        <okkly-divider orientation="vertical" flexItem />
        <button okklyButton size="small" variant="ghost">Undo</button>
      </div>`,
  }),
};

/**
 * A stats strip — `flexItem` stretches each rule to the tallest cell.
 */
export const VerticalStats: Story = {
  name: "Vertical (stats strip)",
  render: () => ({
    props: {
      stats: [
        ["Deploys", "128"],
        ["Failures", "3"],
        ["Uptime", "99.9%"],
      ],
    },
    template: `
      <div style="${surface}; display: flex; align-items: stretch; gap: 20px">
        @for (stat of stats; track stat[0]; let last = $last) {
          <div style="flex: 1">
            <div style="font-size: var(--okkly-font-size-lg)">{{ stat[1] }}</div>
            <div style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">{{ stat[0] }}</div>
          </div>
          @if (!last) {
            <okkly-divider orientation="vertical" flexItem />
          }
        }
      </div>`,
  }),
};

/**
 * `inset` skips the leading gutter so the rule starts where the text does —
 * here the 4.5rem default is retuned to the 54px avatar column. `middle`
 * insets both ends instead, and `fullWidth` (default) spans everything.
 */
export const Variants: Story = {
  render: () => ({
    props: {
      people: [
        ["AK", "Oleksii", "Pushed 3 commits"],
        ["MB", "Maria", "Opened a merge request"],
        ["TS", "Tomas", "Left a review"],
      ],
    },
    template: `
      <div style="${surface}; padding: 8px 16px">
        @for (person of people; track person[1]; let first = $first) {
          <div>
            @if (!first) {
              <okkly-divider variant="inset" style="--okkly-divider-inset: 54px" />
            }
            <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0">
              <span style="width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--okkly-glass-fill); font-size: var(--okkly-font-size-sm)">{{ person[0] }}</span>
              <div style="font-size: var(--okkly-font-size-sm)">
                <div>{{ person[1] }}</div>
                <div style="color: var(--okkly-text-secondary)">{{ person[2] }}</div>
              </div>
            </div>
          </div>
        }
        <okkly-divider variant="middle" />
        <div style="padding: 12px 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
          The rule above closes the list with variant="middle".
        </div>
      </div>`,
  }),
};

/**
 * Labels double as lightweight section headings inside a long form.
 */
export const TextAlign: Story = {
  render: () => ({
    template: `
      <div style="${surface}; display: flex; flex-direction: column; gap: 18px">
        <okkly-divider textAlign="left"><span okklyDividerLabel>Account</span></okkly-divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Name, email, password</span>
        <okkly-divider textAlign="center"><span okklyDividerLabel>Workspace</span></okkly-divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Members, roles, billing</span>
        <okkly-divider textAlign="right"><span okklyDividerLabel>Danger zone</span></okkly-divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Transfer or delete this workspace</span>
      </div>`,
  }),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the divider itself (inline or in your own rule) rather than on
 * a parent.
 */
export const CustomStyling: Story = {
  render: () => ({
    template: `
      <div style="${surface}; display: flex; flex-direction: column; gap: 22px">
        <okkly-divider style="--okkly-divider-color: var(--okkly-accent-primary)" />
        <okkly-divider style="--okkly-divider-color: var(--okkly-accent-ember); --okkly-divider-thickness: 2px" />
        <okkly-divider style="--okkly-divider-color: var(--okkly-accent-ice); --okkly-divider-label-color: var(--okkly-accent-ice); --okkly-divider-label-gap: 2rem">
          <span okklyDividerLabel>wide gap</span>
        </okkly-divider>
        <okkly-divider style="--okkly-divider-color: var(--okkly-border-default); --okkly-divider-label-font-size: var(--okkly-font-size-lg); --okkly-divider-label-line-height: var(--okkly-font-line-height-lg)">
          <span okklyDividerLabel>Bigger label</span>
        </okkly-divider>
      </div>`,
  }),
};
