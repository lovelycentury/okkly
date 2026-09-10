import { expect, test } from "../../playwright/a11y";
import {
  defineImageMockRoutes,
  executeMatrixScreenshotTest,
  MOCK_PLAYWRIGHT_IMAGE_URL,
} from "../../playwright/screenshots";
import { Card, CardActions, CardContent, CardHeader, CardMedia } from "./Card";
import { Button } from "../Button/Button";
import type { CardPadding, CardVariant } from "./Card";

const VARIANTS = [
  "solid",
  "raised",
  "glass",
  "outline",
  "aura",
] as const satisfies readonly CardVariant[];
const PADDINGS = ["none", "sm", "md", "lg"] as const satisfies readonly CardPadding[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Card (variants)",
    columns: VARIANTS,
    rows: ["plain", "interactive"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Card variant={column} interactive={row === "interactive"}>
        <CardContent>
          <div style={{ width: "10rem" }}>A short card body.</div>
        </CardContent>
      </Card>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Card (padding)",
    columns: PADDINGS,
    rows: ["content-only", "full"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Card padding={column}>
        {row === "full" && <CardHeader title="Release 2.4" subheader="Shipped today" />}
        <CardContent>
          <div style={{ width: "10rem" }}>A short card body.</div>
        </CardContent>
        {row === "full" && (
          <CardActions>
            <Button size="small">Save</Button>
          </CardActions>
        )}
      </Card>
    ),
  });
});

test("should render without modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Card>
      <CardContent>Body</CardContent>
    </Card>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-card/);
  await expect(component).not.toHaveClass(/okkly-card--(raised|glass|outline|aura|padding-)/);
});

test("should apply the variant and padding modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Card raised padding="lg">
      <CardContent>Body</CardContent>
    </Card>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--raised/);
  await expect(component).toHaveClass(/okkly-card--padding-lg/);

  // ACT
  await component.update(
    <Card variant="glass" padding="none">
      <CardContent>Body</CardContent>
    </Card>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-card--glass/);
  await expect(component).toHaveClass(/okkly-card--padding-none/);
});

test("should render the compound subcomponents", async ({ mount, page }) => {
  // ARRANGE
  await defineImageMockRoutes(page);
  const component = await mount(
    <Card>
      <CardHeader title="Title" subheader="Sub" action={<Button size="small">Go</Button>} />
      <CardMedia src={MOCK_PLAYWRIGHT_IMAGE_URL} alt="Cover" />
      <CardContent>Content</CardContent>
      <CardActions>
        <Button size="small">Save</Button>
      </CardActions>
    </Card>,
  );

  // ASSERT
  await expect(component.locator(".okkly-card__title")).toHaveText("Title");
  await expect(component.locator(".okkly-card__subheader")).toHaveText("Sub");
  await expect(component.getByRole("img", { name: "Cover" })).toHaveClass(/okkly-card__media/);
  await expect(component.locator(".okkly-card__content")).toContainText("Content");
  await expect(
    component.locator(".okkly-card__actions").getByRole("button", { name: "Save" }),
  ).toBeVisible();
  await expect(component.getByRole("button", { name: "Go" })).toBeVisible();
});
