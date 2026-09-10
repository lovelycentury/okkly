# Templates

Skeletons for a component called `Example` (`okkly-example`). Replace the placeholder props with the real API, and keep only what the component needs. Read the closest existing component first; where it differs from these templates, follow the existing code.

The stylesheet these files import — `packages/design-system/src/components/Example/Example.scss` — comes from the `create-design-component` skill. The class names and `--okkly-example-*` variables below assume its template.

## `packages/react/src/components/Example/Example.tsx`

```tsx
"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import "@okkly/design-system/components/Example/Example.scss";

export type ExampleVariant = "filled" | "outlined";
export type ExampleSize = "small" | "medium" | "large";

/**
 * Props follow MUI's Example API (https://mui.com/material-ui/api/example/) as
 * closely as this design allows: `variant`/`size`/`children` match name-for-name.
 * Deliberate gaps: no `sx`/`classes` (use `className` and the CSS variables).
 */
export interface ExampleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Visual style. Can be `filled` or `outlined`.
   *
   * @default "filled"
   * @type {ExampleVariant}
   */
  variant?: ExampleVariant;
  /**
   * Size of the component. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   * @type {ExampleSize}
   */
  size?: ExampleSize;
  /**
   * Content of the component.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

export const Example = forwardRef<HTMLDivElement, ExampleProps>(function Example(
  { variant = "filled", size = "medium", children, className, ...rest },
  forwardedRef,
) {
  const classes = [
    "okkly-component",
    "okkly-example",
    variant !== "filled" && `okkly-example--${variant}`,
    size !== "medium" && `okkly-example--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={forwardedRef} className={classes} {...rest}>
      <span className="okkly-example__label">{children}</span>
    </div>
  );
});
```

## `packages/react/src/components/Example/Example.stories.tsx`

```tsx
import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Example } from "./Example";

/**
 * One or two sentences on what Example is for and when to reach for it. This
 * comment is the description at the top of the docs page.
 */
const meta: Meta<typeof Example> = {
  title: "Data/Example",
  component: Example,
  args: {
    variant: "filled",
    size: "medium",
    children: "Example",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Example>;

const surface: CSSProperties = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "16px",
  fontFamily: "var(--okkly-font-family-sans)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {
  render: (args) => <Example {...args} />,
};

/**
 * A realistic use case, described in a sentence — shown in product context
 * rather than as a bare variant list.
 */
export const InContext: Story = {
  render: () => (
    <div style={{ ...surface, display: "flex", flexDirection: "column", gap: "12px" }}>
      <Example>Filled</Example>
      <Example variant="outlined">Outlined</Example>
    </div>
  ),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the component itself rather than on a parent.
 */
export const CustomStyling: Story = {
  render: () => (
    <Example
      style={
        {
          "--okkly-example-border-color": "var(--okkly-accent-primary)",
          "--okkly-example-radius": "0",
        } as CSSProperties
      }
    >
      Custom
    </Example>
  ),
};
```

## `packages/react/src/components/Example/Example.ct.tsx`

```tsx
import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Example } from "./Example";
import type { ExampleSize, ExampleVariant } from "./Example";

const VARIANTS = ["filled", "outlined"] as const satisfies readonly ExampleVariant[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ExampleSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Example (variants)",
    columns: VARIANTS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => (
      <Example variant={column} size={row}>
        Example
      </Example>
    ),
  });

  // Interactive components: add an isolated matrix with interaction rows.
  //
  // executeMatrixScreenshotTest({
  //   name: "Example (interaction)",
  //   columns: VARIANTS,
  //   rows: ["default", "hover", "active", "focus-visible"],
  //   hooks: {
  //     beforeEach: async (component, page, _column, row) =>
  //       useFocusStateHooks({ component, page, state: row }),
  //   },
  //   component: (column) => <Example variant={column}>Example</Example>,
  // });
});

test("should render its content", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Example>Hello</Example>);

  // ASSERT
  await expect(component).toHaveText("Hello");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Example>Hello</Example>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-example/);
  await expect(component).not.toHaveClass(/okkly-example--(outlined|small|large)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Example size="small">Hello</Example>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-example--small/);

  // ACT
  await component.update(<Example size="medium">Hello</Example>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-example--(small|large)/);
});

test("should forward className and native attributes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Example className="custom" data-testid="example">
      Hello
    </Example>,
  );

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveAttribute("data-testid", "example");
});
```
