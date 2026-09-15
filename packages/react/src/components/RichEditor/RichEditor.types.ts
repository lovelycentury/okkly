import type { ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";

export type RichEditorColor = "primary" | "dante";
export type RichEditorFormat = "html" | "json";
export type RichEditorToolbar = "full" | "compact" | "none";
export type RichEditorValue = string | JSONContent;

export type SaveStatus = "saved" | "dirty";

export type SlashItem = {
  id: string;
  label: string;
  kbd: string;
  icon: string;
  keywords: string[];
  run: () => void;
};

/**
 * TipTap-based rich text editor. No MUI equivalent — closest is a custom
 * composition of MUI TextField + a third-party editor; this design's toolbar,
 * slash menu, word counter, and autosave status have no direct API to mirror.
 *
 * Deliberate gaps vs catalog: no `markdown` format, no `bubble` toolbar,
 * no `blocks`/`marks` allow-lists (all StarterKit + Underline + Link marks
 * are always available).
 */
export interface RichEditorProps {
  /**
   * Document value. HTML string by default; JSONContent when `format="json"`.
   *
   * @default undefined
   * @type {RichEditorValue}
   */
  value?: RichEditorValue;
  /**
   * Uncontrolled initial document.
   *
   * @default undefined
   * @type {RichEditorValue}
   */
  defaultValue?: RichEditorValue;
  /**
   * Fires on every content update with the serialized document.
   *
   * @default undefined
   * @type {(value: string | JSONContent) => void}
   */
  onChange?: (value: string | JSONContent) => void;
  /**
   * Serialization of `value` / `onChange`.
   *
   * @default "html"
   * @type {RichEditorFormat}
   */
  format?: RichEditorFormat;
  /**
   * Which formatting bar is shown. Hidden when `readonly`.
   *
   * @default "full"
   * @type {RichEditorToolbar}
   */
  toolbar?: RichEditorToolbar;
  /**
   * Empty-document hint.
   *
   * @default "Write something…"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Soft character limit — shows error styling when exceeded.
   *
   * @default undefined
   * @type {number}
   */
  maxLength?: number;
  /**
   * Idle ms before status flips to "Saved". While dirty shows "Not saved". Pass `false` to hide the save status.
   *
   * @default 5000
   * @type {number | false}
   */
  autosave?: number | false;
  /**
   * “/” opens the block picker in an empty paragraph.
   *
   * @default true
   * @type {boolean}
   */
  slashMenu?: boolean;
  /**
   * Renders the document only — no toolbar, no editing.
   *
   * @default false
   * @type {boolean}
   */
  readonly?: boolean;
  /**
   * Non-interactive; dims to 40%.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Marks invalid + red border.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Field label above the shell.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Caption below the shell.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Stretch to container width (default true).
   *
   * @default true
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Tints the focus ring/glow. `dante` is a rare accent moment.
   *
   * @default "primary"
   * @type {RichEditorColor}
   */
  color?: RichEditorColor;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}
