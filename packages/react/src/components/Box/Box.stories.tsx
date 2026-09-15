import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BOX_SYSTEM_PROPS, type BoxSystemPropName, type BoxValueKind } from "@okkly/shared";
import { Box } from "./Box";
import type { BoxColorToken } from "./Box.types";

/**
 * The type the Controls table shows for each system prop. react-docgen expands
 * the generic `BoxResponsive<T>` into its body with `T` unfilled, so the
 * readable form is spelled out here, from the kind of value each prop takes.
 */
const KIND_TYPES: Record<BoxValueKind, string> = {
  spacing: "BoxResponsive<BoxSpacing>",
  radius: "BoxResponsive<BoxSpacing>",
  size: "BoxResponsive<BoxSize>",
  color: "BoxResponsive<BoxColor>",
  border: "BoxResponsive<number | string>",
  keyword: "BoxResponsive<number | string>",
};
const KEYWORD_TYPES: Partial<Record<BoxSystemPropName, string>> = {
  display: "BoxResponsive<BoxDisplay>",
  flexDirection: "BoxResponsive<BoxFlexDirection>",
  flexWrap: "BoxResponsive<BoxFlexWrap>",
  alignItems: "BoxResponsive<BoxAlign>",
  justifyContent: "BoxResponsive<BoxJustify>",
  alignSelf: "BoxResponsive<BoxAlign>",
};
const systemPropTypes = Object.fromEntries(
  Object.entries(BOX_SYSTEM_PROPS).map(([prop, kind]) => [
    prop,
    { table: { type: { summary: KEYWORD_TYPES[prop as BoxSystemPropName] ?? KIND_TYPES[kind] } } },
  ]),
);

const SURFACE_TOKENS = [
  "bg.canvas",
  "bg.inset",
  "bg.surface",
  "bg.surface-raised",
  "accent.primary",
  "accent.secondary",
  "accent.dante",
] as const satisfies readonly BoxColorToken[];

/**
 * The layout primitive: a `div` — or any element, through `as` — that takes
 * MUI-style system props. Numeric spacing steps on the 4px scale (`p={2}` is
 * 8px), colors name design tokens (`bgcolor="bg.surface-raised"`), and every
 * prop accepts one value per breakpoint (`flexDirection={{ base: "column", md:
 * "row" }}`) — no stylesheet needed for one-off layout.
 */
