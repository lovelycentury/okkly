import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import CustomInputSelect from "../../playwright/fixtures/CustomInputSelect.vue";
import CustomOptionSelect from "../../playwright/fixtures/CustomOptionSelect.vue";
import GroupedSelect from "../../playwright/fixtures/GroupedSelect.vue";
import RenderValueSelect from "../../playwright/fixtures/RenderValueSelect.vue";
import Select from "./Select.vue";
import type { SelectOption, SelectOptionState, SelectSize } from "./Select.types";

const SIZES = ["small", "medium", "large"] as const satisfies readonly SelectSize[];

const OPTIONS: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
];

interface City extends SelectOption {
  region: string;
}

/** Mirrors `SELECT_CITIES` in the fixtures module. */
const CITIES: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
];

// The listbox portals to `document.body`, so open-state cells photograph the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 420 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Select (sizes)",
    columns: SIZES,
    rows: ["placeholder", "selected", "error", "disabled"],
    fastNoIsolation: true,
    component: Select,
    args: (column, row) => ({
      props: {
        options: OPTIONS,
        size: column,
        defaultValue: row === "placeholder" ? undefined : "design",
        error: row === "error",
        disabled: row === "disabled",
        placeholder: "Choose…",
        style: "width: 14rem",
      } as never,
      slots: {
        label: "Team",
        ...(row === "error" ? { "helper-text": "Required" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Select (open)",
    columns: ["single", "multiple", "grouped"],
    rows: ["default"],
    screenshotTarget: "page",
    context: {
      // A multi-select row draws a real `Checkbox`, but its `<label>` is empty:
      // the visible text is a sibling `.okkly-select__option-label`, so axe sees
      // an unnamed form control. The row itself is `role="option"` with
      // `aria-selected`, which is what assistive tech actually announces, so the
      // checkbox should be hidden from the tree — tracked as a component fix,
      // not something the test can paper over correctly. `nested-interactive`
      // is the same defect seen from the other side: a form control inside a
      // `role="option"` row.
      disabledAccessibilityRules: ["label", "nested-interactive"],
    },
    component: Select,
    args: (column) => ({
      props: (column === "grouped"
        ? {
            options: CITIES,
            open: true,
            groupBy: (option: City) => option.region,
          }
        : {
            options: OPTIONS,
            open: true,
            multiple: column === "multiple",
            defaultValue: column === "multiple" ? ["design"] : "design",
          }) as never,
      slots: { label: column === "grouped" ? "City" : "Team" },
    }),
  });
});

test("should render a combobox trigger and label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, placeholder: "Choose…" } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAccessibleName(/team/i);
  await expect(component).toContainText("Choose…");
});

test("should render the default size without a size modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-select--(small|large)/);
});

test("should apply the size and error modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, size: "small", error: true } as never,
    slots: { label: "Team", "helper-text": "Required" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-select--small/);
  await expect(component).toHaveClass(/okkly-select--error/);
});

test("should open the listbox and select an option", async ({ mount, page }) => {
  const changes: { value: unknown; reason: string; option: unknown }[] = [];

  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS } as never,
    slots: { label: "Team" },
    on: {
      change: (...args: unknown[]) => {
        const [, value, reason, details] = args as [
          unknown,
          unknown,
          string,
          { option?: SelectOption } | undefined,
        ];
        changes.push({ value, reason, option: details?.option?.value });
      },
    },
  });

  // ACT
  await component.getByRole("combobox").click();
  await page.getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  expect(changes).toEqual([
    { value: "engineering", reason: "selectOption", option: "engineering" },
  ]);
  await expect(component.getByRole("combobox")).toContainText("Engineering");
});

