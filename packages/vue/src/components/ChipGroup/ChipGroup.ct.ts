import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import ChipGroup from "./ChipGroup.vue";
import type { ChipGroupColor } from "./ChipGroup.types";

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
    component: ChipGroup,
    args: (column, row) => ({
      props: {
        color: column,
        disabled: row === "disabled",
        modelValue: row === "one-selected" ? ["design"] : [],
        items: ITEMS,
        "onUpdate:modelValue": () => {},
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "ChipGroup (modes)",
    columns: ["multi", "exclusive", "removable"],
    rows: ["default"],
    fastNoIsolation: true,
    component: ChipGroup,
    args: (column) =>
      column === "removable"
        ? { props: { items: ITEMS.map((item) => ({ ...item, onRemove: () => {} })) } }
        : {
            props: {
              exclusive: column === "exclusive",
              modelValue: column === "exclusive" ? "design" : ["design", "research"],
              items: ITEMS,
              "onUpdate:modelValue": () => {},
            } as never,
          },
  });
});

test("should render items as chips", async ({ mount }) => {
  // ARRANGE
  const component = await mount(ChipGroup, { props: { items: ITEMS } });

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText([
    "Design",
    "Engineering",
    "Research",
  ]);
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(ChipGroup, { props: { items: [{ label: "Design" }] } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-chip-group/);
  await expect(component).not.toHaveClass(/okkly-chip-group--color-/);
  await expect(component).not.toHaveClass(/okkly-chip-group--disabled/);
});

test("should apply a color modifier only for non-primary tones", async ({ mount }) => {
  // ARRANGE
  const component = await mount(ChipGroup, {
    props: { color: "dante", items: [{ label: "Design" }] },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip-group--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip-group--color-/);
});

test("should render slot content as an escape hatch", async ({ mount }) => {
  // ARRANGE
  const component = await mount(ChipGroup, { slots: { default: "<div>Custom</div>" } });

  // ASSERT
  await expect(component.getByText("Custom")).toBeVisible();
});

test.describe("selection", () => {
  test("should reflect a controlled multi value", async ({ mount }) => {
    // ARRANGE
    const component = await mount(ChipGroup, {
      props: { modelValue: ["design"], items: ITEMS, "onUpdate:modelValue": () => {} } as never,
    });

    // ASSERT
    await expect(component.locator(".okkly-chip").nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(component.locator(".okkly-chip").nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });

  test("should toggle multi selection through update:modelValue", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(ChipGroup, {
      props: { modelValue: [], items: ITEMS },
      on: { "update:modelValue": (value: unknown) => changes.push(value as string[]) },
    });

    // ACT
    await component.getByRole("button", { name: "Design" }).click();

    // ASSERT
    expect(changes).toEqual([["design"]]);
  });

  test("should switch exclusive selection through update:modelValue", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(ChipGroup, {
      props: { exclusive: true, modelValue: "design", items: ITEMS },
      on: { "update:modelValue": (value: unknown) => changes.push(value as string) },
    });

    // ACT
    await component.getByRole("button", { name: "Engineering" }).click();

    // ASSERT
    expect(changes).toEqual(["engineering"]);
  });

  test("should use item.selected when the model is unset", async ({ mount }) => {
    // ARRANGE
    const component = await mount(ChipGroup, {
      props: {
        items: [
          { label: "Design", value: "design", selected: true },
          { label: "Engineering", value: "engineering" },
        ],
      },
    });

    // ASSERT
    await expect(component.locator(".okkly-chip").nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(component.locator(".okkly-chip").nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });
});

test.describe("disabled", () => {
  test("should mark the group disabled and block chip clicks", async ({ mount }) => {
    const changes: (string | string[])[] = [];

    // ARRANGE
    const component = await mount(ChipGroup, {
      props: { disabled: true, modelValue: [], items: [{ label: "Design", value: "design" }] },
      on: { "update:modelValue": (value: unknown) => changes.push(value as string[]) },
    });

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
  const component = await mount(ChipGroup, {
    props: {
      items: [
        {
          label: "Design",
          onRemove: (_event: MouseEvent, item: { label: string }) => removed.push(item.label),
        },
      ],
    },
  });

  // ACT
  await component.getByRole("button", { name: "Remove" }).click();

  // ASSERT
  expect(removed).toEqual(["Design"]);
});
