import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Slide } from "./Slide";
import type { SlideDirection } from "./Slide";

const DIRECTIONS = ["left", "right", "up", "down"] as const satisfies readonly SlideDirection[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Slide (directions)",
    columns: DIRECTIONS,
    rows: ["entered", "exited"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "10rem", height: "3rem", overflow: "hidden" }}>
        <Slide in={row === "entered"} direction={column} appear={false}>
          <div style={{ padding: "0.5rem", background: "var(--okkly-bg-surface)" }}>
            Slide content
          </div>
        </Slide>
      </div>
    ),
  });
});

test("should render its children when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Slide in>
      <div>Slide content</div>
    </Slide>,
  );

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Slide content");
});

test("should apply the direction class", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Slide in direction="left">
      <div>Slide content</div>
    </Slide>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-slide--left/);
});

test("should unmount the children when in is false and unmountOnExit is set", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await mount(
    <Slide in={false} unmountOnExit>
      <div>Slide content</div>
    </Slide>,
  );

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should fire the enter callbacks when opening", async ({ mount }) => {
  const calls: string[] = [];

  // ARRANGE — the transition callbacks are handed a DOM node, which cannot
  // cross back into Node, so record only that each one ran.
  const component = await mount(
    <Slide
      in={false}
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Slide content</div>
    </Slide>,
  );

  // ACT
  await component.update(
    <Slide
      in
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Slide content</div>
    </Slide>,
  );

  // ASSERT
  await expect(() => expect(calls).toEqual(["enter", "entered"])).toPass();
});