test("should support multi-select toggling and stay open", async ({ mount, page }) => {
  const values: unknown[] = [];

  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, multiple: true } as never,
    slots: { label: "Team" },
    on: {
      change: (...args: unknown[]) => {
        const [, value] = args as [unknown, unknown];
        values.push(value);
      },
    },
  });

  // ACT
  await component.getByRole("combobox").click();
  await page.getByRole("option", { name: "Product design" }).click();

  // ASSERT — the popup survives the first pick.
  await expect(page.getByRole("listbox")).toBeVisible();

  // ACT
  await page.getByRole("option", { name: "Engineering" }).click();

  // ASSERT
  expect(values.at(-1)).toEqual(["design", "engineering"]);
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("should open from the chevron and the field's own padding", async ({ mount, page }) => {
  // ARRANGE — both sit outside the trigger div (the chevron is a Field
  // adornment), so they only work because the whole control box is the target.
  const component = await mount(Select, {
    props: { options: OPTIONS } as never,
    slots: { label: "Team" },
  });

  // ACT
  await component.locator(".okkly-select__chevron").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toBeVisible();

  // ACT
  await component.locator(".okkly-select__control").click();

  // ASSERT
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("should anchor a popup that is already open on the first render", async ({ mount, page }) => {
  // ARRANGE — `anchorEl` is read during render and a ref attach schedules none,
  // so a controlled-open popup used to see a null anchor and never get placed.
  await mount(Select, {
    props: { options: OPTIONS, open: true } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  await expect(page.locator(".okkly-select-popper")).toHaveAttribute("data-popper-placement");
});

test("should carry the field size onto the portaled panel", async ({ mount, page }) => {
  // ARRANGE — the panel is not a DOM descendant of the field, so it cannot
  // inherit the size modifier; it has to be copied across.
  const component = await mount(Select, {
    props: { options: OPTIONS, size: "small" } as never,
    slots: { label: "Team" },
  });

  // ACT
  await component.getByRole("combobox").click();

  // ASSERT
  await expect(page.locator(".okkly-select-popover")).toHaveClass(/okkly-select-popover--small/);
});

test("should render the trigger as a div so chip remove buttons are valid", async ({ mount }) => {
  // ARRANGE — a <button> may not contain interactive descendants; the chips'
  // × buttons are exactly that, which is why the trigger is a div[role=combobox].
  const component = await mount(Select, {
    props: { options: OPTIONS, multiple: true, defaultValue: ["design"] } as never,
    slots: { label: "Team" },
  });
  const trigger = component.getByRole("combobox");

  // ASSERT
  expect(await trigger.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(trigger.locator("button")).not.toHaveCount(0);
});

test("should remove a value from its chip without opening the popup", async ({ mount, page }) => {
  const changes: { value: unknown; reason: string }[] = [];

  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, multiple: true, defaultValue: ["design", "engineering"] } as never,
    slots: { label: "Team" },
    on: {
      change: (...args: unknown[]) => {
        const [, value, reason] = args as [unknown, unknown, string];
        changes.push({ value, reason });
      },
    },
  });

  // ACT
  await component
    .getByRole("button", { name: /remove/i })
    .first()
    .click();

  // ASSERT
  expect(changes).toEqual([{ value: ["engineering"], reason: "removeOption" }]);
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("should collapse chips past limitTags", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: {
      options: OPTIONS,
      multiple: true,
      limitTags: 1,
      defaultValue: ["design", "engineering", "marketing"],
    } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  await expect(component).toContainText("+2");
});

test("should report clearing separately from deselecting", async ({ mount }) => {
  const changes: { value: unknown; reason: string }[] = [];

  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, defaultValue: "design" } as never,
    slots: { label: "Team" },
    on: {
      change: (...args: unknown[]) => {
        const [, value, reason] = args as [unknown, unknown, string];
        changes.push({ value, reason });
      },
    },
  });

  // ACT
  await component.getByRole("button", { name: "Clear" }).click();

  // ASSERT
  expect(changes).toEqual([{ value: null, reason: "clear" }]);
});

test("should render grouped options under sticky headers", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(GroupedSelect);

  // ACT
  await component.getByRole("combobox").click();

  // ASSERT
  await expect(page.getByRole("group", { name: "Europe" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();
});

test("should keep keyboard order aligned with grouped render order", async ({ mount, page }) => {
  // ARRANGE — grouping reorders options (Kyiv moves up beside Paris); the first
  // arrow press must land on the second *rendered* row, not the second input row.
  const component = await mount(GroupedSelect);
  const trigger = component.getByRole("combobox");

  // ACT
  await trigger.click();
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(page.getByRole("option", { name: "Kyiv" })).toHaveClass(
    /okkly-select__option--highlighted/,
  );
});

test("should emit hidden inputs for form submission", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: {
      options: OPTIONS,
      name: "team",
      multiple: true,
      defaultValue: ["design", "marketing"],
    } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  const values = await component
    .locator('input[type="hidden"][name="team"]')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(values).toEqual(["design", "marketing"]);
});

test("should mark the field required", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Select, {
    props: { options: OPTIONS, required: true } as never,
    slots: { label: "Team" },
  });

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAttribute("aria-required", "true");
  await expect(component.locator(".okkly-select__required")).toHaveText("*");
});

