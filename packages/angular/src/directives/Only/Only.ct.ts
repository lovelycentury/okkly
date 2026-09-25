import { expect, test } from "../../playwright/harness";

/**
 * `okklyOnly` is a viewport gate, so there is nothing to photograph — its whole
 * contract is "is the element in the DOM at this width". The tests resize the
 * real browser instead of stubbing `matchMedia`.
 *
 * Breakpoints come from the directive itself: sm at 769px, md at 993px and
 * lg at 1441px.
 */

test("should render its element when both bounds match", async ({ mountTemplate, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 850, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: 'sm', to: 'md' }">Between sm and md</span></div>`,
  );

  // ASSERT
  await expect(component).toHaveText("Between sm and md");
});

test("should render nothing when the viewport is below `from`", async ({ mountTemplate, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 600, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: 'sm', to: 'md' }">Between sm and md</span></div>`,
  );

  // ASSERT
  await expect(component.locator("span")).toHaveCount(0);
});

test("should render nothing when the viewport is at or above `to`", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await page.setViewportSize({ width: 1100, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: 'sm', to: 'md' }">Between sm and md</span></div>`,
  );

  // ASSERT
  await expect(component.locator("span")).toHaveCount(0);
});

test("should treat `to` as exclusive and `from` as inclusive", async ({ mountTemplate, page }) => {
  // ARRANGE — 993px is exactly md.
  await page.setViewportSize({ width: 993, height: 600 });
  const component = await mountTemplate(
    `<div>
      <span class="below" *okklyOnly="{ to: 'md' }">Below md</span>
      <span class="from" *okklyOnly="{ from: 'md' }">md and up</span>
    </div>`,
  );

  // ASSERT
  await expect(component.locator(".from")).toBeAttached();
  await expect(component.locator(".below")).toHaveCount(0);
});

test("should enforce only the lower bound when `to` is omitted", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await page.setViewportSize({ width: 1600, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: 'lg' }">lg and up</span></div>`,
  );

  // ASSERT
  await expect(component).toHaveText("lg and up");
});

test("should always render when neither bound is given", async ({ mountTemplate, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 320, height: 600 });
  const component = await mountTemplate(`<div><span *okklyOnly>Always visible</span></div>`);

  // ASSERT
  await expect(component).toHaveText("Always visible");
});

test("should take the bounds as separate inputs on an ng-template", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await page.setViewportSize({ width: 850, height: 600 });
  const component = await mountTemplate(
    `<div>
      <ng-template okklyOnly okklyOnlyFrom="sm" okklyOnlyTo="md"><span class="inside">In range</span></ng-template>
      <ng-template okklyOnly okklyOnlyFrom="lg"><span class="outside">Out of range</span></ng-template>
    </div>`,
  );

  // ASSERT
  await expect(component.locator(".inside")).toBeAttached();
  await expect(component.locator(".outside")).toHaveCount(0);
});

test("should follow a range that changes", async ({ mountTemplate, page, update }) => {
  // ARRANGE
  await page.setViewportSize({ width: 850, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: state().from }">Gated</span></div>`,
    { from: "lg" },
  );

  // ASSERT
  await expect(component.locator("span")).toHaveCount(0);

  // ACT
  await update({ from: "sm" });

  // ASSERT
  await expect(component.locator("span")).toHaveText("Gated");
});

test("should react to a viewport change after mounting", async ({ mountTemplate, page }) => {
  // ARRANGE — the media query listener is the point: resizing the real
  // browser is what exercises it.
  await page.setViewportSize({ width: 1600, height: 600 });
  const component = await mountTemplate(
    `<div><span *okklyOnly="{ from: 'lg' }">lg and up</span></div>`,
  );

  // ASSERT
  await expect(component.locator("span")).toBeVisible();

  // ACT
  await page.setViewportSize({ width: 500, height: 600 });

  // ASSERT
  await expect(component.locator("span")).toHaveCount(0);

  // ACT
  await page.setViewportSize({ width: 1600, height: 600 });

  // ASSERT
  await expect(component.locator("span")).toHaveCount(1);
});
