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

/** Marks the projected brand mark shown top-left. */
@Directive({ selector: "[okklyProjectCardLogo]" })
export class OkklyProjectCardLogo {}

/**
 * The case-study tile for a portfolio: artwork behind, copy on a scrim over
 * it, at a fixed 476:290 ratio. Inputs mirror `@okkly/react`'s
 * `<ProjectCard>` name-for-name — `image`, `title`, `description`, `tags`,
 * `device`. Neither MUI nor Angular Material has one.
 *
 * It decorates the element the consumer writes: `<a okklyProjectCard href>`
 * for a published case (one link around the whole tile), a
 * `<div okklyProjectCard>` for one that is not.
 *
 * Deliberate gaps: React's `logo` node is projected content tagged
 * `okklyProjectCardLogo`, and `href` is the anchor's own attribute rather than
 * an input. `title` is an input, not the native attribute — the host clears it
 * so no browser tooltip appears.
 */
@Component({
  selector: "a[okklyProjectCard], div[okklyProjectCard]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-project-card",
    "[attr.title]": "null",
  },
  templateUrl: "./ProjectCard.html",
})
export class OkklyProjectCard {
  /**
   * Background image URL (transparent is fine). Unset, the card shows its built-in gradient.
   *
   * @default undefined
   */
  readonly image = input<string>();
  /**
   * Project name.
   *
   * @default undefined
   */
  readonly title = input.required<string>();
  /**
   * One- or two-line summary.
   *
   * @default undefined
   */
  readonly description = input<string>();
  /**
   * Category pills.
   *
   * @default []
   */
  readonly tags = input<readonly string[]>([]);
  /**
   * Shows a decorative phone mockup in the corner.
   *
   * @default false
   */
  readonly device = input(false, { transform: booleanAttribute });

  private readonly logo = contentChild(OkklyProjectCardLogo);
  protected readonly hasLogo = computed(() => !!this.logo());
}
