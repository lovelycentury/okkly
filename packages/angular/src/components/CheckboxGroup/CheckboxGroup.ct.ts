import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

const OPTIONS = `
  <okkly-checkbox value="email" label="Email" />
  <okkly-checkbox value="sms" label="SMS" />
  <okkly-checkbox value="push" label="Push" />`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "CheckboxGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-checkbox-group [value]="['sms']" size="${column}"${row === "disabled" ? " disabled" : ""}${
        row === "with-label" ? ` label="Notification channels"` : ""
      }>${OPTIONS}</okkly-checkbox-group>`,
  });

  executeMatrixScreenshotTest({
    name: "CheckboxGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      `<okkly-checkbox-group [value]="['email', 'sms']" size="large" color="dante">
        <okkly-checkbox value="email" label="Email" />
        <okkly-checkbox value="sms" label="SMS"${column === "overridden" ? ` size="small" color="ice"` : ""} />
      </okkly-checkbox-group>`,
  });
});

test("should check the options matching the initial value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group [value]="['sms', 'push']">${OPTIONS}</okkly-checkbox-group>`,
  );

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("checkbox", { name: "Push" })).toBeChecked();
});

test("should toggle nested checkboxes independently", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group [value]="['email']">
      <okkly-checkbox value="email" label="Email" />
      <okkly-checkbox value="sms" label="SMS" />
    </okkly-checkbox-group>`,
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

test("should report the selection through valueChange and follow the bound value", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group [value]="state().value" (valueChange)="record('change', $event)">
      <okkly-checkbox value="email" label="Email" />
      <okkly-checkbox value="sms" label="SMS" />
    </okkly-checkbox-group>`,
    { value: ["email"] },
  );

  // ACT
  await component.getByRole("checkbox", { name: "SMS" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([["email", "sms"]]);

  // ACT — the parent takes the selection back.
  await update({ value: [] });

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("checkbox", { name: "SMS" })).not.toBeChecked();
});

test("should give every nested checkbox the same name", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group>
      <okkly-checkbox value="email" label="Email" />
      <okkly-checkbox value="sms" label="SMS" />
    </okkly-checkbox-group>`,
  );

  // ASSERT
  const names = await component
    .getByRole("checkbox")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should use an explicit name, and keep it off the group element", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group name="channels"><okkly-checkbox value="email" label="Email" /></okkly-checkbox-group>`,
  );

  // ASSERT
  await expect(component.getByRole("checkbox")).toHaveAttribute("name", "channels");
  await expect(component).not.toHaveAttribute("name");
});

test("should propagate disabled to every nested checkbox", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group [value]="['email']" disabled>
      <okkly-checkbox value="email" label="Email" />
      <okkly-checkbox value="sms" label="SMS" />
    </okkly-checkbox-group>`,
  );

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).toBeDisabled();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
});

test("should let a nested checkbox override the group's size and color", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group [value]="['email']" size="large" color="dante">
      <okkly-checkbox value="email" label="Email" />
      <okkly-checkbox value="sms" label="SMS" size="small" color="ice" />
    </okkly-checkbox-group>`,
  );
  const boxes = component.locator(".okkly-checkbox");

  // ASSERT
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--large/);
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--color-dante/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--small/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--color-ice/);
});

test("should expose the group role named by its label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox-group label="Notification channels"><okkly-checkbox value="email" label="Email" /></okkly-checkbox-group>`,
  );

  // ASSERT
  await expect(component).toHaveRole("group");
  await expect(component).toHaveAccessibleName("Notification channels");
  await expect(component.locator(".okkly-checkbox-group__label")).toHaveText(
    "Notification channels",
  );
});
