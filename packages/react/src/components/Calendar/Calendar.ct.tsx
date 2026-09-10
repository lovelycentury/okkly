import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Calendar } from "./Calendar";
import type { CSSProperties } from "react";
import type { CalendarTone } from "./Calendar";

const TONES = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly CalendarTone[];

/**
 * January 2024: Jan 1 is a Monday, so a Monday-start week has zero leading days
 * and January's 31 days spill 4 trailing days into February — a deterministic
 * 5-row grid to assert against.
 */
const JANUARY_2024 = new Date(2024, 0, 1);

/**
 * Mirrors `calendarToneStyle` from Calendar.tsx. Spelled out here because a
 * component test's non-component imports are evaluated in Node, where the
 * component's SCSS import cannot resolve.
 */
const toneStyle = (tone: CalendarTone): CSSProperties | undefined =>
  tone === "primary"
    ? undefined
    : ({ "--okkly-calendar-tone": `var(--okkly-accent-${tone})` } as CSSProperties);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Calendar (tones)",
    columns: TONES,
    rows: ["single", "range"],
    fastNoIsolation: true,
    component: (column, row) =>
      row === "range" ? (
        <Calendar
          mode="range"
          month={JANUARY_2024}
          value={[new Date(2024, 0, 10), new Date(2024, 0, 18)]}
          style={toneStyle(column)}
        />
      ) : (
        <Calendar month={JANUARY_2024} value={new Date(2024, 0, 10)} style={toneStyle(column)} />
      ),
  });

  executeMatrixScreenshotTest({
    name: "Calendar (views)",
    columns: ["days", "years", "months"],
    rows: ["default"],
    hooks: {
      beforeEach: async (component, _page, column) => {
        if (column === "days") return;
        await component.getByRole("button", { name: /Choose year/ }).click();
        if (column === "months") {
          await component.getByRole("button", { name: "2024" }).click();
        }
      },
    },
    component: () => <Calendar month={JANUARY_2024} value={new Date(2024, 0, 10)} />,
  });

  executeMatrixScreenshotTest({
    name: "Calendar (bounds)",
    columns: ["unbounded", "bounded", "sunday-start"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <Calendar
        month={JANUARY_2024}
        weekStart={column === "sunday-start" ? "sun" : "mon"}
        min={column === "bounded" ? new Date(2024, 0, 5) : undefined}
        max={column === "bounded" ? new Date(2024, 0, 20) : undefined}
      />
    ),
  });
});

test("should render the visible month's title", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} />);

  // ASSERT
  await expect(component).toContainText("January 2024");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-calendar/);
});

test("should retint from the style prop rather than a color modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} style={toneStyle("dante")} />);

  // ASSERT
  expect(
    await component.evaluate((element) => element.style.getPropertyValue("--okkly-calendar-tone")),
  ).toBe("var(--okkly-accent-dante)");

  // ACT — the default tone sets nothing at all.
  await component.update(<Calendar month={JANUARY_2024} style={toneStyle("primary")} />);

  // ASSERT
  expect(
    await component.evaluate((element) => element.style.getPropertyValue("--okkly-calendar-tone")),
  ).toBe("");
});

test("should render Monday-start weekday labels by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} />);

  // ASSERT
  await expect(component.locator(".okkly-calendar__weekday")).toHaveText([
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
    "Su",
  ]);
});

test("should reorder weekday labels for a Sunday start", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} weekStart="sun" />);

  // ASSERT
  await expect(component.locator(".okkly-calendar__weekday")).toHaveText([
    "Su",
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
  ]);
});

test("should render a 5-week grid with trailing outside days", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} />);
  const days = component.locator(".okkly-calendar__day");

  // ASSERT
  await expect(days).toHaveCount(35);
  await expect(days.nth(0)).toHaveText("1");
  await expect(days.nth(0)).not.toHaveClass(/okkly-calendar__day--outside/);
  await expect(days.nth(34)).toHaveText("4");
  await expect(days.nth(34)).toHaveClass(/okkly-calendar__day--outside/);
});

test("should mark the selected date and report the clicked one", async ({ mount }) => {
  const picked: Date[] = [];

  // ARRANGE
  const component = await mount(
    <Calendar
      month={JANUARY_2024}
      value={new Date(2024, 0, 10)}
      onSelect={(value) => picked.push(value as Date)}
    />,
  );
  const selected = component.getByRole("button", { name: "10", exact: true });

  // ASSERT
  await expect(selected).toHaveClass(/okkly-calendar__day--selected/);
  await expect(selected).toHaveAttribute("aria-pressed", "true");

  // ACT
  await component.getByRole("button", { name: "15", exact: true }).click();

  // ASSERT
  expect(picked).toHaveLength(1);
  expect(picked[0]).toEqual(new Date(2024, 0, 15));
});

