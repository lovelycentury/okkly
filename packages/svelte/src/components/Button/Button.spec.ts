import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button.svelte";
import ButtonHarness from "./Button.harness.svelte";

describe("Button", () => {
  it("renders its label", () => {
    render(ButtonHarness, { label: "Click me" });
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies the default classes (primary variant, pill shape, medium size)", () => {
    render(ButtonHarness, { label: "Click me" });
    const button = screen.getByRole("button");
    expect(button).toHaveClass("okkly-component", "okkly-button", "okkly-button--primary");
    expect(button.className).not.toMatch(/okkly-button--color-/);
    expect(button.className).not.toMatch(/okkly-button--(small|large)/);
    expect(button.className).not.toContain("okkly-button--rounded");
  });

  it("applies the variant modifier", () => {
    render(ButtonHarness, { label: "Click me", variant: "ghost" });
    expect(screen.getByRole("button")).toHaveClass("okkly-button--ghost");
  });

  it("applies a color modifier only for non-default colors", async () => {
    const { rerender } = render(ButtonHarness, { label: "Click me", color: "dante" });
    expect(screen.getByRole("button")).toHaveClass("okkly-button--color-dante");

    await rerender({ label: "Click me", color: "primary" });
    expect(screen.getByRole("button").className).not.toMatch(/okkly-button--color-/);
  });

  it("applies a size modifier only for non-medium sizes", async () => {
    const { rerender } = render(ButtonHarness, { label: "Click me", size: "small" });
    expect(screen.getByRole("button")).toHaveClass("okkly-button--small");

    await rerender({ label: "Click me", size: "medium" });
    expect(screen.getByRole("button").className).not.toMatch(/okkly-button--(small|large)/);
  });

  it("applies the rounded shape modifier", () => {
    render(ButtonHarness, { label: "Click me", shape: "rounded" });
    expect(screen.getByRole("button")).toHaveClass("okkly-button--rounded");
  });

  it("applies the full-width modifier", () => {
    render(ButtonHarness, { label: "Click me", fullWidth: true });
    expect(screen.getByRole("button")).toHaveClass("okkly-button--full-width");
  });

  it("keeps a consumer's own class alongside the modifiers", () => {
    render(ButtonHarness, { label: "Click me", class: "my-button" });
    expect(screen.getByRole("button")).toHaveClass("okkly-button", "my-button");
  });

  it("renders the icon slots only when a snippet is passed", () => {
    const { container } = render(ButtonHarness, { label: "Click me" });
    expect(container.querySelectorAll(".okkly-button__icon")).toHaveLength(0);

    const withIcons = render(ButtonHarness, { label: "Click me", withIcons: true });
    expect(withIcons.getByTestId("start-icon")).toBeInTheDocument();
    expect(withIcons.getByTestId("end-icon")).toBeInTheDocument();
    expect(withIcons.container.querySelectorAll(".okkly-button__icon")).toHaveLength(2);
  });

  it("fires onclick", async () => {
    const onclick = vi.fn();
    render(ButtonHarness, { label: "Click me", onclick });
    screen.getByRole("button").click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("disables the native button while loading", () => {
    const { container } = render(ButtonHarness, { label: "Click me", loading: true });
    expect(screen.getByRole("button")).toBeDisabled();
    expect(container.querySelector(".okkly-button__spinner")).not.toBeNull();
    expect(container.querySelector(".okkly-button__label--hidden")).not.toBeNull();
  });

  it("replaces the start icon with the spinner when loading from the start", () => {
    const { container } = render(ButtonHarness, {
      label: "Click me",
      withIcons: true,
      loading: true,
      loadingPosition: "start",
    });
    expect(container.querySelectorAll(".okkly-button__icon")).toHaveLength(1);
    expect(container.querySelector(".okkly-button__label--hidden")).toBeNull();
  });

  it("renders an anchor for href and drops it while disabled", async () => {
    const { rerender } = render(ButtonHarness, {
      label: "Get in touch",
      href: "https://okryshto.dev",
    });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://okryshto.dev");

    await rerender({ label: "Get in touch", href: "https://okryshto.dev", disabled: true });
    const disabledLink = screen.getByText("Get in touch").closest("a")!;
    expect(disabledLink).not.toHaveAttribute("href");
    expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    expect(disabledLink).toHaveAttribute("tabindex", "-1");
  });

  it("paints a ripple on pointer down and clears it on release", () => {
    const { container } = render(ButtonHarness, { label: "Click me" });
    const button = screen.getByRole("button");

    button.dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: 4 }));
    const element = container.querySelector(".okkly-ripple__element");
    expect(element).not.toBeNull();

    element?.dispatchEvent(new Event("animationend"));
    button.dispatchEvent(new MouseEvent("pointerup"));
    expect(container.querySelector(".okkly-ripple__element")).toBeNull();
  });

  // Both renders live in the same document, so each query is scoped to its own
  // container rather than going through `screen`.
  it("does not ripple while disabled or when the ripple is turned off", () => {
    const press = (container: HTMLElement) => {
      within(container)
        .getByRole("button")
        .dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: 4 }));
      return container.querySelector(".okkly-ripple__element");
    };

    expect(
      press(render(ButtonHarness, { label: "Click me", disabled: true }).container),
    ).toBeNull();
    expect(
      press(render(ButtonHarness, { label: "Click me", disableRipple: true }).container),
    ).toBeNull();
  });

  it("is exported as a component the consumer can render directly", () => {
    expect(typeof Button).toBe("function");
  });
});
