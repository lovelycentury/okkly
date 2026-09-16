import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ButtonGroup from "./ButtonGroup.vue";
import type { ButtonGroupColor, ButtonGroupProps } from "./ButtonGroup.types";

/**
 * A split button: one main action plus a chevron menu of variants of that
 * same action. For a row of independent toggle buttons (view filters,
 * Day/Week/Month, and the like), use `SegmentedToggle` instead — that's the
 * dedicated selection control.
 */
const meta: Meta<ButtonGroupProps> = {
  title: "Control/ButtonGroup",
  component: ButtonGroup,
  args: {
    action: { label: "Save" },
    menu: [{ label: "Save as…" }, { label: "Save & publish" }],
    variant: "primary",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    action: { control: false },
    menu: { control: false },
  },
  render: (args) => ({
    components: { ButtonGroup },
    setup: () => ({ args }),
    template: `<ButtonGroup v-bind="args" />`,
  }),
};

export default meta;
type Story = StoryObj<ButtonGroupProps>;

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
  args: {
    color: "dante",
    action: { label: "Boost" },
    menu: [{ label: "Boost now" }, { label: "Schedule boost" }],
  },
};

/**
 * This example shows secondary (outlined).
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    action: { label: "Export" },
    menu: [{ label: "Export as CSV" }, { label: "Export as PDF" }],
  },
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
    components: { ButtonGroup },
    setup() {
      const log = ref<string[]>([]);
      const run = (action: string) => () => {
        log.value = [`${new Date().toLocaleTimeString()} — ${action}`, ...log.value].slice(0, 4);
      };
      const action = { label: "Commit", onClick: run("Commit") };
      const menu = [
        { label: "Commit & push", onClick: run("Commit & push") },
        { label: "Amend last commit", onClick: run("Amend last commit") },
      ];
      return { log, action, menu };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <ButtonGroup :action="action" :menu="menu" />
        <ul style="margin: 0; padding-left: 16px; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          <li v-if="log.length === 0">No action yet — click the button or open the menu.</li>
          <li v-for="entry in log" :key="entry">{{ entry }}</li>
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
    components: { ButtonGroup },
    setup() {
      const status = ref<string | null>(null);
      const send = (outcome: string) => () => {
        status.value = outcome;
      };
      const action = { label: "Send", onClick: send("Sent now") };
      const menu = [
        { label: "Send later…", onClick: send("Scheduled to send later") },
        { label: "Save as draft", onClick: send("Saved as draft") },
      ];
      return { status, action, menu };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        <ButtonGroup color="indigo" :action="action" :menu="menu" />
        <p style="margin: 0; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-mono, monospace)">
          {{ status ?? "Nothing sent yet." }}
        </p>
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
    components: { ButtonGroup },
    setup: () => ({
      colors: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
      ] as const satisfies readonly ButtonGroupColor[],
      actionFor: (color: string) => ({ label: color[0].toUpperCase() + color.slice(1) }),
      menu: [{ label: "Option A" }, { label: "Option B" }],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <ButtonGroup v-for="color in colors" :key="color" :color="color" :action="actionFor(color)" :menu="menu" />
      </div>`,
  }),
};
