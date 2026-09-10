import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { ChipGroup } from "./ChipGroup";
import { Chip } from "../Chip/Chip";
import type { ChipGroupColor } from "./ChipGroup";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly ChipGroupColor[];

const ITEMS = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Research", value: "research" },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ChipGroup (colors)",
    columns: COLORS,
    rows: ["none-selected", "one-selected", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <ChipGroup
        color={column}
        disabled={row === "disabled"}
        value={row === "one-selected" ? ["design"] : []}
        onChange={() => {}}
        items={ITEMS}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "ChipGroup (modes)",
    columns: ["multi", "exclusive", "removable"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      column === "removable" ? (
        <ChipGroup items={ITEMS.map((item) => ({ ...item, onRemove: () => {} }))} />
      ) : (
        <ChipGroup
          exclusive={column === "exclusive"}
          value={column === "exclusive" ? "design" : ["design", "research"]}
          onChange={() => {}}
          items={ITEMS}
        />
      ),
  });
});

test("should render items as chips", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ChipGroup items={ITEMS} />);

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText([
    "Design",
    "Engineering",
    "Research",
  ]);
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ChipGroup items={[{ label: "Design" }]} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-chip-group/);
  await expect(component).not.toHaveClass(/okkly-chip-group--color-/);
  await expect(component).not.toHaveClass(/okkly-chip-group--disabled/);
});

test("should apply a color modifier only for non-primary tones", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<ChipGroup color="dante" items={[{ label: "Design" }]} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip-group--color-dante/);

  // ACT
  await component.update(<ChipGroup color="primary" items={[{ label: "Design" }]} />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip-group--color-/);
});

test("should render children as an escape hatch", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <ChipGroup>
      <Chip label="Custom" />
    </ChipGroup>,
  );

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText("Custom");
});

test.describe("selection", () => {
  test("should reflect a controlled multi value", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <ChipGroup value={["design"]} onChange={() => {}} items={ITEMS} />,
    );

    // ASSERT
    await expect(component.locator(".okkly-chip").nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(component.locator(".okkly-chip").nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });

  test("should toggle multi selection through onChange", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(
      <ChipGroup value={[]} onChange={(value) => changes.push(value)} items={ITEMS} />,
    );

    // ACT
    await component.getByRole("button", { name: "Design" }).click();

    // ASSERT
    expect(changes).toEqual([["design"]]);
  });

  test("should switch exclusive selection through onChange", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(
      <ChipGroup
        exclusive
        value="design"
        onChange={(value) => changes.push(value)}
        items={ITEMS}
      />,
    );

    // ACT
    await component.getByRole("button", { name: "Engineering" }).click();

    // ASSERT
    expect(changes).toEqual(["engineering"]);
  });

  test("should use item.selected when value is omitted", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <ChipGroup
        items={[
          { label: "Design", value: "design", selected: true },
          { label: "Engineering", value: "engineering" },
        ]}
      />,
    );

    // ASSERT
    await expect(component.locator(".okkly-chip").nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(component.locator(".okkly-chip").nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });
});

test.describe("disabled", () => {
  test("should mark the group disabled and block chip clicks", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(
      <ChipGroup
        disabled
        value={[]}
        onChange={(value) => changes.push(value)}
        items={[{ label: "Design", value: "design" }]}
      />,
    );

    // ASSERT
    await expect(component).toHaveClass(/okkly-chip-group--disabled/);
    await expect(component.locator(".okkly-chip")).toHaveCSS("pointer-events", "none");

    // ACT — the chip is unclickable in CSS, so dispatch directly to prove the
    // handler is guarded in JS as well.
    await component.locator(".okkly-chip").dispatchEvent("click");

    // ASSERT
    expect(changes).toEqual([]);
  });
});

test("should wire removable chips, handing the item back to onRemove", async ({ mount }) => {
  const removed: string[] = [];

  // ARRANGE
  const component = await mount(
    <ChipGroup
      items={[
        {
          label: "Design",
          onRemove: (_event, item) => removed.push(String(item.label)),
        },
      ]}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Remove" }).click();

  // ASSERT
  expect(removed).toEqual(["Design"]);
});
