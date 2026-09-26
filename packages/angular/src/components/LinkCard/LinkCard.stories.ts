import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyLinkCard } from "./LinkCard";
import type { LinkCardColor, LinkCardSize } from "./LinkCard";

/** Every input the Playground binds, plus the anchor's `href`. */
type LinkCardArgs = {
  title: string;
  subtitle?: string;
  meta?: string;
  featured: boolean;
  color: LinkCardColor;
  size: LinkCardSize;
  href: string;
};

// `minmax(0, 1fr)`, not the default `auto`: an auto grid track sizes to its
// content's minimum, so a long unbreakable title would widen the column past the
// container instead of being truncated by the card.
const surface =
  "display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; width: 460px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * The signature "vizitka" row: a tappable link to a destination (writing, work,
 * socials) with a title, a supporting line and a trailing tag.
 *
 * `OkklyLinkCard` decorates the element you write — `<a okklyLinkCard href>` to
 * navigate, `<div okklyLinkCard interactive>` to act on this page, or a plain
 * `<div okklyLinkCard>` for a row that is not live yet.
 */
const meta: Meta<LinkCardArgs> = {
  title: "Media/LinkCard",
  component: OkklyLinkCard,
  decorators: [moduleMetadata({ imports: [OkklyLinkCard] })],
  args: {
    title: "Writing",
    subtitle: "Essays on design systems and audio",
    meta: "24 posts",
    size: "medium",
    color: "primary",
    featured: false,
    href: "#writing",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    featured: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    meta: { control: "text" },
    href: { control: "text", description: "The anchor's own `href`." },
  },
  parameters: { controls: { exclude: ["interactive", "isInteractiveDiv", "modifiers"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <a okklyLinkCard [href]="href" [title]="title" [subtitle]="subtitle" [meta]="meta"
          [featured]="featured" [color]="color" [size]="size"></a>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<LinkCardArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The whole point: a page that is nothing but these. One row is `featured`, which
 * is what draws the eye to the thing you actually want clicked.
 */
export const ALinksPage: Story = {
  name: "A links page",
  render: () => ({
    template: `
      <div style="${surface}">
        <a okklyLinkCard href="#writing" featured title="Night drive vol. 2" subtitle="New record, out now" meta="album"></a>
        <a okklyLinkCard href="#essays" title="Writing" subtitle="Essays on design systems and audio" meta="24 posts"></a>
        <a okklyLinkCard href="#work" title="Work" subtitle="Selected projects, 2019—2026" meta="12 cases"></a>
        <a okklyLinkCard href="#github" title="GitHub" subtitle="Open source and half-finished experiments" meta="@okkly"></a>
        <div okklyLinkCard title="Newsletter" subtitle="Not open yet — soon" meta="soon"></div>
      </div>`,
  }),
};

/**
 * `featured` swaps the surface for glass, adds an accent dot before the title, and
 * tints the arrow and the glow with `color`. One per page.
 */
export const Featured: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <a okklyLinkCard href="#a" title="Regular row" subtitle="Surface, subtle border" meta="default"></a>
        <a okklyLinkCard href="#b" featured title="Featured row" subtitle="Glass, accent dot, glow" meta="featured"></a>
      </div>`,
  }),
};

/**
 * `color` only shows up on a `featured` row — it drives the dot, the arrow, and
 * the glow. On a regular row it is stored and unused.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="${surface}">
        @for (color of colors; track color) {
          <a okklyLinkCard [href]="'#' + color" featured [color]="color" [title]="color" subtitle="featured" [meta]="color"></a>
        }
      </div>`,
  }),
};

/**
 * Three densities. `small` fits a sidebar; `large` is for a page where three rows
 * are the entire content.
 */
export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="${surface}">
        @for (size of sizes; track size) {
          <a okklyLinkCard [href]="'#' + size" [size]="size" [title]="'Writing (' + size + ')'" subtitle="Essays" meta="24"></a>
        }
      </div>`,
  }),
};

/**
 * Everything but the title is optional. Without `subtitle` the row halves in
 * height; without `meta` the arrow moves to the trailing edge on its own.
 */
export const Slots: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <a okklyLinkCard href="#a" title="Title only"></a>
        <a okklyLinkCard href="#b" title="With a subtitle" subtitle="Essays on design systems and audio"></a>
        <a okklyLinkCard href="#c" title="With meta" meta="24 posts"></a>
        <a okklyLinkCard href="#d" title="Everything" subtitle="Essays on design systems and audio" meta="24 posts"></a>
        <a okklyLinkCard href="#e" title="A title long enough that it has nowhere left to go and has to be cut off"
          subtitle="The title truncates; the meta never shrinks" meta="@a-long-handle"></a>
      </div>`,
  }),
};

/**
 * An `interactive` `<div>` is a button: focusable with Tab, activated by Enter
 * *and* Space. Use it for rows that do something on this page rather than
 * navigating away.
 */
export const AsAButton: Story = {
  name: "As a button",
  render: () => ({
    props: { count: 0 },
    template: `
      <div style="${surface}">
        <div okklyLinkCard interactive title="Copy my email address" subtitle="Nothing navigates — this one acts"
          [meta]="count > 0 ? 'copied' : 'click me'" (click)="count = count + 1"></div>
        <p style="${caption}">Activated {{ count }} times. Tab to it and press Space.</p>
      </div>`,
  }),
};

/**
 * A plain `<div>` row is inert: no cursor, no focus, no role. That is the right
 * way to show something that is coming but not live — better than a link to
 * nowhere.
 */
export const Static: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <a okklyLinkCard href="#live" title="Live" subtitle="Has an href" meta="→"></a>
        <div okklyLinkCard title="Not live yet" subtitle="No href, not interactive — inert" meta="soon"></div>
      </div>`,
  }),
};
