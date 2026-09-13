import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import TextField from "./TextField.svelte";
import TextFieldHarness from "./TextField.harness.svelte";

describe("TextField", () => {
  it("renders a labeled input linked by for/id", () => {
    render(TextFieldHarness, { label: "Email" });
    const input = screen.getByRole("textbox", { name: "Email" });
    const label = screen.getByText("Email").closest("label")!;
    expect(label).toHaveAttribute("for", input.id);
  });

  it("applies the default classes (medium size, primary color)", () => {
    const { container } = render(TextFieldHarness, { label: "Email" });
    const field = container.firstElementChild!;
    expect(field).toHaveClass("okkly-component", "okkly-text-field");
    expect(field.className).not.toMatch(/okkly-text-field--color-/);
    expect(field.className).not.toMatch(/okkly-text-field--(small|large)/);
  });

  it("visually hides the label but keeps it accessible", () => {
    render(TextFieldHarness, { label: "Email", hideLabel: true });
    expect(screen.getByText("Email")).toHaveClass("okkly-text-field__label--hidden");
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Email");
  });

  it("applies a size modifier only for non-medium sizes", async () => {
    const { container, rerender } = render(TextFieldHarness, { label: "Email", size: "small" });
    expect(container.firstElementChild).toHaveClass("okkly-text-field--small");

    await rerender({ label: "Email", size: "medium" });
    expect(container.firstElementChild!.className).not.toMatch(/okkly-text-field--(small|large)/);
  });

  it.each(["secondary", "dante", "violet", "ember", "ice", "contrast"] as const)(
    "applies the color-%s modifier",
    (color) => {
      const { container } = render(TextFieldHarness, { label: "Email", color });
      expect(container.firstElementChild).toHaveClass(`okkly-text-field--color-${color}`);
    },
  );

  it("applies no color modifier for the default primary color", async () => {
    const { container, rerender } = render(TextFieldHarness, { label: "Email", color: "dante" });
    expect(container.firstElementChild).toHaveClass("okkly-text-field--color-dante");

    await rerender({ label: "Email", color: "primary" });
    expect(container.firstElementChild!.className).not.toMatch(/okkly-text-field--color-/);
  });

  it("applies the error modifier and marks aria-invalid", () => {
    const { container } = render(TextFieldHarness, { label: "Email", error: true });
    expect(container.firstElementChild).toHaveClass("okkly-text-field--error");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies the full-width modifier", () => {
    const { container } = render(TextFieldHarness, { label: "Email", fullWidth: true });
    expect(container.firstElementChild).toHaveClass("okkly-text-field--full-width");
  });

  it("renders helperText and links it via aria-describedby", () => {
    render(TextFieldHarness, { label: "Email", helperText: "We'll never share it" });
    const input = screen.getByRole("textbox");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)).toHaveTextContent("We'll never share it");
  });

  it("disables the input", () => {
    render(TextFieldHarness, { label: "Email", disabled: true });
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("shows a required asterisk after the label and marks the input required", () => {
    const { container } = render(TextFieldHarness, { label: "Email", required: true });
    expect(container.querySelector(".okkly-text-field__required")).toHaveTextContent("*");
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("keeps a consumer's own class alongside the modifiers", () => {
    const { container } = render(TextFieldHarness, { label: "Email", class: "my-field" });
    expect(container.firstElementChild).toHaveClass("okkly-text-field", "my-field");
  });

  it("renders adornments only when passed", () => {
    const { container: withoutAdornments } = render(TextFieldHarness, { label: "Email" });
    expect(withoutAdornments.querySelectorAll(".okkly-text-field__adornment")).toHaveLength(0);

    const { getByTestId, container } = render(TextFieldHarness, {
      label: "Email",
      withAdornments: true,
    });
    expect(getByTestId("start-adornment")).toBeInTheDocument();
    expect(getByTestId("end-adornment")).toBeInTheDocument();
    expect(container.querySelectorAll(".okkly-text-field__adornment")).toHaveLength(2);
  });

  it("fires oninput as the user types", () => {
    const oninput = vi.fn();
    render(TextFieldHarness, { label: "Email", oninput });
    const input = screen.getByRole("textbox") as HTMLInputElement;

    input.value = "abc";
    // Svelte 5 delegates most native events to a shared root listener, so a
    // synthetic event must bubble to be caught.
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(oninput).toHaveBeenCalledOnce();
    expect(input.value).toBe("abc");
  });

  it("is exported as a component the consumer can render directly", () => {
    expect(typeof TextField).toBe("function");
  });
});
