export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "fullWidth" | "inset" | "middle";
export type DividerTextAlign = "left" | "center" | "right";

/**
 * Props follow MUI's Divider API (https://mui.com/material-ui/api/divider/)
 * as closely as this design allows, mirroring `@okkly/react`'s `<Divider>`
 * name-for-name: `orientation`/`flexItem`/`textAlign`/`variant` all match.
 * Deliberate gaps carried over from React: no `sx`/`classes`, no `absolute`
 * positioning (always in-flow), `variant` maps to inset spacing on the line
 * segments.
 *
 * Vue-forced difference: `children` becomes the default slot (the optional
 * centered label).
 */
export interface DividerProps {
  /**
   * Line direction.
   *
   * @default "horizontal"
   */
  orientation?: DividerOrientation;
  /**
   * Stretch to fill a flex container's cross axis.
   *
   * @default false
   */
  flexItem?: boolean;
  /**
   * Label alignment when the default slot is filled.
   *
   * @default "center"
   */
  textAlign?: DividerTextAlign;
  /**
   * Inset spacing variant.
   *
   * @default "fullWidth"
   */
  variant?: DividerVariant;
}
