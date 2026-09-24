import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterEveryRender,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  signal,
  viewChild,
  type ElementRef,
} from "@angular/core";

export type BadgeColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";
export type BadgeVariant = "standard" | "dot";
export type BadgeOverlap = "circular" | "rectangular";

export interface BadgeAnchorOrigin {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}

/** A numeric attribute (`badgeContent="4"`) reads as the count a binding (`[badgeContent]="4"`) passes. */
function numeric(value: number | string | null | undefined): number | string | null | undefined {
  return typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
}

/** Whether a node is something the consumer projected, rather than whitespace or a control-flow anchor. */
function isContent(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) return true;
  return node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim();
}

/**
 * Inputs mirror `@okkly/react`'s `<Badge>` name-for-name — `badgeContent`,
 * `color`, `variant`, `max`, `invisible`, `overlap`, `anchorOrigin` — which
 * follows MUI's Badge API (https://mui.com/material-ui/api/badge/). Angular
 * Material's `matBadge` is an attribute directive that paints onto its host;
 * this design needs a wrapper around the anchor, so it is an element instead.
 *
 * Deliberate gaps: React's `children` is the default `<ng-content />`, and
 * whether anything was projected into it — which switches between a badge
 * pinned to an anchor and a standalone pill — is read off the rendered DOM
 * after every render, since Angular has no `children == null` check. `badgeContent`
 * takes a string or a number, not an arbitrary node; a numeric attribute
 * (`badgeContent="4"`) reads as a number, so `0` hides and `max` caps it.
 */
@Component({
  selector: "okkly-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-badge",
    "[class]": "modifiers()",
  },
  templateUrl: "./Badge.html",
})
export class OkklyBadge {
  /**
   * Count or short label. Hidden when `0`.
   *
   * @default undefined
   */
  readonly badgeContent = input<
    number | string | null | undefined,
    number | string | null | undefined
  >(undefined, { transform: numeric });
  /**
   * Semantic fill tone. Omit for a neutral raised count.
   *
   * @default undefined
   */
  readonly color = input<BadgeColor>();
  /**
   * Number pill or status dot.
   *
   * @default "standard"
   */
  readonly variant = input<BadgeVariant>("standard");
  /**
   * Overflow cap — numbers above this render as `{max}+`.
   *
   * @default 99
   */
  readonly max = input(99, { transform: (value: unknown) => numberAttribute(value, 99) });
  /**
   * Hides the badge without removing the anchor it sits on.
   *
   * @default false
   */
  readonly invisible = input(false, { transform: booleanAttribute });
  /**
   * Adjusts the corner offset for circular vs rectangular anchors.
   *
   * @default "circular"
   */
  readonly overlap = input<BadgeOverlap>("circular");
  /**
   * Corner placement relative to the anchor.
   *
   * @default { vertical: "top", horizontal: "right" }
   */
  readonly anchorOrigin = input<BadgeAnchorOrigin>({ vertical: "top", horizontal: "right" });

  private readonly anchor = viewChild.required<ElementRef<HTMLElement>>("anchor");

  /** Whether the consumer projected an anchor — refreshed after every render. */
  protected readonly hasAnchor = signal(false);

  constructor() {
    afterEveryRender({
      read: () => {
        const hasAnchor = Array.from(this.anchor().nativeElement.childNodes).some(isContent);
        if (hasAnchor !== this.hasAnchor()) this.hasAnchor.set(hasAnchor);
      },
    });
  }

  /** The text the pill prints, or `null` when there is nothing to show. */
  protected readonly formatted = computed(() => {
    const content = this.badgeContent();
    if (this.variant() === "dot" || content == null || content === "") return null;
    if (typeof content === "number") {
      if (content === 0) return null;
      if (content > this.max()) return `${this.max()}+`;
    }
    return String(content);
  });

  protected readonly hidden = computed(
    () => this.invisible() || (this.variant() !== "dot" && this.formatted() === null),
  );

  protected readonly modifiers = computed(() =>
    [
      !this.hasAnchor() && "okkly-badge--standalone",
      this.overlap() === "rectangular" && "okkly-badge--overlap-rectangular",
      this.color() && `okkly-badge--color-${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected readonly contentClasses = computed(() =>
    [
      "okkly-badge__content",
      this.variant() === "dot" && "okkly-badge__content--dot",
      this.hidden() && "okkly-badge__content--invisible",
      this.hasAnchor() && `okkly-badge__content--${this.anchorOrigin().vertical}`,
      this.hasAnchor() && `okkly-badge__content--${this.anchorOrigin().horizontal}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
