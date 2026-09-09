<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./Button.svelte";
  import type {
    ButtonColor,
    ButtonLoadingPosition,
    ButtonShape,
    ButtonSize,
    ButtonVariant,
  } from "./Button.svelte";

  const variants: ButtonVariant[] = ["primary", "gradient", "secondary", "soft", "ghost", "glass"];
  const colors: ButtonColor[] = ["primary", "dante", "indigo", "violet", "ember", "ice"];
  const shapes: ButtonShape[] = ["pill", "rounded"];
  const sizes: ButtonSize[] = ["small", "medium", "large"];
  const loadingPositions: ButtonLoadingPosition[] = ["start", "center", "end"];

  /**
   * Primary action control for forms, dialogs, and toolbars. Pick variant and color for emphasis — one primary action per view.
   *
   * Renders a native `<button>`, or an `<a>` when given an `href`. Icons are snippets
   * passed as `startIcon` / `endIcon`; the label is the default `children` snippet.
   */
  const { Story } = defineMeta({
    title: "Control/Button",
    component: Button,
    args: {
      variant: "primary",
      color: "primary",
      shape: "pill",
      size: "medium",
      fullWidth: false,
      loading: false,
      loadingPosition: "center",
      disabled: false,
      disableRipple: false,
    },
    argTypes: {
      variant: { control: "select", options: variants },
      color: { control: "select", options: colors },
      shape: { control: "inline-radio", options: shapes },
      size: { control: "inline-radio", options: sizes },
      loadingPosition: { control: "inline-radio", options: loadingPositions },
      fullWidth: { control: "boolean" },
      loading: { control: "boolean" },
      disabled: { control: "boolean" },
      disableRipple: { control: "boolean" },
    },
  });
</script>

<!-- `iconArrowRight` from `@okkly/icons`, inlined so the stories pull in no build-time import. -->
{#snippet arrow()}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
{/snippet}

<!-- This example shows the primary appearance. -->
<Story name="Primary">
  {#snippet template(args)}
    <Button {...args} endIcon={arrow}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the gradient variant. -->
<Story name="Gradient" args={{ variant: "gradient" }}>
  {#snippet template(args)}
    <Button {...args} endIcon={arrow}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the secondary appearance. -->
<Story name="Secondary" args={{ variant: "secondary" }}>
  {#snippet template(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the soft variant. -->
<Story name="Soft" args={{ variant: "soft" }}>
  {#snippet template(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the ghost variant. -->
<Story name="Ghost" args={{ variant: "ghost" }}>
  {#snippet template(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the glass variant. -->
<Story name="Glass" args={{ variant: "glass" }}>
  {#snippet template(args)}
    <Button {...args} endIcon={arrow}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the disabled state. -->
<Story name="Disabled" args={{ disabled: true }}>
  {#snippet template(args)}
    <Button {...args} endIcon={arrow}>Button</Button>
  {/snippet}
</Story>

<!-- This example shows the loading state. -->
<Story name="Loading" args={{ loading: true }}>
  {#snippet template(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<!--
  This example shows where the spinner sits relative to the label. `start` and
  `end` take over the matching icon slot; `center` dims the label and overlays
  the spinner.
-->
<Story name="Loading positions">
  {#snippet template()}
    <div style="display: flex; gap: 12px">
      {#each loadingPositions as position (position)}
        <Button loading loadingPosition={position}>{position}</Button>
      {/each}
    </div>
  {/snippet}
</Story>

<!-- This example shows both icon slots. -->
<Story name="With icons">
  {#snippet template(args)}
    <div style="display: flex; gap: 12px">
      <Button {...args} startIcon={arrow}>Start</Button>
      <Button {...args} endIcon={arrow}>End</Button>
      <Button {...args} startIcon={arrow} endIcon={arrow}>Both</Button>
    </div>
  {/snippet}
</Story>

<!-- This example shows the full-width layout. -->
<Story name="Full width" args={{ fullWidth: true }}>
  {#snippet template(args)}
    <div style="width: 320px">
      <Button {...args} endIcon={arrow}>Button</Button>
    </div>
  {/snippet}
</Story>

<!--
  This example shows the component used as a link. An anchor cannot be disabled
  natively, so a disabled one drops its href and gets `aria-disabled`.
-->
<Story name="As link" args={{ href: "https://okryshto.dev" }}>
  {#snippet template(args)}
    <Button {...args} endIcon={arrow}>Get in touch</Button>
  {/snippet}
</Story>

<!-- This example shows every available color. -->
<Story name="Colors">
  {#snippet template()}
    <div style="display: flex; gap: 12px">
      {#each colors as color (color)}
        <Button {color} endIcon={arrow}>{color}</Button>
      {/each}
    </div>
  {/snippet}
</Story>

<!-- This example shows every available size. -->
<Story name="Sizes">
  {#snippet template()}
    <div style="display: flex; align-items: center; gap: 12px">
      {#each sizes as size (size)}
        <Button {size} endIcon={arrow}>Button</Button>
      {/each}
    </div>
  {/snippet}
</Story>

<!-- This example shows both shapes. -->
<Story name="Shapes">
  {#snippet template()}
    <div style="display: flex; align-items: center; gap: 12px">
      {#each shapes as shape (shape)}
        <Button {shape}>{shape}</Button>
      {/each}
    </div>
  {/snippet}
</Story>
