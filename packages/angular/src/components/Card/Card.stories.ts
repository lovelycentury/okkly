import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyAvatar } from "../Avatar/Avatar";
import { OkklyButton } from "../Button/Button";
import { OkklyIconButton } from "../IconButton/IconButton";
import {
  OkklyCard,
  OkklyCardAction,
  OkklyCardActions,
  OkklyCardAvatar,
  OkklyCardContent,
  OkklyCardHeader,
  OkklyCardMedia,
} from "./Card";
import type { CardColor, CardPadding, CardVariant } from "./Card";

/** Served from `@okkly/react`'s Photo assets through Storybook's `staticDirs`. */
const oleksiiInParis = "photos/oleksii-paris.jpg";

/** `iconMoreHorizontal` from `@okkly/icons`, inlined. */
const moreIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;
const moreButton = `<button okklyIconButton okklyCardAction variant="ghost" aria-label="More options">${moreIcon}</button>`;

/** Every input the Playground binds. */
type CardArgs = {
  variant: CardVariant;
  padding: CardPadding;
  color: CardColor;
  interactive: boolean;
  raised: boolean;
};

const surface = "font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const row = `display: flex; flex-wrap: wrap; align-items: flex-start; gap: 18px; ${surface}`;
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * A surface that groups one thing: a release, a member, a setting. It is composed,
 * not configured — `okkly-card-header`, `img[okklyCardMedia]`, `okkly-card-content`,
 * and `okkly-card-actions` each own their padding, and you use the ones you need in
 * the order you need them.
 *
 * `interactive` is for cards where the whole surface is the target: it adds the
 * cursor, the hover lift, and the shadow. It does not make the card focusable or
 * clickable — put a real link or button inside, or wrap the card in one. A div
 * that only *looks* tappable is worse than one that doesn't.
 */
const meta: Meta<CardArgs> = {
  title: "Media/Card",
  component: OkklyCard,
  decorators: [
    moduleMetadata({
      imports: [
        OkklyCard,
        OkklyCardHeader,
        OkklyCardContent,
        OkklyCardActions,
        OkklyCardMedia,
        OkklyCardAvatar,
        OkklyCardAction,
        OkklyAvatar,
        OkklyButton,
        OkklyIconButton,
      ],
    }),
  ],
  args: {
    variant: "solid",
    padding: "md",
    color: "primary",
    interactive: false,
    raised: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["solid", "raised", "glass", "outline", "aura"] },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    color: { control: "inline-radio", options: ["primary", "dante", "indigo"] },
    interactive: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    raised: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 340px; ${surface}">
        <okkly-card [variant]="variant" [padding]="padding" [color]="color" [interactive]="interactive" [raised]="raised">
          <okkly-card-header title="Night drive vol. 2" subheader="Released 14 March">
            <okkly-avatar okklyCardAvatar initials="OK" size="sm" />
            ${moreButton}
          </okkly-card-header>
          <okkly-card-content>Eleven tracks recorded between Kyiv and Lisbon over the winter.</okkly-card-content>
          <okkly-card-actions>
            <button okklyButton size="small">Play</button>
            <button okklyButton size="small" variant="ghost">Share</button>
          </okkly-card-actions>
        </okkly-card>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<CardArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The full stack, in the order the slots are meant to appear: media, header,
 * content, actions. The media bleeds to the card's edges because the card clips
 * its own corners — it takes no padding of its own.
 */
export const ReleaseCard: Story = {
  name: "Release card",
  render: () => ({
    props: { photo: oleksiiInParis },
    template: `
      <div style="width: 340px; ${surface}">
        <okkly-card>
          <img okklyCardMedia [src]="photo" height="180" />
          <okkly-card-header title="Night drive vol. 2" subheader="Released 14 March · 11 tracks">
            <okkly-avatar okklyCardAvatar initials="OK" size="sm" />
          </okkly-card-header>
          <okkly-card-content>
            Recorded between Kyiv and Lisbon over the winter, mixed on a pair of speakers that have
            seen better decades.
          </okkly-card-content>
          <okkly-card-actions>
            <button okklyButton size="small">Play</button>
            <button okklyButton size="small" variant="ghost">Add to library</button>
          </okkly-card-actions>
        </okkly-card>
      </div>`,
  }),
};

/**
 * Five surfaces. `solid` is the default page card; `raised` lifts it with a
 * shadow; `glass` is for cards over imagery; `outline` gives a border and no fill;
 * `aura` adds an accent glow, and is the only variant `color` applies to.
 */
export const Variants: Story = {
  render: () => ({
    props: { variants: ["solid", "raised", "glass", "outline", "aura"] },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 240px); gap: 18px; ${surface}">
        @for (variant of variants; track variant) {
          <okkly-card [variant]="variant">
            <okkly-card-header [title]="variant" subheader="Surface treatment" />
            <okkly-card-content>The same content on every surface, so the difference is the surface.</okkly-card-content>
          </okkly-card>
        }
      </div>`,
  }),
};

/**
 * `color` tints the `aura` glow and its border, and does nothing anywhere else —
 * it is a property of that one treatment, not a card-wide accent.
 */
export const AuraColors: Story = {
  name: "Aura colors",
  render: () => ({
    props: { colors: ["primary", "dante", "indigo"] },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 240px); gap: 18px; ${surface}">
        @for (color of colors; track color) {
          <okkly-card variant="aura" [color]="color">
            <okkly-card-header [title]="color" subheader="aura" />
            <okkly-card-content>The glow and the border pick up the tone.</okkly-card-content>
          </okkly-card>
        }
      </div>`,
  }),
};

