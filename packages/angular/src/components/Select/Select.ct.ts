import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { SelectSize } from "./Select";

const SIZES = ["small", "medium", "large"] as const satisfies readonly SelectSize[];

/** Angular template array-literal syntax, so tests need no `state()` for option data. */
const TEAM_OPTIONS =
  "[{value:'design',label:'Product design'},{value:'engineering',label:'Engineering'},{value:'marketing',label:'Marketing'}]";

// The listbox portals to `document.body`, so open-state cells photograph the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 420 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Select (sizes)",
    columns: SIZES,
    rows: ["placeholder", "selected", "error", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => `
      <div style="width: 14rem">
        <okkly-select
          label="Team"
          placeholder="Choose…"
          size="${column}"
          [options]="${TEAM_OPTIONS}"
          ${row === "placeholder" ? "" : 'value="design"'}
          ${row === "error" ? 'error helperText="Required"' : ""}
          ${row === "disabled" ? "disabled" : ""}
        />
      </div>
    `,
  });

  executeMatrixScreenshotTest({
    name: "Select (open)",
    columns: ["single", "multiple"],
    rows: ["default"],
    screenshotTarget: "page",
    component: (column) => `
      <div style="width: 14rem; padding: 1rem">
        <okkly-select
          label="Team"
          open
          [options]="${TEAM_OPTIONS}"
          ${column === "multiple" ? "multiple [value]=\"['design']\"" : 'value="design"'}
        />
      </div>
    `,
  });
});

test("should render a combobox trigger and label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" placeholder="Choose…" />`,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAccessibleName(/team/i);
  await expect(component).toContainText("Choose…");
});

test("should render the default size without a size modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-select")).not.toHaveClass(/okkly-select--(small|large)/);
});

test("should apply the size and error modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" size="small" error helperText="Required" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-select")).toHaveClass(/okkly-select--small/);
  await expect(component.locator(".okkly-select")).toHaveClass(/okkly-select--error/);
});

test("should open the listbox and select an option", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" (change)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("combobox").click();
  await component.page().getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: "engineering",
      reason: "selectOption",
      option: { value: "engineering", label: "Engineering" },
    },
  ]);
  await expect(component.getByRole("combobox")).toContainText("Engineering");
});

test("should support multi-select toggling and stay open", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" multiple (change)="record('change', $event)" />`,
  );
  const page = component.page();

  // ACT
  await component.getByRole("combobox").click();
  await page.getByRole("option", { name: "Product design" }).click();

  // ASSERT — the popup survives the first pick.
  await expect(page.getByRole("listbox")).toBeVisible();

  // ACT
  await page.getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  const events = (await recordedEvents("change")) as { value: unknown }[];
  expect(events.at(-1)?.value).toEqual(["design", "engineering"]);
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("should open from the chevron and the field's own padding", async ({ mountTemplate }) => {
  // ARRANGE — both sit outside the trigger div (the chevron is a Field
  // adornment), so they only work because the whole control box is the target.
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" />`,
  );
  const page = component.page();

  // ACT
  await component.locator(".okkly-select__chevron").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toBeVisible();

  // ACT
  await component.locator(".okkly-select__control").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("should render the trigger as a div so chip remove buttons are valid", async ({
  mountTemplate,
}) => {
  // ARRANGE — a <button> may not contain interactive descendants; the chips'
  // × buttons are exactly that, which is why the trigger is a div[role=combobox].
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" multiple value="design" />`,
  );
  const trigger = component.getByRole("combobox");

  // ASSERT
  expect(await trigger.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(trigger.locator("button")).not.toHaveCount(0);
});

test("should remove a value from its chip without opening the popup", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" multiple [value]="['design','engineering']" (change)="record('change', $event)" />`,
  );

  // ACT
  await component
    .getByRole("button", { name: /remove/i })
    .first()
    .click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: ["engineering"],
      reason: "removeOption",
      option: { value: "design", label: "Product design" },
    },
  ]);
  await expect(component.page().getByRole("listbox")).toHaveCount(0);
});

test("should collapse chips past limitTags", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" multiple [limitTags]="1" [value]="['design','engineering','marketing']" />`,
  );

  // ASSERT
  await expect(component).toContainText("+2");
});

test("should report clearing separately from deselecting", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" value="design" (change)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Clear" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([{ value: null, reason: "clear" }]);
});

test("should emit hidden inputs for form submission", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" name="team" [options]="${TEAM_OPTIONS}" multiple [value]="['design','marketing']" />`,
  );

  // ASSERT
  const values = await component
    .locator('input[type="hidden"][name="team"]')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(values).toEqual(["design", "marketing"]);
});

test("should mark the field required", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" required />`,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAttribute("aria-required", "true");
  await expect(component.locator(".okkly-select__required")).toHaveText("*");
});

test("should navigate and select with the keyboard", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" (change)="record('change', $event)" />`,
  );
  const trigger = component.getByRole("combobox");
  const page = component.page();

  // ACT
  await trigger.click();
  await page.keyboard.press("ArrowDown");

  // ASSERT
  const second = page.getByRole("option", { name: "Engineering" });
  await expect(trigger).toHaveAttribute(
    "aria-activedescendant",
    (await second.getAttribute("id"))!,
  );

  // ACT
  await page.keyboard.press("Enter");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: "engineering",
      reason: "selectOption",
      option: { value: "engineering", label: "Engineering" },
    },
  ]);
});

test("should disable a select and not open on click", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-select label="Team" [options]="${TEAM_OPTIONS}" disabled />`,
  );

  // ACT
  await component.locator(".okkly-select__control").click({ force: true });

  // ASSERT
  await expect(component.page().getByRole("listbox")).toHaveCount(0);
});

test("should render grouped options under sticky headers and keep keyboard order aligned", async ({
  page,
}) => {
  // ARRANGE — `groupBy` is a function, which cannot cross the Node/browser
  // boundary through `mountTemplate`'s serialized `state`, so this mounts
  // directly with a closure built in-page. Grouping also reorders options
  // (Kyiv moves up beside Paris under "Europe"); the first arrow press must
  // land on the second *rendered* row.
  await page.goto("/");
  await page.waitForFunction(() => window.okklyHarness !== undefined);
  await page.evaluate(
    (options) => {
      window.okklyHarness?.mount(
        `<okkly-select label="City" [options]="state().options" [groupBy]="state().groupBy" />`,
        { options, groupBy: (option: { region: string }) => option.region },
      );
    },
    [
      { value: "paris", label: "Paris", region: "Europe" },
      { value: "tokyo", label: "Tokyo", region: "Asia" },
      { value: "kyiv", label: "Kyiv", region: "Europe" },
    ],
  );
  const component = page.locator("#root > * > *").first();
  const trigger = component.getByRole("combobox");

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByRole("group", { name: "Europe" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();

  // ACT
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(page.getByRole("option", { name: "Kyiv" })).toHaveClass(
    /okkly-select__option--highlighted/,
  );
});
