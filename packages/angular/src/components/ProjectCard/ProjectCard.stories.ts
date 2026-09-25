import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyLogo } from "../Logo/Logo";
import oleksiiInParis from "../Photo/assets/oleksii-paris.jpg";
import { OkklyProjectCard, OkklyProjectCardLogo } from "./ProjectCard";

/** Every input the Playground binds, plus the anchor's `href`. */
type ProjectCardArgs = {
  title: string;
  description?: string;
  tags: string[];
  device: boolean;
  href: string;
};

const surface = "font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const grid = `display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; width: 820px; ${surface}`;
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/** The compact emblem the stories put in the logo slot. */
const logo = (attributes = "") =>
  `<okkly-logo okklyProjectCardLogo [showLabel]="false" [size]="32"${attributes} />`;

/**
 * The case-study tile for a portfolio: a wide card at a fixed 476:290 ratio, with
 * the artwork behind and the copy sitting on a scrim over it. It sizes to its
 * container's width — give it a grid cell and it fills it.
 *
 * On an `<a okklyProjectCard href>` the whole tile is a single link, which is why
 * the arrow in the corner is decorative: it is a picture of the link, not a second
 * one. On a `<div okklyProjectCard>` it is inert, for a case that is not published yet.
 */
const meta: Meta<ProjectCardArgs> = {
  title: "Media/ProjectCard",
  component: OkklyProjectCard,
  decorators: [moduleMetadata({ imports: [OkklyProjectCard, OkklyProjectCardLogo, OkklyLogo] })],
  args: {
    title: "Night drive",
    description: "A record, a site, and a token library that outlived both.",
    tags: ["Design system", "Audio"],
    device: false,
    href: "#case",
  },
  argTypes: {
    device: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    tags: { control: "object" },
    href: { control: "text", description: "The anchor's own `href`." },
  },
  parameters: { controls: { exclude: ["image", "hasLogo"] } },
  render: (args) => ({
    props: { ...args, image: oleksiiInParis },
    template: `
      <div style="width: 476px; ${surface}">
        <a okklyProjectCard [href]="href" [image]="image" [title]="title" [description]="description"
          [tags]="tags" [device]="device">${logo(` variant="outlined"`)}</a>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ProjectCardArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The portfolio grid this component is for. The tiles keep their ratio as the
 * column width changes, so the row stays even however many of them there are.
 */
export const APortfolioGrid: Story = {
  name: "A portfolio grid",
  render: () => ({
    props: { image: oleksiiInParis },
    template: `
      <div style="${grid}">
        <a okklyProjectCard href="#okkly" [image]="image" title="Okryshto"
          description="A design system in three frameworks, one token pipeline."
          [tags]="['Design system', 'Tokens']">${logo()}</a>
        <a okklyProjectCard href="#orbit" device title="Orbit"
          description="A messenger built on Fastify and Vue, shipped in six weeks."
          [tags]="['Product', 'Vue']">${logo(` tone="indigo"`)}</a>
        <a okklyProjectCard href="#vizitka" title="Vizitka" description="One page, five links, no framework."
          [tags]="['Web']">${logo(` tone="dante"`)}</a>
        <a okklyProjectCard href="#night-drive" [image]="image" title="Night drive"
          description="A record and the site that carries it." [tags]="['Audio', 'Web']">${logo()}</a>
      </div>`,
  }),
};

/**
 * Without an `image` the card falls back to its built-in gradient. That is a
 * finished state, not a broken one — a case study with no artwork yet still looks
 * like the others.
 */
export const WithoutAnImage: Story = {
  name: "Without an image",
  render: () => ({
    props: { image: oleksiiInParis },
    template: `
      <div style="${grid}">
        <a okklyProjectCard href="#a" title="Okryshto"
          description="A design system in three frameworks, one token pipeline."
          [tags]="['Design system', 'Tokens']">${logo()}</a>
        <a okklyProjectCard href="#b" [image]="image" title="Night drive"
          description="A record and the site that carries it." [tags]="['Audio', 'Web']">${logo(` tone="dante"`)}</a>
      </div>`,
  }),
};

/**
 * `device` drops a phone mockup into the corner, bleeding off the card edge. It is
 * decoration for app cases — it shows no real content and is hidden from assistive
 * tech.
 */
export const WithADevice: Story = {
  name: "With a device",
  render: () => ({
    props: { image: oleksiiInParis },
    template: `
      <div style="${grid}">
        <a okklyProjectCard href="#app" device title="Orbit"
          description="A messenger built on Fastify and Vue, shipped in six weeks."
          [tags]="['Product', 'Vue']">${logo(` tone="indigo"`)}</a>
        <a okklyProjectCard href="#app2" device [image]="image" title="Night drive"
          description="The mockup sits over the artwork." [tags]="['Audio']">${logo(` tone="dante"`)}</a>
      </div>`,
  }),
};

/**
 * Everything except `title` can be dropped. Tags wrap onto a second line when
 * there are enough of them; the description is capped so it never runs the width
 * of a wide card.
 *
 * Keep the description to a line or two. The tile holds its 476:290 ratio and
 * clips what does not fit, so a long one eats the bottom padding first and then
 * gets cut — two or three lines is the working budget, less if the card also
 * carries tags.
 */
export const Slots: Story = {
  render: () => ({
    template: `
      <div style="${grid}">
        <a okklyProjectCard href="#a" title="Title only"></a>
        <a okklyProjectCard href="#b" title="Title and description" description="One line of supporting copy."></a>
        <a okklyProjectCard href="#c" title="Tags that wrap"
          [tags]="['Design system', 'Tokens', 'Audio', 'Vue', 'React', 'Svelte']"></a>
        <a okklyProjectCard href="#d" title="Everything"
          description="A design system in three frameworks, one token pipeline, and about as much copy as this tile will take."
          [tags]="['Design system', 'Tokens']">${logo()}</a>
      </div>`,
  }),
};

/**
 * On an anchor the whole tile is one link — tab to it and the focus ring goes round
 * the card. On a div the tile is inert, for a case that is not published.
 */
export const LinkedAndStatic: Story = {
  name: "Linked and static",
  render: () => ({
    props: { image: oleksiiInParis },
    template: `
      <div style="display: grid; gap: 12px; ${surface}">
        <div style="${grid}">
          <a okklyProjectCard href="#linked" [image]="image" title="Linked"
            description="One anchor around the whole tile." [tags]="['Case study']">${logo()}</a>
          <div okklyProjectCard title="Not published" description="No href — nothing to tab to."
            [tags]="['Draft']">${logo(` tone="indigo"`)}</div>
        </div>
        <p style="${caption}">Tab through this story: only the first tile takes focus.</p>
      </div>`,
  }),
};
