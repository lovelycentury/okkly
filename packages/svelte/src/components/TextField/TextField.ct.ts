import { test, expect } from "@playwright/experimental-ct-svelte";
import TextField from "./TextField.svelte";

test.describe("Screenshot tests", () => {
  test("TextField default state", async ({ mount }) => {
    const component = await mount(TextField, {
      props: { placeholder: "you@example.com" },
      slots: { label: "Email" },
    });
    await expect(component).toHaveScreenshot();
  });

  test("TextField filled", async ({ mount }) => {
    const component = await mount(TextField, {
      props: { placeholder: "you@example.com", value: "hello@okryshto.dev" },
      slots: { label: "Email" },
    });
    await expect(component).toHaveScreenshot();
  });

  test("TextField error", async ({ mount }) => {
    const component = await mount(TextField, {
      props: { placeholder: "you@example.com", value: "hello@okryshto.dev", error: true },
      slots: { label: "Email", helperText: "That address looks wrong" },
    });
    await expect(component).toHaveScreenshot();
  });

  test("TextField disabled", async ({ mount }) => {
    const component = await mount(TextField, {
      props: { placeholder: "you@example.com", disabled: true },
      slots: { label: "Email" },
    });
    await expect(component).toHaveScreenshot();
  });
});

test("should render a labeled input linked by for/id", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, { slots: { label: "Email" } });

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveAccessibleName("Email");
  const [forAttribute, id] = await Promise.all([
    component.locator("label").getAttribute("for"),
    input.getAttribute("id"),
  ]);
  expect(forAttribute).toBe(id);
});

test("should visually hide the label but keep it accessible", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { hideLabel: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.locator(".okkly-text-field__label")).toHaveClass(
    /okkly-text-field__label--hidden/,
  );
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Email");
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { size: "small" },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { color: "dante" },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--color-/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { error: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should apply the full-width modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { fullWidth: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--full-width/);
});

test("should render helperText and link it via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    slots: { label: "Email", helperText: "We'll never share it" },
  });

  // ASSERT
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  await expect(component.locator(`#${describedBy}`)).toHaveText("We'll never share it");
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { disabled: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { required: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.locator(".okkly-text-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test("should fire oninput as the user types", async ({ mount }) => {
  let changes = 0;

  // ARRANGE
  const component = await mount(TextField, {
    props: { oninput: () => (changes += 1) },
    slots: { label: "Email" },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(changes).toBe(3);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});
