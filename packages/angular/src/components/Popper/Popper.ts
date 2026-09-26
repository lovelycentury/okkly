import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import {
  createPopper,
  type Instance,
  type Modifier,
  type Options,
  type Placement,
  type VirtualElement,
} from "@popperjs/core";
import { portalTo } from "../../helpers/portal";

export type PopperPlacement = Placement;

export type PopperAnchorEl =
  HTMLElement | VirtualElement | (() => HTMLElement | VirtualElement | null) | null;

/** `true` pins the popper to the anchor's width, `"min"` uses it as a floor. */
export type PopperMatchAnchorWidth = boolean | "min";

function resolveAnchorEl(anchorEl: PopperAnchorEl | undefined) {
  if (anchorEl == null) return null;
  return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}

function isHTMLElement(element: HTMLElement | VirtualElement): element is HTMLElement {
  return (element as HTMLElement).nodeType !== undefined;
}

/**
 * Inputs mirror `@okkly/react`'s `<Popper>` name-for-name, which in turn
 * follows MUI's Popper API (https://mui.com/material-ui/api/popper/) as
 * closely as this design allows: `open`/`anchorEl`/`placement`/`keepMounted`/
 * `disablePortal`/`container`/`modifiers`/`popperOptions`/`transition`/
 * `matchAnchorWidth`/`minWidth` match name-for-name. Deliberate gaps: no
 * `sx`/`classes`/`slots`/`slotProps`, no `component` polymorphism, no RTL
 * `direction` flip helper (ltr only for now).
 *
 * Angular-forced differences:
 * - `children` becomes the default `<ng-content />`.
 * - React's render-prop `children({ placement, TransitionProps })` has no
 *   Angular counterpart, so the same three values are public component state
 *   instead: read `resolvedPlacement()` off a template reference variable
 *   (`<okkly-popper #popper>` … `popper.resolvedPlacement()`), and drive a
 *   transition by calling `notifyEnter()` as it starts and `notifyExited()`
 *   when it has finished — the latter is what lets the popper stay mounted for
 *   the whole way out. `growSurface()` in `src/helpers/transitions.ts` wires
 *   both for you, as `OkklyPopover` and `OkklyTooltip` do.
 * - `popperRef` becomes the `popperInstance()` signal plus `update()`.
 * - The popper is moved into the portal container, which leaves the
 *   `<okkly-popper>` host element behind holding nothing — so a `class` on it
 *   would never reach the surface a stylesheet targets. `popperClass` puts
 *   classes on the portalled root instead, and the host is `display: contents`
 *   so it stays out of the caller's layout.
 */