/**
 * Hover the cards below. `interactive` lifts the card, deepens the border, and
 * adds a shadow — and the whole surface is wrapped in a link, which is what makes
 * it actually reachable by keyboard.
 */
export const Interactive: Story = {
  render: () => ({
    props: {
      items: [
        { title: "Static card", interactive: false },
        { title: "Interactive card", interactive: true },
      ],
    },
    template: `
      <div style="${row}">
        @for (item of items; track item.title) {
          <a href="#release" style="width: 240px; text-decoration: none; border-radius: 1.25rem; display: block">
            <okkly-card [interactive]="item.interactive">
              <okkly-card-header [title]="item.title" subheader="Hover me" />
              <okkly-card-content>{{ item.interactive ? "Lifts on hover." : "Stays put." }}</okkly-card-content>
            </okkly-card>
          </a>
        }
      </div>`,
  }),
};

/**
 * `padding` scales the inset used by the header, the content, and the actions
 * together. `none` is for cards that are entirely media, or that hold a component
 * bringing its own padding — a `List`, say.
 */
export const Padding: Story = {
  render: () => ({
    props: { paddings: ["none", "sm", "md", "lg"] },
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 200px); gap: 18px; ${surface}">
        @for (padding of paddings; track padding) {
          <div style="display: grid; gap: 8px">
            <okkly-card [padding]="padding">
              <okkly-card-header title="Night drive" subheader="vol. 2" />
              <okkly-card-content>Padding: {{ padding }}.</okkly-card-content>
            </okkly-card>
            <p style="${caption}">{{ padding }}</p>
          </div>
        }
      </div>`,
  }),
};

/**
 * `okkly-card-header` has four slots and any of them can be left out. The action
 * is pinned to the trailing edge, so a header without a subheader still lines up.
 */
export const HeaderSlots: Story = {
  name: "Header slots",
  render: () => ({
    template: `
      <div style="display: grid; gap: 18px; width: 340px; ${surface}">
        <okkly-card><okkly-card-header title="Title only" /></okkly-card>
        <okkly-card><okkly-card-header title="Title and subheader" subheader="Released 14 March" /></okkly-card>
        <okkly-card>
          <okkly-card-header title="With an avatar" subheader="Oleksii Kryshtopa">
            <okkly-avatar okklyCardAvatar initials="OK" size="sm" />
          </okkly-card-header>
        </okkly-card>
        <okkly-card>
          <okkly-card-header title="With an action" subheader="The action is pinned right">
            ${moreButton}
          </okkly-card-header>
        </okkly-card>
      </div>`,
  }),
};

/**
 * `okklyCardMedia` takes a pixel number or any CSS length for `height`, and always
 * crops to `cover`. Its `alt` defaults to empty — the image is decoration next to
 * the title. Give it a real `alt` only when it carries information the text does
 * not.
 */
export const Media: Story = {
  render: () => ({
    props: { photo: oleksiiInParis, heights: [120, 180, 240] },
    template: `
      <div style="${row}">
        @for (height of heights; track height) {
          <okkly-card padding="sm" style="width: 220px">
            <img okklyCardMedia [src]="photo" [height]="height" />
            <okkly-card-content>height={{ height }}</okkly-card-content>
          </okkly-card>
        }
      </div>`,
  }),
};
