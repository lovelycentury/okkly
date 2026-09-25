import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";

export type LinkCardColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type LinkCardSize = "small" | "medium" | "large";

/**
 * The signature "links page" row: a tappable link to a destination with a
 * title, a supporting line and a trailing tag. Inputs mirror `@okkly/react`'s
 * `<LinkCard>` name-for-name — `title`, `subtitle`, `meta`, `featured`,
 * `color`, `size`. Neither MUI nor Angular Material has one.
 *
 * It decorates the element the consumer writes, as `OkklyButton` does: an
 * `<a okklyLinkCard href>` for a link, a `<div okklyLinkCard>` otherwise.
 *
 * Deliberate gaps: React turns a `<div>` into a button when it has an
 * `onClick`; Angular cannot see whether a `(click)` listener exists, so the
 * `interactive` input does that — `role="button"`, `tabindex="0"`, and Enter
 * or Space firing `click`. `meta` is text where React takes any node. `title`
 * is an input, not the native attribute — the host clears it so no browser
 * tooltip appears.
 */
@Component({
  selector: "a[okklyLinkCard], div[okklyLinkCard]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-link-card",
    "[class]": "modifiers()",
    "[attr.title]": "null",
    // `button`, not `link`: without an `href` there is nowhere to go, and the
    // row answers to Space as well as Enter — which is how a button behaves.
    "[attr.role]": "isInteractiveDiv() ? 'button' : null",
    "[attr.tabindex]": "isInteractiveDiv() ? '0' : null",
    "(keydown)": "onKeydown($event)",
  },
  templateUrl: "./LinkCard.html",
})
export class OkklyLinkCard {
  /**
   * Primary label.
   *
   * @default undefined
   */
  readonly title = input.required<string>();
  /**
   * Supporting line.
   *
   * @default undefined
   */
  readonly subtitle = input<string>();
  /**
   * Right-aligned tag or handle, e.g. "essays" or "@handle".
   *
   * @default undefined
   */
  readonly meta = input<string>();
  /**
   * Accent dot, glass surface and glow.
   *
   * @default false
   */
  readonly featured = input(false, { transform: booleanAttribute });
  /**
   * Accent tone when featured.
   *
   * @default "primary"
   */
  readonly color = input<LinkCardColor>("primary");
  /**
   * Row density.
   *
   * @default "medium"
   */
  readonly size = input<LinkCardSize>("medium");
  /**
   * On a `<div>`, makes the row a button: focusable, and fired by Enter and Space. Ignored on an `<a>`.
   *
   * @default false
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isAnchor = this.element.tagName === "A";

  protected readonly isInteractiveDiv = computed(() => !this.isAnchor && this.interactive());

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-link-card--color-${this.color()}`,
      this.size() !== "medium" && `okkly-link-card--${this.size()}`,
      this.featured() && "okkly-link-card--featured",
      this.isInteractiveDiv() && "okkly-link-card--interactive",
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected onKeydown(event: Event): void {
    if (!this.isInteractiveDiv() || event.target !== this.element) return;
    const { key } = event as KeyboardEvent;
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.element.click();
    }
  }
}
