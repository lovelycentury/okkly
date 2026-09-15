import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import RadioGroupFixture from "../../playwright/fixtures/RadioGroupFixture.vue";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "RadioGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: RadioGroupFixture,
    args: (column, row) => ({
      props: {
        defaultValue: "sms",
        size: column as "small" | "medium" | "large",
        disabled: row === "disabled",
        label: row === "with-label" ? "Notification preference" : undefined,
        showPush: true,
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "RadioGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: RadioGroupFixture,
    args: (column) => ({
      props: {
        defaultValue: "email",
        size: "large",
        color: "dante",
        smsSize: column === "overridden" ? "small" : undefined,
        smsColor: column === "overridden" ? "ice" : undefined,
      },
    }),
  });
});

test("should check exactly the option matching defaultValue", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, { props: { defaultValue: "sms" } });

  // ASSERT
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
});

test("should move the checked state when another option is picked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, { props: { defaultValue: "email" } });

  // ACT
  await component.getByRole("radio", { name: "SMS" }).click();

  // ASSERT
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
});

test("should reflect an explicit modelValue prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, { props: { modelValue: "sms" } });

  // ASSERT
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
});

test("should report the picked value through update:modelValue", async ({ mount }) => {
  const changes: string[] = [];

  // ARRANGE — the fixture relays through its own `v-model`, so mounting
  // already reports the `defaultValue` seed once; only the value after the
  // click matters here.
  const component = await mount(RadioGroupFixture, {
    props: { defaultValue: "email" },
    on: { "update:modelValue": (value: unknown) => changes.push(value as string) },
  });

  // ACT
  await component.getByRole("radio", { name: "SMS" }).click();

  // ASSERT
  await expect(() => expect(changes.at(-1)).toBe("sms")).toPass();
});

test("should give every nested Radio the same name", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, { props: { defaultValue: "email" } });

  // ASSERT — a shared name is what keeps the selection mutually exclusive.
  const names = await component
    .getByRole("radio")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should propagate disabled to every nested Radio", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, {
    props: { defaultValue: "email", disabled: true },
  });

  // ASSERT
  await expect(component.getByRole("radio", { name: "Email" })).toBeDisabled();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeDisabled();
});

test("should let a nested Radio override the group's size and color", async ({ mount, page }) => {
  // ARRANGE
  await mount(RadioGroupFixture, {
    props: {
      defaultValue: "email",
      size: "large",
      color: "dante",
      smsSize: "small",
      smsColor: "ice",
    },
  });
  const radios = page.locator(".okkly-radio");

  // ASSERT
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--large/);
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--color-dante/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--small/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--color-ice/);
});

test("should expose the radiogroup role named by its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, {
    props: { defaultValue: "email", label: "Notification preference" },
  });

  // ASSERT — the role sits on the component root itself.
  await expect(component).toHaveRole("radiogroup");
  await expect(component.locator(".okkly-radio-group__label")).toHaveText(
    "Notification preference",
  );
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RadioGroupFixture, { props: { defaultValue: "email" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-radio-group\b/);
});
