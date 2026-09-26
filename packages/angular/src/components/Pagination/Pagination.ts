import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import { iconChevronLeft, iconChevronRight } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";

export type PaginationColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type PaginationSize = "small" | "medium" | "large";
export type PaginationShape = "circular" | "rounded";

/** MUI-style page range with boundaries + sibling window + ellipses. */
export function getPaginationItems(
  page: number,
  count: number,
  siblingCount = 1,
  boundaryCount = 1,
): Array<number | "ellipsis"> {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, index) => start + index);
  };

  const totalNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

  if (count <= totalNumbers) {
    return range(1, count);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, boundaryCount + 2);
  const rightSiblingIndex = Math.min(page + siblingCount, count - boundaryCount - 1);

  const items: Array<number | "ellipsis"> = [];

  items.push(...range(1, boundaryCount));

  if (leftSiblingIndex > boundaryCount + 2) {
    items.push("ellipsis");
  } else {
    items.push(...range(boundaryCount + 1, leftSiblingIndex - 1));
  }

  items.push(...range(leftSiblingIndex, rightSiblingIndex));

  if (rightSiblingIndex < count - boundaryCount - 1) {
    items.push("ellipsis");
  } else {
    items.push(...range(rightSiblingIndex + 1, count - boundaryCount));
  }

  items.push(...range(count - boundaryCount + 1, count));

  return items;
}

/**
 * Props follow MUI's Pagination API (https://mui.com/material-ui/api/pagination/)
 * closely, mirroring `@okkly/react`'s `<Pagination>` name-for-name
 * (`count`/`page`/`siblingCount`/`boundaryCount`/`showFirstButton`/
 * `showLastButton`/`size`/`color`/`disabled`/`shape`). Deliberate gaps: no
 * `renderItem` override and no compact mobile variant, matching react's own
 * v1 scope. React's `onChange(event, page)` becomes `page`'s own `model()` —
 * a click just moves the model; there is no Angular equivalent worth
 * threading a `MouseEvent` through for.
 *
 * `@okkly/icons` has no first/last-page glyphs, so those two buttons render
 * the same inline double-chevron SVGs react hand-rolls, kept byte-for-byte
 * for visual parity; prev/next reuse the shared `iconChevronLeft`/`iconChevronRight`.
 */
@Component({
  selector: "okkly-pagination",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  imports: [OkklyIcon],
  host: {
    class: "okkly-component okkly-pagination",
    "[class]": "modifiers()",
    role: "navigation",
    "aria-label": "pagination",
  },
  templateUrl: "./Pagination.html",
})
export class OkklyPagination {
  /**
   * Total number of pages.
   *
   * @default undefined
   */
  readonly count = input.required<number>();
  /**
   * Current page (1-based). Two-way bindable as `[(page)]`.
   *
   * @default 1
   */
  readonly page = model(1);
  /**
   * Pages shown on each side of the current page.
   *
   * @default 1
   */
  readonly siblingCount = input(1);
  /**
   * Pages always shown at the start and end.
   *
   * @default 1
   */
  readonly boundaryCount = input(1);
  /**
   * Whether a "go to first page" button renders.
   *
   * @default false
   */
  readonly showFirstButton = input(false, { transform: booleanAttribute });
  /**
   * Whether a "go to last page" button renders.
   *
   * @default false
   */
  readonly showLastButton = input(false, { transform: booleanAttribute });
  /**
   * Size.
   *
   * @default "medium"
   */
  readonly size = input<PaginationSize>("medium");
  /**
   * Color of the active page button.
   *
   * @default "primary"
   */
  readonly color = input<PaginationColor>("primary");
  /**
   * Disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Shape.
   *
   * @default "rounded"
   */
  readonly shape = input<PaginationShape>("rounded");

  protected readonly iconChevronLeft = iconChevronLeft;
  protected readonly iconChevronRight = iconChevronRight;

  protected readonly safeCount = computed(() => Math.max(1, this.count()));
  protected readonly safePage = computed(() =>
    Math.min(Math.max(1, this.page()), this.safeCount()),
  );
  protected readonly items = computed(() =>
    getPaginationItems(
      this.safePage(),
      this.safeCount(),
      this.siblingCount(),
      this.boundaryCount(),
    ),
  );

  protected readonly prevDisabled = computed(() => this.disabled() || this.safePage() <= 1);
  protected readonly nextDisabled = computed(
    () => this.disabled() || this.safePage() >= this.safeCount(),
  );

  protected readonly modifiers = computed(() =>
    [
      this.color() !== "primary" && `okkly-pagination--color-${this.color()}`,
      this.size() !== "medium" && `okkly-pagination--size-${this.size()}`,
      this.shape() === "circular" && "okkly-pagination--shape-circular",
      this.disabled() && "okkly-pagination--disabled",
    ]
      .filter(Boolean)
      .join(" "),
  );

  protected goToPage(next: number): void {
    if (this.disabled() || next === this.safePage()) return;
    this.page.set(next);
  }
}
