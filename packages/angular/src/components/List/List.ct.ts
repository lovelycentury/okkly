import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";

const glyph = (attributes: string) => MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg ${attributes}`);

const moreButton = (label = "More") =>
  `<button okklyIconButton okklyListItemEnd size="small" aria-label="${label}">${glyph("")}</button>`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "List (density)",
    columns: ["default", "dense", "disable-padding"],
    rows: ["plain", "with-subheader"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 16rem">
        <ul okklyList${column === "dense" ? " dense" : ""}${
          column === "disable-padding" ? " disablePadding" : ""
        }${row === "with-subheader" ? ` subheader="Section"` : ""}>
          <li okklyListItem><okkly-list-item-text primary="Profile" secondary="Name and photo" /></li>
          <li okklyListItem><okkly-list-item-text primary="Notifications" secondary="Email and push" /></li>
        </ul>
      </div>`,
  });

  executeMatrixScreenshotTest({
    name: "List (rows)",
    columns: ["static", "button", "selected", "disabled"],
    rows: ["plain", "with-icon", "with-secondary-action"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 16rem">
        <ul okklyList>
          <li okklyListItem${column === "button" ? " button" : ""}${
            column === "selected" ? " selected" : ""
          }${column === "disabled" ? " disabled" : ""}>
            ${row === "with-icon" ? glyph("okklyListItemStart") : ""}
            <okkly-list-item-text primary="Profile" secondary="Name and photo" />
            ${row === "with-secondary-action" ? moreButton() : ""}
          </li>
        </ul>
      </div>`,
  });
});

test("should render without modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList><li okklyListItem><okkly-list-item-text primary="Item" /></li></ul>`,
  );

  // ASSERT
  await expect(component).toHaveRole("list");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-list");
  await expect(component.getByRole("listitem")).toHaveAttribute("class", "okkly-list-item");
  await expect(component.locator(".okkly-list__subheader")).toHaveCount(0);
});

test("should apply the dense and disablePadding modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList dense disablePadding subheader="Section"><li okklyListItem>Child</li></ul>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-list--dense/);
  await expect(component).toHaveClass(/okkly-list--disable-padding/);
  await expect(component.locator("li.okkly-list__subheader")).toHaveText("Section");
});

test("should render a static row without the button modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList>
      <li okklyListItem selected>
        <okkly-list-item-icon okklyListItemStart>${glyph(`class="glyph"`)}</okkly-list-item-icon>
        <okkly-list-item-text primary="Title" secondary="Subtitle" />
      </li>
    </ul>`,
  );
  const item = component.locator(".okkly-list-item");

  // ASSERT
  await expect(item).toHaveClass(/okkly-list-item--selected/);
  await expect(item).not.toHaveClass(/okkly-list-item--(button|container)/);
  await expect(component.getByRole("button")).toHaveCount(0);
  await expect(component.locator(".okkly-list-item__leading .glyph")).toBeVisible();
  await expect(component.locator(".okkly-list-item__icon")).toHaveAttribute("aria-hidden", "true");
  await expect(component.locator(".okkly-list-item__primary")).toHaveText("Title");
  await expect(component.locator(".okkly-list-item__secondary")).toHaveText("Subtitle");
});

test("should leave the leading and trailing slots out when empty", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<ul okklyList><li okklyListItem>Row</li></ul>`);

  // ASSERT
  await expect(component.locator(".okkly-list-item__leading")).toHaveCount(0);
  await expect(component.locator(".okkly-list-item__trailing")).toHaveCount(0);
  await expect(component.locator(".okkly-list-item__content")).toHaveText("Row");
});

// Keyboard activation is not asserted here because it is not this component's
// code: the row is a real `<button>`, so Enter and Space reach `itemClick` through
// the browser's own activation behaviour. What is worth pinning down is that it
// really is a button, and that it fires exactly once per click.
test("should handle a button row click", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList>
      <li okklyListItem button selected (itemClick)="record('click')"><okkly-list-item-text primary="Click me" /></li>
    </ul>`,
  );
  const row = component.getByRole("button", { name: "Click me" });

  // ASSERT
  expect(await row.evaluate((element) => element.tagName)).toBe("BUTTON");
  await expect(row).toHaveAttribute("type", "button");
  await expect(row).toHaveClass(/okkly-list-item--button/);
  await expect(row).toHaveClass(/okkly-list-item--selected/);
  await expect(component.getByRole("listitem")).toHaveClass(/okkly-list-item--container/);
  await expect(component.getByRole("listitem")).not.toHaveClass(/okkly-list-item--selected/);

  // ACT
  await row.click();

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(1);
});

test("should disable a button row", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList>
      <li okklyListItem button disabled (itemClick)="record('click')"><okkly-list-item-text primary="Delete" /></li>
    </ul>`,
  );
  const row = component.getByRole("button", { name: "Delete" });

  // ASSERT
  await expect(row).toBeDisabled();
  await expect(component.getByRole("listitem")).toHaveClass(/okkly-list-item--disabled/);

  // ACT
  await row.click({ force: true });

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(0);
});

test("should render the trailing control outside the button", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<ul okklyList>
      <li okklyListItem button (itemClick)="record('row')">
        <okkly-list-item-text primary="Row" />
        ${moreButton("Action").replace("<button", `<button (click)="record('action')"`)}
      </li>
    </ul>`,
  );

  // ASSERT — nested buttons would be invalid HTML, so they must be siblings.
  const row = component.getByRole("button", { name: "Row" });
  await expect(row).toBeVisible();
  await expect(component.getByRole("button", { name: "Action" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Action" })).toHaveCount(0);

  // ACT
  await component.getByRole("button", { name: "Action" }).click();

  // ASSERT
  expect(await recordedEvents("action")).toHaveLength(1);
  expect(await recordedEvents("row")).toHaveLength(0);
});
