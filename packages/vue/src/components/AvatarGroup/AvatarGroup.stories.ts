import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Avatar from "../Avatar/Avatar.vue";
import AvatarGroup from "./AvatarGroup.vue";
import type { AvatarGroupProps } from "./AvatarGroup.types";

/**
 * A stack of overlapping avatars for "who is on this". It takes plain
 * `Avatar` children and overrides their `size` and `color` so a row of them
 * can never come out ragged — pass the people, not the styling.
 *
 * Past `max` it collapses into a "+N" chip. `total` is there for the usual
 * case where the API hands you the first few members and a count: pass four
 * children and `total="31"` and the chip says +28, without inventing 27
 * avatars nobody will look at.
 */
const meta: Meta<AvatarGroupProps> = {
  title: "Data/AvatarGroup",
  component: AvatarGroup,
  args: {
    max: 5,
    size: "sm",
    spacing: "default",
    ring: true,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    spacing: { control: "inline-radio", options: ["dense", "default", "loose"] },
    ring: { control: "boolean" },
    max: { control: { type: "number", min: 1, max: 8 } },
    total: { control: { type: "number", min: 0, max: 99 } },
    hues: { control: false },
  },
  render: (args) => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ args, team: TEAM }),
    template: `
      <div style="${SURFACE}">
        <AvatarGroup v-bind="args" :hues="['mint', 'dante', 'indigo']">
          <Avatar v-for="member in team" :key="member.name" :initials="member.initials" />
        </AvatarGroup>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AvatarGroupProps>;

const SURFACE =
  "display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const CAPTION = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

const TEAM = [
  { name: "Oleksii Kryshtopa", initials: "OK" },
  { name: "Anna Berg", initials: "AB" },
  { name: "Marek Kovac", initials: "MK" },
  { name: "Lena Ford", initials: "LF" },
  { name: "Ravi Shah", initials: "RS" },
  { name: "Tom Iversen", initials: "TI" },
];

const members = (count: number) => TEAM.slice(0, count);

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The stack as it appears on a project row: the faces, then how many more
 * there are, then the label that says what the faces mean.
 */
export const OnAProjectRow: Story = {
  name: "On a project row",
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ six: members(6), three: members(3) }),
    template: `
      <div style="display: grid; gap: 18px; width: 360px; ${SURFACE}">
        <div style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :max="4" :total="31" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in six" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">31 collaborators</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :max="4" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in three" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">3 collaborators</span>
        </div>
      </div>`,
  }),
};

/**
 * Under `max` everything is shown. At or over it, one slot is given up to
 * the chip — `max={4}` with six children means three faces and "+3", never
 * four faces and "+2".
 */
export const Overflow: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ six: members(6), maxes: [6, 5, 4, 3] }),
    template: `
      <div style="display: grid; gap: 18px; ${SURFACE}">
        <div v-for="max in maxes" :key="max" style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :max="max" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in six" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">max={{ max }} of 6</span>
        </div>
      </div>`,
  }),
};

/**
 * `total` overrides what the chip counts, for the common case where the API
 * returns a handful of members plus a number. The children are still the
 * ones you get faces for.
 */
export const TotalCount: Story = {
  name: "Total count",
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ four: members(4), totals: [8, 31, 240] }),
    template: `
      <div style="display: grid; gap: 18px; ${SURFACE}">
        <div v-for="total in totals" :key="total" style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :max="4" :total="total" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in four" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">total={{ total }}, 4 children</span>
        </div>
      </div>`,
  }),
};

/**
 * `spacing` sets how far the faces climb onto each other. `dense` fits a
 * long stack into a table cell; `loose` keeps every face legible.
 */
export const Spacing: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ five: members(5), spacings: ["dense", "default", "loose"] as const }),
    template: `
      <div style="display: grid; gap: 18px; ${SURFACE}">
        <div v-for="spacing in spacings" :key="spacing" style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :spacing="spacing" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in five" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">{{ spacing }}</span>
        </div>
      </div>`,
  }),
};

/**
 * `size` is applied to every member, overriding whatever the child `Avatar`
 * asked for. That is the point: a stack with one odd-sized face in it looks
 * broken.
 */
export const Sizes: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ four: members(4), sizes: ["sm", "md", "lg"] as const }),
    template: `
      <div style="display: grid; gap: 18px; ${SURFACE}">
        <div v-for="size in sizes" :key="size" style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :size="size" :max="4" :total="12" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in four" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">{{ size }}</span>
        </div>
      </div>`,
  }),
};

/**
 * The separator ring is painted in `--okkly-bg-canvas` to look punched out
 * of the page — which only works while the stack *is* on the canvas. On a
 * raised card, retint `--okkly-avatar-group-ring-color`, or turn the ring
 * off.
 */
export const RingOnAnotherSurface: Story = {
  name: "Ring on another surface",
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ four: members(4) }),
    template: `
      <div style="display: grid; gap: 16px; width: 360px; ${SURFACE}">
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 14px; background: var(--okkly-bg-surface-raised)">
          <AvatarGroup :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in four" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">default ring — wrong colour here</span>
        </div>
        <div
          style="display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 14px; background: var(--okkly-bg-surface-raised); --okkly-avatar-group-ring-color: var(--okkly-bg-surface-raised)"
        >
          <AvatarGroup :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in four" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">ring retinted to the card</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup :ring="false" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in four" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">ring=false — works on any surface</span>
        </div>
      </div>`,
  }),
};

/**
 * `hues` cycles tones across the members in order, so a stack of initials
 * does not come out as one flat block of mint. Members with a photo ignore
 * it.
 */
export const Hues: Story = {
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ five: members(5) }),
    template: `
      <div style="display: grid; gap: 18px; ${SURFACE}">
        <div style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup size="md">
            <Avatar v-for="member in five" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">default — one tone</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <AvatarGroup size="md" :hues="['mint', 'dante', 'indigo']">
            <Avatar v-for="member in five" :key="member.name" :initials="member.initials" />
          </AvatarGroup>
          <span style="${CAPTION}">cycled</span>
        </div>
      </div>`,
  }),
};

/**
 * `shape="rounded"` members keep their corners, and the ring follows them
 * rather than drawing a circle around a squircle.
 */
export const RoundedMembers: Story = {
  name: "Rounded members",
  render: () => ({
    components: { AvatarGroup, Avatar },
    template: `
      <div style="${SURFACE}">
        <AvatarGroup size="md" spacing="loose" :hues="['mint', 'dante', 'indigo']">
          <Avatar initials="LK" shape="rounded" />
          <Avatar initials="AC" shape="rounded" />
          <Avatar initials="ZY" shape="rounded" />
        </AvatarGroup>
      </div>`,
  }),
};
