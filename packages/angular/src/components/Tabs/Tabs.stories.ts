import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { iconActivity, iconSettings, iconUsers } from "@okkly/icons";
import { OkklyTabs } from "./Tabs";
import type { TabItem, TabsColor, TabsOrientation, TabsVariant } from "./Tabs";

const ITEMS: TabItem[] = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity", icon: iconActivity },
  { label: "Members", value: "members", icon: iconUsers },
];

/** Every input the template below binds. */
type TabsArgs = {
  items: TabItem[];
  value?: string;
  color: TabsColor;
  variant: TabsVariant;
  orientation: TabsOrientation;
};

const bindings = `
    [items]="items"
    [color]="color"
    [variant]="variant"
    [orientation]="orientation"`;

/**
 * Switch between peer views inside one panel. Keep labels short, never nest
 * tabs in tabs, and render the panel yourself — `OkklyTabs` owns the tab strip
 * only.
 *
 * Keyboard follows the WAI-ARIA tabs pattern: only the selected tab is
 * tabbable, arrows move (and activate) the selection, Home/End jump to the
 * ends.
 */
const meta: Meta<TabsArgs> = {
  title: "Navigation/Tabs",
  component: OkklyTabs,
  decorators: [moduleMetadata({ imports: [OkklyTabs] })],
  args: {
    items: ITEMS,
    value: "overview",
    color: "primary",
    variant: "standard",
    orientation: "horizontal",
  },
  argTypes: {
    items: { control: false },
    value: { control: false },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    variant: { control: "inline-radio", options: ["standard", "scrollable"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 8px 16px 16px; width: 520px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <okkly-tabs${bindings} />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<TabsArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The real job: a tab strip wired to the panel it switches. `OkklyTabs` keeps
 * its own selection when unbound — `(valueChange)` still fires, so the panel
 * can follow.
 */
export const WithPanel: Story = {
  render: () => ({
    props: { tab: "overview" },
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 8px 16px 16px; width: 520px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <okkly-tabs [items]="[
          { label: 'Overview', value: 'overview' },
          { label: 'Activity', value: 'activity' },
          { label: 'Members', value: 'members' }
        ]" [(value)]="tab" />
        <div
          role="tabpanel"
          [id]="'okkly-tabpanel-' + tab"
          [attr.aria-labelledby]="'okkly-tab-' + tab"
          style="padding-top: 16px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); line-height: var(--okkly-font-line-height-md)"
        >
          @switch (tab) {
            @case ("overview") { Project "Orbit" — 12 open issues, 3 merge requests waiting on review. }
            @case ("activity") { Maria pushed 4 commits · Tomas opened !238 · CI passed on main 20 minutes ago. }
            @case ("members") { 6 people have access: 2 owners, 3 developers, 1 guest. }
          }
        </div>
      </div>`,
  }),
};

/**
 * A settings sidebar: vertical tabs sit next to the panel instead of above it.
 */
export const Vertical: Story = {
  render: () => ({
    props: { tab: "profile" },
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 16px; display: flex; gap: 20px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <okkly-tabs orientation="vertical" [items]="[
          { label: 'Profile', value: 'profile' },
          { label: 'Notifications', value: 'notifications' },
          { label: 'Security', value: 'security', icon: '${iconSettings}' }
        ]" [(value)]="tab" />
        <div style="flex: 1; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary); line-height: var(--okkly-font-line-height-md)">
          @switch (tab) {
            @case ("profile") { Display name, avatar, and the timezone used for every timestamp. }
            @case ("notifications") { Choose which events reach you by email and which stay in-app. }
            @case ("security") { Two-factor authentication, active sessions, and personal access tokens. }
          }
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
    props: {
      items: [
        { label: "All", value: "all" },
        { label: "Open", value: "open" },
        { label: "In review", value: "review" },
        { label: "Merged", value: "merged" },
        { label: "Closed", value: "closed" },
        { label: "Drafts", value: "drafts" },
        { label: "Archived", value: "archived" },
      ],
    },
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 8px 16px 16px; width: 420px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <okkly-tabs variant="scrollable" value="all" [items]="items" />
      </div>`,
  }),
};

/**
 * A tab can be disabled — it stays visible but is skipped by both pointer and
 * arrow keys.
 */
export const DisabledTab: Story = {
  render: () => ({
    props: {
      items: [
        { label: "Overview", value: "overview" },
        { label: "Activity", value: "activity" },
        { label: "Billing", value: "billing", disabled: true },
      ],
    },
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 8px 16px 16px; width: 520px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        <okkly-tabs value="overview" [items]="items" />
      </div>`,
  }),
};

/**
 * Every accent tone the indicator supports.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as TabsColor[] },
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 8px 16px 16px; width: 520px; display: flex; flex-direction: column; gap: 4px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)">
        @for (color of colors; track color) {
          <okkly-tabs
            [color]="color"
            [value]="color"
            [items]="[
              { label: color, value: color },
              { label: 'Second', value: color + '-2' },
              { label: 'Third', value: color + '-3' }
            ]"
          />
        }
      </div>`,
  }),
};
