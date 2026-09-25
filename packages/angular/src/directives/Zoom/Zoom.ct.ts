import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Zoom (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem; height: 3rem">
        <div
          *okklyZoom="${column === "entered"}; appear: false; unmountOnExit: ${row === "unmount-on-exit"}"
          style="padding: 0.5rem; background: var(--okkly-bg-surface)"
        >Zoom content</div>
      </div>`,
  });
});

test("should render its element when shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyZoom="true" class="content">Zoom content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toBeVisible();
  await expect(content).toHaveText("Zoom content");
  await expect(content).toHaveCSS("transform", "none");
});

test("should keep the element mounted, scaled to nothing and hidden when not shown", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyZoom="false" class="content">Zoom content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toHaveCSS("visibility", "hidden");
  await expect(content).toHaveCSS("transform", "matrix(0, 0, 0, 0, 0, 0)");
});

test("should not mount the element when not shown and unmountOnExit is set", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyZoom="false; unmountOnExit: true" class="content">Zoom content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCount(0);
});

test("should apply the okkly-zoom class to the element", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyZoom="true" class="content">Zoom content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveClass(/okkly-zoom/);
});

test("should animate transform only, leaving opacity alone", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyZoom="state().open; timeout: 200" class="content">Zoom content</div></div>`,
    { open: false },
  );
  const content = component.locator(".content");

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(content).toHaveCSS("transition-property", "transform");
  await expect(content).toHaveCSS("opacity", "1");
  await expect(content).toHaveCSS("transform", "none");
});

test("should fire the enter callbacks when opening", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE
  await mountTemplate(
    `<div>
      <ng-template [okklyZoom]="state().open" [okklyZoomTimeout]="100"
        (enter)="record('phase', 'enter')" (entered)="record('phase', 'entered')">
        <div>Zoom content</div>
      </ng-template>
    </div>`,
    { open: false },
  );

  // ACT
  await update({ open: true });

  // ASSERT
  await expect.poll(() => recordedEvents("phase")).toEqual(["enter", "entered"]);
});
