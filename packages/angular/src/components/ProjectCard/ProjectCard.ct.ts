import { expect, test } from "../../playwright/harness";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ProjectCard (slots)",
    columns: ["bare", "tags", "device", "logo"],
    rows: ["with-image", "without-image"],
    hooks: {
      beforeEach: async (_component, page) => defineImageMockRoutes(page),
    },
    component: (column, row) =>
      `<div style="width: 18rem">
        <div okklyProjectCard title="Finance App" description="Buy, earn and grow crypto."${
          row === "with-image" ? ` image="${MOCK_PLAYWRIGHT_IMAGE_URL}"` : ""
        }${column === "tags" ? ` [tags]="['Fintech', 'Mobile']"` : ""}${
          column === "device" ? " device" : ""
        }>${
          column === "logo"
            ? `<okkly-logo okklyProjectCardLogo layout="compact" [showLabel]="false" />`
            : ""
        }</div>
      </div>`,
  });
});

test("should render the title and the description", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App" description="Buy, earn and grow crypto."></div>`,
  );

  // ASSERT
  await expect(component.getByRole("heading", { level: 3 })).toHaveText("Finance App");
  await expect(component).toContainText("Buy, earn and grow crypto.");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-project-card");
  await expect(component).not.toHaveAttribute("title");
});

test("should render tags when provided", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App" [tags]="['Fintech', 'Mobile']"></div>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-project-card__tag")).toHaveText(["Fintech", "Mobile"]);
});

test("should omit the tags container when tags is empty", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App" [tags]="[]"></div>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-project-card__tags")).toHaveCount(0);
});

test("should render the device mockup only when device is set", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App" [device]="state().device"></div>`,
    { device: true },
  );

  // ASSERT
  await expect(component.locator(".okkly-project-card__device")).toBeAttached();
  await expect(component.locator(".okkly-project-card__device")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  // ACT
  await update({ device: false });

  // ASSERT
  await expect(component.locator(".okkly-project-card__device")).toHaveCount(0);
});

test("should render the background image only when one is provided", async ({
  mountTemplate,
  page,
  update,
}) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App" [image]="state().image"></div>`,
    { image: MOCK_PLAYWRIGHT_IMAGE_URL },
  );
  const background = component.locator(".okkly-project-card__background");

  // ASSERT
  await expect(background).toHaveAttribute("src", MOCK_PLAYWRIGHT_IMAGE_URL);
  await expect(background).toHaveAttribute("alt", "");

  // ACT
  await update({ image: undefined });

  // ASSERT
  await expect(background).toHaveCount(0);
});

test("should be a link on an anchor", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<a okklyProjectCard title="Finance App" href="#test-section"></a>`,
  );

  // ASSERT
  await expect(component).toHaveRole("link");
  await expect(component).toHaveAttribute("href", "#test-section");
});

test("should be inert on a div", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyProjectCard title="Finance App"></div>`);

  // ASSERT
  await expect(component).not.toHaveAttribute("href");
  await expect(component).not.toHaveAttribute("role");
  await expect(component).not.toHaveAttribute("tabindex");
});

test("should render the logo slot when provided", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyProjectCard title="Finance App">
      <okkly-logo okklyProjectCardLogo class="brand-mark" layout="compact" [showLabel]="false" />
    </div>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-project-card__logo .brand-mark")).toBeVisible();
});

test("should leave the logo container out without a logo", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyProjectCard title="Finance App"></div>`);

  // ASSERT
  await expect(component.locator(".okkly-project-card__logo")).toHaveCount(0);
});
