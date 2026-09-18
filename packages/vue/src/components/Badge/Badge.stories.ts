import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { iconBell, iconMail, iconShoppingCart } from "@okkly/icons";
import Avatar from "../Avatar/Avatar.vue";
import Button from "../Button/Button.vue";
import IconButton from "../IconButton/IconButton.vue";
import Badge from "./Badge.vue";
import type { BadgeColor, BadgeProps } from "./Badge.types";

/**
 * A count or status dot pinned to the corner of another element. Fill the
 * default slot with the thing being annotated; without it the badge renders
 * standalone, which is what you want inside a list row or a tab label.
 *
 * A bare number is meaningless to a screen reader, so give the anchor an
 * accessible name that includes the count — see the *Accessible counts* story.
 * Zero is hidden on purpose, matching MUI: an empty inbox shouldn't wear a `0`.
 */
const meta: Meta<BadgeProps> = {
  title: "Feedback/Badge",
  component: Badge,
  args: {
    badgeContent: 4,
    color: "dante",
    variant: "standard",
    max: 99,
    invisible: false,
    overlap: "circular",
  },
  argTypes: {
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
    variant: { control: "inline-radio", options: ["standard", "dot"] },
    overlap: { control: "inline-radio", options: ["circular", "rectangular"] },
    anchorOrigin: { control: false },
  },
  render: (args) => ({
    components: { Badge, IconButton },
    setup: () => ({ args, surface, iconBell }),
    template: `
      <div :style="surface">
        <Badge v-bind="args">
          <IconButton variant="glass" aria-label="Notifications"><span v-html="iconBell" /></IconButton>
        </Badge>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<BadgeProps>;

const surface = {
  display: "flex",
  alignItems: "center",
  // The badge's ring is drawn in the inset colour, so it only disappears against
  // a matching background — hence the explicit card rather than the bare canvas.
  width: "fit-content",
  gap: "28px",
  padding: "20px 24px",
  borderRadius: "14px",
  background: "var(--okkly-bg-inset)",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The everyday case: counts on the icons in an app bar.
 */
export const OnIcons: Story = {
  name: "On icons",
  render: () => ({
    components: { Badge, IconButton },
    setup: () => ({ surface, iconBell, iconMail, iconShoppingCart }),
    template: `
      <div :style="surface">
        <Badge :badge-content="4" color="dante">
          <IconButton variant="glass" aria-label="Notifications, 4 unread"><span v-html="iconBell" /></IconButton>
        </Badge>
        <Badge :badge-content="12" color="indigo">
          <IconButton variant="glass" aria-label="Messages, 12 unread"><span v-html="iconMail" /></IconButton>
        </Badge>
        <Badge :badge-content="128" :max="99" color="primary">
          <IconButton variant="glass" aria-label="Cart, 128 items"><span v-html="iconShoppingCart" /></IconButton>
        </Badge>
      </div>`,
  }),
};

/**
 * `variant="dot"` drops the number and just says "something changed" — the
 * right choice when the exact count doesn't help the user decide anything.
 */
export const StatusDot: Story = {
  name: "Status dot",
  render: () => ({
    components: { Badge, Avatar },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Badge variant="dot" color="success">
          <Avatar initials="OK" />
        </Badge>
        <Badge variant="dot" color="warning">
          <Avatar initials="LM" color="indigo" />
        </Badge>
        <Badge variant="dot" color="danger" :anchor-origin="{ vertical: 'bottom', horizontal: 'right' }">
          <Avatar initials="AS" color="dante" />
        </Badge>
      </div>`,
  }),
};

/**
 * `max` caps the number: anything above it renders as `{max}+`, so a runaway
 * count can't stretch the layout. `0` is hidden entirely.
 */
export const Overflow: Story = {
  render: () => ({
    components: { Badge, IconButton },
    setup: () => ({ surface, iconBell, counts: [0, 9, 99, 100, 1240] }),
    template: `
      <div :style="surface">
        <div v-for="count in counts" :key="count" style="display: grid; justify-items: center; gap: 10px">
          <Badge :badge-content="count" color="dante">
            <IconButton variant="glass" :aria-label="\`\${count} notifications\`"><span v-html="iconBell" /></IconButton>
          </Badge>
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">{{ count }}</span>
        </div>
      </div>`,
  }),
};

/**
 * Without a default slot the badge is a standalone pill — use it in table
 * cells, list rows, and tab labels, where it lines up with text instead of
 * hanging off a corner.
 */
