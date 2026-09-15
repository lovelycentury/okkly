"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  iconAlertTriangle,
  iconArchive,
  iconCode,
  iconFile,
  iconFilm,
  iconImage,
  iconInfo,
  iconMusic,
  iconTrash,
  iconUpload,
} from "@okkly/icons";
import {
  formatFileSize,
  useFileUpload,
  type BinaryPrefixedSize,
  type FileUploadIssue,
} from "@okkly/react-hooks";
import "@okkly/design-system/components/FileUpload/FileUpload.scss";
import { IconButton } from "../IconButton/IconButton";
import { Tooltip } from "../Tooltip/Tooltip";
import type {
  FileUploadStatus,
  FileUploadLabels,
  FileUploadValue,
  FileUploadProps,
} from "./FileUpload.types";

export const defaultFileUploadLabels: FileUploadLabels = {
  trigger: "Select file",
  clickToUpload: "Click to upload",
  orDragAndDrop: "or drag and drop",
  maxSizeHint: (size) => `Max. file size: ${size}`,
  maxTotalSizeHint: (size, totalSize) => `Max. file size: ${size} (${totalSize} in total)`,
  totalSizeHint: (totalSize) => `Max. file size: ${totalSize} in total`,
  maxCountHint: (count) => `Max. ${count} files`,
  allowedTypesHint: (types) => `Allowed file types: ${types}`,
  requiredError: "Please select a file.",
  fileTypeError: (extension) => `.${extension} files are not allowed`,
  maxSizeError: (size) => `Exceeds the max. file size of ${size}`,
  maxTotalSizeError: (size) => `Exceeds the max. total size of ${size}`,
  maxCountError: (count) => `Exceeds the limit of ${count} files`,
  removeFile: (filename) => `Remove ${filename}`,
  showFiles: "Show files",
  hideFiles: "Hide files",
};