test("should disable dates outside min/max", async ({ mount }) => {
  const picked: Date[] = [];

  // ARRANGE
  const component = await mount(
    <Calendar
      month={JANUARY_2024}
      min={new Date(2024, 0, 5)}
      max={new Date(2024, 0, 20)}
      onSelect={(value) => picked.push(value as Date)}
    />,
  );
  // Jan 3 — Feb 3 also renders, as a trailing outside day.
  const tooEarly = component.getByRole("button", { name: "3", exact: true }).first();

  // ASSERT
  await expect(tooEarly).toBeDisabled();
  await expect(tooEarly).toHaveClass(/okkly-calendar__day--disabled/);

  // ACT
  await tooEarly.click({ force: true });

  // ASSERT
  expect(picked).toEqual([]);
  await expect(component.getByRole("button", { name: "10", exact: true })).toBeEnabled();
});

test("should render no availability-window tint or legend", async ({ mount }) => {
  // ARRANGE — removed outright: it was a 12% wash indistinguishable from a
  // selected range, so the two states could not be told apart.
  const component = await mount(<Calendar month={JANUARY_2024} value={new Date(2024, 0, 10)} />);

  // ASSERT
  await expect(component.locator(".okkly-calendar__legend")).toHaveCount(0);
  await expect(component.locator(".okkly-calendar__day--highlight")).toHaveCount(0);
});

test.describe("today", () => {
  test("should mark today's cell and render its dot", async ({ mount, page }) => {
    // ARRANGE — a real fixed clock in the browser, rather than jsdom fake timers.
    await page.clock.setFixedTime(new Date(2024, 0, 17, 12));
    const component = await mount(<Calendar month={JANUARY_2024} />);
    const today = component.getByRole("button", { name: "17", exact: true });

    // ASSERT
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveClass(/okkly-calendar__day--today/);
    await expect(today.locator(".okkly-calendar__day-dot")).toBeAttached();
    await expect(component.locator(".okkly-calendar__day-dot")).toHaveCount(1);
  });

  test("should keep the today modifier on a day that is also selected", async ({ mount, page }) => {
    // ARRANGE — the two are styled by declaration order, not by one replacing
    // the other, so both classes have to survive for that ordering to mean
    // anything.
    await page.clock.setFixedTime(new Date(2024, 0, 17, 12));
    const component = await mount(<Calendar month={JANUARY_2024} value={new Date(2024, 0, 17)} />);
    const today = component.getByRole("button", { name: "17", exact: true });

    // ASSERT
    await expect(today).toHaveClass(/okkly-calendar__day--today/);
    await expect(today).toHaveClass(/okkly-calendar__day--selected/);
  });
});

test.describe("month navigation", () => {
  test("should move month and report it via onMonthChange", async ({ mount }) => {
    const months: Date[] = [];

    // ARRANGE
    const component = await mount(
      <Calendar month={JANUARY_2024} onMonthChange={(value) => months.push(value)} />,
    );

    // ACT
    await component.getByRole("button", { name: "Next month" }).click();

    // ASSERT
    expect(months.at(-1)).toEqual(new Date(2024, 1, 1));

    // ACT
    await component.getByRole("button", { name: "Previous month" }).click();

    // ASSERT
    expect(months.at(-1)).toEqual(new Date(2023, 11, 1));
  });

  test("should navigate internally when uncontrolled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Calendar />);
    const title = component.locator(".okkly-calendar__title");
    const before = await title.textContent();

    // ACT
    await component.getByRole("button", { name: "Next month" }).click();

    // ASSERT
    await expect(title).not.toHaveText(before!);
  });

  test("should use custom accessible names for the nav buttons", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Calendar month={JANUARY_2024} previousMonthLabel="Prev" nextMonthLabel="Next" />,
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "Prev" })).toBeVisible();
    await expect(component.getByRole("button", { name: "Next" })).toBeVisible();
  });
});

