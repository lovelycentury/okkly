import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyAvatar } from "../Avatar/Avatar";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";
import { OkklyAvatarGroup, OkklyAvatarGroupItem } from "./AvatarGroup";
import type { AvatarGroupSize, AvatarGroupSpacing } from "./AvatarGroup";

/** Every input the Playground binds. */
type AvatarGroupArgs = {
  max: number;
  total: number | undefined;
  size: AvatarGroupSize;
  spacing: AvatarGroupSpacing;
  ring: boolean;
};

const TEAM = [
  { name: "Oleksii Kryshtopa", initials: "OK", src: oleksiiInParis },
  { name: "Anna Berg", initials: "AB", src: undefined },
  { name: "Marek Kovac", initials: "MK", src: undefined },
  { name: "Lena Ford", initials: "LF", src: undefined },
  { name: "Ravi Shah", initials: "RS", src: undefined },
  { name: "Tom Iversen", initials: "TI", src: undefined },
];
const HUES = ["mint", "dante", "indigo"];

/** `count` members of the team, each marked as a group item. */
const members = (count: number) => `
  @for (member of team.slice(0, ${count}); track member.name) {
    <okkly-avatar *okklyAvatarGroupItem [initials]="member.initials" [src]="member.src" />
  }`;

const surface =
  "display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const stack = `display: grid; gap: 18px; ${surface}`;
const row = "display: flex; align-items: center; gap: 12px";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * A stack of overlapping avatars for "who is on this". Each member is an
 * `okkly-avatar` marked `*okklyAvatarGroupItem`; the group overrides their `size`
 * and `color` so a row of them can never come out ragged — pass the people, not
 * the styling.
 *
 * Past `max` it collapses into a "+N" chip. `total` is there for the usual case
 * where the API hands you the first few members and a count: pass four members
 * and `total="31"` and the chip says +28, without inventing 27 avatars nobody
 * will look at.
 */
