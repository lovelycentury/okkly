import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from "@angular/core";
import { OkklySeverityIcon, type SeverityIconSeverity } from "../SeverityIcon/SeverityIcon";

export type EmptyStateSize = "small" | "medium" | "large";
export type EmptyStateColor = "primary" | "dante" | "indigo" | "danger";

const COLOR_SEVERITY: Record<EmptyStateColor, SeverityIconSeverity> = {
  primary: "primary",
  dante: "primary",
  indigo: "primary",
  danger: "danger",
};

const ICON_SIZE: Record<EmptyStateSize, "small" | "medium" | "large"> = {
  small: "small",
  medium: "large",
  large: "large",
};

/** Marks the projected illustration or glyph that replaces the default severity icon. */
@Directive({ selector: "[okklyEmptyStateIcon]" })
export class OkklyEmptyStateIcon {}

/** Marks projected controls for the action row — tag each one. */
@Directive({ selector: "[okklyEmptyStateAction]" })
export class OkklyEmptyStateAction {}

/**
 * The panel that stands in for a list with nothing in it. Inputs mirror
 * `@okkly/react`'s `<EmptyState>` name-for-name — `title`, `description`,
 * `severity`, `color`, `size`. Neither MUI nor Angular Material has one.
 *
 * Deliberate gaps: React's `title` and `description` take any node; here they
 * are text. The custom icon and the action are projected content tagged
 * `okklyEmptyStateIcon` and `okklyEmptyStateAction`. `title` is an input, not
 * the native attribute — the host clears it so no browser tooltip appears.
 */
@Component({
  selector: "okkly-empty-state",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklySeverityIcon],
  host: {
    class: "okkly-component okkly-empty-state",
    "[class]": "modifiers()",
    "[attr.title]": "null",
  },
  templateUrl: "./EmptyState.html",
})
export class OkklyEmptyState {
  /**
   * Headline explaining the empty state.
   *
   * @default undefined
   */
  readonly title = input.required<string>();
  /**
   * Supporting copy.
   *
   * @default undefined
   */
  readonly description = input<string>();
  /**
   * Which glyph the default icon draws. The colour comes from `color`, not from
   * here — so `severity="danger"` on a `primary` panel is a cross in mint.
   *
   * @default undefined
   */
  readonly severity = input<SeverityIconSeverity>();
  /**
   * Accent tone for the halo and the icon.
   *
   * @default "primary"
   */
  readonly color = input<EmptyStateColor>("primary");
  /**
   * Layout scale.
   *
   * @default "medium"
   */
  readonly size = input<EmptyStateSize>("medium");

  private readonly customIcon = contentChild(OkklyEmptyStateIcon);
  private readonly action = contentChild(OkklyEmptyStateAction);

  protected readonly hasCustomIcon = computed(() => !!this.customIcon());
  protected readonly hasAction = computed(() => !!this.action());
  protected readonly iconSeverity = computed(() => this.severity() ?? COLOR_SEVERITY[this.color()]);
  protected readonly iconSize = computed(() => ICON_SIZE[this.size()]);

  protected readonly modifiers = computed(() =>
    [
      this.size() !== "medium" && `okkly-empty-state--${this.size()}`,
      this.color() !== "primary" && `okkly-empty-state--${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
