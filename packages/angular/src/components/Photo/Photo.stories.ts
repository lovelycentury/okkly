import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyPhoto, OkklyPhotoFallback } from "./Photo";
import type { PhotoRadius, PhotoSize, PhotoVariant } from "./Photo";
import oleksiiInParis from "./assets/oleksii-paris.jpg";

/** Every input the Playground binds. */
type PhotoArgs = {
  image: string | undefined;
  alt: string;
  variant: PhotoVariant;
  size: PhotoSize;
  radius: PhotoRadius;
  scrim: boolean;
  transparent: boolean;
  loading: boolean;
  caption: string | undefined;
};

const surface =
  "display: flex; flex-wrap: wrap; align-items: flex-end; gap: 24px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";
const labelled = "display: grid; gap: 10px; justify-items: center";
const caption = "margin: 0; font-size: var(--okkly-font-size-sm); color: var(--okkly-text-muted)";

/**
 * A portrait or a hero cutout on a dark surface — a framed photo, not a generic
 * `<img>`. For icons and logos use SVG; for a photo inside a card, `okklyCardMedia`.
 *
 * `alt` is required, and it is required even when there is no image: with `image`
 * omitted or broken the frame falls back to a silhouette that is exposed as an
 * image named by that same `alt`, so the slot never becomes an unlabelled blank.
 */
const meta: Meta<PhotoArgs> = {
  title: "Media/Photo",
  component: OkklyPhoto,
  decorators: [moduleMetadata({ imports: [OkklyPhoto, OkklyPhotoFallback] })],
  args: {
    alt: "Oleksii in Paris",
    image: oleksiiInParis,
    variant: "plain",
    size: "md",
    radius: "xl",
    scrim: false,
    transparent: false,
    loading: false,
    caption: undefined,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "framed", "scrim", "noir", "cutout"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    radius: { control: "inline-radio", options: ["none", "sm", "md", "lg", "xl"] },
    scrim: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    transparent: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    loading: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    caption: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-photo
          [image]="image" [alt]="alt" [variant]="variant" [size]="size" [radius]="radius"
          [scrim]="scrim" [transparent]="transparent" [loading]="loading" [caption]="caption"
        />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<PhotoArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The five treatments. `plain` is the frame alone; `framed` insets a hard border;
 * `scrim` darkens the bottom for text; `noir` closes in from three sides for a
 * dramatic crop; `cutout` throws the frame away entirely, for a transparent PNG
 * that should sit directly on the page.
 */
export const Variants: Story = {
  render: () => ({
    props: { photo: oleksiiInParis, variants: ["plain", "framed", "scrim", "noir", "cutout"] },
    template: `
      <div style="${surface}">
        @for (variant of variants; track variant) {
          <div style="${labelled}">
            <okkly-photo [image]="photo" alt="Oleksii in Paris" [variant]="variant" size="sm" />
            <p style="${caption}">{{ variant }}</p>
          </div>
        }
      </div>`,
  }),
};

/**
 * A `caption` sits over the bottom of the frame, and brings the scrim with it —
 * light text laid straight onto an unknown photo is a coin toss, so the gradient
 * is not optional here even on `plain`.
 */
export const WithACaption: Story = {
  name: "With a caption",
  render: () => ({
    props: { photo: oleksiiInParis, variants: ["plain", "scrim", "noir"] },
    template: `
      <div style="${surface}">
        @for (variant of variants; track variant) {
          <div style="${labelled}">
            <okkly-photo
              [image]="photo" alt="Oleksii Kryshtopa" [variant]="variant"
              caption="Oleksii Kryshtopa" size="sm"
            />
            <p style="${caption}">{{ variant }} + caption</p>
          </div>
        }
      </div>`,
  }),
};

/**
 * A row of team portraits — the shape this component was cut for. One size, one
 * treatment, captions carrying the names.
 */
export const AProfileRow: Story = {
  name: "A profile row",
  render: () => ({
    props: {
      people: [
        { name: "Oleksii Kryshtopa", image: oleksiiInParis },
        { name: "Anna Berg", image: undefined },
        { name: "Marek Kovac", image: undefined },
      ],
    },
    template: `
      <div style="${surface}">
        @for (person of people; track person.name) {
          <okkly-photo
            [image]="person.image" [alt]="person.name" variant="scrim"
            [caption]="person.name" size="sm"
          />
        }
      </div>`,
  }),
};

/**
 * No `image`, or an image that fails to load, leaves the silhouette. It is
 * exposed as an image named by `alt`, so the layout keeps its shape and the slot
 * keeps its name. Project an `okklyPhotoFallback` to replace the silhouette.
 */
export const Placeholders: Story = {
  render: () => ({
    template: `
      <div style="${surface}">
        <div style="${labelled}">
          <okkly-photo alt="Portrait not provided" size="sm" />
          <p style="${caption}">no image</p>
        </div>
        <div style="${labelled}">
          <okkly-photo image="/does-not-exist.jpg" alt="Anna Berg" size="sm" />
          <p style="${caption}">broken src → silhouette</p>
        </div>
        <div style="${labelled}">
          <okkly-photo alt="Anna Berg" size="sm">
            <span okklyPhotoFallback style="font-size: 40px; font-weight: 600; color: var(--okkly-accent-primary)">AB</span>
          </okkly-photo>
          <p style="${caption}">custom fallback</p>
        </div>
      </div>`,
  }),
};

/**
 * `loading` opts into a pulsing skeleton until the image reports back. Leave it
 * off and the image simply draws when it arrives — the frame already reserves the
 * space either way, so nothing reflows.
 */
export const Loading: Story = {
  render: () => ({
    props: { photo: oleksiiInParis, fresh: `${oleksiiInParis}?cache-bust=${Date.now()}` },
    template: `
      <div style="${surface}">
        <div style="${labelled}">
          <okkly-photo [image]="fresh" alt="Oleksii in Paris" loading size="sm" />
          <p style="${caption}">loading</p>
        </div>
        <div style="${labelled}">
          <okkly-photo [image]="photo" alt="Oleksii in Paris" size="sm" />
          <p style="${caption}">no skeleton</p>
        </div>
      </div>`,
  }),
};

/**
 * Three fixed portrait sizes, all at the same 3:4 ratio. The frame crops to
 * `cover`, so a landscape source is centre-cropped rather than letterboxed.
 */
export const Sizes: Story = {
  render: () => ({
    props: { photo: oleksiiInParis, sizes: ["sm", "md", "lg"] },
    template: `
      <div style="${surface}">
        @for (size of sizes; track size) {
          <div style="${labelled}">
            <okkly-photo [image]="photo" alt="Oleksii in Paris" [size]="size" />
            <p style="${caption}">{{ size }}</p>
          </div>
        }
      </div>`,
  }),
};

/**
 * `radius` runs from square to the default `xl`. It is ignored on `cutout`, which
 * has no frame to round.
 */
export const Radius: Story = {
  render: () => ({
    props: { photo: oleksiiInParis, radii: ["none", "sm", "md", "lg", "xl"] },
    template: `
      <div style="${surface}">
        @for (radius of radii; track radius) {
          <div style="${labelled}">
            <okkly-photo [image]="photo" alt="Oleksii in Paris" [radius]="radius" size="sm" />
            <p style="${caption}">{{ radius }}</p>
          </div>
        }
      </div>`,
  }),
};
