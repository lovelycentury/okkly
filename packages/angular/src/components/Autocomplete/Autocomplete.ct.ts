import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { AutocompleteSize } from "./Autocomplete";

const SIZES = ["small", "medium", "large"] as const satisfies readonly AutocompleteSize[];

/** Angular template array-literal syntax, so tests need no `state()` for option data. */
const TEAM_OPTIONS =
  "[{value:'design',label:'Product design'},{value:'engineering',label:'Engineering'},{value:'marketing',label:'Marketing'}]";

// The listbox portals to `document.body`, so open-state cells photograph the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 420 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Autocomplete (sizes)",
    columns: SIZES,
    rows: ["placeholder", "filled", "error", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => `
      <div style="width: 14rem">
        <okkly-autocomplete
          label="Team"
          placeholder="Search…"
          size="${column}"
          [options]="${TEAM_OPTIONS}"
          ${row === "placeholder" ? "" : 'value="design" inputValue="Product design"'}
          ${row === "error" ? 'error helperText="Required"' : ""}
          ${row === "disabled" ? "disabled" : ""}
        />
      </div>
    `,
  });

  executeMatrixScreenshotTest({
    name: "Autocomplete (open)",
    columns: ["single", "multiple"],
    rows: ["default"],
    screenshotTarget: "page",
    component: (column) => `
      <div style="width: 14rem; padding: 1rem">
        <okkly-autocomplete
          label="Team"
          [open]="true"
          [options]="${TEAM_OPTIONS}"
          ${column === "multiple" ? "multiple [value]=\"['design']\"" : 'value="design" inputValue="Product design"'}
        />
      </div>
    `,
  });
});

test("should render a combobox input and label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" placeholder="Search…" />`,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAccessibleName(/team/i);
  await expect(component.getByRole("combobox")).toHaveAttribute("placeholder", "Search…");
});

test("should render the default size without a size modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-autocomplete")).not.toHaveClass(
    /okkly-autocomplete--(small|large)/,
  );
});

test("should apply the size and error modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" size="small" error helperText="Required" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-autocomplete")).toHaveClass(/okkly-autocomplete--small/);
  await expect(component.locator(".okkly-autocomplete")).toHaveClass(/okkly-autocomplete--error/);
});

test("should filter options as the user types", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" />`,
  );
  const page = component.page();

  // ACT
  await component.getByRole("combobox").fill("eng");

  // ASSERT
  await expect(page.getByRole("option", { name: "Engineering" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Marketing" })).toHaveCount(0);
});

test("should select a filtered option and echo its label in the input", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" (change)="record('change', $event)" />`,
  );
  const trigger = component.getByRole("combobox");

  // ACT
  await trigger.fill("eng");
  await component.page().getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: "engineering",
      reason: "selectOption",
      option: { value: "engineering", label: "Engineering" },
    },
  ]);
  await expect(trigger).toHaveValue("Engineering");
  await expect(component.page().getByRole("listbox")).toHaveCount(0);
});

test("should support multi-select tagging and stay open", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" multiple (change)="record('change', $event)" />`,
  );
  const page = component.page();

  // ACT
  await component.locator(".okkly-autocomplete__toggle").click();
  await page.getByRole("option", { name: "Product design" }).click();

  // ASSERT — the popup survives the first pick, and the input clears for the next tag.
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(component.getByRole("combobox")).toHaveValue("");

  // ACT
  await page.getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  const events = (await recordedEvents("change")) as { value: unknown }[];
  expect(events.at(-1)?.value).toEqual(["design", "engineering"]);
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("should remove the last tag with Backspace when the input is empty", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" multiple [value]="['design','engineering']" (change)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("combobox").press("Backspace");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: ["design"],
      reason: "removeOption",
      option: { value: "engineering", label: "Engineering" },
    },
  ]);
});

