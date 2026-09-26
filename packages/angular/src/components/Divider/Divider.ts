import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from "@angular/core";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "fullWidth" | "inset" | "middle";
export type DividerTextAlign = "left" | "center" | "right";

/** Marks the projected content that renders as the centered label. */
@Directive({ selector: "[okklyDividerLabel]" })
export class OkklyDividerLabel {}

/**
 * Inputs mirror `@okkly/react`'s `<Divider>` name-for-name — `orientation`,
 * `variant`, `flexItem`, `textAlign` — which itself follows MUI's Divider API
 * (https://mui.com/material-ui/api/divider/) as closely as this design
 * allows. Angular Material's `mat-divider` is the loose precedent for the
 * owned-element-selector shape, but it has no label/children concept at all,
 * so the label handling below has no Material analogue.
 *
 * Deliberate gaps: not polymorphic — React picks between a plain `<hr>`, a
 * vertical `<hr>`, and a `<div role="separator">` internally, but Angular's
 * host tag is fixed to `okkly-divider` by the selector, so `role="separator"`
 * is set unconditionally rather than relying on native `<hr>` semantics only
 * some of those renders would have had. React's implicit `children` becomes
 * explicit projected content tagged `okklyDividerLabel`, the same pattern
 * `OkklyButton`'s icon slots and `OkklyField`'s adornments use, since Angular
 * has no `Boolean(children)` equivalent for a default `<ng-content>` slot.
 */
@Component({
  selector: "okkly-divider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-divider",
    "[class]": "modifiers()",
    role: "separator",
    "[attr.aria-orientation]": "orientation() === 'vertical' ? 'vertical' : null",
  },
  templateUrl: "./Divider.html",
})
export class OkklyDivider {
  /**
   * Line direction.
   *
   * @default "horizontal"
   */
  readonly orientation = input<DividerOrientation>("horizontal");
  /**
   * Inset spacing variant.
   *
   * @default "fullWidth"
   */
  readonly variant = input<DividerVariant>("fullWidth");
  /**
   * Stretch to fill a flex container's cross axis.
   *
   * @default false
   */
  readonly flexItem = input(false, { transform: booleanAttribute });
  /**
   * Label alignment. Only visible when a label is projected on a horizontal divider.
   *
   * @default "center"
   */
  readonly textAlign = input<DividerTextAlign>("center");

  private readonly label = contentChild(OkklyDividerLabel);

  /** Whether a label was projected and the divider is horizontal — vertical dividers never show one. */
  protected readonly hasLabel = computed(
    () => !!this.label() && this.orientation() === "horizontal",
  );

  protected readonly modifiers = computed(() =>
    [
      this.orientation() === "vertical" ? "okkly-divider--vertical" : "okkly-divider--horizontal",
      this.variant() === "inset" && "okkly-divider--inset",
      this.variant() === "middle" && "okkly-divider--middle",
      this.hasLabel() && "okkly-divider--with-label",
      this.flexItem() && "okkly-divider--flex-item",
      this.textAlign() !== "center" && `okkly-divider--align-${this.textAlign()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
