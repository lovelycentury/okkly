import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Avatar from "./Avatar.vue";
import type { AvatarProps } from "./Avatar.types";

// A neutral placeholder portrait, inlined so the stories pull in no build-time
// asset import — @okkly/react's stories use a real photo from its own Photo
// fixtures, which this package doesn't have a copy of.
const PLACEHOLDER_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#2b2f3a"/><circle cx="48" cy="38" r="18" fill="#5b6478"/><path d="M14 96c0-19.9 15.3-36 34-36s34 16.1 34 36z" fill="#5b6478"/></svg>`,
)}`;

/**
 * The person, compressed to one glyph. An avatar carries an image when there
 * is one and the person's initials when there isn't — and it flips to the
 * initials on its own if the image 404s, so a dead CDN never leaves a hole in
 * a member list.
 *
 * It says nothing to a screen reader unless you give it `alt`. That is
 * usually right: an avatar next to a name is decoration, and announcing
 * "Oleksii Kryshtopa" twice helps nobody. Set `alt` only when the avatar
 * stands alone.
 */
const meta: Meta<AvatarProps> = {
  title: "Data/Avatar",
  component: Avatar,
  args: {
    initials: "OK",
    size: "md",
    shape: "circle",
    color: "mint",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "rounded"] },
    color: { control: "inline-radio", options: ["mint", "dante", "indigo"] },
    status: { control: "inline-radio", options: [undefined, "online", "offline"] },
  },
  render: (args) => ({
    components: { Avatar },
    setup: () => ({ args }),
    template: `<div style="${SURFACE}"><Avatar v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<AvatarProps>;

const SURFACE =
  "display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const CAPTION = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * With `src` the image fills the frame, cropped to `cover` — so a portrait
 * and a landscape both come out as the same circle.
 */
