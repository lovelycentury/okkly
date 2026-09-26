import { afterEveryRender, signal, type Signal } from "@angular/core";

/** Whether a node is something the consumer projected, rather than whitespace or a control-flow anchor. */
function isProjectedContent(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) return true;
  return node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim();
}

/**
 * Whether a default `<ng-content />` slot received anything — the Angular
 * stand-in for React's `children != null`, which a template cannot ask.
 * `slot` returns the element the `<ng-content />` sits in; it is read off the
 * DOM after every render, so an `@if` around the projected content is
 * followed. Call it in an injection context.
 */
export function projectedContent(slot: () => HTMLElement): Signal<boolean> {
  const hasContent = signal(false);
  afterEveryRender({
    read: () => {
      const next = Array.from(slot().childNodes).some(isProjectedContent);
      if (next !== hasContent()) hasContent.set(next);
    },
  });
  return hasContent.asReadonly();
}