export const Standalone: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({
      surface,
      rows: [
        { label: "Inbox", count: 12, color: "indigo" as BadgeColor },
        { label: "Flagged", count: 3, color: "warning" as BadgeColor },
        { label: "Failed deliveries", count: 128, color: "danger" as BadgeColor },
        { label: "Archive", count: 0, color: "indigo" as BadgeColor },
      ],
    }),
    template: `
      <div :style="{ ...surface, flexDirection: 'column', alignItems: 'stretch', gap: '0', width: '360px', padding: '8px' }">
        <div
          v-for="row in rows"
          :key="row.label"
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 8px; font-size: var(--okkly-font-size-sm)"
        >
          <span>{{ row.label }}</span>
          <Badge :badge-content="row.count" :color="row.color" />
        </div>
      </div>`,
  }),
};

/**
 * `anchorOrigin` picks the corner and `overlap` tunes how far out the badge
 * sits — `circular` for avatars and round buttons, `rectangular` for cards
 * and thumbnails whose corners are square.
 */
export const Placement: Story = {
  render: () => ({
    components: { Badge, Avatar },
    setup: () => ({
      surface,
      corners: [
        { vertical: "top", horizontal: "right" },
        { vertical: "top", horizontal: "left" },
        { vertical: "bottom", horizontal: "right" },
        { vertical: "bottom", horizontal: "left" },
      ],
    }),
    template: `
      <div :style="{ ...surface, flexWrap: 'wrap', gap: '36px' }">
        <div v-for="anchorOrigin in corners" :key="\`\${anchorOrigin.vertical}-\${anchorOrigin.horizontal}\`" style="display: grid; justify-items: center; gap: 12px">
          <Badge :badge-content="7" color="dante" :anchor-origin="anchorOrigin">
            <Avatar initials="OK" />
          </Badge>
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">{{ anchorOrigin.vertical }}/{{ anchorOrigin.horizontal }}</span>
        </div>
        <div style="display: grid; justify-items: center; gap: 12px">
          <Badge :badge-content="7" color="dante" overlap="rectangular">
            <Avatar initials="OK" shape="rounded" />
          </Badge>
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">rectangular</span>
        </div>
      </div>`,
  }),
};

/**
 * Every tone. Omit `color` for the neutral raised pill, which is the quiet
 * option for counts that carry no urgency.
 */
export const Colors: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({
      surface,
      colors: [
        undefined,
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ] as (BadgeColor | undefined)[],
    }),
    template: `
      <div :style="{ ...surface, flexWrap: 'wrap', gap: '18px' }">
        <div v-for="color in colors" :key="color ?? 'neutral'" style="display: grid; justify-items: center; gap: 8px">
          <Badge :badge-content="8" :color="color" />
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)">{{ color ?? "neutral" }}</span>
        </div>
      </div>`,
  }),
};

/**
 * `invisible` hides the badge without unmounting the anchor — handy when a
 * count drops to nothing but you don't want the icon to jump.
 */
export const Invisible: Story = {
  render: () => ({
    components: { Badge, IconButton, Button },
    setup() {
      const unread = ref(6);
      return { surface, iconBell, unread };
    },
    template: `
      <div :style="surface">
        <Badge :badge-content="unread" color="dante" :invisible="unread === 0">
          <IconButton variant="glass" :aria-label="\`Notifications, \${unread} unread\`"><span v-html="iconBell" /></IconButton>
        </Badge>
        <Button size="small" variant="soft" @click="unread += 1">New notification</Button>
        <Button size="small" variant="ghost" @click="unread = 0">Mark all read</Button>
      </div>`,
  }),
};

/**
 * The number is decorative markup — assistive tech reads the anchor, not the
 * pill. Put the count in the anchor's accessible name so both audiences get
 * the same information.
 */
export const AccessibleCounts: Story = {
  name: "Accessible counts",
  render: () => ({
    components: { Badge, IconButton },
    setup: () => ({ surface, iconBell }),
    template: `
      <div :style="{ ...surface, flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }">
        <Badge :badge-content="4" color="dante">
          <IconButton variant="glass" aria-label="Notifications, 4 unread"><span v-html="iconBell" /></IconButton>
        </Badge>
        <p style="margin: 0; max-width: 420px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
          The button above announces "Notifications, 4 unread". Keep that label in sync with
          <code>badgeContent</code> — a badge on its own announces nothing.
        </p>
      </div>`,
  }),
};
