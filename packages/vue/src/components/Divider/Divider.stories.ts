import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "../Button/Button.vue";
import Divider from "./Divider.vue";
import type { DividerProps } from "./Divider.types";

/** `label` fills the default slot; everything else is a prop. */
type DividerArgs = DividerProps & { label?: string };

const SURFACE =
  "background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 16px; font-family: var(--okkly-font-family-sans)";
const ROW =
  "display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: var(--okkly-font-size-sm)";

/**
 * Hairline separator for lists, stacks and toolbars. Optional label sits on
 * the rule and can be aligned left, center or right.
 */
const meta: Meta<DividerArgs> = {
  title: "Data/Divider",
  component: Divider,
  args: {
    orientation: "horizontal",
    variant: "fullWidth",
    flexItem: false,
    textAlign: "center",
    label: "",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: { control: "inline-radio", options: ["fullWidth", "inset", "middle"] },
    textAlign: { control: "inline-radio", options: ["left", "center", "right"] },
    label: { control: "text", description: "Default slot — the optional label." },
  },
  decorators: [
    () => ({
      template: `<div style="width: 360px; color: var(--okkly-text-primary)"><story /></div>`,
    }),
  ],
  render: (args) => ({
    components: { Divider },
    setup() {
      const { label, ...props } = args;
      return { label, props };
    },
    template: `<div style="${SURFACE}; display: flex; min-height: 72px"><Divider v-bind="props">{{ label }}</Divider></div>`,
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
    components: { Divider },
    template: `
      <div style="${SURFACE}">
        <div style="${ROW}">
          <span>Email notifications</span>
          <span style="color: var(--okkly-text-secondary)">On</span>
        </div>
        <Divider />
        <div style="${ROW}">
          <span>Weekly digest</span>
          <span style="color: var(--okkly-text-secondary)">Monday</span>
        </div>
        <Divider />
        <div style="${ROW}">
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
    components: { Divider, Button },
    template: `
      <div style="${SURFACE}; display: flex; flex-direction: column; gap: 14px">
        <Button full-width>Continue with email</Button>
        <Divider>or</Divider>
        <Button full-width variant="secondary">Continue with GitHub</Button>
        <Button full-width variant="ghost">Continue with Google</Button>
      </div>`,
  }),
};

/**
 * Vertical dividers split a toolbar into groups of related actions.
 */
export const Vertical: Story = {
  render: () => ({
    components: { Divider, Button },
    template: `
      <div style="${SURFACE}; display: flex; align-items: center; gap: 12px; padding: 10px 14px; width: fit-content">
        <Button size="small" variant="ghost">Bold</Button>
        <Button size="small" variant="ghost">Italic</Button>
        <Divider orientation="vertical" flex-item />
        <Button size="small" variant="ghost">Link</Button>
        <Button size="small" variant="ghost">Code</Button>
        <Divider orientation="vertical" flex-item />
        <Button size="small" variant="ghost">Undo</Button>
      </div>`,
  }),
};

/**
 * A stats strip — `flexItem` stretches each rule to the tallest cell.
 */
export const VerticalStats: Story = {
  name: "Vertical (stats strip)",
  render: () => ({
    components: { Divider },
    setup: () => ({
      stats: [
        ["Deploys", "128"],
        ["Failures", "3"],
        ["Uptime", "99.9%"],
      ],
    }),
    template: `
      <div style="${SURFACE}; display: flex; align-items: stretch; gap: 20px">
        <template v-for="([label, value], index) in stats" :key="label">
          <div style="flex: 1">
            <div style="font-size: var(--okkly-font-size-lg)">{{ value }}</div>
            <div style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">{{ label }}</div>
          </div>
          <Divider v-if="index < stats.length - 1" orientation="vertical" flex-item />
        </template>
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
    components: { Divider },
    setup: () => ({
      rows: [
        ["AK", "Oleksii", "Pushed 3 commits"],
        ["MB", "Maria", "Opened a merge request"],
        ["TS", "Tomas", "Left a review"],
      ],
    }),
    template: `
      <div style="${SURFACE}; padding: 8px 16px">
        <div v-for="([initials, name, detail], index) in rows" :key="name">
          <Divider v-if="index > 0" variant="inset" style="--okkly-divider-inset: 54px" />
          <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0">
            <span style="width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--okkly-glass-fill); font-size: var(--okkly-font-size-sm)">{{ initials }}</span>
            <div style="font-size: var(--okkly-font-size-sm)">
              <div>{{ name }}</div>
              <div style="color: var(--okkly-text-secondary)">{{ detail }}</div>
            </div>
          </div>
        </div>
        <Divider variant="middle" />
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
    components: { Divider },
    template: `
      <div style="${SURFACE}; display: flex; flex-direction: column; gap: 18px">
        <Divider text-align="left">Account</Divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Name, email, password</span>
        <Divider text-align="center">Workspace</Divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Members, roles, billing</span>
        <Divider text-align="right">Danger zone</Divider>
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">Transfer or delete this workspace</span>
      </div>`,
  }),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the divider itself (inline or in your own rule) rather than
 * on a parent.
 */
export const CustomStyling: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div style="${SURFACE}; display: flex; flex-direction: column; gap: 22px">
        <Divider style="--okkly-divider-color: var(--okkly-accent-primary)" />
        <Divider style="--okkly-divider-color: var(--okkly-accent-ember); --okkly-divider-thickness: 2px" />
        <Divider style="--okkly-divider-color: var(--okkly-accent-ice); --okkly-divider-label-color: var(--okkly-accent-ice); --okkly-divider-label-gap: 2rem">wide gap</Divider>
        <Divider style="--okkly-divider-color: var(--okkly-border-default); --okkly-divider-label-font-size: var(--okkly-font-size-lg); --okkly-divider-label-line-height: var(--okkly-font-line-height-lg)">Bigger label</Divider>
      </div>`,
  }),
};
