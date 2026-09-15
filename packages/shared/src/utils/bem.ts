/**
 * Build BEM class names for a given block.
 *
 * @example
 * const button = bem("okkly-button");
 * button();                       // "okkly-button"
 * button("label");                // "okkly-button__label"
 * button(null, "primary");        // "okkly-button okkly-button--primary"
 * button("icon", "disabled");     // "okkly-button__icon okkly-button__icon--disabled"
 */
export function bem(block: string) {
  return (element?: string | null, ...modifiers: (string | false | null | undefined)[]): string => {
    const base = element ? `${block}__${element}` : block;
    const classes = [base];
    for (const modifier of modifiers) {
      if (modifier) classes.push(`${base}--${modifier}`);
    }
    return classes.join(" ");
  };
}
