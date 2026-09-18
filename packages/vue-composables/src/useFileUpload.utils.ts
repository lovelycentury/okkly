/**
 * For a full list of media types, see the
 * [official docs](https://www.iana.org/assignments/media-types/media-types.xhtml).
 */
export type MediaType =
  `${"application" | "audio" | "font" | "image" | "model" | "text" | "video"}/${string}`;

/**
 * Unique file type specifier — a file extension (`".pdf"`), a wildcard media type
 * (`"image/*"`) or an exact media type (`"application/pdf"`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#unique_file_type_specifiers
 */
export type FileType = `.${string}` | `${"audio" | "video" | "image"}/*` | MediaType;

/**
 * Binary prefixed file size, e.g. `"42MiB"`.
 *
 * @see https://en.wikipedia.org/wiki/Binary_prefix
 */
export type BinaryPrefixedSize = `${number}${"" | "Ki" | "Mi" | "Gi" | "Ti" | "Pi"}B`;

/**
 * Why a selected file is not accepted. Files carrying an issue stay in the selection —
 * the UI marks them so the user can remove them deliberately.
 */
export type FileUploadIssue =
  | { type: "fileType"; file: File; extension: string }
  | { type: "maxSize"; file: File; maxSize: number }
  | { type: "maxTotalSize"; file: File; maxTotalSize: number }
  | { type: "maxCount"; file: File; maxCount: number };

const BINARY_PREFIX_FACTORS: Record<string, number> = {
  "": 1,
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  Pi: 1024 ** 5,
};

const DECIMAL_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * Converts a file size to bytes. Numbers are passed through, binary prefixed strings
 * (e.g. `"42MiB"`) are expanded (42 * 1024 * 1024).
 */
export function parseFileSize(size: number | BinaryPrefixedSize): number {
  if (typeof size === "number") return size;

  const match = /^(\d+(?:\.\d+)?)\s*(Ki|Mi|Gi|Ti|Pi)?B$/.exec(size.trim());
  if (!match) return Number.NaN;

  return Number(match[1]) * BINARY_PREFIX_FACTORS[match[2] ?? ""];
}

/**
 * Formats a file size for display. Sizes are shown in decimal notation (e.g. 44 MB for
 * 42MiB) because users are mostly non-technical and decimal units are simpler to read.
 */
export function formatFileSize(size: number | BinaryPrefixedSize, locale?: string): string {
  const bytes = parseFileSize(size);
  if (Number.isNaN(bytes)) return "";

  let value = Math.abs(bytes);
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < DECIMAL_UNITS.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(bytes < 0 ? -value : value);

  return `${formatted} ${DECIMAL_UNITS[unitIndex]}`;
}

/** Whether the file matches at least one of the accepted file type specifiers. */
export function matchesFileType(file: File, accept?: FileType[]): boolean {
  if (!accept?.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept.some((specifier) => {
    const token = specifier.trim().toLowerCase();
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** File extension without the leading dot, or an empty string if there is none. */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "") : "";
}
