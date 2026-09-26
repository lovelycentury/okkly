import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import type { OverlayCloseEvent } from "../../types";
import { OkklyPopover } from "../Popover/Popover";

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
  /** The item's `<button>`, for the menu's keyboard navigation. */
  readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

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
 *
 * The menu opens in an `OkklyPopover` — portalled, flipped when there is no
 * room below, and grown in with its Grow transition — where React renders it
 * in place. Because it then sits at the end of the page, it behaves like
 * `mat-menu` from the keyboard: opening focuses the first item, the arrow keys
 * move between items, and Escape or Tab closes it and returns focus to the
 * chevron.
 */
@Component({
  selector: "okkly-button-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyPopover],
  host: {
    class: "okkly-component okkly-button-group",
    "[class]": "modifiers()",
  },
  templateUrl: "./ButtonGroup.html",
  // The design system draws the menu as an absolutely positioned child of the
  // group. Here it lives in a Popover instead, so the paper takes on the
  // look of `.okkly-button-group__menu` and a plain list holds the items.
  styles: `
    .okkly-button-group__menu-paper {
      --okkly-popover-padding: 0.5rem;
      --okkly-popover-border-radius: 1.25rem;
      --okkly-popover-shadow: none;
      width: 13.125rem;
      filter: drop-shadow(0 1.75rem 2rem rgba(0, 0, 0, 0.45));
    }

    .okkly-button-group__menu-list {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
  `,
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
  /**
   * Renders the menu in place instead of in `document.body`, as
   * `OkklyPopover`'s own `disablePortal` does.
   *
   * @default false
   */
  readonly disablePortal = input(false, { transform: booleanAttribute });

  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
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

  constructor() {
    // The menu is portalled to the end of the page, so Tab from the chevron
    // would never reach it; like `mat-menu`, opening moves focus into it.
    afterRenderEffect(() => {
      if (this.open()) untracked(() => this.enabledItems()[0]?.focus());
    });
  }

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
    const { key } = event as KeyboardEvent;
    // Escape is also handled here, not only by the Popover: its document
    // listener is attached in an effect, a tick after the menu opens.
    if (key === "Escape" && this.open()) {
      event.preventDefault();
      this.closeAndFocusChevron();
    } else if (key === "ArrowDown" && !this.open()) {
      event.preventDefault();
      this.open.set(true);
    }
  }

  protected onPopoverClose({ reason }: OverlayCloseEvent): void {
    if (reason === "escapeKeyDown") this.closeAndFocusChevron();
    else this.open.set(false);
  }

  protected onMenuKeydown(event: Event): void {
    const { key } = event as KeyboardEvent;
    if (key === "Tab" || key === "Escape") {
      event.preventDefault();
      this.closeAndFocusChevron();
      return;
    }
    const items = this.enabledItems();
    if (!items.length) return;
    const current = items.indexOf(event.target as HTMLButtonElement);
    const next =
      key === "ArrowDown"
        ? (current + 1) % items.length
        : key === "ArrowUp"
          ? (current - 1 + items.length) % items.length
          : key === "Home"
            ? 0
            : key === "End"
              ? items.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    items[next].focus();
  }

  private enabledItems(): HTMLButtonElement[] {
    return this.menuItems()
      .map((item) => item.element)
      .filter((element) => !element.disabled && element.isConnected);
  }
}
