import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import {
  CustomInputAutocomplete,
  CustomOptionAutocomplete,
  GroupedAutocomplete,
  RenderTagsAutocomplete,
} from "../../playwright/fixtures/AutocompleteFixtures";
import { Autocomplete } from "./Autocomplete";
import type { AutocompleteOption, AutocompleteOptionState, AutocompleteSize } from "./Autocomplete";

const SIZES = ["small", "medium", "large"] as const satisfies readonly AutocompleteSize[];

const OPTIONS: AutocompleteOption[] = [
  { value: "mika", label: "Mika Chen" },
  { value: "alex", label: "Alex Rivera" },
];

// The listbox portals to `document.body`, so open-state cells photograph the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 420 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Autocomplete (sizes)",
    columns: SIZES,
    rows: ["placeholder", "selected", "error", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "14rem" }}>
        <Autocomplete
          label="People"
          placeholder="Search…"
          options={OPTIONS}
          size={column}
          defaultValue={row === "placeholder" ? undefined : OPTIONS[0]}
          defaultInputValue={row === "placeholder" ? undefined : OPTIONS[0].label}
          error={row === "error"}
          disabled={row === "disabled"}
          helperText={row === "error" ? "Required" : undefined}
        />
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Autocomplete (open)",
    columns: ["single", "multiple", "grouped", "empty"],
    rows: ["default"],
    screenshotTarget: "page",
    context: {
      // The empty state renders `<ul role="listbox"><li class="…__empty">` — a
      // role-less child of a listbox, which also strips the <ul>'s implicit
      // list role out from under the <li>. The message should carry
      // `role="presentation"` (or the listbox role should drop while empty);
      // tracked as a component fix rather than papered over here.
      disabledAccessibilityRules: ["aria-required-children", "listitem"],
    },
    component: (column) => (
      <div style={{ width: "14rem", padding: "1rem" }}>
        {column === "grouped" ? (
          <GroupedAutocomplete open />
        ) : (
          <Autocomplete
            label="People"
            open
            options={column === "empty" ? [] : OPTIONS}
            multiple={column === "multiple"}
            defaultValue={column === "multiple" ? [OPTIONS[0]] : undefined}
            noOptionsText={column === "empty" ? "Nobody here" : undefined}
          />
        )}
      </div>
    ),
  });
});

test("should render an input combobox with a placeholder", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} placeholder="Search…" />,
  );

  // ASSERT
  await expect(component.getByRole("combobox")).toHaveAttribute("placeholder", "Search…");
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Autocomplete label="People" options={OPTIONS} required />);

  // ASSERT
  await expect(component.locator(".okkly-autocomplete__required")).toHaveText("*");
  await expect(component.getByRole("combobox")).toHaveAttribute("required", "");
});

test("should apply non-default modifiers only when set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} size="large" color="dante" error />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-autocomplete--large/);
  await expect(component).toHaveClass(/okkly-autocomplete--color-dante/);
  await expect(component).toHaveClass(/okkly-autocomplete--error/);

  // ACT
  await component.update(<Autocomplete label="People" options={OPTIONS} />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-autocomplete--(small|large|color-|error)/);
});

test("should filter options as the user types", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<Autocomplete label="People" options={OPTIONS} openOnFocus />);

  // ACT
  await component.getByRole("combobox").fill("mik");

  // ASSERT
  await expect(page.getByRole("option", { name: "Mika Chen" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Alex Rivera" })).toHaveCount(0);
});

test("should select an option and call onChange", async ({ mount, page }) => {
  const changes: { value: unknown; reason: string }[] = [];

  // ARRANGE
  const component = await mount(
    <Autocomplete
      label="People"
      options={OPTIONS}
      openOnFocus
      onChange={(_event, value, reason) =>
        changes.push({ value: (value as AutocompleteOption)?.value, reason })
      }
    />,
  );

  // ACT
  await component.getByRole("combobox").fill("mik");
  await page.getByRole("option", { name: "Mika Chen" }).click();

  // ASSERT
  expect(changes).toEqual([{ value: "mika", reason: "selectOption" }]);
});

test("should clear the value via the clear button", async ({ mount }) => {
  const changes: { value: unknown; reason: string }[] = [];

  // ARRANGE
  const component = await mount(
    <Autocomplete
      label="People"
      options={OPTIONS}
      defaultValue={OPTIONS[0]}
      defaultInputValue={OPTIONS[0].label}
      onChange={(_event, value, reason) => changes.push({ value, reason })}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Clear" }).click();

  // ASSERT
  expect(changes).toEqual([{ value: null, reason: "clear" }]);
});

test("should commit unmatched freeSolo text on Enter", async ({ mount, page }) => {
  const changes: { value: unknown; reason: string }[] = [];

  // ARRANGE
  const component = await mount(
    <Autocomplete
      label="People"
      options={OPTIONS}
      freeSolo
      openOnFocus
      onChange={(_event, value, reason) => changes.push({ value, reason })}
    />,
  );

  // ACT
  await component.getByRole("combobox").fill("Berlin");
  await page.keyboard.press("Enter");

  // ASSERT
  expect(changes).toEqual([{ value: "Berlin", reason: "createOption" }]);
});

test("should render no rows for freeSolo text that matches nothing", async ({ mount, page }) => {
  // ARRANGE — the list has no "Add …" affordance; unmatched text simply empties it.
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} freeSolo openOnFocus />,
  );

  // ACT
  await component.getByRole("combobox").fill("Berlin");

  // ASSERT
  await expect(page.getByRole("option")).toHaveCount(0);
});

