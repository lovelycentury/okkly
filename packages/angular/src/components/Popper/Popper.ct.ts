import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { PopperPlacement } from "./Popper";

const PLACEMENTS = ["top", "bottom", "left", "right"] as const satisfies readonly PopperPlacement[];

// Popper portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 320 } });

/**
 * The counterpart of `@okkly/react`'s `AnchoredPopper` fixture: a trigger that
 * toggles the harness's own `state`, and a popper anchored to it through a
 * template reference variable.
 */
const anchoredPopper = (attributes = "", content = "Popper content") => `
  <div style="display: grid; place-items: center; width: 520px; height: 320px">
    <button #trigger type="button" (click)="state.set({ open: !state().open })">Toggle</button>
    <okkly-popper [open]="!!state().open" [anchorEl]="trigger" ${attributes}>${content}</okkly-popper>
  </div>`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Popper (placements)",
    columns: PLACEMENTS,
    rows: ["default"],
    screenshotTarget: "page",
    hooks: {
      beforeEach: async (component) => {
        await component.getByRole("button", { name: "Toggle" }).click();
      },
    },
    component: (column) => anchoredPopper(`placement="${column}"`, "A hover card"),
  });
});

test("should render its content when open with an anchor", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(anchoredPopper(), { open: true });

  // ASSERT — the panel portals to document.body, so it is queried off the page.
  await expect(page.locator(".okkly-popper")).toBeVisible();
  await expect(page.getByText("Popper content")).toBeVisible();
});

test("should not render when closed", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(anchoredPopper("", "Hidden"));

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
  await expect(page.locator(".okkly-popper")).toHaveCount(0);
});

test("should keep its content mounted but hidden with keepMounted", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await mountTemplate(anchoredPopper("keepMounted", "Kept"));

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-popper")).toHaveCSS("display", "none");
});

test("should toggle from its trigger", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(anchoredPopper("", "Panel"));
  const trigger = component.getByRole("button", { name: "Toggle" });

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByText("Panel")).toBeVisible();

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByText("Panel")).toHaveCount(0);
});

test("should position itself against its anchor", async ({ mountTemplate, page }) => {
  // ARRANGE — this is the part a DOM-less test could not cover at all: without
  // layout there are no boxes for Popper.js to place anything against.
  const component = await mountTemplate(anchoredPopper(`placement="bottom"`, "Panel"));
  await component.getByRole("button", { name: "Toggle" }).click();

  // ASSERT
  const anchor = (await component.getByRole("button", { name: "Toggle" }).boundingBox())!;
  const popper = (await page.locator(".okkly-popper").boundingBox())!;
  expect(popper.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
  await expect(page.locator(".okkly-popper")).toHaveAttribute("data-popper-placement", "bottom");
});

test("should portal to the body and render in place with disablePortal", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await mountTemplate(anchoredPopper("", "Panel"), { open: true });

  // ASSERT
  await expect(page.locator("body > .okkly-popper")).toBeAttached();

  // ARRANGE
  await mountTemplate(anchoredPopper("disablePortal", "Panel"), { open: true });

  // ASSERT
  await expect(page.locator("body > .okkly-popper")).toHaveCount(0);
  await expect(page.locator("#root .okkly-popper")).toBeAttached();
});

test("should keep matchAnchorWidth's min-width across an unrelated re-render", async ({
  mountTemplate,
  update,
  page,
}) => {
  // ARRANGE — the popper's own `[style]` binding must not clear the `min-width`
  // the `matchAnchorWidth` modifier writes imperatively, or the panel visibly
  // narrows back to its content width whenever its content re-renders — which
  // is what a listbox does on every keystroke.
  const component = await mountTemplate(
    `<div style="display: grid; place-items: center; width: 520px; height: 320px">
      <button #trigger type="button" style="width: 260px">Toggle</button>
      <okkly-popper [open]="true" [anchorEl]="trigger" matchAnchorWidth="min">
        Panel {{ state().bump }}
      </okkly-popper>
    </div>`,
    { bump: 0 },
  );
  const popper = page.locator(".okkly-popper");
  const anchorWidth = (await component.getByRole("button", { name: "Toggle" }).boundingBox())!
    .width;
  const readMinWidth = () =>
    popper.evaluate((element) => Number.parseFloat(element.style.minWidth));

  // ASSERT — sanity check the floor took effect at all.
  await expect(async () => expect(await readMinWidth()).toBeCloseTo(anchorWidth, 0)).toPass();

  // ACT — re-renders the panel's content without touching a single input the
  // popper itself watches.
  await update({ bump: 1 });

  // ASSERT
  await expect(async () => expect(await readMinWidth()).toBeCloseTo(anchorWidth, 0)).toPass();
});

test("should stay visible when transition is set", async ({ mountTemplate, page }) => {
  // ARRANGE — the transition machinery itself (`notifyEnter`/`notifyExited`
  // keeping the popper mounted for the way out) is exercised end-to-end by
  // Popover and Tooltip, which are built on this. This only pins that
  // `transition` does not stop it rendering.
  await mountTemplate(`<okkly-popper [open]="true" transition>Animated</okkly-popper>`);

  // ASSERT
  await expect(page.getByText("Animated")).toBeVisible();
});
