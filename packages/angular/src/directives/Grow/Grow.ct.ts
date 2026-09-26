import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Grow (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem; height: 3rem">
        <div
          *okklyGrow="${column === "entered"}; appear: false; unmountOnExit: ${row === "unmount-on-exit"}"
          style="padding: 0.5rem; background: var(--okkly-bg-surface)"
        >Grow content</div>
      </div>`,
  });
});

test("should render its element when shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="true" class="content">Grow content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toBeVisible();
  await expect(content).toHaveText("Grow content");
  await expect(content).toHaveCSS("opacity", "1");
  await expect(content).toHaveCSS("transform", "none");
});

test("should keep the element mounted, shrunk and hidden when not shown", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="false" class="content">Grow content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toHaveCSS("visibility", "hidden");
  await expect(content).toHaveCSS("opacity", "0");
  await expect(content).not.toHaveCSS("transform", "none");
});

test("should not mount the element when not shown and unmountOnExit is set", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="false; unmountOnExit: true" class="content">Grow content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCount(0);
});

test("should apply the okkly-grow class to the element", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="true" class="content">Grow content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveClass(/okkly-grow/);
});

test("should support a numeric timeout", async ({ mountTemplate, recordedEvents, update }) => {
  // ARRANGE
  await mountTemplate(
    `<div>
      <ng-template [okklyGrow]="state().open" [okklyGrowTimeout]="80" (entered)="record('entered')">
        <div>Grow content</div>
      </ng-template>
    </div>`,
    { open: false },
  );

  // ACT
  await update({ open: true });

  // ASSERT
  await expect.poll(() => recordedEvents("entered")).toHaveLength(1);
});

test("should transition opacity and transform together", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="state().open; timeout: 300" class="content">Grow content</div></div>`,
    { open: false },
  );
  const content = component.locator(".content");

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(content).toHaveCSS("transition-property", "opacity, transform");
  await expect(content).toHaveCSS("opacity", "1");
});

test("should keep the element's own transform-origin", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyGrow="true" class="content" style="transform-origin: left top">Grow content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCSS("transform-origin", "0px 0px");
});