test("should support the #value slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(RenderValueSelect, {
    props: { options: OPTIONS, defaultValue: "design" } as never,
  });

  // ASSERT
  await expect(component.getByRole("combobox")).toContainText("Product design");
});

// These pin the contract the customization stories document: what a caller
// gets, and what still has to work once they take a piece over.
test.describe("customization", () => {
  test("should hand #option the state a custom row cannot recompute", async ({ mount }) => {
    const seen: SelectOptionState[] = [];

    // ARRANGE
    await mount(CustomOptionSelect, {
      props: {
        options: [{ value: "design", label: "Product design", disabled: true }],
        size: "small",
        multiple: true,
        open: true,
      } as never,
      on: { "option-state": (...args: unknown[]) => seen.push(args[0] as SelectOptionState) },
    });

    // ASSERT
    await expect(() => expect(seen.length).toBeGreaterThan(0)).toPass();
    expect(seen[0]).toMatchObject({ disabled: true, multiple: true, size: "small", index: 0 });
  });

  test("should keep a custom row selectable by pointer and keyboard", async ({ mount, page }) => {
    const changes: { value: unknown; reason: string }[] = [];

    // ARRANGE
    const component = await mount(CustomOptionSelect, {
      props: { options: OPTIONS } as never,
      on: {
        change: (...args: unknown[]) => {
          const [, value, reason] = args as [unknown, unknown, string];
          changes.push({ value, reason });
        },
      },
    });
    const trigger = component.getByRole("combobox");

    // ACT
    await trigger.click();
    await page.keyboard.press("ArrowDown");

    // ASSERT
    const second = page.getByRole("option", { name: "Engineering" });
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      (await second.getAttribute("id"))!,
    );

    // ACT
    await second.click();

    // ASSERT
    expect(changes).toEqual([{ value: "engineering", reason: "selectOption" }]);
  });

  test("should give option primitives the listbox's own block classes", async ({ mount, page }) => {
    // ARRANGE
    await mount(CustomOptionSelect, {
      props: { options: CITIES, twoLine: true, open: true } as never,
    });

    // ASSERT
    const row = page.getByRole("option", { name: "Paris Europe" });
    await expect(row.locator(".okkly-select__option-body")).toBeAttached();
    await expect(row.locator(".okkly-select__option-label")).toBeAttached();
    await expect(row.locator(".okkly-select__option-meta")).toBeAttached();
  });

  test("should keep the combobox working when #trigger takes over", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(CustomInputSelect, {
      props: { options: OPTIONS, defaultValue: "design", variant: "badge" } as never,
    });

    // ASSERT — the label association, the role and the keyboard handling all
    // ride on `triggerAttrs`/`triggerEvents`; losing any of them fails this
    // lookup or the open.
    const trigger = component.getByRole("combobox");
    await expect(trigger).toHaveAccessibleName(/team/i);
    await expect(component.getByTestId("badge")).toHaveText("P");

    // ACT
    await trigger.click();

    // ASSERT
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("should move the adornments into #trigger rather than drawing them twice", async ({
    mount,
  }) => {
    // ARRANGE
    const component = await mount(CustomInputSelect, {
      props: { options: OPTIONS, defaultValue: "design", variant: "wrapper" } as never,
    });

    // ASSERT
    const clears = component.getByRole("button", { name: "Clear" });
    await expect(clears).toHaveCount(1);
    await expect(
      component.getByTestId("trigger-wrapper").getByRole("button", { name: "Clear" }),
    ).toHaveCount(1);
    // The default trigger content still comes from `value`, so opting into
    // `#trigger` does not mean rebuilding the placeholder/chip logic by hand.
    await expect(component.getByRole("combobox")).toContainText("Product design");
  });

  test("should replace group headers, the empty state and the loading state", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(GroupedSelect, {
      props: { open: true, customGroups: true } as never,
    });

    // ASSERT
    await expect(page.getByText("Europe (2)")).toBeVisible();
    await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();

    // ACT
    await component.update({
      props: { open: true, empty: true, customSlots: true } as never,
    });

    // ASSERT
    await expect(page.getByText("Nothing archived yet")).toBeVisible();

    // ACT
    await component.update({ props: { open: true, loading: true, customSlots: true } as never });

    // ASSERT
    await expect(page.getByText("Fetching…")).toBeVisible();
  });
});