test.describe("year / month views", () => {
  test("should open the year grid from the header label", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Calendar month={JANUARY_2024} />);

    // ACT
    await component.getByRole("button", { name: /Choose year, currently January 2024/ }).click();

    // ASSERT
    await expect(component).toContainText("2016–2027");
    await expect(component.getByRole("button", { name: "2024" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(component.locator(".okkly-calendar__weekday")).toHaveCount(0);
  });

  test("should drill year → month → day and report the picked month", async ({ mount }) => {
    const months: Date[] = [];

    // ARRANGE
    const component = await mount(
      <Calendar month={JANUARY_2024} onMonthChange={(value) => months.push(value)} />,
    );

    // ACT
    await component.getByRole("button", { name: /Choose year/ }).click();
    await component.getByRole("button", { name: "2025" }).click();

    // ASSERT — picking a year alone must not commit a month yet.
    await expect(
      component.getByRole("button", { name: /Choose year, currently 2025/ }),
    ).toBeVisible();
    await expect(component.getByRole("button", { name: "Jan" })).toBeVisible();
    expect(months).toEqual([]);

    // ACT
    await component.getByRole("button", { name: "Mar" }).click();

    // ASSERT — back on the day grid. The controlled `month` prop still shows
    // January until the parent re-supplies March; that hand-off is the caller's
    // job, same as the arrow nav.
    expect(months).toHaveLength(1);
    expect(months[0]).toEqual(new Date(2025, 2, 1));
    await expect(component.locator(".okkly-calendar__weekday").first()).toBeVisible();
    // Exact, or the header's own "…currently January 2024" would match too.
    await expect(component.getByRole("button", { name: "Jan", exact: true })).toHaveCount(0);
  });

  test("should land on the picked month when uncontrolled", async ({ mount, page }) => {
    // ARRANGE — pin the clock so the 12-year page is deterministic.
    await page.clock.setFixedTime(new Date(2024, 0, 17, 12));
    const component = await mount(<Calendar />);

    // ACT
    await component.getByRole("button", { name: /Choose year/ }).click();
    await component.getByRole("button", { name: "2025" }).click();
    await component.getByRole("button", { name: "Mar" }).click();

    // ASSERT
    await expect(component).toContainText("March 2025");
  });

  test("should page years twelve at a time, and one at a time in month view", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Calendar month={JANUARY_2024} />);

    // ACT
    await component.getByRole("button", { name: /Choose year/ }).click();
    await component.getByRole("button", { name: "Next years" }).click();

    // ASSERT
    await expect(component).toContainText("2028–2039");

    // ACT
    await component.getByRole("button", { name: "Previous years" }).click();

    // ASSERT
    await expect(component).toContainText("2016–2027");

    // ACT
    await component.getByRole("button", { name: "2024" }).click();
    await component.getByRole("button", { name: "Next year" }).click();

    // ASSERT
    await expect(
      component.getByRole("button", { name: /Choose year, currently 2025/ }),
    ).toBeVisible();
  });

  test("should disable years and months outside min/max", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Calendar month={JANUARY_2024} min={new Date(2024, 2, 1)} max={new Date(2025, 5, 30)} />,
    );

    // ACT
    await component.getByRole("button", { name: /Choose year/ }).click();

    // ASSERT
    await expect(component.getByRole("button", { name: "2023" })).toBeDisabled();
    await expect(component.getByRole("button", { name: "2026" })).toBeDisabled();
    await expect(component.getByRole("button", { name: "2024" })).toBeEnabled();

    // ACT
    await component.getByRole("button", { name: "2024" }).click();

    // ASSERT
    await expect(component.getByRole("button", { name: "Jan" })).toBeDisabled();
    await expect(component.getByRole("button", { name: "Feb" })).toBeDisabled();
    await expect(component.getByRole("button", { name: "Mar" })).toBeEnabled();
  });

  test("should swap the day grid out entirely while browsing year/month views", async ({
    mount,
  }) => {
    // ARRANGE
    const component = await mount(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
      />,
    );

    // ASSERT
    await expect(component.locator(".okkly-calendar__grid")).toBeAttached();

    // ACT
    await component.getByRole("button", { name: /Choose year/ }).click();

    // ASSERT
    await expect(component.locator(".okkly-calendar__grid")).toHaveCount(0);
    await expect(component.locator(".okkly-calendar__day--in-range")).toHaveCount(0);
  });
});

test("should render no shortcut chips column", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Calendar month={JANUARY_2024} value={new Date(2024, 0, 10)} />);

  // ASSERT
  await expect(component.locator(".okkly-calendar__chips")).toHaveCount(0);
  await expect(component.locator(".okkly-chip")).toHaveCount(0);
});

