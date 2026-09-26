import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  type Signal,
} from "@angular/core";

export type ChipVariant = "glass" | "solid" | "outline" | "accent" | "dante";
export type ChipSize = "small" | "medium" | "large";

/**
 * What an `OkklyChipGroup` option imposes on the chip it sits on: whether the
 * group has it selected (`undefined` while the group holds no value, so the
 * chip's own `selected` applies) and whether the group is disabled. Provided
 * by `okklyChipGroupOption` on the chip's own element.
 */
export interface ChipGroupOptionState {
  selected: Signal<boolean | undefined>;
  disabled: Signal<boolean>;
}

export const CHIP_GROUP_OPTION = new InjectionToken<ChipGroupOptionState>("CHIP_GROUP_OPTION");

/** Marks the projected element that renders as the leading icon. */
@Directive({ selector: "[okklyChipIcon]" })
export class OkklyChipIcon {}

/**
 * Inputs mirror `@okkly/react`'s `<Chip>` name-for-name — `label`,
 * `variant`, `size`, `selected`, `dot`, `removable`, `disabled`,
 * `removeLabel` — which follows MUI's Chip API. The remove output is named
 * `removed`, after Angular Material's `mat-chip`.
 *
 * Deliberate gaps: React infers a clickable chip from `onClick` being set;
 * Angular cannot see whether a `(click)` listener exists, so this takes MUI's
 * explicit `clickable` input instead. A clickable chip gets button semantics
 * and turns Enter/Space into a `click` on the host, so a plain `(click)`
 * binding covers mouse and keyboard alike. React's `icon` node becomes
 * projected content tagged `okklyChipIcon`.
 */
@Component({
  selector: "okkly-chip",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-chip",
    "[class]": "modifiers()",
    "[attr.role]": "isInteractive() ? 'button' : null",
    "[attr.tabindex]": "isInteractive() ? '0' : null",
    "[attr.aria-pressed]": "isInteractive() ? (isSelected() ? 'true' : 'false') : null",
    "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
    "(keydown)": "onKeydown($event)",
  },
  templateUrl: "./Chip.html",
})
export class OkklyChip {
  /**
   * Chip text.
   *
   * @default undefined
   */
  readonly label = input<string>();
  /**
   * Surface style.
   *
   * @default "glass"
   */
  readonly variant = input<ChipVariant>("glass");
  /**
   * Chip size.
   *
   * @default "medium"
   */
  readonly size = input<ChipSize>("medium");
  /**
   * Active/filter state.
   *
   * @default false
   */
  readonly selected = input(false, { transform: booleanAttribute });
  /**
   * Leading status dot. Ignored when an icon is projected.
   *
   * @default false
   */
  readonly dot = input(false, { transform: booleanAttribute });
  /**
   * Shows a trailing × that emits `removed`.
   *
   * @default false
   */
  readonly removable = input(false, { transform: booleanAttribute });
  /**
   * Makes the chip a button (e.g. a filter toggle): focusable, `aria-pressed`,
   * and activated by Enter/Space as well as clicks.
   *
   * @default false
   */
  readonly clickable = input(false, { transform: booleanAttribute });
  /**
   * Non-interactive; blocks clicks and removal.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Accessible name for the trailing × button.
   *
   * @default "Remove"
   */
  readonly removeLabel = input("Remove");

  /** Emits when the trailing × is activated. */
  readonly removed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly icon = contentChild(OkklyChipIcon);

  /** Set when the chip is an option of an `OkklyChipGroup`, which then drives its state. */
  private readonly option = inject(CHIP_GROUP_OPTION, { self: true, optional: true });

  protected readonly hasIcon = computed(() => !!this.icon());
  protected readonly isSelected = computed(() => this.option?.selected() ?? this.selected());
  protected readonly isDisabled = computed(() => this.disabled() || !!this.option?.disabled());
  protected readonly isInteractive = computed(
    () => (this.clickable() || !!this.option) && !this.isDisabled(),
  );

  protected readonly modifiers = computed(() =>
    [
      this.variant() !== "glass" && `okkly-chip--${this.variant()}`,
      this.size() !== "medium" && `okkly-chip--${this.size()}`,
      this.isSelected() && "okkly-chip--selected",
      this.isInteractive() && "okkly-chip--interactive",
      this.isDisabled() && "okkly-chip--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  constructor() {
    // `pointer-events: none` already stops a real click; this guards a
    // programmatic one. It has to be a capture listener: the consumer's
    // `(click)` on the same element is registered before any host listener,
    // and only capture-phase listeners run ahead of it at the target.
    const swallowWhileDisabled = (event: Event) => {
      if (!this.isDisabled()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const element = this.host.nativeElement;
    element.addEventListener("click", swallowWhileDisabled, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      element.removeEventListener("click", swallowWhileDisabled, { capture: true }),
    );
  }

  // Host listeners hand back a bare `Event`; nothing below needs more than that.
  protected onKeydown(event: Event): void {
    if (!this.isInteractive() || event.target !== this.host.nativeElement) return;
    const { key } = event as KeyboardEvent;
    if (key !== "Enter" && key !== " ") return;
    event.preventDefault();
    this.host.nativeElement.click();
  }

  protected remove(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.removed.emit();
  }
}
