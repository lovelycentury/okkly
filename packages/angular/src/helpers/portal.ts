/**
 * React portals with `createPortal` and Vue with `<Teleport>`; Angular has
 * neither, so the overlays render their root inside their own template and
 * then move that one element into the portal container. Angular keeps owning
 * the node — it removes it on destroy from wherever it currently sits — so
 * nothing here has to be undone.
 */

/**
 * Moves `node` into `target`, unless it is already there.
 *
 * Whoever calls this keeps the moved node reachable and removes it from its
 * own `DestroyRef.onDestroy`. Angular takes a view's nodes down one at a time
 * only when a block inside it is removed — destroying the whole component
 * drops its host element and everything still inside it in one go, which a
 * node that has been moved out is no longer part of.
 */
export function portalTo(node: HTMLElement, target: Element | DocumentFragment): void {
  if (node.parentNode === target) return;
  target.appendChild(node);
}
