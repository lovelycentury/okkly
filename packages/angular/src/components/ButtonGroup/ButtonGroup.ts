import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";

export type ButtonGroupColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type ButtonGroupVariant = "primary" | "secondary";

/**
 * The main action — React's `action`. Put it on the `<button>` that fires the
 * one-click default; bind `(click)` on it as usual. It is disabled with the
 * group.
 */
@Directive({
  selector: "button[okklyButtonGroupAction]",
  host: {
    class: "okkly-button-group__segment",
    type: "button",
    "[disabled]": "group.disabled() || disabled()",
  },
})
export class OkklyButtonGroupAction {
  /**
   * Disables this action on its own, where React's `action.disabled` would.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(OkklyButtonGroup);
}

/** Marks the icon inside the main action — React's `action.icon`. */
@Directive({
  selector: "[okklyButtonGroupIcon]",
  host: { class: "okkly-button-group__icon", "aria-hidden": "true" },
})
export class OkklyButtonGroupIcon {}

/**
 * One entry of the chevron's menu — React's `menu[i]`. Put it on a `<button>`
 * and bind `(click)`; picking it also closes the menu and returns focus to the
 * chevron.
 */
@Directive({
  selector: "button[okklyButtonGroupMenuItem]",
  host: {
    class: "okkly-button-group__menu-item",
    type: "button",
    role: "menuitem",
    "(click)": "group.closeAndFocusChevron()",
  },
})
export class OkklyButtonGroupMenuItem {
  protected readonly group = inject(OkklyButtonGroup);
}

/**
 * A split button: one main action plus a chevron menu of variants of that same
 * action. Inputs mirror `@okkly/react`'s `<ButtonGroup>` — `variant`, `color`,
 * `disabled`, `menuAriaLabel` — which folds MUI's split-button recipe into one
 * component.
 *
 * Deliberate gaps: React takes `action` and `menu` as data with `onClick`
 * callbacks and `ReactNode` labels. Angular composes them like Angular
 * Material's `mat-menu` instead: a `<button okklyButtonGroupAction>` and any
 * number of `<button okklyButtonGroupMenuItem>`, each with its own `(click)`.
 * The chevron appears once at least one menu item is projected.
 */
@Component({
  selector: "okkly-button-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-button-group",
    "[class]": "modifiers()",
    "(document:mousedown)": "onDocumentPointerDown($event)",
  },
  templateUrl: "./ButtonGroup.html",
})
export class OkklyButtonGroup {
  /**
   * Fill treatment.
   *
   * @default "primary"
   */
  readonly variant = input<ButtonGroupVariant>("primary");
  /**
   * Tone colour.
   *
   * @default "primary"
   */
  readonly color = input<ButtonGroupColor>("primary");
  /**
   * Disables the whole split button.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Accessible name for the chevron toggle.
   *
   * @default "Open menu"
   */
  readonly menuAriaLabel = input("Open menu");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuItems = contentChildren(OkklyButtonGroupMenuItem);
  private readonly chevron = viewChild<ElementRef<HTMLButtonElement>>("chevron");

  protected readonly open = signal(false);
  protected readonly hasMenu = computed(() => this.menuItems().length > 0);

  protected readonly modifiers = computed(() =>
    [
      this.variant() === "secondary" && "okkly-button-group--secondary",
      this.color() !== "primary" && `okkly-button-group--color-${this.color()}`,
      this.disabled() && "okkly-button-group--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  /** Closes the menu and puts focus back on the chevron that opened it. */
  closeAndFocusChevron(): void {
    this.open.set(false);
    this.chevron()?.nativeElement.focus();
  }

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  // Host listeners hand back a bare `Event`; nothing below needs more than that.
  protected onChevronKeydown(event: Event): void {
    if ((event as KeyboardEvent).key !== "Escape" || !this.open()) return;
    event.preventDefault();
    this.open.set(false);
  }

  protected onDocumentPointerDown(event: Event): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
