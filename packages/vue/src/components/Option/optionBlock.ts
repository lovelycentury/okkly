import { inject, provide, type InjectionKey } from "vue";

/**
 * BEM block the option parts namespace themselves under — `"okkly-select"` or
 * `"okkly-autocomplete"`. Select and Autocomplete each provide their own, so a
 * custom `#option` slot written for one keeps that component's listbox
 * styling.
 *
 * Outside either popup there is no block, and the parts render as plain
 * elements: the primitives inherit the styling of the list they are rendered
 * in rather than carrying a block of their own.
 */
const OptionBlockKey: InjectionKey<string | null> = Symbol("OptionBlock");

/** Names the BEM block for every option part rendered below it. */
export function provideOptionBlock(block: string): void {
  provide(OptionBlockKey, block);
}

/** The block in scope, or `null` outside a Select/Autocomplete listbox. */
export function useOptionBlock(): string | null {
  return inject(OptionBlockKey, null);
}

export function optionElement(block: string | null, part: string): string | undefined {
  return block ? `${block}__${part}` : undefined;
}
