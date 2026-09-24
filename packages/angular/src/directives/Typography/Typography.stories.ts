import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyTypography } from "./Typography";
import type { TypographyAlign, TypographyColor, TypographyVariant } from "./Typography";

/**
 * The element each variant reads best as by default, for the `Scale` story
 * below only — `OkklyTypography` has no `as` and therefore no such map of its
 * own; the consumer picks the element by writing it, as `okklyBox` does.
 * Mirrors `TYPOGRAPHY_VARIANTS` in `@okkly/react`'s `Typography.tsx`.
 */
const VARIANT_ELEMENTS: Record<TypographyVariant, string> = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h2",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "label-md": "span",
  "label-sm": "span",
  caption: "span",
  overline: "span",
  "mono-sm": "code",
};
const VARIANTS = Object.keys(VARIANT_ELEMENTS) as TypographyVariant[];

/** Every input the Playground binds, plus `label` for the projected content. */
type TypographyArgs = {
  label: string;
  variant: TypographyVariant;
  color: TypographyColor;
  align: TypographyAlign;
  gutterBottom: boolean;
  noWrap: boolean;
};

/**
 * Every step of the editorial type scale, from `display-2xl` down to `mono-sm`. Each
 * variant carries its own size, line height, weight and tracking.
 *
 * `OkklyTypography` (`[okklyTypography]`) is a directive, not a component: it puts the
 * scale's classes on whatever element the markup calls for, so there is no `as` to
 * decouple the look from the element — put it on the element you want, as `okklyBox` does.
 */
const meta: Meta<TypographyArgs> = {
  title: "Data/Typography",
  component: OkklyTypography,
  decorators: [moduleMetadata({ imports: [OkklyTypography] })],
  args: {
    label: "The quick brown fox jumps over the lazy dog",
    variant: "body-md",
    color: "inherit",
    align: "inherit",
    gutterBottom: false,
    noWrap: false,
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here. `booleanAttribute` inputs need an explicit
  // one — their compiled default reads as the whole `input()` call, which
  // Storybook cannot infer a toggle from.
  argTypes: {
    label: { control: "text", description: "Projected content." },
    variant: { control: "select", options: VARIANTS },
    color: {
      control: "select",
      options: [
        "inherit",
        "primary",
        "secondary",
        "muted",
        "accent",
        "success",
        "warning",
        "danger",
      ],
    },
    align: { control: "inline-radio", options: ["inherit", "left", "center", "right", "justify"] },
    gutterBottom: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    noWrap: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => ({
    props: args,
    template: `<p okklyTypography [variant]="variant" [color]="color" [align]="align" [gutterBottom]="gutterBottom" [noWrap]="noWrap">{{ label }}</p>`,
  }),
};

export default meta;
type Story = StoryObj<TypographyArgs>;

/**
 * This example shows the default state: `body-md`, on a paragraph, inheriting
 * the surrounding colour.
 */
export const Default: Story = {};

/**
 * The whole scale in order. The label above each sample names the element that
 * variant reads best as — `OkklyTypography` does not pick it for you.
 */
export const Scale: Story = {
  render: () => ({
    props: { variants: VARIANTS, elements: VARIANT_ELEMENTS },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem">
        @for (variant of variants; track variant) {
          <div>
            <div okklyTypography variant="label-sm" color="muted">{{ variant }} → &lt;{{ elements[variant] }}&gt;</div>
            <div okklyTypography [variant]="variant">Aa — the quick brown fox</div>
          </div>
        }
      </div>`,
  }),
};

/**
 * There is no `as`: `okklyTypography variant="h1"` looks the same wherever it
 * sits, because the classes are all it adds. All three of these are styled as
 * an `h1` while being a different element.
 */
export const PolymorphicAs: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <h1 okklyTypography variant="h1">Default element for the variant (h1)</h1>
        <div okklyTypography variant="h1">Same styling, rendered as a div</div>
        <a okklyTypography variant="h1" href="https://okkly.dev">Rendered as a link</a>
      </div>`,
  }),
};

/**
 * Semantic colours. `inherit` is the default so text picks up whatever surface
 * it lands on.
 */
export const Colors: Story = {
  render: () => ({
    props: {
      colors: [
        "inherit",
        "primary",
        "secondary",
        "muted",
        "accent",
        "success",
        "warning",
        "danger",
      ],
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        @for (color of colors; track color) {
          <p okklyTypography [color]="color">{{ color }}</p>
        }
      </div>`,
  }),
};

/**
 * Alignment, a size-proportional bottom gutter, and single-line truncation.
 */
export const Modifiers: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 22rem">
        <div>
          <h3 okklyTypography variant="h3" gutterBottom>Heading with a gutter</h3>
          <p okklyTypography>The gutter scales with the step above it, not a fixed 8px.</p>
        </div>

        <p okklyTypography align="center">Centred</p>
        <p okklyTypography align="right">Right aligned</p>

        <p okklyTypography noWrap>
          A single line that is far too long for its container and therefore ends in an ellipsis
        </p>
      </div>`,
  }),
};

/**
 * A realistic block: eyebrow, title, lead paragraph and metadata, each mapped
 * to the step it is meant for.
 */
export const InContext: Story = {
  render: () => ({
    template: `
      <article style="max-width: 34rem">
        <div okklyTypography variant="overline" gutterBottom>Case study</div>
        <h2 okklyTypography variant="display-lg" gutterBottom>Orbit</h2>
        <p okklyTypography variant="body-lg" color="secondary" gutterBottom>
          Approve CV downloads by location and radius, on a map that stays readable at every zoom level.
        </p>
        <p okklyTypography variant="mono-sm" color="muted">orbit.okkly.dev</p>
      </article>`,
  }),
};
