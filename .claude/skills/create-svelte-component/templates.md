# Templates

Skeletons for a component called `Example` (`okkly-example`). Replace the placeholder props with the real API, and keep only what the component needs. `packages/svelte/src/components/Button/` is the fuller reference; where it differs from these templates, follow the existing code.

The stylesheet — `packages/design-system/src/components/Example/Example.scss` — comes from the `create-design-component` skill, and is registered in `styles.scss` and `.storybook/preview.ts` rather than imported here (see SKILL.md). The class names and `--okkly-example-*` variables assume its template.

## `packages/svelte/src/components/Example/Example.svelte`

```svelte
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export type ExampleVariant = "filled" | "outlined";
  export type ExampleSize = "small" | "medium" | "large";

  type SharedProps = {
    /**
     * Visual style. Can be `filled` or `outlined`.
     *
     * @default "filled"
     */
    variant?: ExampleVariant;
    /**
     * Size of the component. Can be `small`, `medium`, or `large`.
     *
     * @default "medium"
     */
    size?: ExampleSize;
    /**
     * Content of the component.
     *
     * @default undefined
     */
    children?: Snippet;
  };

  /**
   * Props mirror `@okkly/react`'s `<Example>` name-for-name, which in turn
   * follows MUI's Example API. `children` is a snippet rather than a
   * `ReactNode`, and everything the element itself understands — `class`,
   * `onclick`, `aria-*` — spreads through to the rendered `<div>`.
   */
  export type ExampleProps = SharedProps & Omit<HTMLAttributes<HTMLDivElement>, keyof SharedProps>;
</script>

<script lang="ts">
  let {
    variant = "filled",
    size = "medium",
    children,
    class: className,
    ...rest
  }: ExampleProps = $props();

  const classes = $derived(
    [
      "okkly-component",
      "okkly-example",
      variant !== "filled" && `okkly-example--${variant}`,
      size !== "medium" && `okkly-example--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

<div class={classes} {...rest}>
  <span class="okkly-example__label">{@render children?.()}</span>
</div>
```

## `packages/svelte/src/components/Example/Example.harness.svelte`

```svelte
<script lang="ts">
  import Example from "./Example.svelte";
  import type { ExampleProps } from "./Example.svelte";

  let { label, ...rest }: ExampleProps & { label: string } = $props();
</script>

<Example {...rest}>{label}</Example>
```

## `packages/svelte/src/components/Example/Example.stories.svelte`

```svelte
<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Example from "./Example.svelte";
  import type { ExampleSize, ExampleVariant } from "./Example.svelte";

  const variants: ExampleVariant[] = ["filled", "outlined"];
  const sizes: ExampleSize[] = ["small", "medium", "large"];

  /**
   * One or two sentences on what Example is for and when to reach for it. This
   * comment is the description at the top of the docs page.
   */
  const { Story } = defineMeta({
    title: "Data/Example",
    component: Example,
    args: {
      variant: "filled",
      size: "medium",
    },
    argTypes: {
      variant: { control: "inline-radio", options: variants },
      size: { control: "inline-radio", options: sizes },
    },
  });
</script>

<!-- Play with every prop from the controls panel. -->
<Story name="Playground">
  {#snippet template(args)}
    <Example {...args}>Example</Example>
  {/snippet}
</Story>

<!--
  A realistic use case, described in a sentence — shown in product context
  rather than as a bare variant list.
-->
<Story name="In context">
  {#snippet template()}
    <div
      style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px"
    >
      <Example>Filled</Example>
      <Example variant="outlined">Outlined</Example>
    </div>
  {/snippet}
</Story>

<!--
  The CSS-variable API. The component seeds its own defaults, so set the
  variables on the component itself rather than on a parent.
-->
<Story name="Custom styling">
  {#snippet template()}
    <Example
      style="--okkly-example-border-color: var(--okkly-accent-primary); --okkly-example-radius: 0"
    >
      Custom
    </Example>
  {/snippet}
</Story>
```

## `packages/svelte/src/components/Example/Example.spec.ts`

```ts
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ExampleHarness from "./Example.harness.svelte";

const root = (container: HTMLElement) => container.querySelector<HTMLElement>(".okkly-example")!;

describe("Example", () => {
  it("renders its content", () => {
    render(ExampleHarness, { label: "Hello" });
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    const { container } = render(ExampleHarness, { label: "Hello" });
    expect(root(container)).toHaveClass("okkly-component", "okkly-example");
    expect(root(container).className).not.toMatch(/okkly-example--(outlined|small|large)/);
  });

  it("applies the variant modifier", () => {
    const { container } = render(ExampleHarness, { label: "Hello", variant: "outlined" });
    expect(root(container)).toHaveClass("okkly-example--outlined");
  });

  it("applies a size modifier only for non-medium sizes", async () => {
    const { container, rerender } = render(ExampleHarness, { label: "Hello", size: "small" });
    expect(root(container)).toHaveClass("okkly-example--small");

    await rerender({ label: "Hello", size: "medium" });
    expect(root(container).className).not.toMatch(/okkly-example--(small|large)/);
  });

  it("keeps a consumer's own class and spreads native attributes", () => {
    render(ExampleHarness, { label: "Hello", class: "custom", "data-testid": "example" });
    expect(screen.getByTestId("example")).toHaveClass("okkly-example", "custom");
  });
});
```

## `packages/svelte/src/index.ts` — append

```ts
export { default as Example } from "./components/Example/Example.svelte";
export type {
  ExampleProps,
  ExampleVariant,
  ExampleSize,
} from "./components/Example/Example.svelte";
```
