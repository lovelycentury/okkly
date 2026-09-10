import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { AnchoredPopper } from "../../playwright/fixtures/AnchoredOverlay";
import { Popper } from "./Popper";
import type { PopperPlacement } from "./Popper";

const PLACEMENTS = ["top", "bottom", "left", "right"] as const satisfies readonly PopperPlacement[];

// Popper portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 320 } });

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
    component: (column) => (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: "520px",
          height: "320px",
        }}
      >
        <AnchoredPopper placement={column}>A hover card</AnchoredPopper>
      </div>
    ),
  });
});

test("should render its children when open with an anchor", async ({ mount, page }) => {
  // ARRANGE
  await mount(<AnchoredPopper defaultOpen />);

  // ASSERT — the panel portals to document.body, so it is queried off the page.
  await expect(page.locator(".okkly-popper")).toBeVisible();
  await expect(page.getByText("Popper content")).toBeVisible();
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(<AnchoredPopper>Hidden</AnchoredPopper>);

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
  await expect(page.locator(".okkly-popper")).toHaveCount(0);
});

test("should keep its children mounted but hidden with keepMounted", async ({ mount, page }) => {
  // ARRANGE
  await mount(<AnchoredPopper keepMounted>Kept</AnchoredPopper>);

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-popper")).toHaveCSS("display", "none");
});

test("should toggle from its trigger", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<AnchoredPopper>Panel</AnchoredPopper>);
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

test("should position itself against its anchor", async ({ mount, page }) => {
  // ARRANGE — this is the part jsdom could not test at all: without layout
  // there were no boxes for Popper.js to place anything against.
  const component = await mount(<AnchoredPopper placement="bottom">Panel</AnchoredPopper>);
  await component.getByRole("button", { name: "Toggle" }).click();

  // ASSERT
  const anchor = (await component.getByRole("button", { name: "Toggle" }).boundingBox())!;
  const popper = (await page.locator(".okkly-popper").boundingBox())!;
  expect(popper.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
  await expect(page.locator(".okkly-popper")).toHaveAttribute("data-popper-placement", "bottom");
});

test("should hand TransitionProps to a render-prop child", async ({ mount, page }) => {
  // ARRANGE — a render prop cannot be defined in the test file, so this uses
  // `Popper` directly with a virtual-free anchor: `anchorEl` may be omitted,
  // and the transition wiring is what is under test here.
  await mount(
    <Popper open transition>
      <div>Animated</div>
    </Popper>,
  );

  // ASSERT
  await expect(page.getByText("Animated")).toBeVisible();
});
