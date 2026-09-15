# Templates

Skeletons for a component called `Example` (`okkly-example`, class `OkklyExample`). Replace the placeholder inputs with the real API, and keep only what the component needs. `packages/angular/src/components/Button/` is the fuller reference — including the attribute-selector shape for components that decorate a native `<button>`/`<a>`; where it differs from these templates, follow the existing code.

The stylesheet — `packages/design-system/src/components/Example/Example.scss` — comes from the `create-design-component` skill, and is registered in `src/styles.scss` and `.storybook/preview.ts` rather than imported here (see SKILL.md). The class names and `--okkly-example-*` variables assume its template.

## `packages/angular/src/components/Example/Example.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from "@angular/core";

export type ExampleVariant = "filled" | "outlined";
export type ExampleSize = "small" | "medium" | "large";

/**
 * Inputs mirror `@okkly/react`'s `<Example>` name-for-name (Angular Material
 * has no equivalent). Deliberate gaps: the content arrives as projected
 * content rather than as an input, since Angular has no `ReactNode`.
 */
@Component({
  selector: "okkly-example",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-example",
    "[class]": "modifiers()",
  },
  templateUrl: "./Example.html",
})
export class OkklyExample {
  /**
   * Visual style. Can be `filled` or `outlined`.
   *
   * @default "filled"
   */
  readonly variant = input<ExampleVariant>("filled");
  /**
   * Size of the component. Can be `small`, `medium`, or `large`.
   *
   * @default "medium"
   */
  readonly size = input<ExampleSize>("medium");

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "filled" && `okkly-example--${this.variant()}`,
      this.size() !== "medium" && `okkly-example--${this.size()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
```

## `packages/angular/src/components/Example/Example.html`

```html
<span class="okkly-example__label"><ng-content /></span>
```

## `packages/angular/src/components/Example/Example.stories.ts`

```ts
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyExample } from "./Example";
import type { ExampleSize, ExampleVariant } from "./Example";

/** Every input the template below binds, plus `label` for the projected content. */
type ExampleArgs = {
  label: string;
  variant: ExampleVariant;
  size: ExampleSize;
};

const bindings = `[variant]="variant" [size]="size"`;

/**
 * One or two sentences on what Example is for and when to reach for it. This
 * comment is the description at the top of the docs page.
 */
const meta: Meta<ExampleArgs> = {
  title: "Data/Example",
  component: OkklyExample,
  decorators: [moduleMetadata({ imports: [OkklyExample] })],
  args: {
    label: "Example",
    variant: "filled",
    size: "medium",
  },
  // Descriptions and defaults come from the sources via Compodoc; only the
  // controls are declared here.
  argTypes: {
    label: { control: "text", description: "Projected content." },
    variant: { control: "inline-radio", options: ["filled", "outlined"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
  render: (args) => ({
    props: args,
    template: `<okkly-example ${bindings}>{{ label }}</okkly-example>`,
  }),
};

export default meta;
type Story = StoryObj<ExampleArgs>;

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
    template: `
      <div style="background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px">
        <okkly-example>Filled</okkly-example>
        <okkly-example variant="outlined">Outlined</okkly-example>
      </div>`,
  }),
};

/**
 * The CSS-variable API. The component seeds its own defaults, so set the
 * variables on the component itself rather than on a parent.
 */
export const CustomStyling: Story = {
  render: () => ({
    template: `
      <okkly-example style="--okkly-example-border-color: var(--okkly-accent-primary); --okkly-example-radius: 0">
        Custom
      </okkly-example>`,
  }),
};
```

## `packages/angular/src/components/Example/Example.ct.ts`

```ts
import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { ExampleSize, ExampleVariant } from "./Example";

const VARIANTS = ["filled", "outlined"] as const satisfies readonly ExampleVariant[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ExampleSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Example (variants)",
    columns: VARIANTS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-example variant="${column}" size="${row}">Example</okkly-example>`,
  });
});

test("should render its content", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-example>Hello</okkly-example>`);

  // ASSERT
  await expect(component).toHaveText("Hello");
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-example>Hello</okkly-example>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-example/);
  await expect(component).not.toHaveClass(/okkly-example--(outlined|small|large)/);
});

test("should apply the variant modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-example variant="outlined">Hello</okkly-example>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-example--outlined/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-example [size]="state().size">Hello</okkly-example>`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-example--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-example--(small|large)/);
});

test("should keep a consumer's own class and attributes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-example class="custom" data-testid="example">Hello</okkly-example>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveAttribute("data-testid", "example");
});
```

## `packages/angular/src/index.ts` — append

```ts
export { OkklyExample } from "./components/Example/Example";
export type { ExampleVariant, ExampleSize } from "./components/Example/Example";
```
