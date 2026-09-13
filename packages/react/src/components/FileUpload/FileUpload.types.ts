import type { ReactNode, Ref } from "react";
import type { BinaryPrefixedSize, FileType } from "@okkly/react-hooks";

export type FileUploadSize = "large" | "medium" | "small";
export type FileUploadListType = "list" | "maxHeight" | "button" | "hidden";
export type FileUploadStatusColor =
  "primary" | "neutral" | "danger" | "warning" | "success" | "info";

/** Status line shown under a file name, optionally with a progress bar. */
export interface FileUploadStatus {
  /**
   * Status text shown next to the file size.
   *
   * @default undefined
   * @type {ReactNode}
   */
  text?: ReactNode;
  /**
   * Status color. Also tints the progress bar.
   *
   * @default "neutral"
   * @type {FileUploadStatusColor}
   */
  color?: FileUploadStatusColor;
  /**
   * Upload progress in percent (0–100). Renders a progress bar at the bottom of the row.
   *
   * @default undefined
   * @type {number}
   */
  progress?: number;
}

/** Every user-facing string of the component, so it can be translated without an i18n layer. */
export interface FileUploadLabels {
  trigger: string;
  clickToUpload: string;
  orDragAndDrop: string;
  maxSizeHint: (size: string) => string;
  maxTotalSizeHint: (size: string, totalSize: string) => string;
  totalSizeHint: (totalSize: string) => string;
  maxCountHint: (count: number) => string;
  allowedTypesHint: (types: string) => string;
  requiredError: string;
  fileTypeError: (extension: string) => string;
  maxSizeError: (size: string) => string;
  maxTotalSizeError: (size: string) => string;
  maxCountError: (count: number) => string;
  removeFile: (filename: string) => string;
  showFiles: string;
  hideFiles: string;
}

export type FileUploadValue<TMultiple extends boolean> = TMultiple extends true
  ? File[]
  : File | null;

/**
 * Props follow sit-onyx's OnyxFileUpload API
 * (https://onyx.schwarz/development/components/file-upload.html) as closely as React
 * allows: `multiple`/`accept`/`maxSize`/`maxTotalSize`/`maxCount`/`replace`/`size`/
 * `listType`/`required`/`name`/`disabled` match name-for-name, and onyx's `v-model`
 * becomes MUI-style `value`/`defaultValue`/`onChange`. Onyx's default slot for
 * overriding a file row becomes `renderFile`.
 * Deliberate gaps: no `density`/`skeleton` (neither exists in this library yet), and
 * no `OnyxFileCard` — the file row is rendered inline and customized via `renderFile`.
 */
export interface FileUploadProps<TMultiple extends boolean = false> {
  /**
   * Currently selected file(s) — an array when `multiple`, a single file otherwise.
   * Makes the component controlled.
   *
   * @default undefined
   * @type {FileUploadValue<TMultiple>}
   */
  value?: FileUploadValue<TMultiple>;
  /**
   * Initially selected file(s) for uncontrolled usage.
   *
   * @default undefined
   * @type {FileUploadValue<TMultiple>}
   */
  defaultValue?: FileUploadValue<TMultiple>;
  /**
   * Called whenever the selection changes.
   *
   * @default undefined
   * @type {(value: FileUploadValue<TMultiple>) => void}
   */
  onChange?: (value: FileUploadValue<TMultiple>) => void;
  /**
   * Whether multiple files can be selected. Also switches `value` to an array.
   *
   * @default false
   * @type {TMultiple}
   */
  multiple?: TMultiple;
  /**
   * File types to allow, e.g. `[".pdf", "image/*"]`. Empty allows every type.
   *
   * @default undefined
   * @type {FileType[]}
   */
  accept?: FileType[];
  /**
   * Max. allowed size per file — bytes or a binary prefixed size (e.g. `"42MiB"`).
   * Shown to the user in decimal notation (44.1 MB).
   *
   * @default undefined
   * @type {number | BinaryPrefixedSize}
   */
  maxSize?: number | BinaryPrefixedSize;
  /**
   * Max. allowed size of all files combined when `multiple` is enabled.
   *
   * @default undefined
   * @type {number | BinaryPrefixedSize}
   */
  maxTotalSize?: number | BinaryPrefixedSize;
  /**
   * Max. number of files that can be selected when `multiple` is enabled.
   *
   * @default undefined
   * @type {number}
   */
  maxCount?: number;
  /**
   * Whether a new selection replaces the current one instead of being appended.
   *
   * @default false
   * @type {boolean}
   */
  replace?: boolean;
  /**
   * Visual size of the drop zone. `large` is the illustrated drop zone, `medium` a
   * compact one, `small` a button-like trigger whose error is shown in a tooltip.
   *
   * @default "large"
   * @type {FileUploadSize}
   */
  size?: FileUploadSize;
  /**
   * How the selected files are listed. `maxHeight` scrolls after
   * `--okkly-file-upload-max-files` rows, `button` adds a show/hide toggle and
   * `hidden` renders no list at all (for a custom one).
   *
   * @default "list"
   * @type {FileUploadListType}
   */
  listType?: FileUploadListType;
  /**
   * Whether at least one file is required.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Forces the error state. When omitted, the error state follows the built-in
   * validation (required + per-file constraints).
   *
   * @default undefined
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Whether validation messages are shown. When omitted they appear once the user has
   * interacted with the component.
   *
   * @default undefined
   * @type {boolean}
   */
  showError?: boolean;
  /**
   * Name of the underlying file input, for native form submission.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Whether the upload is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Label rendered above the drop zone.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Overrides for the user-facing strings.
   *
   * @default defaultFileUploadLabels
   * @type {Partial<FileUploadLabels>}
   */
  labels?: Partial<FileUploadLabels>;
  /**
   * Locale used to format file sizes.
   *
   * @default undefined
   * @type {string}
   */
  locale?: string;
  /**
   * Status shown for a file — e.g. real upload progress. Overrides the built-in
   * validation status when it returns a value.
   *
   * @default undefined
   * @type {(file: File, index: number) => FileUploadStatus | undefined}
   */
  getFileStatus?: (file: File, index: number) => FileUploadStatus | undefined;
  /**
   * Renders a file row instead of the built-in one.
   *
   * @default undefined
   * @type {(context: FileUploadRenderContext) => ReactNode}
   */
  renderFile?: (context: FileUploadRenderContext) => ReactNode;
  /**
   * Called whenever the validity of the underlying input changes.
   *
   * @default undefined
   * @type {(validity: ValidityState) => void}
   */
  onValidityChange?: (validity: ValidityState) => void;
  /**
   * If `true`, the component takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Ref to the underlying file input.
   *
   * @default undefined
   * @type {Ref<HTMLInputElement>}
   */
  inputRef?: Ref<HTMLInputElement>;
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

/** What `renderFile` receives for each selected file. */
export interface FileUploadRenderContext {
  file: File;
  index: number;
  status?: FileUploadStatus;
  disabled: boolean;
  remove: () => void;
}
