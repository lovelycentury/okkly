import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Fade from "./Fade.vue";

const content = { default: "<div>Fade content</div>" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fade (states)",
    columns: ["entered", "exited"],
    rows: ["default", "keep-mounted"],
    fastNoIsolation: true,
    component: Fade,
    args: (column, row) => ({
      props: { in: column === "entered", keepMounted: row === "keep-mounted", appear: false },
      slots: {
        default: `<div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Fade content</div>`,
      },
    }),
  });
});

test("should render its slot when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fade, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Fade content");
});

test("should not render the slot when in is false", async ({ mount, page }) => {
  // ARRANGE
  await mount(Fade, { props: { in: false }, slots: content });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should keep the slot mounted but hidden when keepMounted is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fade, {
    props: { in: false, keepMounted: true },
    slots: content,
  });

  // ASSERT
  await expect(component).toBeAttached();
  await expect(component).toHaveCSS("display", "none");
});

test("should apply the okkly-fade class to the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fade, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fade/);
});

test("should apply the okkly-fade class even with appear disabled", async ({ mount }) => {
  // ARRANGE — no enter transition runs on mount, so the class has to come from
  // somewhere other than the `enter` hook.
  const component = await mount(Fade, {
    props: { in: true, appear: false },
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fade/);
});

test("should transition to opacity 1 when in flips to true", async ({ mount }) => {
  // ARRANGE — a `component.update()` re-mount does not carry the `on:` emit
  // listeners from the original `mount()` forward, so the enter/entered
  // *order* is instead pinned on the initial-mount case below; this checks
  // the actual visual effect update produces.
  const component = await mount(Fade, {
    props: { in: false, timeout: 50 },
    slots: content,
  });

  // ACT
  await component.update({ props: { in: true, timeout: 50 } });

  // ASSERT
  await expect(component).toHaveCSS("opacity", "1");
});

test("should fire enter then entered on initial mount when in starts true", async ({
  mount,
  page,
}) => {
  const calls: string[] = [];

  // ARRANGE
  await mount(Fade, {
    props: { in: true, timeout: 50 },
    slots: content,
    on: { enter: () => calls.push("enter"), entered: () => calls.push("entered") },
  });
  await page.waitForTimeout(200);

  // ASSERT
  expect(calls).toEqual(["enter", "entered"]);
});

test("should merge a consumer's class onto the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fade, {
    props: { in: true, class: "custom-class" } as never,
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fade/);
  await expect(component).toHaveClass(/custom-class/);
});
