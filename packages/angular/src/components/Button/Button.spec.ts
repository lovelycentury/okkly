import { Component, signal } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OkklyButton, OkklyButtonEndIcon, OkklyButtonStartIcon } from "./Button";
import type {
  ButtonColor,
  ButtonLoadingPosition,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from "./Button";

// State is held in signals rather than plain fields: this package is zoneless,
// so nothing else would mark the host dirty between `detectChanges()` calls.
@Component({
  imports: [OkklyButton, OkklyButtonStartIcon, OkklyButtonEndIcon],
  template: `
    <button
      okklyButton
      [variant]="variant()"
      [color]="color()"
      [shape]="shape()"
      [size]="size()"
      [fullWidth]="fullWidth()"
      [loading]="loading()"
      [loadingPosition]="loadingPosition()"
      [disabled]="disabled()"
      (click)="onClick()"
    >
      @if (withIcons()) {
        <span okklyButtonStartIcon data-testid="start-icon"></span>
        <span okklyButtonEndIcon data-testid="end-icon"></span>
      }
      Click me
    </button>
  `,
})
class Host {
  readonly variant = signal<ButtonVariant>("primary");
  readonly color = signal<ButtonColor>("primary");
  readonly shape = signal<ButtonShape>("pill");
  readonly size = signal<ButtonSize>("medium");
  readonly fullWidth = signal(false);
  readonly loading = signal(false);
  readonly loadingPosition = signal<ButtonLoadingPosition>("center");
  readonly disabled = signal(false);
  readonly withIcons = signal(false);
  readonly onClick = vi.fn();
}

describe("OkklyButton", () => {
  let fixture: ComponentFixture<Host>;

  const button = () => fixture.nativeElement.querySelector("button") as HTMLButtonElement;
  const iconSlots = () => [...button().querySelectorAll<HTMLElement>(".okkly-button__icon")];
  const render = (patch: (host: Host) => void = () => {}) => {
    patch(fixture.componentInstance);
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    render();
  });

  it("renders its label", () => {
    expect(button().textContent?.trim()).toBe("Click me");
  });

  it("applies the default classes (primary variant, pill shape, medium size)", () => {
    expect(button().className).toContain("okkly-component");
    expect(button().className).toContain("okkly-button");
    expect(button().className).toContain("okkly-button--primary");
    expect(button().className).not.toMatch(/okkly-button--color-/);
    expect(button().className).not.toMatch(/okkly-button--(small|large)/);
    expect(button().className).not.toContain("okkly-button--rounded");
  });

  it("applies the variant modifier", () => {
    render((host) => host.variant.set("ghost"));
    expect(button().className).toContain("okkly-button--ghost");
  });

  it("applies a color modifier only for non-default colors", () => {
    render((host) => host.color.set("dante"));
    expect(button().className).toContain("okkly-button--color-dante");

    render((host) => host.color.set("primary"));
    expect(button().className).not.toMatch(/okkly-button--color-/);
  });

  it("applies a size modifier only for non-medium sizes", () => {
    render((host) => host.size.set("small"));
    expect(button().className).toContain("okkly-button--small");

    render((host) => host.size.set("medium"));
    expect(button().className).not.toMatch(/okkly-button--(small|large)/);
  });

  it("applies the rounded shape modifier", () => {
    render((host) => host.shape.set("rounded"));
    expect(button().className).toContain("okkly-button--rounded");
  });

  it("applies the full-width modifier", () => {
    render((host) => host.fullWidth.set(true));
    expect(button().className).toContain("okkly-button--full-width");
  });

  it("collapses the icon slots until something is projected into them", () => {
    expect(iconSlots().every((slot) => slot.style.display === "none")).toBe(true);

    render((host) => host.withIcons.set(true));
    expect(button().querySelector("[data-testid='start-icon']")).not.toBeNull();
    expect(button().querySelector("[data-testid='end-icon']")).not.toBeNull();
    expect(iconSlots().some((slot) => slot.style.display === "none")).toBe(false);
  });

  it("fires click", () => {
    button().click();
    expect(fixture.componentInstance.onClick).toHaveBeenCalledOnce();
  });

  it("disables the native button and swallows clicks", () => {
    render((host) => host.disabled.set(true));
    expect(button().disabled).toBe(true);

    button().click();
    expect(fixture.componentInstance.onClick).not.toHaveBeenCalled();
  });

  it("shows the spinner and hides the label while loading in the center", () => {
    render((host) => host.loading.set(true));
    expect(button().disabled).toBe(true);
    expect(button().querySelector(".okkly-button__spinner")).not.toBeNull();
    expect(button().querySelector(".okkly-button__label--hidden")).not.toBeNull();
  });

  it("replaces the start icon with the spinner when loading from the start", () => {
    render((host) => {
      host.withIcons.set(true);
      host.loading.set(true);
      host.loadingPosition.set("start");
    });
    const [start, end] = iconSlots();
    expect(start.style.display).toBe("none");
    expect(end.style.display).not.toBe("none");
    expect(button().querySelector(".okkly-button__label--hidden")).toBeNull();
  });

  it("paints a ripple on pointer down and clears it on release", () => {
    button().dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: 4 }));
    const ripple = button().querySelector(".okkly-ripple__element");
    expect(ripple).not.toBeNull();

    ripple?.dispatchEvent(new Event("animationend"));
    button().dispatchEvent(new MouseEvent("pointerup"));
    expect(button().querySelector(".okkly-ripple__element")).toBeNull();
  });

  it("does not ripple while disabled", () => {
    render((host) => host.disabled.set(true));
    button().dispatchEvent(new MouseEvent("pointerdown", { clientX: 4, clientY: 4 }));
    expect(button().querySelector(".okkly-ripple__element")).toBeNull();
  });
});
