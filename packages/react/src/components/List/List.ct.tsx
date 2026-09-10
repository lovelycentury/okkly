import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { List, ListItem, ListItemText } from "./List";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "List (density)",
    columns: ["default", "dense", "disable-padding"],
    rows: ["plain", "with-subheader"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "16rem" }}>
        <List
          dense={column === "dense"}
          disablePadding={column === "disable-padding"}
          subheader={row === "with-subheader" ? "Section" : undefined}
        >
          <ListItem>
            <ListItemText primary="Profile" secondary="Name and photo" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Notifications" secondary="Email and push" />
          </ListItem>
        </List>
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "List (rows)",
    columns: ["static", "button", "selected", "disabled"],
    rows: ["plain", "with-icon", "with-secondary-action"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "16rem" }}>
        <List>
          <ListItem
            button={column === "button"}
            selected={column === "selected"}
            disabled={column === "disabled"}
            startIcon={row === "with-icon" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
            secondaryAction={
              row === "with-secondary-action" ? (
                <IconButton
                  size="small"
                  aria-label="More"
                  icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
                />
              ) : undefined
            }
          >
            <ListItemText primary="Profile" secondary="Name and photo" />
          </ListItem>
        </List>
      </div>
    ),
  });
});

test("should render without modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <List>
      <ListItem>
        <ListItemText primary="Item" />
      </ListItem>
    </List>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-list/);
  await expect(component).not.toHaveClass(/okkly-list--(dense|disable-padding)/);
});

test("should apply the dense and disablePadding modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <List dense disablePadding subheader="Section">
      <ListItem>Child</ListItem>
    </List>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-list--dense/);
  await expect(component).toHaveClass(/okkly-list--disable-padding/);
  await expect(component.locator(".okkly-list__subheader")).toHaveText("Section");
});

test("should render a static row without the button modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <List>
      <ListItem selected startIcon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />}>
        <ListItemText primary="Title" secondary="Subtitle" />
      </ListItem>
    </List>,
  );
  const item = component.locator(".okkly-list-item");

  // ASSERT
  await expect(item).toHaveClass(/okkly-list-item--selected/);
  await expect(item).not.toHaveClass(/okkly-list-item--button/);
  await expect(component.locator(".glyph")).toBeVisible();
  await expect(component.locator(".okkly-list-item__primary")).toHaveText("Title");
});

// Keyboard activation is not asserted here because it is not this component's
// code: the row is a real `<button>`, so Enter and Space reach `onClick` through
// the browser's own activation behaviour. What is worth pinning down is that it
// really is a button, and that it fires exactly once per click.
test("should handle a button row click", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <List>
      <ListItem button onClick={() => (clicks += 1)}>
        <ListItemText primary="Click me" />
      </ListItem>
    </List>,
  );
  const row = component.getByRole("button", { name: "Click me" });

  // ASSERT
  expect(await row.evaluate((element) => element.tagName)).toBe("BUTTON");
  await expect(row).toHaveAttribute("type", "button");

  // ACT
  await row.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test("should render secondaryAction outside the button", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <List>
      <ListItem
        button
        secondaryAction={
          <IconButton
            size="small"
            aria-label="Action"
            icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
          />
        }
      >
        <ListItemText primary="Row" />
      </ListItem>
    </List>,
  );

  // ASSERT — nested buttons would be invalid HTML, so they must be siblings.
  const row = component.getByRole("button", { name: "Row" });
  await expect(row).toBeVisible();
  await expect(component.getByRole("button", { name: "Action" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Action" })).toHaveCount(0);
});
