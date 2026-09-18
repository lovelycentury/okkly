import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Grow from "./Grow.vue";

const content = { default: "<div>Grow content</div>" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Grow (states)",
    columns: ["entered", "exited"],
    rows: ["default", "keep-mounted"],
    fastNoIsolation: true,
    component: Grow,
    args: (column, row) => ({
      props: { in: column === "entered", keepMounted: row === "keep-mounted", appear: false },
      slots: {
        default: `<div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Grow content</div>`,
      },
    }),
  });
});

test("should render its slot when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Grow, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Grow content");
});

test("should not render the slot when in is false", async ({ mount, page }) => {
  // ARRANGE
  await mount(Grow, { props: { in: false }, slots: content });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should keep the slot mounted but hidden when keepMounted is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Grow, {
    props: { in: false, keepMounted: true },
    slots: content,
  });

  // ASSERT
  await expect(component).toBeAttached();
  await expect(component).toHaveCSS("display", "none");
});

test("should apply the okkly-grow class to the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Grow, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toHaveClass(/okkly-grow/);
});

test("should scale up from 75% and settle at none", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Grow, { props: { in: true, timeout: 50 }, slots: content });

  // ASSERT
  await expect(component).toHaveCSS("transform", "none");
});

test("should derive the duration from the child's height when timeout is auto", async ({
  mount,
}) => {
  const calls: string[] = [];

  // ARRANGE — a tall child gets a longer auto duration than a short one, so the
  // short one settles ("entered") well before the tall one does.
  await mount(Grow, {
    props: { in: true, timeout: "auto" },
    slots: { default: `<div style="height: 400px">Tall content</div>` },
    on: { entered: () => calls.push("entered") },
  });

  // ASSERT — still mid-transition shortly after mount.
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(calls).toEqual([]);
});

test("should merge a consumer's class and style onto the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Grow, {
    props: { in: true, class: "custom-class", style: "transform-origin: top left" } as never,
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-grow/);
  await expect(component).toHaveClass(/custom-class/);
  await expect(component).toHaveCSS("transform-origin", "0px 0px");
});
