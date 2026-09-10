import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Collapse } from "./Collapse";
import type { CollapseOrientation } from "./Collapse";

const ORIENTATIONS = ["vertical", "horizontal"] as const satisfies readonly CollapseOrientation[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Collapse (states)",
    columns: ["entered", "exited", "collapsed-size"],
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "10rem" }}>
        <Collapse
          in={column === "entered"}
          orientation={row}
          collapsedSize={column === "collapsed-size" ? 40 : undefined}
          appear={false}
        >
          <div style={{ padding: "0.5rem", background: "var(--okkly-bg-surface)" }}>
            Collapse content
          </div>
        </Collapse>
      </div>
    ),
  });
});

test("should render its children when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in>
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(component).toContainText("Collapse content");
});

test("should use the vertical orientation by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in>
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--vertical/);
});

test("should use the horizontal orientation when asked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in orientation="horizontal">
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--horizontal/);
});

test("should keep collapsedSize as the minimum dimension", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in={false} collapsedSize={40}>
      <div style={{ height: 200 }}>Collapse content</div>
    </Collapse>,
  );

  // ASSERT — a closed panel still occupies its collapsed size.
  await expect(component).toHaveCSS("min-height", "40px");
  const box = (await component.boundingBox())!;
  expect(Math.round(box.height)).toBe(40);
});

test("should render the wrapper structure", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in>
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(component.locator(".okkly-collapse__wrapper")).toBeAttached();
  await expect(component.locator(".okkly-collapse__wrapper-inner")).toBeAttached();
});

test("should unmount when in is false and unmountOnExit is set", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Collapse in={false} unmountOnExit>
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should fire the enter callbacks when opening", async ({ mount }) => {
  const calls: string[] = [];

  // ARRANGE — the transition callbacks are handed a DOM node, which cannot
  // cross back into Node, so record only that each one ran.
  const component = await mount(
    <Collapse
      in={false}
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div style={{ height: 80 }}>Collapse content</div>
    </Collapse>,
  );

  // ACT
  await component.update(
    <Collapse
      in
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div style={{ height: 80 }}>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(() => expect(calls).toEqual(["enter", "entered"])).toPass();
});

test("should apply a custom className", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Collapse in className="custom-class">
      <div>Collapse content</div>
    </Collapse>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse/);
  await expect(component).toHaveClass(/custom-class/);
});
