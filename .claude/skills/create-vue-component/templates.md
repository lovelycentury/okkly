# Templates

Skeletons for a component called `Example` (`okkly-example`). Replace the placeholder props with the real API, and keep only what the component needs. `packages/vue/src/components/Button/` is the fuller reference; where it differs from these templates, follow the existing code.

The stylesheet imported below — `packages/design-system/src/components/Example/Example.scss` — comes from the `create-design-component` skill. The class names and `--okkly-example-*` variables assume its template.

## `packages/vue/src/components/Example/Example.vue`

```vue
<script lang="ts">
export type ExampleVariant = "filled" | "outlined";
export type ExampleSize = "small" | "medium" | "large";

/**
 * Props mirror `@okkly/react`'s `<Example>` name-for-name, which in turn follows
 * MUI's Example API. Deliberate difference, because Vue has no `ReactNode`: the
 * content arrives as the default slot. Everything the element itself
 * understands — `class`, `@click`, `aria-*` — falls through to the rendered
 * `<div>` rather than being redeclared here.
 */
export interface ExampleProps {
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
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import "@okkly/design-system/components/Example/Example.scss";

const props = withDefaults(defineProps<ExampleProps>(), {
  variant: "filled",
  size: "medium",
});

defineSlots<{
  /** Content of the component. */
  default?: () => unknown;
}>();

const classes = computed(() =>
  [
    "okkly-component",
    "okkly-example",
    props.variant !== "filled" && `okkly-example--${props.variant}`,
    props.size !== "medium" && `okkly-example--${props.size}`,
  ]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <div :class="classes">
    <span class="okkly-example__label"><slot /></span>
  </div>
</template>
```

## `packages/vue/src/components/Example/Example.stories.ts`

```ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Example from "./Example.vue";
import type { ExampleProps } from "./Example.vue";

/** `label` fills the default slot; everything else is a prop. */
type ExampleArgs = ExampleProps & { label: string };

/**
 * Renders the component with `label` split back out of the args, so it lands in
 * the default slot instead of falling through to the element as an attribute.
 */
const render = (body: string) => (args: ExampleArgs) => ({
  components: { Example },
  setup() {
    const { label, ...props } = args;
    return { label, props };
  },
  template: `<Example v-bind="props">${body}</Example>`,
});

/**
 * One or two sentences on what Example is for and when to reach for it. This
 * comment is the description at the top of the docs page.
 */
const meta: Meta<ExampleArgs> = {
  title: "Data/Example",
  component: Example,
  args: {
    label: "Example",
    variant: "filled",
    size: "medium",
  },
  argTypes: {
    label: { control: "text", description: "Default slot — the content." },
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: render(`{{ label }}`),
};

export default meta;
type Story = StoryObj<ExampleArgs>;

const surface = [
  "background: var(--okkly-bg-surface-raised)",
  "border: 1px solid var(--okkly-border-subtle)",
  "border-radius: 12px",
  "padding: 16px",
  "font-family: var(--okkly-font-family-sans)",
].join("; ");

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A realistic use case, described in a sentence — shown in product context
 * rather than as a bare variant list.
 */
export const InContext: Story = {
  render: () => ({
    components: { Example },
    template: `
      <div style="${surface}; display: flex; flex-direction: column; gap: 12px">
        <Example>Filled</Example>
        <Example variant="outlined">Outlined</Example>
      </div>`,
  }),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the component itself rather than on a parent.
 */
export const CustomStyling: Story = {
  render: () => ({
    components: { Example },
    template: `
      <Example style="--okkly-example-border-color: var(--okkly-accent-primary); --okkly-example-radius: 0">
        Custom
      </Example>`,
  }),
};
```

## `packages/vue/src/components/Example/Example.ct.ts`

```ts
import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Example from "./Example.vue";
import type { ExampleSize, ExampleVariant } from "./Example.vue";

const VARIANTS = ["filled", "outlined"] as const satisfies readonly ExampleVariant[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ExampleSize[];

const slots = { default: "Hello" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Example (variants)",
    columns: VARIANTS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Example,
    args: (column, row) => ({
      props: { variant: column, size: row },
      slots: { default: "Example" },
    }),
  });
});

test("should render its content", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Example, { slots });

  // ASSERT
  await expect(component).toHaveText("Hello");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Example, { slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-example/);
  await expect(component).not.toHaveClass(/okkly-example--(outlined|small|large)/);
});

test("should apply the variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Example, { props: { variant: "outlined" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-example--outlined/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Example, { props: { size: "small" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-example--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-example--(small|large)/);
});

test("should merge a consumer's class and fall native attributes through", async ({ mount }) => {
  // ARRANGE — not declared props, so Vue treats them as fall-through attributes
  const attrs = { class: "custom", "data-testid": "example" };
  const component = await mount(Example, { props: attrs, slots });

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveAttribute("data-testid", "example");
});
```

## `packages/vue/src/index.ts` — append

```ts
export { default as Example } from "./components/Example/Example.vue";
export type { ExampleProps, ExampleVariant, ExampleSize } from "./components/Example/Example.vue";
```
