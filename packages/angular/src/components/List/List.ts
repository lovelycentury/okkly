import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
} from "@angular/core";

/** Marks the projected leading icon or avatar of an `okklyListItem`. */
@Directive({ selector: "[okklyListItemStart]" })
export class OkklyListItemStart {}

/** Marks the projected trailing control (switch, badge, chevron) of an `okklyListItem`. */
@Directive({ selector: "[okklyListItemEnd]" })
export class OkklyListItemEnd {}

/**
 * A vertical run of rows on one surface. Inputs follow MUI's List (mirrored by
 * `@okkly/react`'s `<List>`) — `dense`, `disablePadding`, `subheader`; the
 * attribute selector on a native `<ul>` follows Angular Material's `mat-list`
 * in spirit.
 *
 * Deliberate gaps: `subheader` is text where React takes any node; it renders
 * as the first `<li>`, so the `<ul>` stays valid.
 */
@Component({
  selector: "ul[okklyList]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-list",
    "[class]": "modifiers()",
  },
  templateUrl: "./List.html",
})
export class OkklyList {
  /**
   * Reduces vertical padding between items.
   *
   * @default false
   */
  readonly dense = input(false, { transform: booleanAttribute });
  /**
   * Removes the list's outer padding.
   *
   * @default false
   */
  readonly disablePadding = input(false, { transform: booleanAttribute });
  /**
   * Section label above the items.
   *
   * @default undefined
   */
  readonly subheader = input<string>();

  protected readonly modifiers = computed(() =>
    [this.dense() && "okkly-list--dense", this.disablePadding() && "okkly-list--disable-padding"]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * One row of an `okklyList`. Inputs follow MUI's ListItem (mirrored by
 * `@okkly/react`'s `<ListItem>`) — `selected`, `disabled`, `button`, `dense`.
 *
 * With `button`, the row's content becomes a real `<button>` inside the `<li>`,
 * which is what makes Enter, Space and focus work; the trailing control stays
 * outside it, since a switch nested inside a button is unreachable.
 *
 * Deliberate gaps: React's `startIcon` and `secondaryAction` nodes are
 * projected content tagged `okklyListItemStart` and `okklyListItemEnd`. React
 * makes a row a button when it has an `onClick`; Angular cannot see whether a
 * listener exists, so `button` does that, and the `itemClick` output reports
 * activations of that button — a `(click)` on the `<li>` would also hear the
 * trailing control.
 */
@Component({
  selector: "li[okklyListItem]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    class: "okkly-list-item",
    "[class]": "modifiers()",
  },
  templateUrl: "./ListItem.html",
})
export class OkklyListItem {
  /**
   * Highlights the row as active.
   *
   * @default false
   */
  readonly selected = input(false, { transform: booleanAttribute });
  /**
   * Dims the row; on a `button` row the button gets the real `disabled` attribute.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Renders the row's content as a `<button>` — focusable, with hover feedback.
   *
   * @default false
   */
  readonly button = input(false, { transform: booleanAttribute });
  /**
   * Dense row padding.
   *
   * @default false
   */
  readonly dense = input(false, { transform: booleanAttribute });

  /** Emits when a `button` row is activated — by click, Enter or Space. */
  readonly itemClick = output<void>();

  private readonly start = contentChild(OkklyListItemStart);
  private readonly end = contentChild(OkklyListItemEnd);
  protected readonly hasStart = computed(() => !!this.start());
  protected readonly hasEnd = computed(() => !!this.end());

  protected readonly modifiers = computed(() =>
    [
      this.button() && "okkly-list-item--container",
      this.dense() && "okkly-list-item--dense",
      // On a button row the selection shows on the button, not the container.
      !this.button() && this.selected() && "okkly-list-item--selected",
      this.disabled() && "okkly-list-item--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected readonly buttonClasses = computed(() =>
    [
      "okkly-list-item okkly-list-item--button",
      this.dense() && "okkly-list-item--dense",
      this.selected() && "okkly-list-item--selected",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * The common two-line row content: a `primary` line and a `secondary` one,
 * after MUI's ListItemText (mirrored by `@okkly/react`). Every element is
 * inline, as a `button` row only accepts phrasing content.
 *
 * Deliberate gaps: `primary` and `secondary` are text where React takes any node.
 */
@Component({
  selector: "okkly-list-item-text",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: "okkly-list-item__text" },
  templateUrl: "./ListItemText.html",
})
export class OkklyListItemText {
  /**
   * The main line.
   *
   * @default undefined
   */
  readonly primary = input<string>();
  /**
   * The supporting line.
   *
   * @default undefined
   */
  readonly secondary = input<string>();
}

/** A decorative icon sized for list rows, after MUI's ListItemIcon. Hidden from assistive tech. */
@Component({
  selector: "okkly-list-item-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: "okkly-list-item__icon", "aria-hidden": "true" },
  templateUrl: "./ListItemIcon.html",
})
export class OkklyListItemIcon {}
