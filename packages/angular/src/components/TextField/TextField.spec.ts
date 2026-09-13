import { Component, signal } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import {
  OkklyTextField,
  OkklyTextFieldEndAdornment,
  OkklyTextFieldStartAdornment,
} from "./TextField";
import type { TextFieldColor, TextFieldSize } from "./TextField";

// State is held in signals rather than plain fields: this package is zoneless,
// so nothing else would mark the host dirty between `detectChanges()` calls.
@Component({
  imports: [OkklyTextField],
  template: `
    <okkly-text-field
      [label]="label()"
      [hideLabel]="hideLabel()"
      [size]="size()"
      [color]="color()"
      [error]="error()"
      [helperText]="helperText()"
      [fullWidth]="fullWidth()"
      [disabled]="disabled()"
      [required]="required()"
      [(value)]="value"
    />
  `,
})
class Host {
  readonly label = signal<string | undefined>("Email");
  readonly hideLabel = signal(false);
  readonly size = signal<TextFieldSize>("medium");
  readonly color = signal<TextFieldColor>("primary");
  readonly error = signal(false);
  readonly helperText = signal<string | undefined>(undefined);
  readonly fullWidth = signal(false);
  readonly disabled = signal(false);
  readonly required = signal(false);
  readonly value = signal("");
}

// Adornments are declared statically here, never toggled after creation: a
// nested-forwarding limitation in Angular's content projection can drop
// dynamically-added siblings that route to different projected slots (see
// the doc comment on `OkklyTextField`).
@Component({
  imports: [OkklyTextField, OkklyTextFieldStartAdornment, OkklyTextFieldEndAdornment],
  template: `
    <okkly-text-field label="Amount">
      <span okklyTextFieldStartAdornment data-testid="start-adornment">$</span>
      <span okklyTextFieldEndAdornment data-testid="end-adornment">USD</span>
    </okkly-text-field>
  `,
})
class HostWithAdornments {}

describe("OkklyTextField", () => {
  let fixture: ComponentFixture<Host>;

  const field = () => fixture.nativeElement.querySelector(".okkly-text-field") as HTMLElement;
  const label = () => field().querySelector("label") as HTMLLabelElement | null;
  const input = () => field().querySelector("input") as HTMLInputElement;
  const render = (patch: (host: Host) => void = () => {}) => {
    patch(fixture.componentInstance);
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    render();
  });

  it("renders a labeled input linked by for/id", () => {
    expect(label()?.getAttribute("for")).toBe(input().id);
    expect(label()?.textContent?.trim()).toContain("Email");
  });

  it("visually hides the label but keeps it in the DOM", () => {
    render((host) => host.hideLabel.set(true));
    expect(label()?.className).toContain("okkly-text-field__label--hidden");
  });

  it("applies a size modifier only for non-medium sizes", () => {
    render((host) => host.size.set("small"));
    expect(field().className).toContain("okkly-text-field--small");

    render((host) => host.size.set("medium"));
    expect(field().className).not.toMatch(/okkly-text-field--(small|large)/);
  });

  it("applies a color modifier only for non-primary colors", () => {
    render((host) => host.color.set("dante"));
    expect(field().className).toContain("okkly-text-field--color-dante");

    render((host) => host.color.set("primary"));
    expect(field().className).not.toMatch(/okkly-text-field--color-/);
  });

  it("applies the error modifier and marks aria-invalid", () => {
    render((host) => host.error.set(true));
    expect(field().className).toContain("okkly-text-field--error");
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });

  it("applies the full-width modifier", () => {
    render((host) => host.fullWidth.set(true));
    expect(field().className).toContain("okkly-text-field--full-width");
  });

  it("renders helperText and links it via aria-describedby", () => {
    render((host) => host.helperText.set("We'll never share it"));
    const describedBy = input().getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(field().querySelector(`#${describedBy}`)?.textContent).toBe("We'll never share it");
  });

  it("disables the input", () => {
    render((host) => host.disabled.set(true));
    expect(input().disabled).toBe(true);
  });

  it("shows a required asterisk after the label and marks the input required", () => {
    render((host) => host.required.set(true));
    expect(field().querySelector(".okkly-text-field__required")?.textContent).toBe("*");
    expect(input().required).toBe(true);
  });

  it("updates the value model as the user types", () => {
    input().value = "abc";
    input().dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe("abc");
  });

  it("does not render an adornment slot when nothing is projected into it", () => {
    expect(field().querySelectorAll(".okkly-text-field__adornment")).toHaveLength(0);
  });

  it("renders projected start and end adornments inside the border", () => {
    const adornmentsFixture = TestBed.createComponent(HostWithAdornments);
    adornmentsFixture.detectChanges();
    const adornmentsField = adornmentsFixture.nativeElement.querySelector(
      ".okkly-text-field",
    ) as HTMLElement;

    const adornments = adornmentsField.querySelectorAll(".okkly-text-field__adornment");
    expect(adornments).toHaveLength(2);
    expect(adornmentsField.querySelector("[data-testid='start-adornment']")?.textContent).toBe("$");
    expect(adornmentsField.querySelector("[data-testid='end-adornment']")?.textContent).toBe("USD");
  });
});
