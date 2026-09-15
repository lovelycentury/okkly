import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Box from "./Box.vue";
import type { BoxColorToken, BoxProps } from "./Box.types";

const SURFACE_TOKENS = [
  "bg.canvas",
  "bg.inset",
  "bg.surface",
  "bg.surface-raised",
  "accent.primary",
  "accent.secondary",
  "accent.dante",
] as const satisfies readonly BoxColorToken[];

/** `label` fills the default slot; everything else is a prop. */
type BoxArgs = BoxProps & { label: string };

const label = "font-family: var(--okkly-font-family-sans); font-size: var(--okkly-font-size-sm)";

/**
 * The layout primitive: a `div` — or any element, through `as` — that takes
 * MUI-style system props. Numeric spacing steps on the 4px scale (`:p="2"` is
 * 8px), colors name design tokens (`bgcolor="bg.surface-raised"`), and every
 * prop accepts one value per breakpoint (`:flex-direction="{ base: 'column',
 * md: 'row' }"`) — no stylesheet needed for one-off layout.
 */
const meta: Meta<BoxArgs> = {
  title: "Helpers/Box",
  component: Box,
  args: {
    label: "A box with a 16px padding",
    p: 4,
    bgcolor: "bg.surface-raised",
    border: 1,
    borderColor: "border.subtle",
    borderRadius: 3,
    color: "text.primary",
  },
  argTypes: {
    label: { control: "text", description: "Default slot — the content." },
    display: { control: "select", options: ["block", "flex", "inline-flex", "grid", "none"] },
    flexDirection: { control: "inline-radio", options: ["row", "column"] },
    alignItems: { control: "select", options: ["stretch", "flex-start", "center", "flex-end"] },
    justifyContent: {
      control: "select",
      options: ["flex-start", "center", "flex-end", "space-between"],
    },
    bgcolor: { control: "select", options: SURFACE_TOKENS },
    borderColor: {
      control: "select",
      options: ["border.subtle", "border.default", "border.strong"],
    },
    color: { control: "select", options: ["text.primary", "text.secondary", "text.muted"] },
    as: { control: false },
  },
  render: (args) => ({
    components: { Box },
    setup() {
      const { label: content, ...props } = args;
      return { content, props, label };
    },
    template: `<Box v-bind="props" :style="label">{{ content }}</Box>`,
  }),
};

export default meta;
type Story = StoryObj<BoxArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The 4px scale: `:p="1"` is 4px, `:p="4"` 16px, `:p="8"` 32px. Strings pass
 * through as CSS (`p="1.25rem"`).
 */
export const SpacingScale: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label, steps: [1, 2, 4, 6, 8] }),
    template: `
      <Box display="flex" align-items="flex-end" :gap="4" color="text.secondary" :style="label">
        <Box v-for="step in steps" :key="step" display="flex" flex-direction="column" align-items="center" :gap="2">
          <Box bgcolor="bg.surface-raised" :border="1" border-color="border.default" :p="step">
            <Box :width="24" :height="24" bgcolor="accent.primary" :border-radius="1" />
          </Box>
          p={{ step }} · {{ step * 4 }}px
        </Box>
      </Box>`,
  }),
};

/**
 * A settings row built from Boxes alone: a flex row that pushes its action to
 * the far edge, with token colors and a hairline border.
 */
export const SettingsRow: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label }),
    template: `
      <Box
        display="flex" align-items="center" justify-content="space-between" :gap="4"
        :px="5" :py="4" :max-width="480" bgcolor="bg.surface-raised"
        :border="1" border-color="border.subtle" :border-radius="3" :style="label"
      >
        <Box display="flex" flex-direction="column" :gap="1">
          <Box color="text.primary">Weekly digest</Box>
          <Box color="text.secondary">A summary of your projects every Monday.</Box>
        </Box>
        <Box as="button" type="button" :px="3" :py="2" :border-radius="2" bgcolor="accent.primary">
          Enable
        </Box>
      </Box>`,
  }),
};