@Component({
  selector: "okkly-popper",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule this renders lives in @okkly/design-system as a global BEM
  // class inside the `okkly` cascade layer; scoping attributes would only add
  // noise to the DOM.
  encapsulation: ViewEncapsulation.None,
  host: { style: "display: contents" },
  templateUrl: "./Popper.html",
})
export class OkklyPopper {
  /**
   * Whether the popper is on screen.
   *
   * @default undefined
   */
  readonly open = input.required<boolean, unknown>({ transform: booleanAttribute });
  /**
   * Element the popper is positioned against. A virtual element (anything with
   * `getBoundingClientRect`) or a getter returning one both work.
   *
   * @default undefined
   */
  readonly anchorEl = input<PopperAnchorEl>();
  /**
   * Side of the anchor the popper is placed on, before `flip` gets a say.
   *
   * @default "bottom"
   */
  readonly placement = input<PopperPlacement>("bottom");
  /**
   * Whether the content stays in the DOM while closed, hidden with `display: none`.
   *
   * @default false
   */
  readonly keepMounted = input(false, { transform: booleanAttribute });
  /**
   * Whether the popper renders in place instead of in the portal container.
   *
   * @default false
   */
  readonly disablePortal = input(false, { transform: booleanAttribute });
  /**
   * Node the popper is portalled into. Defaults to the anchor's document body.
   *
   * @default undefined
   */
  readonly container = input<Element | DocumentFragment | null>();
  /**
   * Extra Popper.js modifiers, appended to the ones this component sets up.
   *
   * @default undefined
   */
  readonly modifiers = input<Array<Partial<Modifier<string, object>>>>();
  /**
   * Options handed to `createPopper`, merged over this component's own.
   *
   * @default {}
   */
  readonly popperOptions = input<Partial<Options>>({});
  /**
   * Whether the content drives an enter/exit transition, which keeps the popper
   * mounted and positioned until `notifyExited()` says it has finished.
   *
   * @default false
   */
  readonly transition = input(false, { transform: booleanAttribute });
  /**
   * Size the popper from its anchor — what a select or an autocomplete listbox
   * wants, so the panel lines up with the field. `true` pins the width to the
   * anchor's exactly; `"min"` uses it as a floor instead, so a `minWidth` (or
   * longer content) can make the panel wider than the field, never narrower.
   * MUI has no prop for this; it is done there with a Popper.js modifier, and
   * that is exactly what this is, just named.
   *
   * @default false
   */
  readonly matchAnchorWidth = input<PopperMatchAnchorWidth>(false);
  /**
   * Floor for the popper's width. Pairs with `matchAnchorWidth` for narrow anchors.
   *
   * @default undefined
   */
  readonly minWidth = input<number | string>();
  /**
   * ARIA role of the popper root.
   *
   * @default "tooltip"
   */
  readonly role = input<string>("tooltip");
  /**
   * Classes for the portalled popper root, which a `class` on the host cannot reach.
   *
   * @default ""
   */
  readonly popperClass = input<string>("");

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly popperElement = viewChild<ElementRef<HTMLElement>>("popperElement");
  /** The portalled root, kept reachable so it can be taken down on destroy. */
  private portalledNode: HTMLElement | null = null;

  /**
   * Whether the exit transition has finished. Starts `true` so a popper that
   * opens closed does not think it is mid-exit.
   */
  private readonly exited = signal(true);
  private readonly instance = signal<Instance | null>(null);
  private readonly placementState = signal<PopperPlacement>("bottom");

  /**
   * The placement Popper.js actually resolved to, which can differ from the
   * requested one once `flip`/`preventOverflow` keep the popper on screen.
   */
  readonly resolvedPlacement = this.placementState.asReadonly();
  /** The live Popper.js instance, or `null` while the popper is unmounted. */
  readonly popperInstance = this.instance.asReadonly();

  /**
   * Whether the node is in the DOM at all. Deliberately not the same thing as
   * `open`: during an exit transition the popper is closed but still on screen,
   * and it has to stay positioned for the whole way out.
   */
  protected readonly shouldRender = computed(
    () => this.keepMounted() || this.open() || (this.transition() && !this.exited()),
  );

  private readonly resolvedAnchor = computed(() => resolveAnchorEl(this.anchorEl()));

  private readonly portalTarget = computed<Element | DocumentFragment>(() => {
    const container = this.container();
    if (container) return container;
    const anchor = this.resolvedAnchor();
    if (anchor && isHTMLElement(anchor)) return anchor.ownerDocument.body;
    return this.document.body;
  });

  protected readonly rootStyle = computed<Record<string, string>>(() => {
    // Must agree with the `strategy: "fixed"` the instance is created with.
    const style: Record<string, string> = { position: "fixed", top: "0", left: "0" };
    if (!this.open() && this.keepMounted() && (!this.transition() || this.exited())) {
      style["display"] = "none";
    }
    const minWidth = this.minWidth();
    if (minWidth !== undefined) {
      style["min-width"] = typeof minWidth === "number" ? `${minWidth}px` : minWidth;
    }
    return style;
  });

