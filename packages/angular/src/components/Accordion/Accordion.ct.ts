import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Accordion (states)",
    columns: ["collapsed", "expanded"],
    rows: ["default", "disabled", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) => {
        if (row === "hover") await component.getByRole("button").hover();
        if (row === "focus-visible") await page.keyboard.press("Tab");
      },
    },
    component: (column, row) => `
      <okkly-accordion ${column === "expanded" ? '[expanded]="true"' : ""} ${row === "disabled" ? '[disabled]="true"' : ""}>
        <button type="button" okklyAccordionSummary>Section title</button>
        <okkly-accordion-details>
          <div style="width: 16rem">The panel body sits behind the summary.</div>
        </okkly-accordion-details>
      </okkly-accordion>
    `,
  });
});

test("should render the summary and hide the details by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion>
      <button type="button" okklyAccordionSummary>Section title</button>
      <okkly-accordion-details>Hidden content</okkly-accordion-details>
    </okkly-accordion>
  `);

  // ASSERT
  await expect(component.getByRole("button", { name: "Section title" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(component.getByText("Hidden content")).toHaveCount(0);
});

test("should render with no modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion>
      <button type="button" okklyAccordionSummary>Title</button>
      <okkly-accordion-details>Body</okkly-accordion-details>
    </okkly-accordion>
  `);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-accordion/);
  await expect(component).not.toHaveClass(/okkly-accordion--expanded/);
  await expect(component).not.toHaveClass(/okkly-accordion--disabled/);
});

test("should show the details when expanded is set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion [expanded]="true">
      <button type="button" okklyAccordionSummary>Section title</button>
      <okkly-accordion-details>Visible content</okkly-accordion-details>
    </okkly-accordion>
  `);

  // ASSERT
  await expect(component.getByRole("region")).toBeVisible();
  await expect(component.getByText("Visible content")).toBeVisible();
  await expect(component.getByRole("button", { name: "Section title" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("should toggle the panel in uncontrolled mode", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion>
      <button type="button" okklyAccordionSummary>Section title</button>
      <okkly-accordion-details>Toggle me</okkly-accordion-details>
    </okkly-accordion>
  `);
  const summary = component.getByRole("button", { name: "Section title" });

  // ACT
  await summary.click();

  // ASSERT
  await expect(component.getByText("Toggle me")).toBeVisible();

  // ACT
  await summary.click();

  // ASSERT — the panel animates out, so it leaves the DOM after the transition.
  await expect(component.getByText("Toggle me")).toHaveCount(0);
});

test("should emit expandedChange with the toggled value", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion (expandedChange)="record('change', $event)">
      <button type="button" okklyAccordionSummary>Section title</button>
      <okkly-accordion-details>Body</okkly-accordion-details>
    </okkly-accordion>
  `);

  // ACT
  await component.getByRole("button", { name: "Section title" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([true]);
});

test("should follow a controlled expanded value, closing when it changes externally", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE — mirrors the exclusive-group story: one accordion's `expanded`
  // is driven entirely by external state, the same way react's controlled
  // `expanded` prop is re-derived on every render. Unlike react, an Angular
  // `model()` bound with `[expanded]="false"` (a constant) does *not* snap
  // an internal toggle back, since change detection skips re-applying a
  // binding whose expression didn't change value — so this only exercises
  // the realistic case, where the bound value genuinely flips.
  const component = await mountTemplate(
    `
    <okkly-accordion [expanded]="state().expanded">
      <button type="button" okklyAccordionSummary>Section title</button>
      <okkly-accordion-details>Body</okkly-accordion-details>
    </okkly-accordion>
  `,
    { expanded: true },
  );
  await expect(component.getByText("Body")).toBeVisible();

  // ACT
  await update({ expanded: false });

  // ASSERT
  await expect(component.getByText("Body")).toHaveCount(0);
});

test("should apply the expanded and disabled modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `
    <okkly-accordion [expanded]="state().expanded" [disabled]="state().disabled">
      <button type="button" okklyAccordionSummary>Title</button>
      <okkly-accordion-details>Body</okkly-accordion-details>
    </okkly-accordion>
  `,
    { expanded: true, disabled: false },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-accordion--expanded/);
  await expect(component.locator(".okkly-accordion__chevron--expanded")).toBeVisible();

  // ACT
  await update({ disabled: true });

  // ASSERT
  await expect(component).toHaveClass(/okkly-accordion--disabled/);
  await expect(component.getByRole("button", { name: "Title" })).toBeDisabled();
});

test("should not toggle when disabled", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`
    <okkly-accordion [disabled]="true">
      <button type="button" okklyAccordionSummary>Title</button>
      <okkly-accordion-details>Body</okkly-accordion-details>
    </okkly-accordion>
  `);

  // ACT — a disabled native button never fires a click.
  await component.getByRole("button", { name: "Title" }).click({ force: true });

  // ASSERT
  await expect(component.getByText("Body")).toHaveCount(0);
});
