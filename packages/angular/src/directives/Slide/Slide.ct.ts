import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { SlideDirection } from "./Slide";

const DIRECTIONS = ["left", "right", "up", "down"] as const satisfies readonly SlideDirection[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Slide (directions)",
    columns: DIRECTIONS,
    rows: ["entered", "exited"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem; height: 3rem; overflow: hidden">
        <div
          *okklySlide="${row === "entered"}; direction: '${column}'; appear: false"
          style="padding: 0.5rem; background: var(--okkly-bg-surface)"
        >Slide content</div>
      </div>`,
  });
});

/** A 200×100 stage at the page's top left, with the sliding element inside. */
const staged = (directive: string) =>
  `<div #stage style="position: absolute; top: 100px; left: 100px; width: 200px; height: 100px; overflow: hidden">
    <div ${directive} class="content" style="width: 100px; height: 40px">Slide content</div>
  </div>`;

test("should render its element when shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklySlide="true" class="content">Slide content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toBeVisible();
  await expect(content).toHaveText("Slide content");
  await expect(content).toHaveCSS("transform", "none");
});

test("should apply the slide and direction classes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklySlide="true; direction: state().direction" class="content">Slide content</div></div>`,
    { direction: "left" },
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toHaveClass(/\bokkly-slide\b/);
  await expect(content).toHaveClass(/okkly-slide--left/);

  // ACT
  await update({ direction: "up" });

  // ASSERT
  await expect(content).toHaveClass(/okkly-slide--up/);
  await expect(content).not.toHaveClass(/okkly-slide--left/);
});

test("should not mount the element when not shown and unmountOnExit is set", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklySlide="false; unmountOnExit: true" class="content">Slide content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCount(0);
});

test.describe("parking", () => {
  for (const [direction, transform] of [
    // From the container's right edge: 300 (its right) - 100 (the element's left).
    ["left", "matrix(1, 0, 0, 1, 200, 0)"],
    // Back past its left edge: 200 (the element's right) - 100 (its left).
    ["right", "matrix(1, 0, 0, 1, -100, 0)"],
    // From below its bottom: 200 (its bottom) - 100 (the element's top).
    ["up", "matrix(1, 0, 0, 1, 0, 100)"],
    // Above its top: 100 - 100 + 40 (the element's height).
    ["down", "matrix(1, 0, 0, 1, 0, -40)"],
  ] as const) {
    test(`should park the element past the container's edge for direction ${direction}`, async ({
      mountTemplate,
    }) => {
      // ARRANGE
      const component = await mountTemplate(
        `<div>${staged(`*okklySlide="false; direction: '${direction}'; container: stage"`)}</div>`,
      );
      const content = component.locator(".content");

      // ASSERT
      await expect(content).toHaveCSS("transform", transform);
      await expect(content).toHaveCSS("visibility", "hidden");
    });
  }
});

test("should slide in to its own place and back out", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div>${staged(`*okklySlide="state().open; direction: 'left'; container: stage; timeout: 100"`)}</div>`,
    { open: false },
  );
  const content = component.locator(".content");

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(content).toHaveCSS("transform", "none");
  await expect(content).toHaveCSS("visibility", "visible");
  await expect(content).toHaveCSS("transition-property", "transform");

  // ACT
  await update({ open: false });

  // ASSERT
  await expect(content).toHaveCSS("transform", "matrix(1, 0, 0, 1, 200, 0)");
  await expect(content).toHaveCSS("visibility", "hidden");
});

test("should fire the enter callbacks when opening", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE
  await mountTemplate(
    `<div>
      <ng-template [okklySlide]="state().open" [okklySlideTimeout]="100"
        (enter)="record('phase', 'enter')" (entered)="record('phase', 'entered')">
        <div>Slide content</div>
      </ng-template>
    </div>`,
    { open: false },
  );

  // ACT
  await update({ open: true });

  // ASSERT
  await expect.poll(() => recordedEvents("phase")).toEqual(["enter", "entered"]);
});