/**
 * Every prop takes one value per breakpoint. These cards stack below `md`
 * (993px) and sit side by side from there up, with a larger gap and padding —
 * resize the canvas to watch it switch.
 */
export const Responsive: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label, steps: ["Plan", "Build", "Ship"] }),
    template: `
      <Box
        display="flex"
        :flex-direction="{ base: 'column', md: 'row' }"
        :gap="{ base: 2, md: 6 }"
        :p="{ base: 3, md: 6 }"
        bgcolor="bg.inset" :border-radius="3" :style="label"
      >
        <Box
          v-for="step in steps" :key="step" :flex-grow="1" :p="4" bgcolor="bg.surface-raised"
          :border="1" border-color="border.subtle" :border-radius="2" color="text.primary"
        >
          {{ step }}
        </Box>
      </Box>`,
  }),
};

/**
 * `@`-keys answer to the nearest `container` Box instead of the window. The
 * same card sits in a narrow region and a wide one: it stacks in the first and
 * lays out as a row in the second, whatever the window size. Drag either
 * region's corner to resize it and watch the card switch at `@md` (640px).
 */
export const ContainerQueries: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label, widths: [280, 720] }),
    template: `
      <Box display="flex" :gap="4" align-items="flex-start" :style="label">
        <Box
          v-for="width in widths" :key="width" container :width="width" :p="2"
          :border="1" border-color="border.default" :border-radius="3"
          style="resize: horizontal; overflow: auto"
        >
          <Box
            display="flex"
            :flex-direction="{ base: 'column', '@md': 'row' }"
            :align-items="{ '@md': 'center' }"
            :gap="{ base: 2, '@md': 4 }"
            :p="{ base: 3, '@md': 5 }"
            bgcolor="bg.surface-raised" :border="1" border-color="border.subtle"
            :border-radius="3" color="text.primary"
          >
            <Box
              :width="{ base: 1, '@md': 120 }" :height="72" :flex-shrink="0"
              bgcolor="accent.secondary" :border-radius="2"
            />
            <Box display="flex" flex-direction="column" :gap="1">
              <Box>Quarterly report</Box>
              <Box color="text.secondary">Stacked below a 640px container, a row from there up.</Box>
            </Box>
          </Box>
        </Box>
      </Box>`,
  }),
};

/**
 * `as` swaps the element without touching the styling — here a `section`
 * landmark wrapping a list, both laid out through system props.
 */
export const PolymorphicAs: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label, files: ["roadmap.pdf", "brand.fig", "notes.md"] }),
    template: `
      <Box as="section" aria-label="Recent files" :p="4" bgcolor="bg.surface" :border-radius="3">
        <Box as="ul" display="flex" flex-direction="column" :gap="2" :m="0" :p="0" :style="label">
          <Box as="li" v-for="file in files" :key="file" color="text.secondary" style="list-style: none">
            {{ file }}
          </Box>
        </Box>
      </Box>`,
  }),
};

/**
 * Numeric spacing is a `calc` on `--okkly-space-unit`, so overriding the unit
 * on a Box rescales every numeric step inside it — here the same layout on a
 * 4px and a 6px unit.
 */
export const CustomStyling: Story = {
  render: () => ({
    components: { Box },
    setup: () => ({ label, units: ["0.25rem", "0.375rem"] }),
    template: `
      <Box display="flex" :gap="6" align-items="flex-start" :style="label">
        <Box
          v-for="unit in units" :key="unit" display="flex" flex-direction="column" :gap="2" :p="4"
          bgcolor="bg.surface-raised" :border-radius="3" color="text.secondary"
          :style="{ '--okkly-space-unit': unit }"
        >
          <Box :width="48" :height="8" bgcolor="accent.primary" :border-radius="1" />
          <Box :width="32" :height="8" bgcolor="accent.secondary" :border-radius="1" />
          unit {{ unit }}
        </Box>
      </Box>`,
  }),
};
