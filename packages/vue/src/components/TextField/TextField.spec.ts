import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TextField from "./TextField.vue";

const label = { label: "Email" };

describe("TextField", () => {
  it("renders a labeled input linked by for/id", () => {
    const wrapper = mount(TextField, { slots: label });
    const input = wrapper.get("input");
    const forAttribute = wrapper.get("label").attributes("for");
    expect(forAttribute).toBe(input.attributes("id"));
    expect(wrapper.get("label").text()).toBe("Email");
  });

  it("visually hides the label but keeps it in the DOM", () => {
    const wrapper = mount(TextField, { props: { hideLabel: true }, slots: label });
    expect(wrapper.get("label").classes()).toContain("okkly-text-field__label--hidden");
    expect(wrapper.get("label").text()).toBe("Email");
  });

  it("applies the default classes", () => {
    const wrapper = mount(TextField, { slots: label });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["okkly-component", "okkly-text-field"]),
    );
    expect(wrapper.attributes("class")).not.toMatch(
      /okkly-text-field--(small|large|error|disabled)/,
    );
  });

  it("applies a size modifier only for non-medium sizes", async () => {
    const wrapper = mount(TextField, { props: { size: "small" as const }, slots: label });
    expect(wrapper.classes()).toContain("okkly-text-field--small");

    await wrapper.setProps({ size: "medium" });
    expect(wrapper.attributes("class")).not.toMatch(/okkly-text-field--(small|large)/);
  });

  it.each(["secondary", "dante", "violet", "ember", "ice", "contrast"] as const)(
    "applies a %s color modifier",
    (color) => {
      const wrapper = mount(TextField, { props: { color }, slots: label });
      expect(wrapper.classes()).toContain(`okkly-text-field--color-${color}`);
    },
  );

  it("applies no color modifier for the default primary color", async () => {
    const wrapper = mount(TextField, { props: { color: "dante" as const }, slots: label });
    expect(wrapper.classes()).toContain("okkly-text-field--color-dante");

    await wrapper.setProps({ color: "primary" });
    expect(wrapper.attributes("class")).not.toMatch(/okkly-text-field--color-/);
  });

  it("applies the error modifier and marks aria-invalid", () => {
    const wrapper = mount(TextField, { props: { error: true }, slots: label });
    expect(wrapper.classes()).toContain("okkly-text-field--error");
    expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
  });

  it("applies the full-width modifier", () => {
    const wrapper = mount(TextField, { props: { fullWidth: true }, slots: label });
    expect(wrapper.classes()).toContain("okkly-text-field--full-width");
  });

  it("renders helper text only when the slot is filled, linked by aria-describedby", () => {
    const bare = mount(TextField, { slots: label });
    expect(bare.find(".okkly-text-field__helper").exists()).toBe(false);

    const wrapper = mount(TextField, {
      slots: { ...label, "helper-text": "We'll never share it" },
    });
    const describedBy = wrapper.get("input").attributes("aria-describedby");
    expect(wrapper.get(`#${describedBy}`).text()).toBe("We'll never share it");
  });

  it("disables the input", () => {
    const wrapper = mount(TextField, { props: { disabled: true }, slots: label });
    expect(wrapper.get("input").attributes("disabled")).toBeDefined();
  });

  it("shows a required asterisk after the label", () => {
    const wrapper = mount(TextField, { props: { required: true }, slots: label });
    expect(wrapper.get(".okkly-text-field__required").text()).toBe("*");
    expect(wrapper.get("input").attributes("required")).toBeDefined();
  });

  it("renders the adornment slots only when filled", () => {
    const bare = mount(TextField, { slots: label });
    expect(bare.find(".okkly-text-field__adornment").exists()).toBe(false);

    const withAdornments = mount(TextField, {
      slots: {
        ...label,
        "start-adornment": '<span data-testid="start" />',
        "end-adornment": '<span data-testid="end" />',
      },
    });
    expect(withAdornments.findAll(".okkly-text-field__adornment")).toHaveLength(2);
  });

  it("updates the model as the user types", async () => {
    const wrapper = mount(TextField, { props: { modelValue: "" }, slots: label });
    const input = wrapper.get("input");

    await input.setValue("a");
    await input.setValue("ab");
    await input.setValue("abc");

    expect(wrapper.emitted("update:modelValue")).toHaveLength(3);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["abc"]);
  });

  it("merges a consumer's class onto the field, and falls other native attributes through to the input", () => {
    const wrapper = mount(TextField, {
      slots: label,
      attrs: { class: "custom", "data-testid": "email-input", placeholder: "you@example.com" },
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["okkly-text-field", "custom"]));
    expect(wrapper.get("input").attributes("data-testid")).toBe("email-input");
    expect(wrapper.get("input").attributes("placeholder")).toBe("you@example.com");
    expect(wrapper.attributes("data-testid")).toBeUndefined();
  });
});
