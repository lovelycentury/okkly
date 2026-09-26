import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import {
  iconBell,
  iconFolder,
  iconGlobe,
  iconLock,
  iconPalette,
  iconTrash,
  iconUser,
} from "@okkly/icons";
import { OkklyAvatar } from "../Avatar/Avatar";
import { OkklyBadge } from "../Badge/Badge";
import { OkklyIcon } from "../Icon/Icon";
import { OkklySwitch } from "../Switch/Switch";
import {
  OkklyList,
  OkklyListItem,
  OkklyListItemEnd,
  OkklyListItemIcon,
  OkklyListItemStart,
  OkklyListItemText,
} from "./List";

/** Every input the Playground binds. */
type ListArgs = {
  dense: boolean;
  disablePadding: boolean;
  subheader?: string;
};

const surface =
  "width: 380px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

/** An `@okkly/icons` glyph in the leading slot. */
const glyph = (svg: string) =>
  `<okkly-list-item-icon okklyListItemStart>${svg}</okkly-list-item-icon>`;

/**
 * A vertical run of rows on one surface — settings, menus, anything where the
 * items are siblings rather than a grid of records. For tabular data with columns
 * that line up, reach for `Table` instead.
 *
 * `li[okklyListItem]` renders one of two things. Plain, it is an `li` you can put
 * anything in. Given `button`, the row's content becomes a real `<button>` inside
 * the `li`, which is what makes Enter, Space, and focus work without this
 * component reimplementing any of it — listen with `(itemClick)`. A control tagged
 * `okklyListItemEnd` deliberately stays *outside* that button — a switch nested
 * inside a button is unreachable.
 */
