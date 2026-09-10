import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "../Radio/Radio";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "RadioGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <RadioGroup
        defaultValue="sms"
        size={column as "small" | "medium" | "large"}
        disabled={row === "disabled"}
        label={row === "with-label" ? "Notification preference" : undefined}
      >
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
        <Radio value="push" label="Push" />
      </RadioGroup>
    ),
  });

  executeMatrixScreenshotTest({
    name: "RadioGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <RadioGroup defaultValue="email" size="large" color="dante">
        <Radio value="email" label="Email" />
        <Radio
          value="sms"
          label="SMS"
          size={column === "overridden" ? "small" : undefined}
          color={column === "overridden" ? "ice" : undefined}
        />
      </RadioGroup>
    ),
  });
});

test("should check exactly the option matching defaultValue", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="sms">
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>,
  );

  // ASSERT
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
});

test("should move the checked state when another option is picked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="email">
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>,
  );

  // ACT
  await component.getByRole("radio", { name: "SMS" }).click();

  // ASSERT
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
});

test("should stay controlled by value and report through onChange", async ({ mount }) => {
  const changes: string[] = [];

  // ARRANGE
  const component = await mount(
    <RadioGroup value="email" onChange={(value) => changes.push(value)}>
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>,
  );

  // ACT
  await component.getByRole("radio", { name: "SMS" }).click();

  // ASSERT — still "email", because the parent never fed the new value back.
  expect(changes).toEqual(["sms"]);
  await expect(component.getByRole("radio", { name: "Email" })).toBeChecked();
});

test("should give every nested Radio the same name", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="email">
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>,
  );

  // ASSERT — a shared name is what keeps the selection mutually exclusive.
  const names = await component
    .getByRole("radio")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should propagate disabled to every nested Radio", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="email" disabled>
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>,
  );

  // ASSERT
  await expect(component.getByRole("radio", { name: "Email" })).toBeDisabled();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeDisabled();
});

test("should let a nested Radio override the group's size and color", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="email" size="large" color="dante">
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" size="small" color="ice" />
    </RadioGroup>,
  );
  const radios = component.locator(".okkly-radio");

  // ASSERT
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--large/);
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--color-dante/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--small/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--color-ice/);
});

test("should expose the radiogroup role named by its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RadioGroup defaultValue="email" label="Notification preference">
      <Radio value="email" label="Email" />
    </RadioGroup>,
  );

  // ASSERT — the role sits on the component root itself.
  await expect(component).toHaveRole("radiogroup");
  await expect(component).toHaveAccessibleName("Notification preference");
});
