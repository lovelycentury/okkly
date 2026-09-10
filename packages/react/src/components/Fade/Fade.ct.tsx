import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Fade } from "./Fade";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fade (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "10rem", height: "3rem" }}>
        <Fade in={column === "entered"} unmountOnExit={row === "unmount-on-exit"} appear={false}>
          <div style={{ padding: "0.5rem", background: "var(--okkly-bg-surface)" }}>
            Fade content
          </div>
        </Fade>
      </div>
    ),
  });
});

test("should render its children when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fade in>
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Fade content");
});

test("should keep the children mounted but hidden when in is false", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fade in={false}>
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(component).toBeAttached();
  await expect(component).toHaveCSS("visibility", "hidden");
});

test("should unmount the children when in is false and unmountOnExit is set", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await mount(
    <Fade in={false} unmountOnExit>
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should apply the okkly-fade class to the child", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fade in>
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fade/);
});

test("should fire the enter callbacks when opening", async ({ mount }) => {
  const calls: string[] = [];

  // ARRANGE — the react-transition-group callbacks are handed a DOM node, which
  // cannot cross back into Node, so record only that each one ran.
  const component = await mount(
    <Fade
      in={false}
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Fade content</div>
    </Fade>,
  );

  // ACT
  await component.update(
    <Fade
      in
      timeout={100}
      onEnter={() => calls.push("enter")}
      onEntered={() => calls.push("entered")}
    >
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(() => expect(calls).toEqual(["enter", "entered"])).toPass();
});

test("should merge a custom className onto the child", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fade in className="custom-class">
      <div>Fade content</div>
    </Fade>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fade/);
  await expect(component).toHaveClass(/custom-class/);
});
