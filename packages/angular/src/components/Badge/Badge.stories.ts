import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyAvatar } from "../Avatar/Avatar";
import { OkklyButton } from "../Button/Button";
import { OkklyIconButton } from "../IconButton/IconButton";
import { OkklyBadge } from "./Badge";
import type { BadgeColor, BadgeOverlap, BadgeVariant } from "./Badge";

/** `iconBell` / `iconMail` / `iconShoppingCart` from `@okkly/icons`, inlined. */
const bell = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M21 12c0-1.5-.5-3-2-4.5S17 4 12 4 6 5 4.5 6.5 2 10.5 2 12s.5 2.5-1 4.5h20c-1.5-2-1-3-1-4.5"/></svg>`;
const mail = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const cart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

/** Every input the Playground binds. */
type BadgeArgs = {
  badgeContent: number;
  color: BadgeColor | undefined;
  variant: BadgeVariant;
  max: number;
  invisible: boolean;
  overlap: BadgeOverlap;
};

// The badge's ring is drawn in the inset colour, so it only disappears against
// a matching background — hence the explicit card rather than the bare canvas.
const surface =
  "display: flex; align-items: center; width: fit-content; gap: 28px; padding: 20px 24px; border-radius: 14px; background: var(--okkly-bg-inset); font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const caption = "font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";
const column = "display: grid; justify-items: center; gap: 10px";

/**
 * A count or status dot pinned to the corner of another element. Project the
 * thing being annotated into the badge; with nothing projected the badge renders
 * standalone, which is what you want inside a list row or a tab label.
 *
 * A bare number is meaningless to a screen reader, so give the anchor an
 * accessible name that includes the count — see the *Accessible counts* story.
 * Zero is hidden on purpose, matching MUI: an empty inbox shouldn't wear a `0`.
 */
const meta: Meta<BadgeArgs> = {
  title: "Feedback/Badge",
  component: OkklyBadge,
  decorators: [
    moduleMetadata({ imports: [OkklyBadge, OkklyIconButton, OkklyAvatar, OkklyButton] }),
  ],
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
      ],
    },
    variant: { control: "inline-radio", options: ["standard", "dot"] },
    overlap: { control: "inline-radio", options: ["circular", "rectangular"] },
    invisible: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  // An object input with no useful control; the Placement story shows every corner.
  parameters: { controls: { exclude: ["anchorOrigin"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-badge
          [badgeContent]="badgeContent" [color]="color" [variant]="variant" [max]="max"
          [invisible]="invisible" [overlap]="overlap"
        >
          <button okklyIconButton variant="glass" aria-label="Notifications">${bell}</button>
        </okkly-badge>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<BadgeArgs>;

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
    template: `
      <div style="${surface}">
        <okkly-badge badgeContent="4" color="dante">
          <button okklyIconButton variant="glass" aria-label="Notifications, 4 unread">${bell}</button>
        </okkly-badge>
        <okkly-badge badgeContent="12" color="indigo">
          <button okklyIconButton variant="glass" aria-label="Messages, 12 unread">${mail}</button>
        </okkly-badge>
        <okkly-badge badgeContent="128" max="99" color="primary">
          <button okklyIconButton variant="glass" aria-label="Cart, 128 items">${cart}</button>
        </okkly-badge>
      </div>`,
  }),
};

/**
 * `variant="dot"` drops the number and just says "something changed" — the right
 * choice when the exact count doesn't help the user decide anything.
 */
export const StatusDot: Story = {
  name: "Status dot",
  render: () => ({
    props: { bottomRight: { vertical: "bottom", horizontal: "right" } },
    template: `
      <div style="${surface}">
        <okkly-badge variant="dot" color="success"><okkly-avatar initials="OK" /></okkly-badge>
        <okkly-badge variant="dot" color="warning"><okkly-avatar initials="LM" color="indigo" /></okkly-badge>
        <okkly-badge variant="dot" color="danger" [anchorOrigin]="bottomRight">
          <okkly-avatar initials="AS" color="dante" />
        </okkly-badge>
      </div>`,
  }),
};

/**
 * `max` caps the number: anything above it renders as `{max}+`, so a runaway
 * count can't stretch the layout. `0` is hidden entirely.
 */
