import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { iconActivity, iconSettings, iconUsers } from "@okkly/icons";
import Tabs from "./Tabs.vue";
import type { TabsColor, TabsProps } from "./Tabs.types";

const surface = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "8px 16px 16px",
  width: "520px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panelStyle =
  "padding-top: 16px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); line-height: var(--okkly-font-line-height-md)";

/**
 * Switch between peer views inside one panel. Keep labels short, never nest
 * tabs in tabs, and render the panel yourself — `Tabs` owns the tab strip only.
 *
 * Keyboard follows the WAI-ARIA tabs pattern: only the selected tab is
 * tabbable, arrows move (and activate) the selection, Home/End jump to the
 * ends.
 */
const meta: Meta<TabsProps> = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: {
    items: [
      { label: "Overview", value: "overview" },
      { label: "Activity", value: "activity", icon: iconActivity },
      { label: "Members", value: "members", icon: iconUsers },
    ],
    defaultValue: "overview",
    color: "primary",
    variant: "standard",
    orientation: "horizontal",
  },
  argTypes: {
    items: { control: false },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    variant: { control: "inline-radio", options: ["standard", "scrollable"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<TabsProps>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {
  render: (args) => ({
    components: { Tabs },
    setup: () => ({ args, surface }),
    template: `<div :style="surface"><Tabs v-bind="args" /></div>`,
  }),
};

/**
 * The real job: a tab strip wired to the panel it switches. `v-model` still
 * changes even without listening, so the panel can follow.
 */
export const WithPanel: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const tab = ref("overview");
      const panels: Record<string, string> = {
        overview: "Project “Orbit” — 12 open issues, 3 merge requests waiting on review.",
        activity: "Maria pushed 4 commits · Tomas opened !238 · CI passed on main 20 minutes ago.",
        members: "6 people have access: 2 owners, 3 developers, 1 guest.",
      };
      const items = [
        { label: "Overview", value: "overview" },
        { label: "Activity", value: "activity", icon: iconActivity },
        { label: "Members", value: "members", icon: iconUsers },
      ];
      return { surface, panelStyle, items, tab, panels };
    },
    template: `
      <div :style="surface">
        <Tabs :items="items" v-model="tab" />
        <div :style="panelStyle" role="tabpanel" :id="\`okkly-tabpanel-\${tab}\`" :aria-labelledby="\`okkly-tab-\${tab}\`">
          {{ panels[tab] }}
        </div>
      </div>`,
  }),
};

/**
 * A settings sidebar: vertical tabs sit next to the panel instead of above it.
 */
export const Vertical: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const tab = ref("profile");
      const panels: Record<string, string> = {
        profile: "Display name, avatar, and the timezone used for every timestamp.",
        notifications: "Choose which events reach you by email and which stay in-app.",
        security: "Two-factor authentication, active sessions, and personal access tokens.",
      };
      const items = [
        { label: "Profile", value: "profile" },
        { label: "Notifications", value: "notifications" },
        { label: "Security", value: "security", icon: iconSettings },
      ];
      return { surface, items, tab, panels };
    },
    template: `
      <div :style="{ ...surface, display: 'flex', gap: '20px', padding: '16px' }">
        <Tabs orientation="vertical" :items="items" v-model="tab" />
        <div style="padding-top: 0; flex: 1; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); line-height: var(--okkly-font-line-height-md)">
          {{ panels[tab] }}
        </div>
      </div>`,
  }),
};

/**
 * `scrollable` keeps a long strip on one line and lets it overflow sideways
 * instead of wrapping.
 */
export const Scrollable: Story = {
  render: () => ({
    components: { Tabs },
    setup: () => ({
      surface,
      items: [
        { label: "All", value: "all" },
        { label: "Open", value: "open" },
        { label: "In review", value: "review" },
        { label: "Merged", value: "merged" },
        { label: "Closed", value: "closed" },
        { label: "Drafts", value: "drafts" },
        { label: "Archived", value: "archived" },
      ],
    }),
    template: `
      <div :style="{ ...surface, width: '420px' }">
        <Tabs variant="scrollable" default-value="all" :items="items" />
      </div>`,
  }),
};

/**
 * A tab can be disabled — it stays visible but is skipped by both pointer and
 * arrow keys.
 */
export const DisabledTab: Story = {
  render: () => ({
    components: { Tabs },
    setup: () => ({
      surface,
      items: [
        { label: "Overview", value: "overview" },
        { label: "Activity", value: "activity" },
        { label: "Billing", value: "billing", disabled: true },
      ],
    }),
    template: `
      <div :style="surface">
        <Tabs default-value="overview" :items="items" />
      </div>`,
  }),
};

/**
 * Every accent tone the indicator supports.
 */
export const Colors: Story = {
  render: () => ({
    components: { Tabs },
    setup: () => ({
      surface,
      colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as TabsColor[],
      itemsFor: (color: TabsColor) => [
        { label: color, value: color },
        { label: "Second", value: `${color}-2` },
        { label: "Third", value: `${color}-3` },
      ],
    }),
    template: `
      <div :style="{ ...surface, display: 'flex', flexDirection: 'column', gap: '4px' }">
        <Tabs v-for="color in colors" :key="color" :color="color" :default-value="color" :items="itemsFor(color)" />
      </div>`,
  }),
};
