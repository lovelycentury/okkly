import { expect, test } from "../../playwright/a11y";
import Field from "./Field.vue";

const props = { block: "okkly-text-field", id: "email" };
const control = '<input id="email" />';

const COLORS = ["secondary", "dante", "violet", "ember", "ice", "contrast"] as const;

const MODIFIERS = [
  { modifier: "small", props: { size: "small" } },
  { modifier: "error", props: { error: true } },
  { modifier: "disabled", props: { disabled: true } },
  { modifier: "full-width", props: { fullWidth: true } },
] as const;

test("should render the control in the default slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Field, { props, slots: { default: control } });

  // ASSERT
  await expect(component.locator("input#email")).toBeAttached();
});

test("should apply the block classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Field, { props, slots: { default: control } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-text-field/);
  await expect(component).not.toHaveClass(/okkly-text-field--/);
});

for (const { modifier, props: modifierProps } of MODIFIERS) {
  test(`should apply the ${modifier} modifier`, async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props: { ...props, ...modifierProps },
      slots: { default: control },
    });

    // ASSERT
    await expect(component).toHaveClass(new RegExp(`okkly-text-field--${modifier}`));
  });
}

for (const color of COLORS) {
  test(`should apply the ${color} color modifier`, async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props: { ...props, color },
      slots: { default: control },
    });

    // ASSERT
    await expect(component).toHaveClass(new RegExp(`okkly-text-field--color-${color}`));
  });
}

test.describe("label", () => {
  test("should not render a label when the slot is empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, { props, slots: { default: control } });

    // ASSERT
    await expect(component.locator("label")).toHaveCount(0);
  });

  test("should render the label linked by for/id", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, { props, slots: { default: control, label: "Email" } });

    // ASSERT
    const label = component.locator("label");
    await expect(label).toHaveText("Email");
    await expect(label).toHaveAttribute("for", "email");
    await expect(label).toHaveAttribute("id", "email-label");
  });

  test("should drop for but keep the label id when htmlFor is false", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props: { ...props, htmlFor: false },
      slots: { default: control, label: "Email" },
    });

    // ASSERT
    const label = component.locator("label");
    await expect(label).not.toHaveAttribute("for");
    await expect(label).toHaveAttribute("id", "email-label");
  });

  test("should visually hide the label but keep it in the DOM", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props: { ...props, hideLabel: true },
      slots: { default: control, label: "Email" },
    });

    // ASSERT
    await expect(component.locator("label")).toHaveClass(/okkly-text-field__label--hidden/);
  });

  test("should not show a required asterisk by default", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, { props, slots: { default: control, label: "Email" } });

    // ASSERT
    await expect(component.locator(".okkly-text-field__required")).toHaveCount(0);
  });

  test("should show a required asterisk when required", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props: { ...props, required: true },
      slots: { default: control, label: "Email" },
    });

    // ASSERT
    await expect(component.locator(".okkly-text-field__required")).toHaveText("*");
  });
});

test.describe("helper text", () => {
  test("should not render helper text when the slot is empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, { props, slots: { default: control } });

    // ASSERT
    await expect(component.locator(".okkly-text-field__helper")).toHaveCount(0);
  });

  test("should render helper text linked by id", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props,
      slots: { default: control, "helper-text": "We'll never share it" },
    });

    // ASSERT
    const helper = component.locator(".okkly-text-field__helper");
    await expect(helper).toHaveText("We'll never share it");
    await expect(helper).toHaveAttribute("id", "email-helper");
  });
});

test.describe("adornments", () => {
  test("should not render the adornment slots when they are empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, { props, slots: { default: control } });

    // ASSERT
    await expect(component.locator(".okkly-text-field__adornment")).toHaveCount(0);
  });

  test("should render the adornment slots once they are filled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Field, {
      props,
      slots: {
        default: control,
        "start-adornment": '<span data-testid="start" />',
        "end-adornment": '<span data-testid="end" />',
      },
    });

    // ASSERT
    await expect(component.locator(".okkly-text-field__adornment")).toHaveCount(2);
  });
});
