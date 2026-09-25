import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import * as okklyIcons from "@okkly/icons";

/**
 * Every icon export in `@okkly/icons`, inferred from the package itself —
 * `"iconStar" | "iconSearch" | …`. Adding an SVG to `@okkly/icons` and running
 * its `generate` script widens this union with no edit here.
 */
export type IconName = keyof typeof okklyIcons;

/** Raw SVG markup, as every `@okkly/icons` export is. */
export type IconSource = string;

export type IconSize = "small" | "medium" | "large" | "inherit";
export type IconColor =
  | "inherit"
  | "primary"
  | "dante"
  | "indigo"
  | "violet"
  | "ember"
  | "ice"
  | "success"
  | "warning"
  | "danger"
  | "muted";

/** Name → markup, so `name` can be resolved at runtime. */
const ICONS = okklyIcons as Record<IconName, IconSource>;

/** Sorted list of every available icon name — handy for pickers and stories. */
export const ICON_NAMES = Object.keys(ICONS).toSorted() as IconName[];

/**
 * Renders a glyph from `@okkly/icons`. Inputs mirror `@okkly/react`'s
 * `<Icon>` name-for-name — `name`, `icon`, `color`, `fontSize`, `titleAccess`
 * — which follows MUI's SvgIcon API; the element selector follows Angular
 * Material's `mat-icon`.
 *
 * Deliberate gaps: React makes `name` and `icon` mutually exclusive in the
 * type system; Angular inputs cannot express that, so when both are set
 * `icon` wins, as React's `icon ?? name` would. `name` bundles the whole icon
 * set because the lookup happens at runtime; `icon` takes one imported export
 * and stays tree-shakeable — prefer it in application code.
 *
 * The markup is trusted and injected as HTML (Angular's sanitizer would strip
 * `<svg>`), so it must be markup you control at build time — an
 * `@okkly/icons` export or your own asset, never a string from a user, an API
 * or a URL.
 */
@Component({
  selector: "okkly-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "okkly-component okkly-icon",
    "[class]": "modifiers()",
    "[attr.role]": "titleAccess() ? 'img' : null",
    "[attr.aria-label]": "titleAccess() || null",
    "[attr.aria-hidden]": "titleAccess() ? null : 'true'",
    "[innerHTML]": "markup()",
  },
  templateUrl: "./Icon.html",
})
export class OkklyIcon {
  /**
   * Icon to render, picked by name from `@okkly/icons`.
   *
   * @default undefined
   */
  readonly name = input<IconName>();
  /**
   * Pre-imported SVG markup — `import { iconStar } from "@okkly/icons"`. Wins over `name`.
   * Injected as HTML, so it must be markup you control at build time.
   *
   * @default undefined
   */
  readonly icon = input<IconSource>();
  /**
   * Tint. `inherit` takes the surrounding text colour, which is what you want
   * inside a Button or a Typography block.
   *
   * @default "inherit"
   */
  readonly color = input<IconColor>("inherit");
  /**
   * Glyph box. `inherit` tracks the surrounding font size (`1em`) instead of the fixed scale.
   *
   * @default "medium"
   */
  readonly fontSize = input<IconSize>("medium");
  /**
   * Text alternative. Provide it when the icon is the only carrier of meaning;
   * omit it and the icon is hidden from assistive tech as decoration.
   *
   * @default undefined
   */
  readonly titleAccess = input<string>();

  private readonly sanitizer = inject(DomSanitizer);

  // Trusted on purpose: the markup is first-party (see the class comment), and
  // the sanitizer would otherwise remove the <svg> it exists to render.
  protected readonly markup = computed(() => {
    const name = this.name();
    const source = this.icon() ?? (name ? ICONS[name] : undefined) ?? "";
    return this.sanitizer.bypassSecurityTrustHtml(source);
  });

  protected readonly modifiers = computed(() =>
    [
      this.fontSize() !== "medium" && `okkly-icon--${this.fontSize()}`,
      this.color() !== "inherit" && `okkly-icon--color-${this.color()}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
