import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { CheckboxGroup } from "./CheckboxGroup";
import { Checkbox } from "../Checkbox/Checkbox";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "CheckboxGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <CheckboxGroup
        defaultValue={["sms"]}
        size={column as "small" | "medium" | "large"}
        disabled={row === "disabled"}
        label={row === "with-label" ? "Notification channels" : undefined}
      >
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
        <Checkbox value="push" label="Push" />
      </CheckboxGroup>
    ),
  });

  executeMatrixScreenshotTest({
    name: "CheckboxGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <CheckboxGroup defaultValue={["email", "sms"]} size="large" color="dante">
        <Checkbox value="email" label="Email" />
        <Checkbox
          value="sms"
          label="SMS"
          size={column === "overridden" ? "small" : undefined}
          color={column === "overridden" ? "ice" : undefined}
        />
      </CheckboxGroup>
    ),
  });
});

test("should check the options matching defaultValue", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["sms", "push"]}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
      <Checkbox value="push" label="Push" />
    </CheckboxGroup>,
  );

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("checkbox", { name: "Push" })).toBeChecked();
});

test("should toggle nested checkboxes independently when uncontrolled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["email"]}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
    </CheckboxGroup>,
  );
  const email = component.getByRole("checkbox", { name: "Email" });
  const sms = component.getByRole("checkbox", { name: "SMS" });

  // ACT
  await sms.click();

  // ASSERT
  await expect(sms).toBeChecked();
  await expect(email).toBeChecked();

  // ACT
  await email.click();

  // ASSERT
  await expect(email).not.toBeChecked();
  await expect(sms).toBeChecked();
});

test("should stay controlled by value and report through onChange", async ({ mount }) => {
  const changes: string[][] = [];

  // ARRANGE
  const component = await mount(
    <CheckboxGroup value={["email"]} onChange={(value) => changes.push(value)}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
    </CheckboxGroup>,
  );

  // ACT
  await component.getByRole("checkbox", { name: "SMS" }).click();

  // ASSERT — the parent owns the state, so nothing flips on its own.
  expect(changes).toEqual([["email", "sms"]]);
  await expect(component.getByRole("checkbox", { name: "Email" })).toBeChecked();
  await expect(component.getByRole("checkbox", { name: "SMS" })).not.toBeChecked();
});

test("should give every nested Checkbox the same name", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["email"]}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
    </CheckboxGroup>,
  );

  // ASSERT
  const names = await component
    .getByRole("checkbox")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should propagate disabled to every nested Checkbox", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["email"]} disabled>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
    </CheckboxGroup>,
  );

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).toBeDisabled();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
});

test("should let a nested Checkbox override the group's size and color", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["email"]} size="large" color="dante">
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" size="small" color="ice" />
    </CheckboxGroup>,
  );
  const boxes = component.locator(".okkly-checkbox");

  // ASSERT
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--large/);
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--color-dante/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--small/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--color-ice/);
});

test("should expose the group role named by its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <CheckboxGroup defaultValue={["email"]} label="Notification channels">
      <Checkbox value="email" label="Email" />
    </CheckboxGroup>,
  );

  // ASSERT — the group role sits on the component root itself.
  await expect(component).toHaveRole("group");
  await expect(component).toHaveAccessibleName("Notification channels");
});
