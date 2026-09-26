import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

const OPTIONS = `
  <okkly-radio value="email" label="Email" />
  <okkly-radio value="sms" label="SMS" />
  <okkly-radio value="push" label="Push" />`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "RadioGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-radio-group value="sms" size="${column}"${row === "disabled" ? " disabled" : ""}${
        row === "with-label" ? ` label="Notification preference"` : ""
      }>${OPTIONS}</okkly-radio-group>`,
  });

  executeMatrixScreenshotTest({
    name: "RadioGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      `<okkly-radio-group value="email" size="large" color="dante">
        <okkly-radio value="email" label="Email" />
        <okkly-radio value="sms" label="SMS"${column === "overridden" ? ` size="small" color="ice"` : ""} />
      </okkly-radio-group>`,
  });
});

test("should check exactly the option matching the initial value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group value="sms">${OPTIONS}</okkly-radio-group>`,
  );

  // ASSERT
  await expect(component.getByRole("radio", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "Push" })).not.toBeChecked();
});

test("should move the checked state when another option is picked", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group value="email">${OPTIONS}</okkly-radio-group>`,
  );
  const email = component.getByRole("radio", { name: "Email" });
  const push = component.getByRole("radio", { name: "Push" });

  // ACT
  await push.click();

  // ASSERT
  await expect(push).toBeChecked();
  await expect(email).not.toBeChecked();
});

test("should report the choice through valueChange and follow the bound value", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group [value]="state().value" (valueChange)="record('change', $event)">${OPTIONS}</okkly-radio-group>`,
    { value: "email" },
  );

  // ACT
  await component.getByRole("radio", { name: "SMS" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual(["sms"]);

  // ACT — the parent moves the choice itself.
  await update({ value: "push" });

  // ASSERT
  await expect(component.getByRole("radio", { name: "Push" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "SMS" })).not.toBeChecked();
});

test("should give every nested radio the same name", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio-group>${OPTIONS}</okkly-radio-group>`);

  // ASSERT
  const names = await component
    .getByRole("radio")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should keep two groups apart", async ({ mountTemplate }) => {
  // ARRANGE — each group generates its own name, so picking in one leaves the other alone.
  const component = await mountTemplate(
    `<div>
      <okkly-radio-group class="first" value="email">${OPTIONS}</okkly-radio-group>
      <okkly-radio-group class="second" value="email">${OPTIONS}</okkly-radio-group>
    </div>`,
  );

  // ACT
  await component.locator(".second").getByRole("radio", { name: "Push" }).click();

  // ASSERT
  await expect(component.locator(".first").getByRole("radio", { name: "Email" })).toBeChecked();
});

test("should propagate disabled to every nested radio", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group value="email" disabled>${OPTIONS}</okkly-radio-group>`,
  );

  // ASSERT
  for (const radio of await component.getByRole("radio").all()) await expect(radio).toBeDisabled();
});

test("should let a nested radio override the group's size and color", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group value="email" size="large" color="dante">
      <okkly-radio value="email" label="Email" />
      <okkly-radio value="sms" label="SMS" size="small" color="ice" />
    </okkly-radio-group>`,
  );
  const radios = component.locator(".okkly-radio");

  // ASSERT
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--large/);
  await expect(radios.nth(0)).toHaveClass(/okkly-radio--color-dante/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--small/);
  await expect(radios.nth(1)).toHaveClass(/okkly-radio--color-ice/);
});

test("should expose the radiogroup role named by its label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio-group value="email" label="Notification preference">${OPTIONS}</okkly-radio-group>`,
  );

  // ASSERT
  await expect(component).toHaveRole("radiogroup");
  await expect(component).toHaveAccessibleName("Notification preference");
});

test("should move the choice with the arrow keys", async ({ mountTemplate, page }) => {
  // ARRANGE — native radios with one name give this for free.
  const component = await mountTemplate(
    `<okkly-radio-group value="email">${OPTIONS}</okkly-radio-group>`,
  );

  // ACT
  await component.getByRole("radio", { name: "Email" }).focus();
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(component.getByRole("radio", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("radio", { name: "SMS" })).toBeFocused();
});