export const Overflow: Story = {
  render: () => ({
    props: { counts: [0, 9, 99, 100, 1240] },
    template: `
      <div style="${surface}">
        @for (count of counts; track count) {
          <div style="${column}">
            <okkly-badge [badgeContent]="count" color="dante">
              <button okklyIconButton variant="glass" [attr.aria-label]="count + ' notifications'">${bell}</button>
            </okkly-badge>
            <span style="${caption}">{{ count }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * With nothing projected the badge is a standalone pill — use it in table cells,
 * list rows, and tab labels, where it lines up with text instead of hanging off
 * a corner.
 */
export const Standalone: Story = {
  render: () => ({
    props: {
      rows: [
        { label: "Inbox", count: 12, color: "indigo" },
        { label: "Flagged", count: 3, color: "warning" },
        { label: "Failed deliveries", count: 128, color: "danger" },
        { label: "Archive", count: 0, color: "indigo" },
      ],
    },
    template: `
      <div style="${surface}; flex-direction: column; align-items: stretch; gap: 0; width: 360px; padding: 8px">
        @for (row of rows; track row.label) {
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 8px; font-size: var(--okkly-font-size-sm)">
            <span>{{ row.label }}</span>
            <okkly-badge [badgeContent]="row.count" [color]="row.color" />
          </div>
        }
      </div>`,
  }),
};

/**
 * `anchorOrigin` picks the corner and `overlap` tunes how far out the badge sits
 * — `circular` for avatars and round buttons, `rectangular` for cards and
 * thumbnails whose corners are square.
 */
export const Placement: Story = {
  render: () => ({
    props: {
      corners: [
        { vertical: "top", horizontal: "right" },
        { vertical: "top", horizontal: "left" },
        { vertical: "bottom", horizontal: "right" },
        { vertical: "bottom", horizontal: "left" },
      ],
    },
    template: `
      <div style="${surface}; flex-wrap: wrap; gap: 36px">
        @for (corner of corners; track corner.vertical + corner.horizontal) {
          <div style="${column}; gap: 12px">
            <okkly-badge badgeContent="7" color="dante" [anchorOrigin]="corner">
              <okkly-avatar initials="OK" />
            </okkly-badge>
            <span style="${caption}">{{ corner.vertical }}/{{ corner.horizontal }}</span>
          </div>
        }
        <div style="${column}; gap: 12px">
          <okkly-badge badgeContent="7" color="dante" overlap="rectangular">
            <okkly-avatar initials="OK" shape="rounded" />
          </okkly-badge>
          <span style="${caption}">rectangular</span>
        </div>
      </div>`,
  }),
};

/**
 * Every tone. Omit `color` for the neutral raised pill, which is the quiet option
 * for counts that carry no urgency.
 */
export const Colors: Story = {
  render: () => ({
    props: {
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
      ],
    },
    template: `
      <div style="${surface}; flex-wrap: wrap; gap: 18px">
        @for (color of colors; track $index) {
          <div style="${column}; gap: 8px">
            <okkly-badge badgeContent="8" [color]="color" />
            <span style="${caption}">{{ color ?? "neutral" }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * `invisible` hides the badge without removing the anchor — handy when a count
 * drops to nothing but you don't want the icon to jump.
 */
export const Invisible: Story = {
  render: () => ({
    props: { unread: 6 },
    template: `
      <div style="${surface}">
        <okkly-badge [badgeContent]="unread" color="dante" [invisible]="unread === 0">
          <button okklyIconButton variant="glass" [attr.aria-label]="'Notifications, ' + unread + ' unread'">${bell}</button>
        </okkly-badge>
        <button okklyButton size="small" variant="soft" (click)="unread = unread + 1">New notification</button>
        <button okklyButton size="small" variant="ghost" (click)="unread = 0">Mark all read</button>
      </div>`,
  }),
};

/**
 * The number is decorative markup — assistive tech reads the anchor, not the
 * pill. Put the count in the anchor's accessible name so both audiences get the
 * same information.
 */
export const AccessibleCounts: Story = {
  name: "Accessible counts",
  render: () => ({
    template: `
      <div style="${surface}; flex-direction: column; align-items: flex-start; gap: 14px">
        <okkly-badge badgeContent="4" color="dante">
          <button okklyIconButton variant="glass" aria-label="Notifications, 4 unread">${bell}</button>
        </okkly-badge>
        <p style="margin: 0; max-width: 420px; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
          The button above announces “Notifications, 4 unread”. Keep that label in sync with
          <code>badgeContent</code> — a badge on its own announces nothing.
        </p>
      </div>`,
  }),
};