test("should remove a value from its tag without opening the popup", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" multiple [value]="['design','engineering']" (change)="record('change', $event)" />`,
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

test("should collapse tags past limitTags", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" multiple [limitTags]="1" [value]="['design','engineering','marketing']" />`,
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
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" value="design" inputValue="Product design" (change)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Clear" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([{ value: null, reason: "clear" }]);
  await expect(component.getByRole("combobox")).toHaveValue("");
});

test("should commit free text on Enter when freeSolo is set", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" freeSolo (change)="record('change', $event)" />`,
  );

  // ACT
  const trigger = component.getByRole("combobox");
  await trigger.fill("Sales");
  await trigger.press("Enter");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    { value: "Sales", reason: "createOption", option: { value: "Sales", label: "Sales" } },
  ]);
});

test("should not commit free text on Enter without freeSolo", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" (change)="record('change', $event)" />`,
  );

  // ACT
  const trigger = component.getByRole("combobox");
  await trigger.fill("Sales");
  await trigger.press("Enter");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([]);
});

test("should emit hidden inputs for form submission", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" name="team" [options]="${TEAM_OPTIONS}" multiple [value]="['design','marketing']" />`,
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
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" required />`,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAttribute("required", "");
  await expect(component.locator(".okkly-autocomplete__required")).toHaveText("*");
});

test("should navigate and select with the keyboard", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" (change)="record('change', $event)" />`,
  );
  const trigger = component.getByRole("combobox");
  const page = component.page();

  // ACT — clicking the input only focuses it (unlike `OkklySelect`'s
  // trigger, it does not open on its own click); the first ArrowDown opens
  // the popup and the second one actually moves the highlight, mirroring
  // `useAutocomplete`'s own `if (!isOpen) setOpen(true); else { …navigate… }`.
  await trigger.click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");

  // ASSERT
  const first = page.getByRole("option", { name: "Product design" });
  await expect(trigger).toHaveAttribute("aria-activedescendant", (await first.getAttribute("id"))!);

  // ACT
  await page.keyboard.press("Enter");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([
    {
      value: "design",
      reason: "selectOption",
      option: { value: "design", label: "Product design" },
    },
  ]);
});

test("should open from the toggle button and the field's own padding", async ({
  mountTemplate,
}) => {
  // ARRANGE — both sit outside the input (the toggle is a Field adornment,
  // and the control's own padding is not the input), so they only work
  // because the whole control box is the click target.
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" />`,
  );
  const page = component.page();

  // ACT
  await component.locator(".okkly-autocomplete__toggle").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toBeVisible();

  // ACT
  await component.locator(".okkly-autocomplete__toggle").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("should disable the field and not open on click", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" disabled />`,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toBeDisabled();

  // ACT
  await component.locator(".okkly-autocomplete__control").click({ force: true });

  // ASSERT
  await expect(component.page().getByRole("listbox")).toHaveCount(0);
});

test("should render a loading row instead of options", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-autocomplete label="Team" [options]="${TEAM_OPTIONS}" loading />`,
  );

  // ACT
  await component.locator(".okkly-autocomplete__toggle").click();

  // ASSERT
  await expect(component.page().locator(".okkly-autocomplete__loading")).toBeVisible();
  await expect(component.page().getByRole("option")).toHaveCount(0);
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
        `<okkly-autocomplete label="City" [options]="state().options" [groupBy]="state().groupBy" />`,
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

  // ACT
  await component.locator(".okkly-autocomplete__toggle").click();

  // ASSERT
  await expect(page.getByRole("group", { name: "Europe" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();

  // ACT — the toggle click leaves focus on the toggle button, not the
  // input, so keyboard nav needs an explicit click into the input first;
  // it stays open (a click landing on `input` is excluded from the
  // control's own open/close toggling).
  await component.getByRole("combobox").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(page.getByRole("option", { name: "Kyiv" })).toHaveClass(
    /okkly-autocomplete__option--highlighted/,
  );
});