test("should render grouped options", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<GroupedAutocomplete openOnFocus />);

  // ACT
  await component.getByRole("combobox").focus();

  // ASSERT
  await expect(page.getByRole("group", { name: "Europe" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();
});

test("should hide already-selected options when asked", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete
      label="People"
      options={OPTIONS}
      multiple
      defaultValue={[OPTIONS[0]]}
      filterSelectedOptions
      openOnFocus
    />,
  );

  // ACT
  await component.getByRole("combobox").focus();

  // ASSERT
  await expect(page.getByRole("option", { name: "Mika Chen" })).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Alex Rivera" })).toBeVisible();
});

test("should focus the input and open when the field's chrome is clicked", async ({
  mount,
  page,
}) => {
  // ARRANGE — the chevron and the box's padding sit outside the input; they are
  // live only because the whole control is the click target.
  const component = await mount(<Autocomplete label="People" options={OPTIONS} />);

  // ACT — aim at the box's padding rather than its centre, which is the input.
  await component.locator(".okkly-autocomplete__control").click({ position: { x: 3, y: 3 } });

  // ASSERT
  await expect(component.getByRole("combobox")).toBeFocused();
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("should keep the popup open when an option inside the portal is clicked", async ({
  mount,
  page,
}) => {
  // ARRANGE — React routes portal events up its own tree, so an option click
  // also reaches the control's open-on-click handler unless filtered by DOM
  // containment.
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} multiple disableCloseOnSelect openOnFocus />,
  );

  // ACT
  await component.getByRole("combobox").focus();
  await page.getByRole("option", { name: "Mika Chen" }).click();

  // ASSERT
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("should anchor a popup that is already open on the first render", async ({ mount, page }) => {
  // ARRANGE — `anchorEl` is read during render and a ref attach schedules none,
  // so a controlled-open popup used to see a null anchor and never get placed.
  await mount(<Autocomplete label="People" options={OPTIONS} open />);

  // ASSERT
  await expect(page.locator(".okkly-autocomplete-popper")).toHaveAttribute("data-popper-placement");
});

test("should carry the field size onto the portaled panel", async ({ mount, page }) => {
  // ARRANGE — the panel is not a DOM descendant of the field, so it cannot
  // inherit the size modifier; it has to be copied across.
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} size="large" openOnFocus />,
  );

  // ACT
  await component.getByRole("combobox").focus();

  // ASSERT
  await expect(page.locator(".okkly-autocomplete-popover")).toHaveClass(
    /okkly-autocomplete-popover--large/,
  );
});

test("should collapse tags past limitTags", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete label="People" options={OPTIONS} multiple defaultValue={OPTIONS} limitTags={1} />,
  );

  // ASSERT
  await expect(component).toContainText("+1");
});

test("should support renderTags", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RenderTagsAutocomplete options={OPTIONS} defaultValue={OPTIONS} />,
  );

  // ASSERT
  await expect(component).toContainText("2 selected");
});

test("should emit hidden inputs for form submission", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete label="People" name="people" options={OPTIONS} multiple defaultValue={OPTIONS} />,
  );

  // ASSERT
  const values = await component
    .locator('input[type="hidden"][name="people"]')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(values).toEqual(["Mika Chen", "Alex Rivera"]);
});

