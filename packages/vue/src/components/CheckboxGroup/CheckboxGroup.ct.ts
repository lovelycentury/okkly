import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import CheckboxGroupFixture from "../../playwright/fixtures/CheckboxGroupFixture.vue";
import type { CheckboxSize } from "../Checkbox/Checkbox.types";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "CheckboxGroup (sizes)",
    columns: ["small", "medium", "large"],
    rows: ["default", "with-label", "disabled"],
    fastNoIsolation: true,
    component: CheckboxGroupFixture,
    args: (column, row) => ({
      props: {
        defaultValue: ["sms"],
        size: column as CheckboxSize,
        disabled: row === "disabled",
        label: row === "with-label" ? "Notification channels" : undefined,
        showPush: true,
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "CheckboxGroup (per-option override)",
    columns: ["group-default", "overridden"],
    rows: ["default"],
    fastNoIsolation: true,
    component: CheckboxGroupFixture,
    args: (column) => ({
      props: {
        defaultValue: ["email", "sms"],
        size: "large",
        color: "dante",
        smsSize: column === "overridden" ? "small" : undefined,
        smsColor: column === "overridden" ? "ice" : undefined,
      },
    }),
  });
});

test("should check the options matching defaultValue", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, {
    props: { defaultValue: ["sms"], showPush: true },
  });

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  await expect(component.getByRole("checkbox", { name: "Push" })).not.toBeChecked();
});

test("should toggle nested checkboxes independently when uncontrolled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, { props: { defaultValue: ["email"] } });
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

test("should compute and report the toggled set through update:modelValue", async ({ mount }) => {
  const changes: string[][] = [];

  // ARRANGE — this only pins the emitted value, not "the checkbox stays
  // unchecked because the parent never fed the update back": Playwright's
  // Vue CT harness delivers `on:` listeners through a devtools-emit hook
  // rather than a real `onUpdate:modelValue` vnode prop, so `defineModel`'s
  // controlled-detection (which looks for exactly that prop) can't see a
  // root-mounted `on:` listener as "controlled" the way a genuine `v-model`
  // binding in a real template would — CalendarFixture hits the same class
  // of harness limitation from a different angle.
  const component = await mount(CheckboxGroupFixture, {
    props: { modelValue: ["email"] } as never,
    on: { "update:modelValue": (value: unknown) => changes.push(value as string[]) },
  });

  // ACT
  await component.getByRole("checkbox", { name: "SMS" }).click();

  // ASSERT
  expect(changes).toEqual([["email", "sms"]]);
});

test("should give every nested Checkbox the same name", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, { props: { defaultValue: ["email"] } });

  // ASSERT
  const names = await component
    .getByRole("checkbox")
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size).toBe(1);
});

test("should propagate disabled to every nested Checkbox", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, {
    props: { defaultValue: ["email"], disabled: true },
  });

  // ASSERT
  await expect(component.getByRole("checkbox", { name: "Email" })).toBeDisabled();
  await expect(component.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
});

test("should let a nested Checkbox override the group's size and color", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await mount(CheckboxGroupFixture, {
    props: {
      defaultValue: ["email"],
      size: "large",
      color: "dante",
      smsSize: "small",
      smsColor: "ice",
    },
  });
  const boxes = page.locator(".okkly-checkbox");

  // ASSERT
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--large/);
  await expect(boxes.nth(0)).toHaveClass(/okkly-checkbox--color-dante/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--small/);
  await expect(boxes.nth(1)).toHaveClass(/okkly-checkbox--color-ice/);
});

test("should expose the group role named by its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, {
    props: { defaultValue: ["email"], label: "Notification channels" },
  });

  // ASSERT — the group role sits on the component root itself.
  await expect(component).toHaveRole("group");
  await expect(component.locator(".okkly-checkbox-group__label")).toHaveText(
    "Notification channels",
  );
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(CheckboxGroupFixture, { props: { defaultValue: ["email"] } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-checkbox-group\b/);
});
