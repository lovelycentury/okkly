import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Grow } from "./Grow";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Grow (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "10rem", height: "3rem" }}>
        <Grow in={column === "entered"} unmountOnExit={row === "unmount-on-exit"} appear={false}>
          <div style={{ padding: "0.5rem", background: "var(--okkly-bg-surface)" }}>
            Grow content
          </div>
        </Grow>
      </div>
    ),
  });
});

test("should render its children when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Grow in>
      <div>Grow content</div>
    </Grow>,
  );

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Grow content");
});

test("should unmount the children when in is false and unmountOnExit is set", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await mount(
    <Grow in={false} unmountOnExit>
      <div>Grow content</div>
    </Grow>,
  );

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should apply the okkly-grow class to the child", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Grow in>
      <div>Grow content</div>
    </Grow>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-grow/);
});

test("should support a numeric timeout", async ({ mount }) => {
  const calls: string[] = [];

  // ARRANGE — the transition callbacks are handed a DOM node, which cannot
  // cross back into Node, so record only that each one ran.
  const component = await mount(
    <Grow in={false} timeout={80} onEntered={() => calls.push("entered")}>
      <div>Grow content</div>
    </Grow>,
  );

  // ACT
  await component.update(
    <Grow in timeout={80} onEntered={() => calls.push("entered")}>
      <div>Grow content</div>
    </Grow>,
  );

  // ASSERT
  await expect(() => expect(calls).toEqual(["entered"])).toPass();
});
