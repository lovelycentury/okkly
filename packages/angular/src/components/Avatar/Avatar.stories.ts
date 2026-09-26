import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyAvatar } from "./Avatar";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";
import type { AvatarColor, AvatarShape, AvatarSize, AvatarStatus } from "./Avatar";

/** Every input the Playground binds. */
type AvatarArgs = {
  initials: string;
  src: string | undefined;
  alt: string | undefined;
  status: AvatarStatus | undefined;
  size: AvatarSize;
  shape: AvatarShape;
  color: AvatarColor;
};

const surface =
  "display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";
const column = "display: grid; gap: 8px; justify-items: center";

/**
 * The person, compressed to one glyph. An avatar carries an image when there is
 * one and the person's initials when there isn't — and it flips to the initials
 * on its own if the image 404s, so a dead CDN never leaves a hole in a member
 * list.
 *
 * It says nothing to a screen reader unless you give it `alt`. That is usually
 * right: an avatar next to a name is decoration, and announcing "Oleksii
 * Kryshtopa" twice helps nobody. Set `alt` only when the avatar stands alone.
 */
const meta: Meta<AvatarArgs> = {
  title: "Data/Avatar",
  component: OkklyAvatar,
  decorators: [moduleMetadata({ imports: [OkklyAvatar] })],
  args: {
    initials: "OK",
    src: undefined,
    alt: undefined,
    status: undefined,
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
    props: args,
    template: `
      <div style="${surface}">
        <okkly-avatar
          [initials]="initials" [src]="src" [alt]="alt" [status]="status"
          [size]="size" [shape]="shape" [color]="color"
        />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AvatarArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * With `src` the image fills the frame, cropped to `cover` — so a portrait and a
 * landscape both come out as the same circle.
 */
export const WithAPhoto: Story = {
  name: "With a photo",
  render: () => ({
    props: { photo: oleksiiInParis },
    template: `
      <div style="${surface}">
        <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" size="sm" />
        <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" />
        <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" size="lg" />
        <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" size="lg" shape="rounded" />
      </div>`,
  }),
};

/**
 * No image, so the initials carry it. Only the first two characters are used —
 * pass the whole name if you like, `"Oleksii Kryshtopa"` still renders as "OL".
 * Feed it the initials you actually want.
 */
export const Initials: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-avatar initials="OK" />
        <okkly-avatar initials="AB" color="dante" />
        <okkly-avatar initials="MK" color="indigo" />
        <okkly-avatar initials="R" />
        <okkly-avatar initials="" />
      </div>`,
  }),
};

/**
 * A broken `src` falls back to the initials rather than to a broken-image icon.
 * The image below points nowhere on purpose — this is what your users get when
 * the avatar host is down.
 */
export const BrokenImage: Story = {
  name: "Broken image",
  render: () => ({
    props: { photo: oleksiiInParis },
    template: `
      <div style="${surface}; gap: 24px">
        <div style="${column}">
          <okkly-avatar [src]="photo" initials="OK" alt="Oleksii Kryshtopa" />
          <p style="${caption}">loads</p>
        </div>
        <div style="${column}">
          <okkly-avatar src="/does-not-exist.jpg" initials="OK" alt="Oleksii Kryshtopa" />
          <p style="${caption}">404 → initials</p>
        </div>
      </div>`,
  }),
};

/**
 * `status` adds a presence dot. Its ring is painted in `--okkly-bg-canvas` so the
 * dot reads as punched out of the page — on a lighter surface, override
 * `--okkly-avatar-status-border-color` to match whatever is actually behind it.
 */
export const Presence: Story = {
  render: () => ({
    props: { photo: oleksiiInParis },
    template: `
      <div style="${surface}; gap: 24px">
        <div style="${column}">
          <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" status="online" />
          <p style="${caption}">online</p>
        </div>
        <div style="${column}">
          <okkly-avatar initials="AB" color="dante" status="offline" />
          <p style="${caption}">offline</p>
        </div>
        <div style="${column}; padding: 12px; border-radius: 12px; background: var(--okkly-bg-surface-raised)">
          <okkly-avatar
            initials="MK" color="indigo" status="online"
            style="--okkly-avatar-status-border-color: var(--okkly-bg-surface-raised)"
          />
          <p style="${caption}">ring retinted</p>
        </div>
      </div>`,
  }),
};

/**
 * The member row this component exists for: avatar, name, role. The avatar has no
 * `alt` here — the name is right next to it, and a second announcement is noise.
 */
export const InAMemberList: Story = {
  name: "In a member list",
  render: () => ({
    props: {
      members: [
        {
          initials: "OK",
          name: "Oleksii Kryshtopa",
          role: "Design systems",
          src: oleksiiInParis,
          color: "mint",
          status: "online",
        },
        {
          initials: "AB",
          name: "Anna Berg",
          role: "Front-end",
          src: undefined,
          color: "dante",
          status: "online",
        },
        {
          initials: "MK",
          name: "Marek Kovac",
          role: "Product",
          src: undefined,
          color: "indigo",
          status: "offline",
        },
      ],
    },
    template: `
      <div style="display: grid; gap: 14px; width: 320px; ${surface}">
        @for (member of members; track member.name) {
          <div style="display: flex; align-items: center; gap: 12px">
            <okkly-avatar
              [initials]="member.initials" [src]="member.src" [color]="member.color"
              [status]="member.status"
            />
            <div style="display: grid; gap: 2px">
              <span style="font-size: var(--okkly-font-size-md)">{{ member.name }}</span>
              <span style="${caption}">{{ member.role }}</span>
            </div>
          </div>
        }
      </div>`,
  }),
};

/**
 * Three diameters, 36/48/64px. The status dot and the `rounded` corner radius
 * scale with them, so a small avatar does not end up with an oversized dot.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["sm", "md", "lg"] },
    template: `
      <div style="${surface}; align-items: flex-end">
        @for (size of sizes; track size) {
          <div style="${column}">
            <okkly-avatar initials="OK" [size]="size" status="online" />
            <p style="${caption}">{{ size }}</p>
          </div>
        }
      </div>`,
  }),
};

/**
 * `circle` for people, `rounded` for anything that is not a person — a workspace,
 * a bot, an integration.
 */
export const Shapes: Story = {
  render: () => ({
    props: { photo: oleksiiInParis },
    template: `
      <div style="${surface}">
        <okkly-avatar initials="OK" />
        <okkly-avatar initials="LK" shape="rounded" />
        <okkly-avatar [src]="photo" alt="Oleksii Kryshtopa" shape="rounded" size="lg" />
      </div>`,
  }),
};

/**
 * `color` only shows through when there is no image — it tints the gradient
 * behind the initials. Deriving it from the name (hash the string, pick a tone)
 * keeps the same person the same colour everywhere.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["mint", "dante", "indigo"] },
    template: `
      <div style="${surface}">
        @for (color of colors; track color) {
          <div style="${column}">
            <okkly-avatar initials="OK" [color]="color" />
            <p style="${caption}">{{ color }}</p>
          </div>
        }
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
    template: `
      <div style="display: grid; gap: 16px; ${surface}">
        <div style="display: flex; align-items: center; gap: 12px">
          <okkly-avatar initials="OK" alt="Oleksii Kryshtopa" />
          <p style="${caption}">alt set — exposed as an image named “Oleksii Kryshtopa”</p>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <okkly-avatar initials="OK" />
          <p style="${caption}">no alt — silent, correct only when a name sits beside it</p>
        </div>
      </div>`,
  }),
};
