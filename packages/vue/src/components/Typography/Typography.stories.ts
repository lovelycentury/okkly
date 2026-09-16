import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Typography, { TYPOGRAPHY_VARIANTS } from "./Typography.vue";
import type { TypographyProps, TypographyVariant } from "./Typography.types";

/** `label` fills the default slot; everything else is a prop. */
type TypographyArgs = TypographyProps & { label?: string };

/**
 * Every step of the editorial type scale, from `display-2xl` down to
 * `mono-sm`. Each variant carries its own size, line height, weight and
 * tracking, and renders a sensible element by default — `h1` for headings,
 * `p` for body, `code` for mono.
 *
 * When the semantics and the look need to disagree, `as` overrides the
 * element without touching the styling: `<Typography variant="h1" as="div">`
 * looks like a page title but leaves the document outline alone.
 */
const meta: Meta<TypographyArgs> = {
  title: "Data/Typography",
  component: Typography,
  args: {
    label: "The quick brown fox jumps over the lazy dog",
  },
  argTypes: {
    label: { control: "text", description: "Default slot — the text." },
    variant: { control: "select", options: Object.keys(TYPOGRAPHY_VARIANTS) },
    as: { control: false },
  },
  render: (args) => ({
    components: { Typography },
    setup() {
      const { label, ...props } = args;
      return { label, props };
    },
    template: `<Typography v-bind="props">{{ label }}</Typography>`,
  }),
};

export default meta;
type Story = StoryObj<TypographyArgs>;

/**
 * This example shows the default state: `body-md`, rendered as a paragraph,
 * inheriting the surrounding colour.
 */
export const Default: Story = {};

/**
 * The whole scale in order, with the element each step renders as by default.
 */
export const Scale: Story = {
  render: () => ({
    components: { Typography },
    setup: () => ({
      variants: Object.keys(TYPOGRAPHY_VARIANTS) as TypographyVariant[],
      TYPOGRAPHY_VARIANTS,
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem">
        <div v-for="variant in variants" :key="variant">
          <Typography variant="label-sm" color="muted" as="div">
            {{ variant }} → &lt;{{ TYPOGRAPHY_VARIANTS[variant] }}&gt;
          </Typography>
          <Typography :variant="variant">Aa — the quick brown fox</Typography>
        </div>
      </div>`,
  }),
};

/**
 * `as` decouples the look from the markup. All three of these are styled as
 * an `h1` while rendering different elements.
 */
export const PolymorphicAs: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <Typography variant="h1">Default element for the variant (h1)</Typography>
        <Typography variant="h1" as="div">Same styling, rendered as a div</Typography>
        <Typography variant="h1" as="a" href="https://okkly.dev">Rendered as a link</Typography>
      </div>`,
  }),
};

/**
 * Semantic colours. `inherit` is the default so text picks up whatever
 * surface it lands on.
 */
export const Colors: Story = {
  render: () => ({
    components: { Typography },
    setup: () => ({
      colors: [
        "inherit",
        "primary",
        "secondary",
        "muted",
        "accent",
        "success",
        "warning",
        "danger",
      ] as const,
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <Typography v-for="color in colors" :key="color" :color="color">{{ color }}</Typography>
      </div>`,
  }),
};

/**
 * Alignment, a size-proportional bottom gutter, and single-line truncation.
 */
export const Modifiers: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 22rem">
        <div>
          <Typography variant="h3" gutter-bottom>Heading with a gutter</Typography>
          <Typography>The gutter scales with the step above it, not a fixed 8px.</Typography>
        </div>

        <Typography align="center">Centred</Typography>
        <Typography align="right">Right aligned</Typography>

        <Typography no-wrap>
          A single line that is far too long for its container and therefore ends in an ellipsis
        </Typography>
      </div>`,
  }),
};

/**
 * A realistic block: eyebrow, title, lead paragraph and metadata, each
 * mapped to the step it is meant for.
 */
export const InContext: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <article style="max-width: 34rem">
        <Typography variant="overline" gutter-bottom as="div">Case study</Typography>
        <Typography variant="display-lg" gutter-bottom>Orbit</Typography>
        <Typography variant="body-lg" color="secondary" gutter-bottom>
          Approve CV downloads by location and radius, on a map that stays readable at every zoom level.
        </Typography>
        <Typography variant="mono-sm" color="muted">orbit.okkly.dev</Typography>
      </article>`,
  }),
};
