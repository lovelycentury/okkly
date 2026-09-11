import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button.vue";

const label = { default: "Click me" };

describe("Button", () => {
  it("renders its label", () => {
    const wrapper = mount(Button, { slots: label });
    expect(wrapper.get("button").text()).toBe("Click me");
  });

  it("applies the default classes (primary variant, pill shape, medium size)", () => {
    const button = mount(Button, { slots: label }).get("button");
    expect(button.classes()).toEqual(
      expect.arrayContaining(["okkly-component", "okkly-button", "okkly-button--primary"]),
    );
    expect(button.attributes("class")).not.toMatch(/okkly-button--color-/);
    expect(button.attributes("class")).not.toMatch(/okkly-button--(small|large)/);
    expect(button.classes()).not.toContain("okkly-button--rounded");
  });

  it("applies the variant modifier", () => {
    const wrapper = mount(Button, { props: { variant: "ghost" as const }, slots: label });
    expect(wrapper.get("button").classes()).toContain("okkly-button--ghost");
  });

  it("applies a color modifier only for non-default colors", async () => {
    const wrapper = mount(Button, { props: { color: "dante" as const }, slots: label });
    expect(wrapper.get("button").classes()).toContain("okkly-button--color-dante");

    await wrapper.setProps({ color: "primary" });
    expect(wrapper.get("button").attributes("class")).not.toMatch(/okkly-button--color-/);
  });

  it("applies a size modifier only for non-medium sizes", async () => {
    const wrapper = mount(Button, { props: { size: "small" as const }, slots: label });
    expect(wrapper.get("button").classes()).toContain("okkly-button--small");

    await wrapper.setProps({ size: "medium" });
    expect(wrapper.get("button").attributes("class")).not.toMatch(/okkly-button--(small|large)/);
  });

  it("applies the rounded shape modifier", () => {
    const wrapper = mount(Button, { props: { shape: "rounded" as const }, slots: label });
    expect(wrapper.get("button").classes()).toContain("okkly-button--rounded");
  });

  it("applies the full-width modifier", () => {
    const wrapper = mount(Button, { props: { fullWidth: true }, slots: label });
    expect(wrapper.get("button").classes()).toContain("okkly-button--full-width");
  });

  it("renders the icon slots only when they are filled", () => {
    const bare = mount(Button, { slots: label });
    expect(bare.find(".okkly-button__icon").exists()).toBe(false);

    const withIcons = mount(Button, {
      slots: {
        ...label,
        "start-icon": '<span data-testid="start-icon" />',
        "end-icon": '<span data-testid="end-icon" />',
      },
    });
    expect(withIcons.find('[data-testid="start-icon"]').exists()).toBe(true);
    expect(withIcons.find('[data-testid="end-icon"]').exists()).toBe(true);
    expect(withIcons.findAll(".okkly-button__icon")).toHaveLength(2);
  });

  it("fires click", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, { slots: label, attrs: { onClick } });
    await wrapper.get("button").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables the native button while loading", () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: label });
    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.find(".okkly-button__spinner").exists()).toBe(true);
    expect(button.find(".okkly-button__label--hidden").exists()).toBe(true);
  });

  it("replaces the start icon with the spinner when loading from the start", () => {
    const wrapper = mount(Button, {
      props: { loading: true, loadingPosition: "start" as const },
      slots: { ...label, "start-icon": "<span />", "end-icon": "<span />" },
    });
    expect(wrapper.findAll(".okkly-button__icon")).toHaveLength(1);
    expect(wrapper.find(".okkly-button__label--hidden").exists()).toBe(false);
  });

  it("renders an anchor for href and drops it while disabled", async () => {
    const wrapper = mount(Button, { props: { href: "https://okkly.dev" }, slots: label });
    expect(wrapper.get("a").attributes("href")).toBe("https://okkly.dev");

    await wrapper.setProps({ disabled: true });
    expect(wrapper.get("a").attributes("href")).toBeUndefined();
    expect(wrapper.get("a").attributes("aria-disabled")).toBe("true");
  });

  it("paints a ripple on mouse down and clears it on release", async () => {
    const wrapper = mount(Button, { slots: label, attachTo: document.body });
    await wrapper.get("button").trigger("mousedown", { clientX: 4, clientY: 4 });
    expect(wrapper.find(".okkly-ripple__element").exists()).toBe(true);

    await wrapper.get(".okkly-ripple__element").trigger("animationend");
    await wrapper.get("button").trigger("mouseup");
    expect(wrapper.find(".okkly-ripple__element").exists()).toBe(false);
  });

  it("does not render the ripple overlay when disabled", () => {
    const wrapper = mount(Button, { props: { disabled: true }, slots: label });
    expect(wrapper.find(".okkly-ripple").exists()).toBe(false);
  });
});
