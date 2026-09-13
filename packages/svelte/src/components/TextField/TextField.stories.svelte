<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TextField from "./TextField.svelte";
  import type { TextFieldColor, TextFieldSize } from "./TextField.svelte";

  const sizes: TextFieldSize[] = ["small", "medium", "large"];
  const colors: TextFieldColor[] = [
    "primary",
    "secondary",
    "dante",
    "violet",
    "ember",
    "ice",
    "contrast",
  ];

  /**
   * Single-line text input with label, helper, and error. Foundation for most form fields.
   */
  const { Story } = defineMeta({
    title: "Control/TextField",
    component: TextField,
    args: {
      placeholder: "you@company.com",
      size: "medium",
      color: "primary",
      error: false,
      disabled: false,
      hideLabel: false,
      fullWidth: false,
      required: false,
    },
    argTypes: {
      size: { control: "inline-radio", options: sizes },
      color: { control: "select", options: colors },
    },
  });
</script>

{#snippet label()}Email{/snippet}
{#snippet helper()}We'll never share it{/snippet}
{#snippet errorHelper()}Enter a valid email{/snippet}

<!-- This example shows the default state. -->
<Story name="Default">
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} />
  {/snippet}
</Story>

<!-- This example shows filled. -->
<Story name="Filled">
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} value="hello@oleksii.dev" />
  {/snippet}
</Story>

<!-- This example shows required. -->
<Story name="Required" args={{ required: true }}>
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} />
  {/snippet}
</Story>

<!-- This example shows the error state. -->
<Story name="Error" args={{ error: true }}>
  {#snippet template(args)}
    <TextField {...args} {label} helperText={errorHelper} value="hello@oleksii.dev" />
  {/snippet}
</Story>

<!-- This example shows the disabled state. -->
<Story name="Disabled" args={{ disabled: true }}>
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} />
  {/snippet}
</Story>

<!-- This example shows no label. -->
<Story name="NoLabel" args={{ hideLabel: true }}>
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} />
  {/snippet}
</Story>

<!-- This example shows dante focus. -->
<Story name="DanteFocus" args={{ color: "dante" }}>
  {#snippet template(args)}
    <TextField {...args} {label} helperText={helper} />
  {/snippet}
</Story>

<!-- This example shows the full-width layout. -->
<Story name="FullWidth" args={{ fullWidth: true }}>
  {#snippet template(args)}
    <div style="width: 320px">
      <TextField {...args} {label} helperText={helper} />
    </div>
  {/snippet}
</Story>

<!-- This example shows every available size. -->
<Story name="Sizes">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 16px">
      {#each sizes as size (size)}
        <TextField {size} {label} placeholder="hello@oleksii.dev" />
      {/each}
    </div>
  {/snippet}
</Story>

{#snippet colorHelper()}Tab into a field to see its tint{/snippet}

<!--
  This example shows every available accent color. The tint only shows on
  `:focus-within`, so tab through the fields (or click into one) to see it.
-->
<Story name="Colors">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 16px">
      {#each colors as color (color)}
        <TextField {color} placeholder={color} helperText={colorHelper} />
      {/each}
    </div>
  {/snippet}
</Story>