const meta: Meta<ListArgs> = {
  title: "Data/List",
  component: OkklyList,
  decorators: [
    moduleMetadata({
      imports: [
        OkklyList,
        OkklyListItem,
        OkklyListItemText,
        OkklyListItemIcon,
        OkklyListItemStart,
        OkklyListItemEnd,
        OkklyAvatar,
        OkklyBadge,
        OkklyIcon,
        OkklySwitch,
      ],
    }),
  ],
  args: {
    dense: false,
    disablePadding: false,
  },
  argTypes: {
    dense: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disablePadding: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    subheader: { control: "text" },
  },
  parameters: { controls: { exclude: ["modifiers"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <ul okklyList [dense]="dense" [disablePadding]="disablePadding" [subheader]="subheader">
          <li okklyListItem button>${glyph(iconUser)}<okkly-list-item-text primary="Profile" secondary="Name, photo, and handle" /></li>
          <li okklyListItem button selected>${glyph(iconBell)}<okkly-list-item-text primary="Notifications" secondary="Email and push" /></li>
          <li okklyListItem button>${glyph(iconLock)}<okkly-list-item-text primary="Security" secondary="Password and sessions" /></li>
        </ul>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ListArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The settings pane this component is shaped for. `selected` marks where the user
 * currently is — one row at a time, kept in the parent's state.
 */
export const SettingsMenu: Story = {
  name: "Settings menu",
  render: () => ({
    props: {
      active: "appearance",
      sections: [
        { id: "profile", icon: iconUser, primary: "Profile", secondary: "Name, photo, and handle" },
        {
          id: "appearance",
          icon: iconPalette,
          primary: "Appearance",
          secondary: "Theme and density",
        },
        {
          id: "notifications",
          icon: iconBell,
          primary: "Notifications",
          secondary: "Email and push",
        },
        { id: "language", icon: iconGlobe, primary: "Language", secondary: "English (UK)" },
      ],
    },
    template: `
      <div style="${surface}">
        <ul okklyList subheader="Settings">
          @for (section of sections; track section.id) {
            <li okklyListItem button [selected]="active === section.id" (itemClick)="active = section.id">
              <okkly-list-item-icon okklyListItemStart><okkly-icon [icon]="section.icon" /></okkly-list-item-icon>
              <okkly-list-item-text [primary]="section.primary" [secondary]="section.secondary" />
            </li>
          }
        </ul>
      </div>`,
  }),
};

/**
 * A control tagged `okklyListItemEnd` sits outside the row's button so it stays
 * focusable and clickable — nesting a switch inside a button would make it neither.
 */
export const WithSecondaryActions: Story = {
  name: "With secondary actions",
  render: () => ({
    props: { email: true, push: false },
    template: `
      <div style="${surface}">
        <ul okklyList subheader="Notifications">
          <li okklyListItem>
            <okkly-list-item-text primary="Email digest" secondary="Once a week, on Mondays" />
            <okkly-switch okklyListItemEnd [(checked)]="email" aria-label="Email digest" />
          </li>
          <li okklyListItem>
            <okkly-list-item-text primary="Push alerts" secondary="Mentions and direct messages" />
            <okkly-switch okklyListItemEnd [(checked)]="push" aria-label="Push alerts" />
          </li>
          <li okklyListItem button>
            ${glyph(iconFolder)}
            <okkly-list-item-text primary="Archived threads" />
            <okkly-badge okklyListItemEnd [badgeContent]="12" />
          </li>
        </ul>
      </div>`,
  }),
};

/**
 * Rows can hold whatever you put in them — `okkly-list-item-text` is a convenience
 * for the common two-line shape, not a requirement. Here the leading slot takes an
 * avatar rather than an icon.
 */
export const WithAvatars: Story = {
  name: "With avatars",
  render: () => ({
    props: {
      rows: [
        {
          initials: "AB",
          name: "Anna Berg",
          line: "Pushed the token rename",
          unread: 3,
          color: "mint",
        },
        {
          initials: "MK",
          name: "Marek Kovac",
          line: "Can you look at the Table specs?",
          unread: 0,
          color: "dante",
        },
        { initials: "LF", name: "Lena Ford", line: "Shipped 🎉", unread: 0, color: "indigo" },
      ],
    },
    template: `
      <div style="${surface}">
        <ul okklyList subheader="Recent conversations">
          @for (row of rows; track row.name) {
            <li okklyListItem button>
              <okkly-avatar okklyListItemStart [initials]="row.initials" size="sm" [color]="row.color" />
              <okkly-list-item-text [primary]="row.name" [secondary]="row.line" />
              @if (row.unread > 0) {
                <okkly-badge okklyListItemEnd [badgeContent]="row.unread" />
              }
            </li>
          }
        </ul>
      </div>`,
  }),
};

/**
 * `dense` tightens the row padding and drops the list's own gutter — for a long
 * list in a sidebar, where the outer padding is wasted space.
 */
export const Dense: Story = {
  render: () => ({
    props: { densities: [false, true], labels: ["Overview", "Tracks", "Artwork", "Release dates"] },
    template: `
      <div style="display: grid; gap: 18px; ${surface}">
        @for (dense of densities; track dense) {
          <ul okklyList [dense]="dense" [subheader]="dense ? 'dense' : 'default'">
            @for (label of labels; track label) {
              <li okklyListItem button [dense]="dense">${glyph(iconFolder)}<okkly-list-item-text [primary]="label" /></li>
            }
          </ul>
        }
      </div>`,
  }),
};

/**
 * A `disabled` row is dimmed and taken out of the tab order — the underlying
 * `<button>` carries the real `disabled` attribute, so it is not merely
 * pointer-events-none.
 */
export const DisabledRows: Story = {
  name: "Disabled rows",
  render: () => ({
    template: `
      <div style="${surface}">
        <ul okklyList subheader="Danger zone">
          <li okklyListItem button>${glyph(iconFolder)}<okkly-list-item-text primary="Duplicate project" /></li>
          <li okklyListItem button disabled>${glyph(iconTrash)}<okkly-list-item-text primary="Delete project" secondary="Only the owner can do this" /></li>
        </ul>
      </div>`,
  }),
};

/**
 * `subheader` labels the group. It renders as an `li`, so the `ul` stays valid —
 * a heading dropped straight into a list would not be.
 */
export const Grouped: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 18px; ${surface}">
        <ul okklyList subheader="Workspace">
          <li okklyListItem button>${glyph(iconUser)}<okkly-list-item-text primary="Members" secondary="8 people" /></li>
          <li okklyListItem button>${glyph(iconLock)}<okkly-list-item-text primary="Permissions" /></li>
        </ul>
        <ul okklyList subheader="Account">
          <li okklyListItem button>${glyph(iconGlobe)}<okkly-list-item-text primary="Language" secondary="English (UK)" /></li>
        </ul>
      </div>`,
  }),
};

/**
 * `disablePadding` strips the list's gutter while keeping the row padding — use it
 * when the list is flush inside a card that already has padding of its own.
 */
export const DisablePadding: Story = {
  name: "Disable padding",
  render: () => ({
    props: { labels: ["Overview", "Tracks", "Artwork"] },
    template: `
      <div style="${surface}">
        <ul okklyList disablePadding>
          @for (label of labels; track label) {
            <li okklyListItem button><okkly-list-item-text [primary]="label" /></li>
          }
        </ul>
      </div>`,
  }),
};
