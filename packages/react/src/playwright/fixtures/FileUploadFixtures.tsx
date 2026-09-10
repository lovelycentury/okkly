"use client";

import { FileUpload, type FileUploadListType } from "../../components/FileUpload/FileUpload";

/**
 * Test fixtures for `FileUpload`.
 *
 * Two of its props cannot travel across the Playwright boundary: `renderFile`
 * and `getFileStatus` must return a value synchronously inside the browser,
 * while a function prop reaching Node becomes an async proxy. These wrappers
 * supply them in the browser, and expose the parts a test needs to vary as
 * ordinary serializable props.
 *
 * They live under `src/playwright/` and are excluded from the published build.
 */

export type CustomRowFileUploadProps = {
  listType?: FileUploadListType;
};

/** Renders each selected file through a custom `renderFile` row. */
export function CustomRowFileUpload({ listType }: CustomRowFileUploadProps) {
  return (
    <FileUpload
      multiple
      listType={listType}
      renderFile={({ file }) => <span>custom {file.name}</span>}
    />
  );
}

export type StatusFileUploadProps = {
  text?: string;
  progress?: number;
};

/** Reports an external upload status, with a progress bar, for every file. */
export function StatusFileUpload({ text = "Uploading…", progress = 40 }: StatusFileUploadProps) {
  return <FileUpload multiple getFileStatus={() => ({ text, color: "primary", progress })} />;
}