test.describe("range mode", () => {
  test("should mark both ends and the days between them", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
      />,
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "10", exact: true })).toHaveClass(
      /okkly-calendar__day--range-start/,
    );
    await expect(component.getByRole("button", { name: "14", exact: true })).toHaveClass(
      /okkly-calendar__day--range-end/,
    );
    await expect(component.getByRole("button", { name: "12", exact: true })).toHaveClass(
      /okkly-calendar__day--in-range/,
    );
    // The ends carry their own modifier and must not also be tinted as interior.
    await expect(component.getByRole("button", { name: "10", exact: true })).not.toHaveClass(
      /okkly-calendar__day--in-range/,
    );
    await expect(component.getByRole("button", { name: "9", exact: true })).not.toHaveClass(
      /okkly-calendar__day--in-range/,
    );
  });

  test("should paint adjacent-month days in range without making them an end", async ({
    mount,
  }) => {
    // ARRANGE — the bug this replaces: the end marker was the *last highlighted
    // cell in the DOM*, so a trailing day of the next month became a third solid
    // date. January 2024 (Monday start) trails Feb 1–4 as outside days.
    const component = await mount(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 29), new Date(2024, 1, 8)]}
      />,
    );
    const trailing = component.locator(".okkly-calendar__day--outside");

    // ASSERT
    await expect(trailing).toHaveCount(4);
    for (const cell of await trailing.all()) {
      await expect(cell).toHaveClass(/okkly-calendar__day--in-range/);
      await expect(cell).not.toHaveClass(/okkly-calendar__day--range-end/);
    }
    // Exactly one start and no end at all: Feb 8 is not in this month's grid.
    await expect(component.locator(".okkly-calendar__day--range-start")).toHaveCount(1);
    await expect(component.locator(".okkly-calendar__day--range-end")).toHaveCount(0);
  });

  test("should commit on the second click and order the pair", async ({ mount }) => {
    const picked: [Date, Date][] = [];

    // ARRANGE
    const component = await mount(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        onSelect={(value) => picked.push(value as [Date, Date])}
      />,
    );

    // ACT
    await component.getByRole("button", { name: "20", exact: true }).click();

    // ASSERT — the armed start shows immediately, so the click is not silently
    // swallowed.
    expect(picked).toEqual([]);
    await expect(component.getByRole("button", { name: "20", exact: true })).toHaveClass(
      /okkly-calendar__day--range-start/,
    );

    // ACT
    await component.getByRole("button", { name: "12", exact: true }).click();

    // ASSERT
    expect(picked).toHaveLength(1);
    expect(picked[0]).toEqual([new Date(2024, 0, 12), new Date(2024, 0, 20)]);
  });

  test("should start a fresh range on the click after a committed one", async ({ mount }) => {
    const picked: [Date, Date][] = [];
    const onSelect = (value: unknown) => picked.push(value as [Date, Date]);

    // ARRANGE
    const component = await mount(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
        onSelect={onSelect}
      />,
    );

    // ACT
    await component.getByRole("button", { name: "20", exact: true }).click();

    // ASSERT — the old pair stops rendering the moment a new start is armed.
    expect(picked).toEqual([]);
    await expect(component.getByRole("button", { name: "12", exact: true })).not.toHaveClass(
      /okkly-calendar__day--in-range/,
    );

    // ACT
    await component.getByRole("button", { name: "25", exact: true }).click();

    // ASSERT
    expect(picked[0]).toEqual([new Date(2024, 0, 20), new Date(2024, 0, 25)]);

    // ACT
    await component.update(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 20), new Date(2024, 0, 25)]}
        onSelect={onSelect}
      />,
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "22", exact: true })).toHaveClass(
      /okkly-calendar__day--in-range/,
    );
  });

  test("should use the single-date modifier only in single mode", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Calendar month={JANUARY_2024} value={new Date(2024, 0, 10)} />);

    // ASSERT
    await expect(component.locator(".okkly-calendar__day--selected")).toHaveCount(1);

    // ACT
    await component.update(
      <Calendar
        mode="range"
        month={JANUARY_2024}
        value={[new Date(2024, 0, 10), new Date(2024, 0, 14)]}
      />,
    );

    // ASSERT
    await expect(component.locator(".okkly-calendar__day--selected")).toHaveCount(0);
  });
});
