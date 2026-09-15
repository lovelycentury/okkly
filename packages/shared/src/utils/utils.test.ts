import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bem } from "./bem";
import { clamp, uniqueId } from "./dom";
import { debounce } from "./timing";

describe("bem", () => {
  it("should build the block, element and modifier classes", () => {
    // ARRANGE
    const button = bem("okkly-button");

    // ASSERT
    expect(button()).toBe("okkly-button");
    expect(button("label")).toBe("okkly-button__label");
    expect(button(null, "primary", false, "large")).toBe(
      "okkly-button okkly-button--primary okkly-button--large",
    );
    expect(button("icon", "disabled")).toBe("okkly-button__icon okkly-button__icon--disabled");
  });
});

describe("clamp", () => {
  it("should keep a value within its bounds", () => {
    // ASSERT
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
  });
});

describe("uniqueId", () => {
  it("should hand out a new id on every call, prefixed", () => {
    // ACT
    const first = uniqueId("field");
    const second = uniqueId("field");

    // ASSERT
    expect(first).toMatch(/^field-\d+$/);
    expect(second).not.toBe(first);
    expect(uniqueId()).toMatch(/^okkly-\d+$/);
  });
});

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("should call once, with the last arguments, after the calls stop for `wait` ms", () => {
    // ARRANGE
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    // ACT
    debounced(1);
    vi.advanceTimersByTime(50);
    debounced(2);
    vi.advanceTimersByTime(99);

    // ASSERT
    expect(fn).not.toHaveBeenCalled();

    // ACT
    vi.advanceTimersByTime(1);

    // ASSERT
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(2);
  });
});
