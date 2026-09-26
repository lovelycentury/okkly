import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  signal,
} from "@angular/core";
import { OkklyIcon, type IconSource } from "../Icon/Icon";

/** One crumb of the trail. */
export interface BreadcrumbItem {
  /** Visible text. */
  label: string;
  /** Where the crumb links. Ignored on the last crumb, which is the current page. */
  href?: string;
  /**
   * Leading glyph: raw SVG markup (an `@okkly/icons` export), or a template for
   * anything else. Decorative — hidden from assistive tech.
   */
  icon?: IconSource | TemplateRef<unknown>;
}

/**
 * Replaces the separator between crumbs with any markup:
 * `<ng-template okklyBreadcrumbsSeparator>›</ng-template>`. It is stamped once
 * per gap, so it is a template rather than projected content.
 */
@Directive({ selector: "ng-template[okklyBreadcrumbsSeparator]" })
export class OkklyBreadcrumbsSeparator {
  readonly template = inject(TemplateRef);
}

/** A crumb as rendered — `null` stands for the collapsed "…". */
type Crumb = { item: BreadcrumbItem; last: boolean } | null;

/**
 * Trail of parent pages ending at the current location. Inputs mirror
 * `@okkly/react`'s `<Breadcrumbs>` name-for-name — `items`, `separator`,
 * `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`, `expandAriaLabel` —
 * which follows MUI's Breadcrumbs API.
 *
 * Deliberate gaps: React's `separator` and item `icon` take any node. Here
 * `separator` is text, with markup going in an `okklyBreadcrumbsSeparator`
 * template, and `icon` is raw SVG markup or a `TemplateRef`. The host is the
 * navigation landmark (`role="navigation"`) where React renders a `<nav>`.
 */
@Component({
  selector: "okkly-breadcrumbs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, OkklyIcon],
  host: {
    class: "okkly-component okkly-breadcrumbs",
    role: "navigation",
    "aria-label": "breadcrumb",
  },
  templateUrl: "./Breadcrumbs.html",
  // React's root is a <nav>; this host is a custom element, inline by default.
  styles: `
    okkly-breadcrumbs {
      display: block;
    }
  `,
})
export class OkklyBreadcrumbs {
  /**
   * The trail, root first. The last crumb is always the current page.
   *
   * @default []
   */
  readonly items = input<readonly BreadcrumbItem[]>([]);
  /**
   * Text between crumbs. Unset, a chevron — or the `okklyBreadcrumbsSeparator` template.
   *
   * @default undefined
   */
  readonly separator = input<string>();
  /**
   * Past this many crumbs, the middle ones collapse behind a "…".
   *
   * @default 8
   */
  readonly maxItems = input(8, { transform: numberAttribute });
  /**
   * Crumbs kept before the "…" when collapsed.
   *
   * @default 1
   */
  readonly itemsBeforeCollapse = input(1, { transform: numberAttribute });
  /**
   * Crumbs kept after the "…" when collapsed.
   *
   * @default 1
   */
  readonly itemsAfterCollapse = input(1, { transform: numberAttribute });
  /**
   * Accessible name of the "…" button that expands the trail.
   *
   * @default "Show all crumbs"
   */
  readonly expandAriaLabel = input("Show all crumbs");

  protected readonly separatorTemplate = contentChild(OkklyBreadcrumbsSeparator);
  protected readonly expanded = signal(false);

  protected readonly crumbs = computed<Crumb[]>(() => {
    const items = this.items();
    const all = items.map((item, index) => ({ item, last: index === items.length - 1 }));
    const before = this.itemsBeforeCollapse();
    const after = this.itemsAfterCollapse();
    const collapse =
      !this.expanded() && items.length > this.maxItems() && before + after < items.length;
    if (!collapse) return all;
    return [...all.slice(0, before), null, ...all.slice(all.length - after)];
  });

  protected isTemplate(icon: BreadcrumbItem["icon"]): icon is TemplateRef<unknown> {
    return icon instanceof TemplateRef;
  }
}