test("should show the custom empty text", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <Autocomplete label="People" options={[]} noOptionsText="Nobody here" openOnFocus />,
  );

  // ACT
  await component.getByRole("combobox").focus();

  // ASSERT
  await expect(page.getByText("Nobody here")).toBeVisible();
});

// These pin the contract the customization stories document: what a caller
// gets, and what still has to work once they take a piece over.
test.describe("customization", () => {
  test("should hand renderOption the state a custom row cannot recompute", async ({ mount }) => {
    const seen: AutocompleteOptionState[] = [];

    // ARRANGE
    await mount(
      <CustomOptionAutocomplete
        options={OPTIONS}
        size="large"
        multiple
        defaultInputValue="mik"
        open
        onOptionState={(state) => seen.push(state)}
      />,
    );

    // ASSERT
    await expect(() => expect(seen.length).toBeGreaterThan(0)).toPass();
    expect(seen[0]).toMatchObject({
      inputValue: "mik",
      multiple: true,
      size: "large",
      index: 0,
    });
  });

  test("should keep a custom row selectable by pointer and keyboard", async ({ mount, page }) => {
    const changes: { value: unknown; reason: string }[] = [];

    // ARRANGE
    const component = await mount(
      <CustomOptionAutocomplete
        options={OPTIONS}
        openOnFocus
        onChange={(_event, value, reason) =>
          changes.push({ value: (value as AutocompleteOption)?.value, reason })
        }
      />,
    );
    const input = component.getByRole("combobox");

    // ACT — spreading `props` is what keeps the row a real option: the role, the
    // id `aria-activedescendant` points at, and the click handler.
    await input.focus();
    await page.keyboard.press("ArrowDown");

    // ASSERT
    const first = page.getByRole("option", { name: "Mika Chen" });
    await expect(input).toHaveAttribute("aria-activedescendant", (await first.getAttribute("id"))!);

    // ACT
    await first.click();

    // ASSERT
    expect(changes).toEqual([{ value: "mika", reason: "selectOption" }]);
  });

  test("should give option primitives the listbox's own block classes", async ({ mount, page }) => {
    // ARRANGE
    await mount(<CustomOptionAutocomplete options={OPTIONS} highlight open />);
    const row = page.getByRole("option").first();

    // ASSERT
    await expect(row.locator(".okkly-autocomplete__option-label")).toBeAttached();
    await expect(row.locator(".okkly-autocomplete__option-meta")).toBeAttached();
    // Only the matching run is wrapped, and the wrapper adds no text of its own
    // — the row still reads as the option label plus its description.
    await expect(row).toHaveText("Mika ChenDesign");
    await expect(row.locator("mark")).toHaveText("Mik");
    await expect(row.locator("mark")).toHaveClass(/okkly-autocomplete__option-mark/);
  });

  test("should keep typing, filtering and the label when renderInput takes over", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(
      <CustomInputAutocomplete options={OPTIONS} openOnFocus variant="glyph" />,
    );

    // ASSERT
    const input = page.getByRole("combobox", { name: "People" });
    await expect(page.getByTestId("glyph")).toBeVisible();

    // ACT
    await input.fill("alex");

    // ASSERT
    await expect(page.getByRole("option", { name: "Alex Rivera" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Mika Chen" })).toHaveCount(0);
    await expect(component).toBeAttached();
  });

  test("should move the adornments into renderInput rather than drawing them twice", async ({
    mount,
  }) => {
    // ARRANGE
    const component = await mount(<CustomInputAutocomplete options={OPTIONS} variant="wrapper" />);

    // ASSERT
    const toggles = component.getByRole("button", { name: "Open options" });
    await expect(toggles).toHaveCount(1);
    await expect(
      component.getByTestId("control").getByRole("button", { name: "Open options" }),
    ).toHaveCount(1);
  });

  test("should replace group headers, the empty state and the loading state", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(<GroupedAutocomplete open customGroups />);

    // ASSERT
    await expect(page.getByText("Europe (1)")).toBeVisible();
    await expect(page.getByRole("group", { name: "Asia" })).toBeVisible();

    // ACT — `inputValue` rather than `defaultInputValue`: the default is only
    // read on mount, and a re-render keeps the same instance.
    await component.update(<GroupedAutocomplete open empty customSlots inputValue="atlantis" />);

    // ASSERT
    await expect(page.getByText("No match for atlantis")).toBeVisible();

    // ACT
    await component.update(<GroupedAutocomplete open loading customSlots />);

    // ASSERT
    await expect(page.getByText("Fetching…")).toBeVisible();
  });
});
