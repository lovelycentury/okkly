import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the default wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("okkly")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<Logo label="Acme Inc." />);
    expect(screen.getByText("Acme Inc.")).toBeInTheDocument();
  });

  it("applies the default classes (horizontal layout, mint tone)", () => {
    const { container } = render(<Logo />);
    const logo = container.querySelector(".okkly-logo");
    expect(logo).toHaveClass("okkly-component", "okkly-logo");
    expect(logo?.className).not.toMatch(/okkly-logo--(compact|stacked)/);
    expect(logo?.className).not.toMatch(/okkly-logo--tone-/);
  });

  it("applies a layout modifier only for non-horizontal layouts", () => {
    const { rerender, container } = render(<Logo layout="compact" />);
    expect(container.querySelector(".okkly-logo")).toHaveClass("okkly-logo--compact");

    rerender(<Logo layout="horizontal" />);
    expect(container.querySelector(".okkly-logo")?.className).not.toMatch(
      /okkly-logo--(compact|stacked)/,
    );
  });

  it("applies a tone modifier only for non-multi tones", () => {
    const { rerender, container } = render(<Logo tone="dante" />);
    expect(container.querySelector(".okkly-logo")).toHaveClass("okkly-logo--tone-dante");

    rerender(<Logo tone="mint" />);
    expect(container.querySelector(".okkly-logo")).toHaveClass("okkly-logo--tone-mint");

    rerender(<Logo tone="multi" />);
    expect(container.querySelector(".okkly-logo")?.className).not.toMatch(/okkly-logo--tone-/);
  });

  it("applies a variant modifier only for non-filled variants", () => {
    const { rerender, container } = render(<Logo variant="outlined" />);
    expect(container.querySelector(".okkly-logo")).toHaveClass("okkly-logo--outlined");

    rerender(<Logo variant="pure" />);
    expect(container.querySelector(".okkly-logo")).toHaveClass("okkly-logo--pure");

    rerender(<Logo variant="filled" />);
    expect(container.querySelector(".okkly-logo")?.className).not.toMatch(
      /okkly-logo--(filled|outlined|pure)/,
    );
  });

  it("crops the viewBox to the glyph for the pure variant", () => {
    const { container } = render(<Logo variant="pure" />);
    const svg = container.querySelector(".okkly-logo__emblem");
    expect(svg).toHaveAttribute("viewBox", "18.28125 19.125 37.125 37.125");
  });

  it("drops the gradient for flat tones", () => {
    const { container } = render(<Logo tone="dante" />);
    expect(container.querySelector("linearGradient")).toBeNull();
  });

  it("hides the wordmark when showLabel is false", () => {
    render(<Logo showLabel={false} />);
    expect(screen.queryByText("okkly")).not.toBeInTheDocument();
  });

  it("renders the emblem svg", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector(".okkly-logo__emblem")).toBeInTheDocument();
  });

  it("overrides the emblem size via the size prop", () => {
    const { container } = render(<Logo size={80} />);
    const logo = container.querySelector(".okkly-logo") as HTMLElement;
    expect(logo.style.getPropertyValue("--okkly-logo-emblem-size")).toBe("80px");
  });

  it("accepts a string size", () => {
    const { container } = render(<Logo size="4rem" />);
    const logo = container.querySelector(".okkly-logo") as HTMLElement;
    expect(logo.style.getPropertyValue("--okkly-logo-emblem-size")).toBe("4rem");
  });

  it("uses unique gradient ids across multiple instances", () => {
    const { container } = render(
      <>
        <Logo />
        <Logo />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("linearGradient")).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Logo ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
