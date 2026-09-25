import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fade (states)",
    columns: ["entered", "exited"],
    rows: ["kept-mounted", "unmount-on-exit"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 10rem; height: 3rem">
        <div
          *okklyFade="${column === "entered"}; appear: false; unmountOnExit: ${row === "unmount-on-exit"}"
          style="padding: 0.5rem; background: var(--okkly-bg-surface)"
        >Fade content</div>
      </div>`,
  });
});

test("should render its element when shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="true" class="content">Fade content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toBeVisible();
  await expect(content).toHaveText("Fade content");
  await expect(content).toHaveCSS("opacity", "1");
});

test("should keep the element mounted but hidden when not shown", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="false" class="content">Fade content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toBeAttached();
  await expect(content).toHaveCSS("visibility", "hidden");
  await expect(content).toHaveCSS("opacity", "0");
});

test("should not mount the element when not shown and unmountOnExit is set", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="false; unmountOnExit: true" class="content">Fade content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCount(0);
});

test("should apply the okkly-fade class to the element, keeping its own", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="true" class="content custom-class">Fade content</div></div>`,
  );
  const content = component.locator(".content");

  // ASSERT
  await expect(content).toHaveClass(/okkly-fade/);
  await expect(content).toHaveClass(/custom-class/);
});

test("should fade in and out as it is toggled", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="state().open; timeout: 100" class="content">Fade content</div></div>`,
    { open: false },
  );
  const content = component.locator(".content");

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(content).toHaveCSS("visibility", "visible");
  await expect(content).toHaveCSS("opacity", "1");
  await expect(content).toHaveCSS("transition-property", "opacity");

  // ACT
  await update({ open: false });

  // ASSERT
  await expect(content).toHaveCSS("opacity", "0");
  await expect(content).toHaveCSS("visibility", "hidden");
});

test("should unmount after the exit and mount again on enter", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="state().open; timeout: 100; unmountOnExit: true" class="content">Fade content</div></div>`,
    { open: true },
  );
  const content = component.locator(".content");

  // ACT
  await update({ open: false });

  // ASSERT — gone once it has faded out.
  await expect(content).toHaveCount(0);

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(content).toHaveCSS("opacity", "1");
  await expect(content).toHaveClass(/okkly-fade/);
});

test("should report every lifecycle phase through its outputs", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE — the long form, since the * shorthand cannot bind outputs.
  await mountTemplate(
    `<div>
      <ng-template [okklyFade]="state().open" [okklyFadeTimeout]="100"
        (enter)="record('phase', 'enter')" (entering)="record('phase', 'entering')" (entered)="record('phase', 'entered')"
        (exit)="record('phase', 'exit')" (exiting)="record('phase', 'exiting')" (exited)="record('phase', 'exited')">
        <div>Fade content</div>
      </ng-template>
    </div>`,
    { open: false },
  );

  // ACT
  await update({ open: true });

  // ASSERT
  await expect.poll(() => recordedEvents("phase")).toEqual(["enter", "entering", "entered"]);

  // ACT
  await update({ open: false });

  // ASSERT
  await expect
    .poll(() => recordedEvents("phase"))
    .toEqual(["enter", "entering", "entered", "exit", "exiting", "exited"]);
});

test("should fade in on first render when appear is on", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="true; timeout: 400" class="content">Fade content</div></div>`,
  );

  // ASSERT — a transition was set up for the appear, and it lands at full opacity.
  await expect(component.locator(".content")).toHaveCSS("transition-property", "opacity");
  await expect(component.locator(".content")).toHaveCSS("opacity", "1");
});

test("should not animate on first render when appear is off", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><div *okklyFade="true; appear: false" class="content">Fade content</div></div>`,
  );

  // ASSERT
  await expect(component.locator(".content")).toHaveCSS("opacity", "1");
  await expect(component.locator(".content")).toHaveCSS("transition-duration", "0s");
});
