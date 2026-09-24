import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from "@angular/core";

export type SeverityIconSeverity =
  "success" | "info" | "warning" | "danger" | "primary" | "neutral";
export type SeverityIconSize = "small" | "medium" | "large";
export type SeverityIconShape = "circle" | "rounded";

/** Marks the projected element that replaces the built-in severity glyph. */
@Directive({ selector: "[okklySeverityIconGlyph]" })
export class OkklySeverityIconGlyph {}

/**
 * A tinted chip holding a status glyph. Inputs mirror `@okkly/react`'s
 * `<SeverityIcon>` name-for-name — `severity`, `size`, `shape`, `label`. No
 * MUI or Angular Material equivalent.
 *
 * Deliberate gaps: React's `icon` node becomes projected content tagged
 * `okklySeverityIconGlyph`. Colour alone says nothing to a screen reader, so
 * without a `label` the host is `aria-hidden`; with one it is a named
 * `role="img"`.
 */
@Component({
  selector: "okkly-severity-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-severity-icon",
    "[class]": "modifiers()",
    role: "img",
    "[attr.aria-label]": "label() || null",
    "[attr.aria-hidden]": "label() ? null : 'true'",
  },
  templateUrl: "./SeverityIcon.html",
})
export class OkklySeverityIcon {
  /**
   * Semantic tone — drives the tint and the default glyph.
   *
   * @default "info"
   */
  readonly severity = input<SeverityIconSeverity>("info");
  /**
   * Chip dimensions.
   *
   * @default "medium"
   */
  readonly size = input<SeverityIconSize>("medium");
  /**
   * Circle or rounded square.
   *
   * @default "circle"
   */
  readonly shape = input<SeverityIconShape>("circle");
  /**
   * Text equivalent of the tone, e.g. `"Failed"`. Omit when the surrounding
   * content already says it — the icon is then hidden from assistive tech.
   *
   * @default undefined
   */
  readonly label = input<string>();

  private readonly glyph = contentChild(OkklySeverityIconGlyph);

  protected readonly hasCustomGlyph = computed(() => !!this.glyph());

  protected readonly modifiers = computed(() =>
    [
      this.severity() !== "info" && `okkly-severity-icon--${this.severity()}`,
      this.size() !== "medium" && `okkly-severity-icon--${this.size()}`,
      this.shape() === "rounded" && "okkly-severity-icon--rounded",
    ]
      .filter(Boolean)
      .join(" "),
  );
}
