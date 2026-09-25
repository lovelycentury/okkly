import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { CollapseOrientation } from "./Collapse";

const ORIENTATIONS = ["vertical", "horizontal"] as const satisfies readonly CollapseOrientation[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Collapse (states)",
    columns: ["entered", "exited", "collapsed-size"],
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem">
        <okkly-collapse [in]="${column === "entered"}" orientation="${row}" [appear]="false"${
          column === "collapsed-size" ? ` [collapsedSize]="40"` : ""
        }>
          <div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Collapse content</div>
        </okkly-collapse>
      </div>`,
  });
});

test("should render its content when shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse in><div>Collapse content</div></okkly-collapse>`,
  );

  // ASSERT
  await expect(component).toContainText("Collapse content");
  await expect(component.getByText("Collapse content")).toBeVisible();
});

test("should use the vertical orientation by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse in><div>Collapse content</div></okkly-collapse>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--vertical/);
});

test("should use the horizontal orientation when asked", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse in orientation="horizontal"><div>Collapse content</div></okkly-collapse>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--horizontal/);
});

test("should keep collapsedSize as the minimum dimension", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse [collapsedSize]="40"><div style="height: 200px">Collapse content</div></okkly-collapse>`,
  );

  // ASSERT — a closed panel still occupies its collapsed size.
  await expect(component).toHaveCSS("min-height", "40px");
  const box = (await component.boundingBox())!;
  expect(Math.round(box.height)).toBe(40);
});

test("should render the wrapper structure", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse in><div>Collapse content</div></okkly-collapse>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-collapse__wrapper")).toBeAttached();
  await expect(component.locator(".okkly-collapse__wrapper-inner")).toBeAttached();
});

test("should open to the content's height, then settle on auto", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse [in]="state().open" [timeout]="150"><div style="height: 80px">Collapse content</div></okkly-collapse>`,
    { open: false },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--hidden/);
  expect(Math.round((await component.boundingBox())?.height ?? -1)).toBe(0);

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--entered/);
  await expect.poll(async () => Math.round((await component.boundingBox())!.height)).toBe(80);

  // ACT
  await update({ open: false });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--hidden/);
  await expect.poll(async () => Math.round((await component.boundingBox())?.height ?? 0)).toBe(0);
});

test("should mount lazy content on enter and unmount it on exit", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div>
      <okkly-collapse [in]="state().open" [timeout]="100" mountOnEnter unmountOnExit>
        <ng-template okklyCollapseContent><div class="lazy">Lazy content</div></ng-template>
      </okkly-collapse>
    </div>`,
    { open: false },
  );
  const lazy = component.locator(".lazy");

  // ASSERT
  await expect(lazy).toHaveCount(0);

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(lazy).toBeVisible();

  // ACT
  await update({ open: false });

  // ASSERT
  await expect(lazy).toHaveCount(0);
  await expect(component.locator("okkly-collapse")).toHaveCSS("display", "none");
});

test("should fire the enter callbacks when opening", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE
  await mountTemplate(
    `<okkly-collapse [in]="state().open" [timeout]="100" (enter)="record('phase', 'enter')" (entered)="record('phase', 'entered')">
      <div style="height: 80px">Collapse content</div>
    </okkly-collapse>`,
    { open: false },
  );

  // ACT
  await update({ open: true });

  // ASSERT
  await expect.poll(() => recordedEvents("phase")).toEqual(["enter", "entered"]);
});

test("should keep the element's own class", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-collapse in class="custom-class"><div>Collapse content</div></okkly-collapse>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse/);
  await expect(component).toHaveClass(/custom-class/);
});
