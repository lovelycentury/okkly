import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input,
  model,
  viewChildren,
  type ElementRef,
} from "@angular/core";
import { OkklyIcon, type IconSource } from "../Icon/Icon";

export type TabsColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type TabsVariant = "standard" | "scrollable";
export type TabsOrientation = "horizontal" | "vertical";

/** One tab in the strip. */
export interface TabItem {
  /** Tab label. */
  label: string;
  /** Stable tab identifier passed to `value`. */
  value: string;
  /**
   * Leading glyph: raw SVG markup (an `@okkly/icons` export), or a template for
   * anything else. Decorative — hidden from assistive tech.
   */
  icon?: IconSource | TemplateRef<unknown>;
  /** Disables this tab alone. */
  disabled?: boolean;
}

/**
 * Inputs follow MUI's Tabs API (https://mui.com/material-ui/api/tabs/) closely
 * — `variant`/`orientation`/`color` match name-for-name — and `@okkly/react`'s
 * item-array shape for everything specific to this design system. Deliberate
 * gaps, the same calls `OkklySegmentedToggle` already made: tabs come from an
 * `items` array rather than `Tab` child composition; `value`'s own `model()`
 * default (`undefined`) covers react's separate `value`/`defaultValue` split
 * — bind `[(value)]` for the controlled case, leave it unbound and the first
 * item is selected for the uncontrolled one; an item's `label` is plain text
 * and its `icon` is raw SVG markup or a `TemplateRef`, since Angular has no
 * `ReactNode` equivalent. Tab panels are left to the consumer, as in react.
 *
 * Keyboard follows the WAI-ARIA tabs pattern with automatic activation: only
 * the active tab is tabbable (roving tabindex), and the arrow keys (plus
 * Home/End) move focus and select in one step.
 */
@Component({
  selector: "okkly-tabs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, OkklyIcon],
  host: {
    class: "okkly-component okkly-tabs",
    "[class]": "modifiers()",
  },
  templateUrl: "./Tabs.html",
})
export class OkklyTabs {
  /**
   * Tab options.
   *
   * @default []
   */
  readonly items = input<readonly TabItem[]>([]);
  /**
   * Selected tab value. Two-way bindable as `[(value)]`. Falls back to the
   * first item's value when unset.
   *
   * @default undefined
   */
  readonly value = model<string>();
  /**
   * Accent tone for the active indicator.
   *
   * @default "primary"
   */
  readonly color = input<TabsColor>("primary");
  /**
   * `standard` shows an underline indicator; `scrollable` adds horizontal overflow.
   *
   * @default "standard"
   */
  readonly variant = input<TabsVariant>("standard");
  /**
   * Orientation.
   *
   * @default "horizontal"
   */
  readonly orientation = input<TabsOrientation>("horizontal");

  protected readonly currentValue = computed(() => this.value() ?? this.items()[0]?.value);

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-tabs--color-${this.color()}`,
      this.variant() === "scrollable" && "okkly-tabs--scrollable",
      this.orientation() === "vertical" && "okkly-tabs--vertical",
    ]
      .filter(Boolean)
      .join(" "),
  );

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>("tabButton");

  protected isTemplate(icon: TabItem["icon"]): icon is TemplateRef<unknown> {
    return icon instanceof TemplateRef;
  }

  protected select(tabValue: string): void {
    this.value.set(tabValue);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const nextKey = this.orientation() === "vertical" ? "ArrowDown" : "ArrowRight";
    const prevKey = this.orientation() === "vertical" ? "ArrowUp" : "ArrowLeft";
    if (!["Home", "End", nextKey, prevKey].includes(event.key)) return;

    const enabled = this.items().filter((item) => !item.disabled);
    if (enabled.length === 0) return;

    const current = this.currentValue();
    const currentIndex = enabled.findIndex((item) => item.value === current);
    let nextIndex: number;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabled.length - 1;
    else {
      const step = event.key === nextKey ? 1 : -1;
      const from = currentIndex === -1 ? 0 : currentIndex;
      nextIndex = (from + step + enabled.length) % enabled.length;
    }

    const next = enabled[nextIndex];
    if (!next || next.value === current) return;

    event.preventDefault();
    this.value.set(next.value);
    this.focusTab(next.value);
  }

  private focusTab(tabValue: string): void {
    const index = this.items().findIndex((item) => item.value === tabValue);
    this.tabButtons()[index]?.nativeElement.focus();
  }
}