const meta: Meta<typeof Box> = {
  title: "Helpers/Box",
  component: Box,
  args: {
    p: 4,
    bgcolor: "bg.surface-raised",
    border: 1,
    borderColor: "border.subtle",
    borderRadius: 3,
    color: "text.primary",
    children: "A box with a 16px padding",
  },
  argTypes: {
    ...systemPropTypes,
    display: {
      ...systemPropTypes.display,
      control: "select",
      options: ["block", "flex", "inline-flex", "grid", "none"],
    },
    flexDirection: {
      ...systemPropTypes.flexDirection,
      control: "inline-radio",
      options: ["row", "column"],
    },
    alignItems: {
      ...systemPropTypes.alignItems,
      control: "select",
      options: ["stretch", "flex-start", "center", "flex-end"],
    },
    justifyContent: {
      ...systemPropTypes.justifyContent,
      control: "select",
      options: ["flex-start", "center", "flex-end", "space-between"],
    },
    bgcolor: { ...systemPropTypes.bgcolor, control: "select", options: SURFACE_TOKENS },
    borderColor: {
      ...systemPropTypes.borderColor,
      control: "select",
      options: ["border.subtle", "border.default", "border.strong"],
    },
    color: {
      ...systemPropTypes.color,
      control: "select",
      options: ["text.primary", "text.secondary", "text.muted"],
    },
    as: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

const label: CSSProperties = {
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {
  render: (args) => (
    <Box {...args} style={label}>
      {args.children}
    </Box>
  ),
};

/**
 * The 4px scale: `p={1}` is 4px, `p={4}` 16px, `p={8}` 32px. Strings pass
 * through as CSS (`p="1.25rem"`).
 */
export const SpacingScale: Story = {
  render: () => (
    <Box display="flex" alignItems="flex-end" gap={4} style={label} color="text.secondary">
      {[1, 2, 4, 6, 8].map((step) => (
        <Box key={step} display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box bgcolor="bg.surface-raised" border={1} borderColor="border.default" p={step}>
            <Box width={24} height={24} bgcolor="accent.primary" borderRadius={1} />
          </Box>
          p={step} · {step * 4}px
        </Box>
      ))}
    </Box>
  ),
};

/**
 * A settings row built from Boxes alone: a flex row that pushes its action to
 * the far edge, with token colors and a hairline border.
 */
export const SettingsRow: Story = {
  render: () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      px={5}
      py={4}
      maxWidth={480}
      bgcolor="bg.surface-raised"
      border={1}
      borderColor="border.subtle"
      borderRadius={3}
      style={label}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Box color="text.primary">Weekly digest</Box>
        <Box color="text.secondary">A summary of your projects every Monday.</Box>
      </Box>
      <Box as="button" type="button" px={3} py={2} borderRadius={2} bgcolor="accent.primary">
        Enable
      </Box>
    </Box>
  ),
};

/**
 * Every prop takes one value per breakpoint. These cards stack below `md`
 * (993px) and sit side by side from there up, with a larger gap and padding —
 * resize the canvas to watch it switch.
 */
export const Responsive: Story = {
  render: () => (
    <Box
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      gap={{ base: 2, md: 6 }}
      p={{ base: 3, md: 6 }}
      bgcolor="bg.inset"
      borderRadius={3}
      style={label}
    >
      {["Plan", "Build", "Ship"].map((step) => (
        <Box
          key={step}
          flexGrow={1}
          p={4}
          bgcolor="bg.surface-raised"
          border={1}
          borderColor="border.subtle"
          borderRadius={2}
          color="text.primary"
        >
          {step}
        </Box>
      ))}
    </Box>
  ),
};

/**
 * `@`-keys answer to the nearest `container` Box instead of the window. The
 * same card sits in a narrow region and a wide one: it stacks in the first and
 * lays out as a row in the second, whatever the window size. Drag either
 * region's corner to resize it and watch the card switch at `@md` (640px).
 */
export const ContainerQueries: Story = {
  render: () => {
    const card = (
      <Box
        display="flex"
        flexDirection={{ base: "column", "@md": "row" }}
        alignItems={{ "@md": "center" }}
        gap={{ base: 2, "@md": 4 }}
        p={{ base: 3, "@md": 5 }}
        bgcolor="bg.surface-raised"
        border={1}
        borderColor="border.subtle"
        borderRadius={3}
        color="text.primary"
      >
        <Box
          width={{ base: 1, "@md": 120 }}
          height={72}
          flexShrink={0}
          bgcolor="accent.secondary"
          borderRadius={2}
        />
        <Box display="flex" flexDirection="column" gap={1}>
          <Box>Quarterly report</Box>
          <Box color="text.secondary">Stacked below a 640px container, a row from there up.</Box>
        </Box>
      </Box>
    );

    return (
      <Box display="flex" gap={4} alignItems="flex-start" style={label}>
        {[280, 720].map((width) => (
          <Box
            key={width}
            container
            width={width}
            p={2}
            border={1}
            borderColor="border.default"
            borderRadius={3}
            style={{ resize: "horizontal", overflow: "auto" }}
          >
            {card}
          </Box>
        ))}
      </Box>
    );
  },
};

/**
 * `as` swaps the element without touching the styling — here a `section`
 * landmark wrapping a list, both laid out through system props.
 */
export const PolymorphicAs: Story = {
  render: () => (
    <Box as="section" aria-label="Recent files" p={4} bgcolor="bg.surface" borderRadius={3}>
      <Box as="ul" display="flex" flexDirection="column" gap={2} m={0} p={0} style={label}>
        {["roadmap.pdf", "brand.fig", "notes.md"].map((file) => (
          <Box as="li" key={file} color="text.secondary" style={{ listStyle: "none" }}>
            {file}
          </Box>
        ))}
      </Box>
    </Box>
  ),
};

/**
 * Numeric spacing is a `calc` on `--okkly-space-unit`, so overriding the unit
 * on a Box rescales every numeric step inside it — here the same layout on a
 * 4px and a 6px unit.
 */
export const CustomStyling: Story = {
  render: () => (
    <Box display="flex" gap={6} alignItems="flex-start" style={label}>
      {["0.25rem", "0.375rem"].map((unit) => (
        <Box
          key={unit}
          display="flex"
          flexDirection="column"
          gap={2}
          p={4}
          bgcolor="bg.surface-raised"
          borderRadius={3}
          color="text.secondary"
          style={{ "--okkly-space-unit": unit } as CSSProperties}
        >
          <Box width={48} height={8} bgcolor="accent.primary" borderRadius={1} />
          <Box width={32} height={8} bgcolor="accent.secondary" borderRadius={1} />
          unit {unit}
        </Box>
      ))}
    </Box>
  ),
};
