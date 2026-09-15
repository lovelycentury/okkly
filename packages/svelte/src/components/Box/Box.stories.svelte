<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Box from "./Box.svelte";
  import type { BoxColorToken, BoxDisplay, BoxFlexDirection } from "./Box.types";

  const displays: BoxDisplay[] = ["block", "flex", "inline-flex", "grid", "none"];
  const directions: BoxFlexDirection[] = ["row", "column"];
  const surfaces: BoxColorToken[] = [
    "bg.canvas",
    "bg.inset",
    "bg.surface",
    "bg.surface-raised",
    "accent.primary",
    "accent.secondary",
    "accent.dante",
  ];
  const borders: BoxColorToken[] = ["border.subtle", "border.default", "border.strong"];
  const texts: BoxColorToken[] = ["text.primary", "text.secondary", "text.muted"];

  const label = "font-family: var(--okkly-font-family-sans); font-size: var(--okkly-font-size-sm)";

  /**
   * The layout primitive: a `div` — or any element, through `as` — that takes
   * MUI-style system props. Numeric spacing steps on the 4px scale (`p={2}` is
   * 8px), colors name design tokens (`bgcolor="bg.surface-raised"`), and every
   * prop accepts one value per breakpoint (`flexDirection={{ base: "column", md:
   * "row" }}`) — no stylesheet needed for one-off layout.
   */
  const { Story } = defineMeta({
    title: "Helpers/Box",
    component: Box,
    args: {
      p: 4,
      bgcolor: "bg.surface-raised",
      border: 1,
      borderColor: "border.subtle",
      borderRadius: 3,
      color: "text.primary",
      container: false,
    },
    argTypes: {
      display: { control: "select", options: displays },
      flexDirection: { control: "inline-radio", options: directions },
      alignItems: { control: "select", options: ["stretch", "flex-start", "center", "flex-end"] },
      justifyContent: {
        control: "select",
        options: ["flex-start", "center", "flex-end", "space-between"],
      },
      bgcolor: { control: "select", options: surfaces },
      borderColor: { control: "select", options: borders },
      color: { control: "select", options: texts },
      container: { control: "boolean" },
      as: { control: false },
    },
  });
</script>

<!-- Play with every prop from the controls panel. -->
<Story name="Playground">
  {#snippet template(args)}
    <Box {...args} style={label}>A box with a 16px padding</Box>
  {/snippet}
</Story>

<!-- The 4px scale: `p={1}` is 4px, `p={4}` 16px, `p={8}` 32px. Strings pass through as CSS (`p="1.25rem"`). -->
<Story name="Spacing scale">
  {#snippet template()}
    <Box display="flex" alignItems="flex-end" gap={4} color="text.secondary" style={label}>
      {#each [1, 2, 4, 6, 8] as step (step)}
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box bgcolor="bg.surface-raised" border={1} borderColor="border.default" p={step}>
            <Box width={24} height={24} bgcolor="accent.primary" borderRadius={1} />
          </Box>
          p={step} · {step * 4}px
        </Box>
      {/each}
    </Box>
  {/snippet}
</Story>

<!--
  A settings row built from Boxes alone: a flex row that pushes its action to
  the far edge, with token colors and a hairline border.
-->
<Story name="Settings row">
  {#snippet template()}
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
  {/snippet}
</Story>

<!--
  Every prop takes one value per breakpoint. These cards stack below `md`
  (993px) and sit side by side from there up, with a larger gap and padding —
  resize the canvas to watch it switch.
-->
<Story name="Responsive">
  {#snippet template()}
    <Box
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      gap={{ base: 2, md: 6 }}
      p={{ base: 3, md: 6 }}
      bgcolor="bg.inset"
      borderRadius={3}
      style={label}
    >
      {#each ["Plan", "Build", "Ship"] as step (step)}
        <Box
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
      {/each}
    </Box>
  {/snippet}
</Story>

<!--
  `@`-keys answer to the nearest `container` Box instead of the window. The
  same card sits in a narrow region and a wide one: it stacks in the first and
  lays out as a row in the second, whatever the window size. Drag either
  region's corner to resize it and watch the card switch at `@md` (640px).
-->
<Story name="Container queries">
  {#snippet template()}
    <Box display="flex" gap={4} alignItems="flex-start" style={label}>
      {#each [280, 720] as width (width)}
        <Box
          container
          {width}
          p={2}
          border={1}
          borderColor="border.default"
          borderRadius={3}
          style="resize: horizontal; overflow: auto"
        >
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
              <Box color="text.secondary">Stacked below a 640px container, a row from there up.</Box
              >
            </Box>
          </Box>
        </Box>
      {/each}
    </Box>
  {/snippet}
</Story>

<!--
  `as` swaps the element without touching the styling — here a `section`
  landmark wrapping a list, both laid out through system props.
-->
<Story name="Polymorphic as">
  {#snippet template()}
    <Box as="section" aria-label="Recent files" p={4} bgcolor="bg.surface" borderRadius={3}>
      <Box as="ul" display="flex" flexDirection="column" gap={2} m={0} p={0} style={label}>
        {#each ["roadmap.pdf", "brand.fig", "notes.md"] as file (file)}
          <Box as="li" color="text.secondary" style="list-style: none">{file}</Box>
        {/each}
      </Box>
    </Box>
  {/snippet}
</Story>

<!--
  Numeric spacing is a `calc` on `--okkly-space-unit`, so overriding the unit
  on a Box rescales every numeric step inside it — here the same layout on a
  4px and a 6px unit.
-->
<Story name="Custom styling">
  {#snippet template()}
    <Box display="flex" gap={6} alignItems="flex-start" style={label}>
      {#each ["0.25rem", "0.375rem"] as unit (unit)}
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          p={4}
          bgcolor="bg.surface-raised"
          borderRadius={3}
          color="text.secondary"
          style="--okkly-space-unit: {unit}"
        >
          <Box width={48} height={8} bgcolor="accent.primary" borderRadius={1} />
          <Box width={32} height={8} bgcolor="accent.secondary" borderRadius={1} />
          unit {unit}
        </Box>
      {/each}
    </Box>
  {/snippet}
</Story>
