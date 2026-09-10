import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Accordion, AccordionDetails, AccordionSummary } from "./Accordion";

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
    component: (column, row) => (
      <Accordion defaultExpanded={column === "expanded"} disabled={row === "disabled"}>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>
          <div style={{ width: "16rem" }}>The panel body sits behind the summary.</div>
        </AccordionDetails>
      </Accordion>
    ),
  });
});

test("should render the summary and hide the details by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Accordion>
      <AccordionSummary>Section title</AccordionSummary>
      <AccordionDetails>Hidden content</AccordionDetails>
    </Accordion>,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Section title" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(component.getByText("Hidden content")).toHaveCount(0);
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Accordion>
      <AccordionSummary>Title</AccordionSummary>
      <AccordionDetails>Body</AccordionDetails>
    </Accordion>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-accordion/);
  await expect(component).not.toHaveClass(/okkly-accordion--expanded/);
  await expect(component).not.toHaveClass(/okkly-accordion--disabled/);
});

test("should show the details when defaultExpanded is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Accordion defaultExpanded>
      <AccordionSummary>Section title</AccordionSummary>
      <AccordionDetails>Visible content</AccordionDetails>
    </Accordion>,
  );

  // ASSERT
  await expect(component.getByRole("region")).toBeVisible();
  await expect(component.getByText("Visible content")).toBeVisible();
  await expect(component.getByRole("button", { name: "Section title" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("should toggle the panel in uncontrolled mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Accordion>
      <AccordionSummary>Section title</AccordionSummary>
      <AccordionDetails>Toggle me</AccordionDetails>
    </Accordion>,
  );
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

test("should fire onChange in controlled mode without expanding itself", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Accordion expanded={false} onChange={(_event, expanded) => changes.push(expanded)}>
      <AccordionSummary>Section title</AccordionSummary>
      <AccordionDetails>Body</AccordionDetails>
    </Accordion>,
  );

  // ACT
  await component.getByRole("button", { name: "Section title" }).click();

  // ASSERT — the parent owns the state, so the panel stays shut.
  expect(changes).toEqual([true]);
  await expect(component.getByText("Body")).toHaveCount(0);
});

test("should apply the expanded and disabled modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Accordion defaultExpanded>
      <AccordionSummary>Title</AccordionSummary>
      <AccordionDetails>Body</AccordionDetails>
    </Accordion>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-accordion--expanded/);
  await expect(component.locator(".okkly-accordion__chevron--expanded")).toBeVisible();

  // ACT
  await component.update(
    <Accordion disabled>
      <AccordionSummary>Title</AccordionSummary>
      <AccordionDetails>Body</AccordionDetails>
    </Accordion>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-accordion--disabled/);
  await expect(component.getByRole("button", { name: "Title" })).toBeDisabled();
});
