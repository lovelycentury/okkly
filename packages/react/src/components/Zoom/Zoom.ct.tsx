import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Zoom } from "./Zoom";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Zoom (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "10rem", height: "3rem" }}>
        <Zoom in={column === "entered"} unmountOnExit={row === "unmount-on-exit"} appear={false}>
          <div style={{ padding: "0.5rem", background: "var(--okkly-bg-surface)" }}>
            Zoom content
          </div>
        </Zoom>
      </div>
    ),
  });
});

test("should render its children when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Zoom in>
      <div>Zoom content</div>
    </Zoom>,
  );

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Zoom content");
});

test("should unmount the children when in is false and unmountOnExit is set", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await mount(
    <Zoom in={false} unmountOnExit>
      <div>Zoom content</div>
    </Zoom>,
  );

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should apply the okkly-zoom class to the child", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Zoom in>
      <div>Zoom content</div>
    </Zoom>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-zoom/);
});

test("should fire the enter callbacks when opening", async ({ mount }) => {
  const calls: string[] = [];

  // ARRANGE — the transition callbacks are handed a DOM node, which cannot
  // cross back into Node, so record only that each one ran.
  const component = await mount(
    <Zoom
      in={false}
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Zoom content</div>
    </Zoom>,
  );

  // ACT
  await component.update(
    <Zoom
      in
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Zoom content</div>
    </Zoom>,
  );

  // ASSERT
  await expect(() => expect(calls).toEqual(["enter", "entered"])).toPass();
});