export const WithAPhoto: Story = {
  name: "With a photo",
  render: () => ({
    components: { Avatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="${SURFACE}">
        <Avatar :src="photo" alt="Portrait" size="sm" />
        <Avatar :src="photo" alt="Portrait" />
        <Avatar :src="photo" alt="Portrait" size="lg" />
        <Avatar :src="photo" alt="Portrait" size="lg" shape="rounded" />
      </div>`,
  }),
};

/**
 * No image, so the initials carry it. Only the first two characters are
 * used — pass the whole name if you like, `"Oleksii Kryshtopa"` still
 * renders as "OL". Feed it the initials you actually want.
 */
export const Initials: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div style="${SURFACE}">
        <Avatar initials="OK" />
        <Avatar initials="AB" color="dante" />
        <Avatar initials="MK" color="indigo" />
        <Avatar initials="R" />
        <Avatar initials="" />
      </div>`,
  }),
};

/**
 * A broken `src` falls back to the initials rather than to a broken-image
 * icon. The image below points nowhere on purpose — this is what your users
 * get when the avatar host is down.
 */
export const BrokenImage: Story = {
  name: "Broken image",
  render: () => ({
    components: { Avatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="${SURFACE}; gap: 24px">
        <div style="display: grid; gap: 8px; justify-items: center">
          <Avatar :src="photo" initials="OK" alt="Loads" />
          <p style="${CAPTION}">loads</p>
        </div>
        <div style="display: grid; gap: 8px; justify-items: center">
          <Avatar src="/does-not-exist.jpg" initials="OK" alt="404" />
          <p style="${CAPTION}">404 → initials</p>
        </div>
      </div>`,
  }),
};

/**
 * `status` adds a presence dot. Its ring is painted in `--okkly-bg-canvas`
 * so the dot reads as punched out of the page — on a lighter surface,
 * override `--okkly-avatar-status-border-color` to match whatever is
 * actually behind it.
 */
export const Presence: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="${SURFACE}; gap: 24px">
        <div style="display: grid; gap: 8px; justify-items: center">
          <Avatar :src="photo" alt="Online" status="online" />
          <p style="${CAPTION}">online</p>
        </div>
        <div style="display: grid; gap: 8px; justify-items: center">
          <Avatar initials="AB" color="dante" status="offline" />
          <p style="${CAPTION}">offline</p>
        </div>
        <div
          style="display: grid; gap: 8px; justify-items: center; padding: 12px; border-radius: 12px; background: var(--okkly-bg-surface-raised)"
        >
          <Avatar
            initials="MK"
            color="indigo"
            status="online"
            style="--okkly-avatar-status-border-color: var(--okkly-bg-surface-raised)"
          />
          <p style="${CAPTION}">ring retinted</p>
        </div>
      </div>`,
  }),
};

/**
 * The member row this component exists for: avatar, name, role. The avatar
 * has no `alt` here — the name is right next to it, and a second
 * announcement is noise.
 */
export const InAMemberList: Story = {
  name: "In a member list",
  render: () => ({
    components: { Avatar },
    setup: () => ({
      members: [
        { initials: "OK", name: "Oleksii Kryshtopa", role: "Design systems", status: "online" },
        { initials: "AB", name: "Anna Berg", role: "Front-end", color: "dante", status: "online" },
        {
          initials: "MK",
          name: "Marek Kovac",
          role: "Product",
          color: "indigo",
          status: "offline",
        },
      ] as const,
    }),
    template: `
      <div style="display: grid; gap: 14px; width: 320px; ${SURFACE}">
        <div v-for="member in members" :key="member.name" style="display: flex; align-items: center; gap: 12px">
          <Avatar :initials="member.initials" :color="member.color" :status="member.status" />
          <div style="display: grid; gap: 2px">
            <span style="font-size: var(--okkly-font-size-md)">{{ member.name }}</span>
            <span style="${CAPTION}">{{ member.role }}</span>
          </div>
        </div>
      </div>`,
  }),
};

/**
 * Three diameters, 36/48/64px. The status dot and the `rounded` corner
 * radius scale with them, so a small avatar does not end up with an
 * oversized dot.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ sizes: ["sm", "md", "lg"] as const }),
    template: `
      <div style="${SURFACE}; align-items: flex-end">
        <div v-for="size in sizes" :key="size" style="display: grid; gap: 8px; justify-items: center">
          <Avatar initials="OK" :size="size" status="online" />
          <p style="${CAPTION}">{{ size }}</p>
        </div>
      </div>`,
  }),
};

/**
 * `circle` for people, `rounded` for anything that is not a person — a
 * workspace, a bot, an integration.
 */
export const Shapes: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="${SURFACE}">
        <Avatar initials="OK" />
        <Avatar initials="LK" shape="rounded" />
        <Avatar :src="photo" alt="Portrait" shape="rounded" size="lg" />
      </div>`,
  }),
};

/**
 * `color` only shows through when there is no image — it tints the gradient
 * behind the initials. Deriving it from the name (hash the string, pick a
 * tone) keeps the same person the same colour everywhere.
 */
export const Colors: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ colors: ["mint", "dante", "indigo"] as const }),
    template: `
      <div style="${SURFACE}">
        <div v-for="color in colors" :key="color" style="display: grid; gap: 8px; justify-items: center">
          <Avatar initials="OK" :color="color" />
          <p style="${CAPTION}">{{ color }}</p>
        </div>
      </div>`,
  }),
};

/**
 * Standing on its own, an avatar needs `alt` — without it the whole thing is
 * hidden from assistive tech and the row it sits in reads as empty.
 */
export const AccessibleName: Story = {
  name: "Accessible name",
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: grid; gap: 16px; ${SURFACE}">
        <div style="display: flex; align-items: center; gap: 12px">
          <Avatar initials="OK" alt="Oleksii Kryshtopa" />
          <p style="${CAPTION}">alt set — exposed as an image named "Oleksii Kryshtopa"</p>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <Avatar initials="OK" />
          <p style="${CAPTION}">no alt — silent, correct only when a name sits beside it</p>
        </div>
      </div>`,
  }),
};
