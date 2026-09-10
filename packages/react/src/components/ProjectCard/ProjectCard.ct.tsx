import { expect, test } from "../../playwright/a11y";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import { ProjectCard } from "./ProjectCard";
import { Logo } from "../Logo/Logo";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ProjectCard (slots)",
    columns: ["bare", "tags", "device", "logo"],
    rows: ["with-image", "without-image"],
    hooks: {
      beforeEach: async (_component, page) => defineImageMockRoutes(page),
    },
    component: (column, row) => (
      <div style={{ width: "18rem" }}>
        <ProjectCard
          title="Finance App"
          description="Buy, earn and grow crypto."
          image={row === "with-image" ? MOCK_PLAYWRIGHT_IMAGE_URL : undefined}
          tags={column === "tags" ? ["Fintech", "Mobile"] : undefined}
          device={column === "device"}
          logo={column === "logo" ? <Logo layout="compact" showLabel={false} /> : undefined}
        />
      </div>
    ),
  });
});

test("should render the title and the description", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ProjectCard title="Finance App" description="Buy, earn and grow crypto." />,
  );

  // ASSERT
  await expect(component.getByRole("heading")).toHaveText("Finance App");
  await expect(component).toContainText("Buy, earn and grow crypto.");
});

test("should render tags when provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ProjectCard title="Finance App" tags={["Fintech", "Mobile"]} />);

  // ASSERT
  await expect(component).toContainText("Fintech");
  await expect(component).toContainText("Mobile");
});

test("should omit the tags container when tags is empty", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ProjectCard title="Finance App" tags={[]} />);

  // ASSERT
  await expect(component.locator(".okkly-project-card__tags")).toHaveCount(0);
});

test("should render the device mockup only when device is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ProjectCard title="Finance App" device />);

  // ASSERT
  await expect(component.locator(".okkly-project-card__device")).toBeAttached();

  // ACT
  await component.update(<ProjectCard title="Finance App" device={false} />);

  // ASSERT
  await expect(component.locator(".okkly-project-card__device")).toHaveCount(0);
});

test("should render the background image only when one is provided", async ({ mount, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(
    <ProjectCard title="Finance App" image={MOCK_PLAYWRIGHT_IMAGE_URL} />,
  );

  // ASSERT
  await expect(component.locator(".okkly-project-card__background")).toHaveAttribute(
    "src",
    MOCK_PLAYWRIGHT_IMAGE_URL,
  );

  // ACT
  await component.update(<ProjectCard title="Finance App" />);

  // ASSERT
  await expect(component.locator(".okkly-project-card__background")).toHaveCount(0);
});

test("should render as an <a> when href is provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ProjectCard title="Finance App" href="#test-section" />);

  // ASSERT
  await expect(component).toHaveRole("link");
  await expect(component).toHaveAttribute("href", "#test-section");
});

test("should render as a plain <div> when href is omitted", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ProjectCard title="Finance App" />);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(component).not.toHaveAttribute("href");
});

test("should render the logo slot when provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ProjectCard
      title="Finance App"
      logo={<Logo layout="compact" showLabel={false} className="brand-mark" />}
    />,
  );

  // ASSERT
  await expect(component.locator(".brand-mark")).toBeVisible();
});
