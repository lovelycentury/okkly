import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Field from "./Field.vue";

const props = { block: "okkly-text-field", id: "email" };
const control = { default: '<input id="email" />' };

describe("Field", () => {
  it("renders the control in the default slot", () => {
    const wrapper = mount(Field, { props, slots: control });
    expect(wrapper.find("input#email").exists()).toBe(true);
  });

  it("renders the label only when the slot is filled, linked by for/id", () => {
    const bare = mount(Field, { props, slots: control });
    expect(bare.find("label").exists()).toBe(false);

    const labeled = mount(Field, { props, slots: { ...control, label: "Email" } });
    expect(labeled.get("label").attributes("for")).toBe("email");
    expect(labeled.get("label").attributes("id")).toBe("email-label");
    expect(labeled.get("label").text()).toBe("Email");
  });

  it("points the label at aria-labelledby target instead of for when htmlFor is false", () => {
    const wrapper = mount(Field, {
      props: { ...props, htmlFor: false },
      slots: { ...control, label: "Email" },
    });
    expect(wrapper.get("label").attributes("for")).toBeUndefined();
    expect(wrapper.get("label").attributes("id")).toBe("email-label");
  });

  it("hides the label visually but keeps it in the DOM", () => {
    const wrapper = mount(Field, {
      props: { ...props, hideLabel: true },
      slots: { ...control, label: "Email" },
    });
    expect(wrapper.get("label").classes()).toContain("okkly-text-field__label--hidden");
  });

  it("shows a required asterisk only when required", () => {
    const bare = mount(Field, { props, slots: { ...control, label: "Email" } });
    expect(bare.find(".okkly-text-field__required").exists()).toBe(false);

    const required = mount(Field, {
      props: { ...props, required: true },
      slots: { ...control, label: "Email" },
    });
    expect(required.get(".okkly-text-field__required").text()).toBe("*");
  });

  it("renders helper text only when the slot is filled, linked by id", () => {
    const bare = mount(Field, { props, slots: control });
    expect(bare.find(".okkly-text-field__helper").exists()).toBe(false);

    const withHelper = mount(Field, {
      props,
      slots: { ...control, "helper-text": "We'll never share it" },
    });
    expect(withHelper.get(".okkly-text-field__helper").attributes("id")).toBe("email-helper");
    expect(withHelper.get(".okkly-text-field__helper").text()).toBe("We'll never share it");
  });

  it("renders the adornment slots only when filled", () => {
    const bare = mount(Field, { props, slots: control });
    expect(bare.find(".okkly-text-field__adornment").exists()).toBe(false);

    const withAdornments = mount(Field, {
      props,
      slots: {
        ...control,
        "start-adornment": '<span data-testid="start" />',
        "end-adornment": '<span data-testid="end" />',
      },
    });
    expect(withAdornments.findAll(".okkly-text-field__adornment")).toHaveLength(2);
  });

  it.each(["secondary", "dante", "violet", "ember", "ice", "contrast"] as const)(
    "applies a %s color modifier",
    async (color) => {
      const wrapper = mount(Field, { props, slots: control });
      await wrapper.setProps({ color });
      expect(wrapper.classes()).toContain(`okkly-text-field--color-${color}`);
    },
  );

  it("applies the block, size, error, disabled and full-width modifiers", async () => {
    const wrapper = mount(Field, { props, slots: control });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["okkly-component", "okkly-text-field"]),
    );

    await wrapper.setProps({ color: "primary", size: "small" });
    expect(wrapper.classes()).toContain("okkly-text-field--small");

    await wrapper.setProps({ size: "medium", error: true });
    expect(wrapper.classes()).toContain("okkly-text-field--error");

    await wrapper.setProps({ error: false, disabled: true });
    expect(wrapper.classes()).toContain("okkly-text-field--disabled");

    await wrapper.setProps({ disabled: false, fullWidth: true });
    expect(wrapper.classes()).toContain("okkly-text-field--full-width");
  });
});
