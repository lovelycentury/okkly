import { describe, expect, it } from "vitest";
import { BOX_SYSTEM_PROPS, resolveBoxSystemProps } from "./box";

describe("resolveBoxSystemProps", () => {
  it("should step numeric spacing on the 4px scale", () => {
    // ACT
    const { className, style } = resolveBoxSystemProps({ p: 2, mt: -1 });

    // ASSERT
    expect(className).toBe("okkly-box--p okkly-box--mt");
    expect(style).toEqual({
      "--okkly-box-p": "calc(2 * var(--okkly-space-unit))",
      "--okkly-box-mt": "calc(-1 * var(--okkly-space-unit))",
    });
  });

  it("should pass strings through as CSS", () => {
    // ACT
    const { style } = resolveBoxSystemProps({ m: "auto", width: "50vw", border: "1px dashed red" });

    // ASSERT
    expect(style).toEqual({
      "--okkly-box-m": "auto",
      "--okkly-box-width": "50vw",
      "--okkly-box-border": "1px dashed red",
    });
  });

  it("should read a size up to 1 as a percentage and anything larger as pixels", () => {
    // ACT
    const { style } = resolveBoxSystemProps({ width: 0.5, height: 1, maxWidth: 320, minHeight: 0 });

    // ASSERT
    expect(style).toEqual({
      "--okkly-box-width": "50%",
      "--okkly-box-height": "100%",
      "--okkly-box-max-width": "320px",
      "--okkly-box-min-height": "0px",
    });
  });

  it("should resolve color token paths and leave other colors alone", () => {
    // ACT
    const { style } = resolveBoxSystemProps({
      bgcolor: "bg.surface-raised",
      color: "text.secondary",
      borderColor: "#ff0000",
    });

    // ASSERT
    expect(style).toEqual({
      "--okkly-box-bgcolor": "var(--okkly-bg-surface-raised)",
      "--okkly-box-color": "var(--okkly-text-secondary)",
      "--okkly-box-border-color": "#ff0000",
    });
  });

  it("should not read a dotted string from an unknown group as a token", () => {
    // ACT
    const { style } = resolveBoxSystemProps({ color: "primary.main" });

    // ASSERT
    expect(style).toEqual({ "--okkly-box-color": "primary.main" });
  });

  it("should draw a numeric border in the default border color", () => {
    // ACT
    const { style } = resolveBoxSystemProps({ border: 2, borderRadius: 3 });

    // ASSERT
    expect(style).toEqual({
      "--okkly-box-border": "2px solid var(--okkly-border-default)",
      "--okkly-box-border-radius": "calc(3 * var(--okkly-space-unit))",
    });
  });

  it("should give every breakpoint of a responsive value its own class and variable", () => {
    // ACT
    const { className, style } = resolveBoxSystemProps({
      flexDirection: { base: "column", md: "row" },
      gap: { "2xs": 1, xl: 4 },
    });

    // ASSERT
    expect(className.split(" ")).toEqual([
      "okkly-box--flex-direction",
      "okkly-box--flex-direction-md",
      "okkly-box--gap-2xs",
      "okkly-box--gap-xl",
    ]);
    expect(style).toEqual({
      "--okkly-box-flex-direction": "column",
      "--okkly-box-flex-direction-md": "row",
      "--okkly-box-gap-2xs": "calc(1 * var(--okkly-space-unit))",
      "--okkly-box-gap-xl": "calc(4 * var(--okkly-space-unit))",
    });
  });

  it("should skip unset values and unknown breakpoints", () => {
    // ACT
    const { className, style } = resolveBoxSystemProps({
      p: undefined,
      m: { base: undefined, huge: 4 } as never,
    });

    // ASSERT
    expect(className).toBe("");
    expect(style).toEqual({});
  });

  it("should keep zero, which is a real value", () => {
    // ACT
    const { className } = resolveBoxSystemProps({ m: 0, flexShrink: 0 });

    // ASSERT
    expect(className).toBe("okkly-box--m okkly-box--flex-shrink");
  });

  it("should hand back everything that is not a system prop", () => {
    // ACT
    const { rest } = resolveBoxSystemProps({ p: 2, id: "box", "aria-label": "Box", toString: 1 });

    // ASSERT
    expect(rest).toEqual({ id: "box", "aria-label": "Box", toString: 1 });
  });

  it("should name every class after the kebab-cased prop", () => {
    // ACT
    const names = Object.keys(BOX_SYSTEM_PROPS).map(
      (prop) => resolveBoxSystemProps({ [prop]: "x" }).className,
    );

    // ASSERT — the class names the Box stylesheet's `$props` map generates
    expect(names).toContain("okkly-box--row-gap");
    expect(names).toContain("okkly-box--justify-content");
    expect(names).toContain("okkly-box--bgcolor");
    expect(names).toContain("okkly-box--border-radius");
    expect(names).toHaveLength(37);
  });

  it("should give container-query keys a -cq- suffix", () => {
    // ACT
    const { className, style } = resolveBoxSystemProps({
      flexDirection: { base: "column", md: "row", "@sm": "row-reverse" },
    });

    // ASSERT
    expect(className.split(" ")).toEqual([
      "okkly-box--flex-direction",
      "okkly-box--flex-direction-md",
      "okkly-box--flex-direction-cq-sm",
    ]);
    expect(style["--okkly-box-flex-direction-cq-sm"]).toBe("row-reverse");
  });

  it("should skip container keys outside the container scale", () => {
    // ACT — `2xs` exists on the viewport scale only
    const { className } = resolveBoxSystemProps({ p: { "@2xs": 1, "@huge": 2 } as never });

    // ASSERT
    expect(className).toBe("");
  });

  it("should turn `container` into a class and keep it off the element", () => {
    // ACT
    const on = resolveBoxSystemProps({ container: true, id: "box" });
    const off = resolveBoxSystemProps({ container: false });

    // ASSERT
    expect(on.className).toBe("okkly-box--container");
    expect(on.rest).toEqual({ id: "box" });
    expect(off.className).toBe("");
  });
});