const meta: Meta<AvatarGroupArgs> = {
  title: "Data/AvatarGroup",
  component: OkklyAvatarGroup,
  decorators: [moduleMetadata({ imports: [OkklyAvatarGroup, OkklyAvatarGroupItem, OkklyAvatar] })],
  args: {
    max: 5,
    total: undefined,
    size: "sm",
    spacing: "default",
    ring: true,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    spacing: { control: "inline-radio", options: ["dense", "default", "loose"] },
    ring: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    max: { control: { type: "number", min: 1, max: 8 } },
    total: { control: { type: "number", min: 0, max: 99 } },
  },
  // An array input with no useful control; the Hues story shows it.
  parameters: { controls: { exclude: ["hues"] } },
  render: (args) => ({
    props: { ...args, team: TEAM, hues: HUES },
    template: `
      <div style="${surface}">
        <okkly-avatar-group [max]="max" [total]="total" [size]="size" [spacing]="spacing" [ring]="ring" [hues]="hues">
          ${members(6)}
        </okkly-avatar-group>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AvatarGroupArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The stack as it appears on a project row: the faces, then how many more there
 * are, then the label that says what the faces mean.
 */
export const OnAProjectRow: Story = {
  name: "On a project row",
  render: () => ({
    props: { team: TEAM, hues: HUES },
    template: `
      <div style="${stack}; width: 360px">
        <div style="${row}">
          <okkly-avatar-group max="4" total="31" [hues]="hues">${members(6)}</okkly-avatar-group>
          <span style="${caption}">31 collaborators</span>
        </div>
        <div style="${row}">
          <okkly-avatar-group max="4" [hues]="hues">${members(3)}</okkly-avatar-group>
          <span style="${caption}">3 collaborators</span>
        </div>
      </div>`,
  }),
};

/**
 * Under `max` everything is shown. At or over it, one slot is given up to the
 * chip — `max="4"` with six members means three faces and "+3", never four
 * faces and "+2".
 */
export const Overflow: Story = {
  render: () => ({
    props: { team: TEAM, hues: HUES, maxes: [6, 5, 4, 3] },
    template: `
      <div style="${stack}">
        @for (max of maxes; track max) {
          <div style="${row}">
            <okkly-avatar-group [max]="max" [hues]="hues">${members(6)}</okkly-avatar-group>
            <span style="${caption}">max={{ max }} of 6</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * `total` overrides what the chip counts, for the common case where the API
 * returns a handful of members plus a number. The members are still the ones
 * you get faces for.
 */
export const TotalCount: Story = {
  name: "Total count",
  render: () => ({
    props: { team: TEAM, hues: HUES, totals: [8, 31, 240] },
    template: `
      <div style="${stack}">
        @for (total of totals; track total) {
          <div style="${row}">
            <okkly-avatar-group max="4" [total]="total" [hues]="hues">${members(4)}</okkly-avatar-group>
            <span style="${caption}">total={{ total }}, 4 members</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * `spacing` sets how far the faces climb onto each other. `dense` fits a long
 * stack into a table cell; `loose` keeps every face legible.
 */
export const Spacing: Story = {
  render: () => ({
    props: { team: TEAM, hues: HUES, spacings: ["dense", "default", "loose"] },
    template: `
      <div style="${stack}">
        @for (spacing of spacings; track spacing) {
          <div style="${row}">
            <okkly-avatar-group [spacing]="spacing" [hues]="hues">${members(5)}</okkly-avatar-group>
            <span style="${caption}">{{ spacing }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * `size` is applied to every member, overriding whatever the avatar asked for.
 * That is the point: a stack with one odd-sized face in it looks broken.
 */
export const Sizes: Story = {
  render: () => ({
    props: { team: TEAM, hues: HUES, sizes: ["sm", "md", "lg"] },
    template: `
      <div style="${stack}">
        @for (size of sizes; track size) {
          <div style="${row}">
            <okkly-avatar-group [size]="size" max="4" total="12" [hues]="hues">${members(4)}</okkly-avatar-group>
            <span style="${caption}">{{ size }}</span>
          </div>
        }
      </div>`,
  }),
};

/**
 * The separator ring is painted in `--okkly-bg-canvas` to look punched out of the
 * page — which only works while the stack *is* on the canvas. On a raised card,
 * retint `--okkly-avatar-group-ring-color`, or turn the ring off.
 */
export const RingOnAnotherSurface: Story = {
  name: "Ring on another surface",
  render: () => ({
    props: { team: TEAM, hues: HUES },
    template: `
      <div style="${stack}; width: 360px; gap: 16px">
        <div style="${row}; padding: 14px; border-radius: 14px; background: var(--okkly-bg-surface-raised)">
          <okkly-avatar-group [hues]="hues">${members(4)}</okkly-avatar-group>
          <span style="${caption}">default ring — wrong colour here</span>
        </div>
        <div style="${row}; padding: 14px; border-radius: 14px; background: var(--okkly-bg-surface-raised)">
          <okkly-avatar-group [hues]="hues" style="--okkly-avatar-group-ring-color: var(--okkly-bg-surface-raised)">${members(4)}</okkly-avatar-group>
          <span style="${caption}">ring retinted to the card</span>
        </div>
        <div style="${row}">
          <okkly-avatar-group ring="false" [hues]="hues">${members(4)}</okkly-avatar-group>
          <span style="${caption}">ring="false" — works on any surface</span>
        </div>
      </div>`,
  }),
};

/**
 * `hues` cycles tones across the members in order, so a stack of initials does not
 * come out as one flat block of mint. Members with a photo ignore it.
 */
export const Hues: Story = {
  render: () => ({
    props: { team: TEAM, hues: HUES },
    template: `
      <div style="${stack}">
        <div style="${row}">
          <okkly-avatar-group size="md">${members(5)}</okkly-avatar-group>
          <span style="${caption}">default — one tone</span>
        </div>
        <div style="${row}">
          <okkly-avatar-group size="md" [hues]="hues">${members(5)}</okkly-avatar-group>
          <span style="${caption}">cycled</span>
        </div>
      </div>`,
  }),
};

/**
 * `shape="rounded"` members keep their corners, and the ring follows them rather
 * than drawing a circle around a squircle.
 */
export const RoundedMembers: Story = {
  name: "Rounded members",
  render: () => ({
    props: { hues: HUES },
    template: `
      <div style="${surface}">
        <okkly-avatar-group size="md" spacing="loose" [hues]="hues">
          <okkly-avatar *okklyAvatarGroupItem initials="LK" shape="rounded" />
          <okkly-avatar *okklyAvatarGroupItem initials="AC" shape="rounded" />
          <okkly-avatar *okklyAvatarGroupItem initials="ZY" shape="rounded" />
        </okkly-avatar-group>
      </div>`,
  }),
};