  constructor() {
    // An opening popper is no longer mid-exit, whether or not anything ever
    // calls `notifyEnter()`.
    effect(() => {
      if (this.open()) this.exited.set(false);
    });

    // The requested placement seeds the resolved one, until Popper.js reports
    // back where it really put the popper.
    effect(() => this.placementState.set(this.placement()));

    afterRenderEffect(() => {
      const element = this.popperElement()?.nativeElement ?? null;
      this.portalledNode = element;
      if (!element) return;
      portalTo(element, this.disablePortal() ? this.host.nativeElement : this.portalTarget());
    });

    inject(DestroyRef).onDestroy(() => this.portalledNode?.remove());

    afterRenderEffect((onCleanup) => {
      const anchor = this.resolvedAnchor();
      const element = this.popperElement()?.nativeElement;
      const disablePortal = this.disablePortal();
      const placement = this.placement();
      const matchAnchorWidth = this.matchAnchorWidth();
      const extraModifiers = this.modifiers();
      const popperOptions = this.popperOptions();
      if (!this.shouldRender() || !anchor || !element) return;

      let popperModifiers: Array<Partial<Modifier<string, object>>> = [
        { name: "preventOverflow", options: { altBoundary: disablePortal } },
        { name: "flip", options: { altBoundary: disablePortal } },
        {
          name: "onUpdate",
          enabled: true,
          phase: "afterWrite",
          fn: ({ state }) => this.placementState.set(state.placement),
        },
      ];

      if (matchAnchorWidth) {
        // `"min"` writes the floor and leaves `width` alone, so whatever the
        // caller asked for still decides how wide the panel actually is.
        const property = matchAnchorWidth === "min" ? "minWidth" : "width";
        popperModifiers.push({
          name: "matchAnchorWidth",
          enabled: true,
          phase: "beforeWrite",
          requires: ["computeStyles"],
          fn: ({ state }) => {
            state.styles["popper"][property] = `${state.rects.reference.width}px`;
          },
          // Sized once up front too, so the first paint is not a frame at the
          // wrong width that then snaps.
          effect: ({ state }) => {
            const reference = state.elements.reference as HTMLElement;
            state.elements.popper.style[property] = `${reference.getBoundingClientRect().width}px`;
          },
        });
      }

      if (extraModifiers) popperModifiers = popperModifiers.concat(extraModifiers);
      if (popperOptions.modifiers)
        popperModifiers = popperModifiers.concat(popperOptions.modifiers);

      const popper = createPopper(anchor, element, {
        // Must agree with the `position: fixed` `rootStyle` puts on the root.
        // Popper.js defaults to `absolute` and writes that onto the element;
        // the two only differ once the instance is destroyed, at which point
        // the style restored below resolves against the offset parent instead
        // of the viewport — and the popper jumps to a corner mid-close.
        strategy: "fixed",
        placement,
        ...popperOptions,
        modifiers: popperModifiers,
      });
      this.instance.set(popper);

      onCleanup(() => {
        const { style } = element;
        const { position, top, left, transform } = style;
        popper.destroy();
        style.position = position;
        style.top = top;
        style.left = left;
        style.transform = transform;
        this.instance.set(null);
      });
    });

    // React repositions on every render, because content that changed size
    // has to be re-placed against its anchor; this is the same, after every
    // change detection pass.
    afterEveryRender(() => this.instance()?.forceUpdate());
  }

  /**
   * Tells the popper an enter transition has started, so it stops counting as
   * exited — the counterpart of React's `TransitionProps.onEnter`.
   */
  notifyEnter(): void {
    this.exited.set(false);
  }

  /**
   * Tells the popper an exit transition has finished, which is what finally
   * unmounts it — the counterpart of React's `TransitionProps.onExited`.
   */
  notifyExited(): void {
    this.exited.set(true);
  }

  /** Repositions the popper now — the counterpart of `popperRef.current.forceUpdate()`. */
  update(): void {
    this.instance()?.forceUpdate();
  }
}