const ICONS_BY_TYPE: [test: RegExp, icon: string][] = [
  [/^image\//, iconImage],
  [/^video\//, iconFilm],
  [/^audio\//, iconMusic],
  [/(zip|tar|gzip|rar|7z)/, iconArchive],
  [/(json|javascript|typescript|xml|html|css)/, iconCode],
];

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase();
  return ICONS_BY_TYPE.find(([test]) => test.test(type))?.[1] ?? iconFile;
}

function Icon({ svg, className }: { svg: string; className?: string }) {
  // @okkly/icons ships trusted, build-time bundled SVG strings — not user input.
  return (
    <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

/**
 * Drop zone for selecting files, with drag & drop, per-file validation and a list of
 * the current selection.
 */
export function FileUpload<TMultiple extends boolean = false>({
  value,
  defaultValue,
  onChange,
  multiple,
  accept,
  maxSize,
  maxTotalSize,
  maxCount,
  replace = false,
  size = "large",
  listType = "list",
  required = false,
  error,
  showError,
  name,
  disabled = false,
  label,
  labels,
  locale,
  getFileStatus,
  renderFile,
  onValidityChange,
  fullWidth = false,
  inputRef,
  className,
  id,
}: FileUploadProps<TMultiple>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const isMultiple = multiple === true;

  const [touched, setTouched] = useState(false);
  const [filesHidden, setFilesHidden] = useState(false);
  const localInputRef = useRef<HTMLInputElement | null>(null);

  const text = useMemo(() => ({ ...defaultFileUploadLabels, ...labels }), [labels]);
  const format = (fileSize: number | BinaryPrefixedSize) => formatFileSize(fileSize, locale);

  const toFiles = (next: FileUploadValue<TMultiple> | undefined): File[] | undefined => {
    if (next === undefined) return undefined;
    if (Array.isArray(next)) return next;
    return next ? [next] : [];
  };

  const upload = useFileUpload({
    value: toFiles(value),
    defaultValue: toFiles(defaultValue),
    onChange: (files) => {
      setTouched(true);
      onChange?.((isMultiple ? files : (files[0] ?? null)) as FileUploadValue<TMultiple>);
    },
    accept,
    multiple: isMultiple,
    replace,
    maxSize,
    maxTotalSize: isMultiple ? maxTotalSize : undefined,
    maxCount: isMultiple ? maxCount : undefined,
    disabled,
  });

  const issueMessage = (issue: FileUploadIssue): string => {
    switch (issue.type) {
      case "fileType":
        return text.fileTypeError(issue.extension);
      case "maxSize":
        return text.maxSizeError(format(issue.maxSize));
      case "maxTotalSize":
        return text.maxTotalSizeError(format(issue.maxTotalSize));
      case "maxCount":
        return text.maxCountError(issue.maxCount);
    }
  };

  const requiredMessage = required && upload.files.length === 0 ? text.requiredError : undefined;
  const firstIssue = upload.issues.find(Boolean);
  const validationMessage = requiredMessage ?? (firstIssue ? issueMessage(firstIssue) : undefined);

  const errorVisible = showError ?? touched;
  // per-file issues are reported on their own row, so the drop zone only carries the
  // required error — it would otherwise repeat every row's message
  const errorMessage = errorVisible ? requiredMessage : undefined;
  const hasError = error ?? (errorVisible && Boolean(validationMessage));

  // keep the input's FileList in sync so `name` submits with the form and so the
  // validation message is anchored to a real form control
  useEffect(() => {
    const input = localInputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try {
      const transfer = new DataTransfer();
      upload.files.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    } catch {
      // environments without full DataTransfer support (e.g. jsdom) keep the input empty
    }
  }, [upload.files]);

  useEffect(() => {
    const input = localInputRef.current;
    if (!input) return;
    input.setCustomValidity(validationMessage ?? "");
    onValidityChange?.(input.validity);
  }, [validationMessage, onValidityChange]);

  const hasConstraints = Boolean(
    maxSize || (isMultiple && (maxTotalSize || maxCount)) || accept?.length,
  );
  const showDetails = size === "large" || (size !== "small" && hasConstraints);
  const showList =
    listType !== "hidden" && upload.files.length > 0 && !(listType === "button" && filesHidden);

  const classes = [
    "okkly-component",
    "okkly-file-upload",
    size !== "large" && `okkly-file-upload--${size}`,
    upload.isDragging && "okkly-file-upload--dragging",
    hasError && "okkly-file-upload--error",
    fullWidth && "okkly-file-upload--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootProps = upload.getRootProps();
  const inputProps = upload.getInputProps({
    ref: (node: HTMLInputElement | null) => {
      localInputRef.current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef && "current" in inputRef) {
        (inputRef as { current: HTMLInputElement | null }).current = node;
      }
    },
  });

  const dropzone = (
    <button
      {...rootProps}
      type="button"
      id={fieldId}
      className="okkly-file-upload__dropzone"
      disabled={disabled}
      aria-labelledby={label ? `${fieldId}-label` : undefined}
      aria-describedby={errorMessage && size !== "small" ? `${fieldId}-error` : undefined}
      aria-required={required || undefined}
      aria-invalid={hasError || undefined}
      onClick={(event) => {
        setTouched(true);
        rootProps.onClick?.(event);
      }}
    >
      {size === "large" ? (
        <Icon svg={iconUpload} className="okkly-file-upload__illustration" />
      ) : (
        <span className="okkly-file-upload__trigger">
          <Icon svg={iconUpload} />
          {text.trigger}
        </span>
      )}

      {showDetails && (
        <span className="okkly-file-upload__content">
          {size === "large" && (
            <span className="okkly-file-upload__title">
              <u>{text.clickToUpload}</u> {text.orDragAndDrop}
            </span>
          )}

          {maxSize != null && (
            <span className="okkly-file-upload__hint">
              {isMultiple && maxTotalSize != null
                ? text.maxTotalSizeHint(format(maxSize), format(maxTotalSize))
                : text.maxSizeHint(format(maxSize))}
            </span>
          )}
          {maxSize == null && isMultiple && maxTotalSize != null && (
            <span className="okkly-file-upload__hint">
              {text.totalSizeHint(format(maxTotalSize))}
            </span>
          )}
          {isMultiple && maxCount != null && (
            <span className="okkly-file-upload__hint">{text.maxCountHint(maxCount)}</span>
          )}
          {accept?.length ? (
            <span className="okkly-file-upload__hint">
              {text.allowedTypesHint(accept.join(", "))}
            </span>
          ) : null}

          {errorMessage && (
            <span className="okkly-file-upload__error" id={`${fieldId}-error`}>
              {errorMessage}
              <Icon svg={iconInfo} />
            </span>
          )}
        </span>
      )}
    </button>
  );

  return (
    <div className={classes}>
      {label && (
        <span id={`${fieldId}-label`} className="okkly-file-upload__label">
          {label}
        </span>
      )}

      {size === "small" && errorMessage ? (
        <Tooltip title={errorMessage}>{dropzone}</Tooltip>
      ) : (
        dropzone
      )}

      <input
        {...inputProps}
        className="okkly-file-upload__input"
        name={name}
        tabIndex={-1}
        aria-hidden="true"
      />

      {listType === "button" && upload.files.length > 0 && (
        <button
          type="button"
          className="okkly-file-upload__list-toggle"
          onClick={() => setFilesHidden((hidden) => !hidden)}
        >
          {filesHidden ? text.showFiles : text.hideFiles}
        </button>
      )}

      {showList && (
        <ul
          className={[
            "okkly-file-upload__list",
            listType === "maxHeight" && "okkly-file-upload__list--max-height",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {upload.files.map((file, index) => {
            const issue = upload.issues[index];
            const status: FileUploadStatus | undefined =
              getFileStatus?.(file, index) ??
              (issue ? { text: issueMessage(issue), color: "danger" } : undefined);
            const remove = () => {
              setTouched(true);
              upload.remove(index);
            };
            const key = `${file.name}-${file.lastModified}-${index}`;

            if (renderFile) {
              return <li key={key}>{renderFile({ file, index, status, disabled, remove })}</li>;
            }

            return (
              <li
                key={key}
                className={[
                  "okkly-file-upload__file",
                  status?.color === "danger" && "okkly-file-upload__file--error",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="okkly-file-upload__file-icon">
                  <Icon svg={status?.color === "danger" ? iconAlertTriangle : getFileIcon(file)} />
                </span>

                <span className="okkly-file-upload__file-body">
                  <span className="okkly-file-upload__file-name">{file.name}</span>
                  <span className="okkly-file-upload__file-details">
                    <span>{format(file.size)}</span>
                    {status?.text != null && (
                      <span
                        className={`okkly-file-upload__file-status okkly-file-upload__file-status--${status.color ?? "neutral"}`}
                      >
                        {status.text}
                      </span>
                    )}
                  </span>
                </span>

                <span className="okkly-file-upload__file-actions">
                  <IconButton
                    variant="ghost"
                    size="small"
                    aria-label={text.removeFile(file.name)}
                    disabled={disabled}
                    onClick={remove}
                    icon={<Icon svg={iconTrash} />}
                  />
                </span>

                {status?.progress != null && (
                  <span className="okkly-file-upload__progress">
                    <span
                      className={`okkly-file-upload__progress-bar okkly-file-upload__progress-bar--${status.color ?? "primary"}`}
                      style={{ width: `${Math.min(Math.max(status.progress, 0), 100)}%` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
