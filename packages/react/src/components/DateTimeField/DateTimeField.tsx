"use client";

import { forwardRef, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { iconCalendar, iconClock } from "@okkly/icons";
import {
  maskitoDateTime,
  maskitoParseDateTime,
  maskitoStringifyDateTime,
  type MaskitoDateTimeParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";
import "@okkly/design-system/components/DateTimeField/DateTimeField.scss";
import { DateTimePicker } from "../DateTimePicker/DateTimePicker";
import { Field, getFieldIds } from "../Field/Field";
import { Popover } from "../Popover/Popover";
import type { DateTimeFieldProps } from "./DateTimeField.types";

const DATE_TIME_PARAMS: MaskitoDateTimeParams = {
  dateMode: "dd/mm/yyyy",
  timeMode: "HH:MM",
  dateTimeSeparator: ", ",
  dateSeparator: ".",
};

function stringifyDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyDateTime(value, DATE_TIME_PARAMS);
}

export const DateTimeField = forwardRef<HTMLInputElement, DateTimeFieldProps>(
  function DateTimeField(
    {
      label,
      hideLabel = false,
      size = "medium",
      color = "primary",
      error = false,
      helperText,
      fullWidth = false,
      disabled = false,
      value: valueProp,
      defaultValue = null,
      onChange,
      min,
      max,
      open: openProp,
      onOpenChange,
      placeholder = "dd.mm.yyyy, HH:mm",
      className,
      id,
      required = false,
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const { helperId } = getFieldIds(inputId, Boolean(label), Boolean(helperText));
    const controlRef = useRef<HTMLDivElement>(null);

    const isControlled = valueProp !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
    const resolvedValue = isControlled ? (valueProp ?? null) : uncontrolledValue;

    const [text, setText] = useState(() =>
      stringifyDateTime(valueProp !== undefined ? valueProp : defaultValue),
    );
    const valueKey =
      valueProp === undefined ? "uncontrolled" : valueProp ? valueProp.getTime() : "null";

    useEffect(() => {
      if (valueProp === undefined) return;
      setText(stringifyDateTime(valueProp));
    }, [valueKey, valueProp]);

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = openProp !== undefined ? openProp : uncontrolledOpen;

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    const dateTimeParams = useMemo<MaskitoDateTimeParams>(
      () => ({ ...DATE_TIME_PARAMS, min, max }),
      [min, max],
    );
    const maskOptions = useMemo(() => maskitoDateTime(dateTimeParams), [dateTimeParams]);
    const maskitoRef = useMaskito({ options: maskOptions });

    const setInputRef = (node: HTMLInputElement | null) => {
      maskitoRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const commit = (next: Date | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    };

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      setText(next);
      if (next === "") {
        commit(null);
        return;
      }
      const parsed = maskitoParseDateTime(next, dateTimeParams);
      if (parsed) commit(parsed);
    };

    const handlePickerChange = (date: Date) => {
      setText(maskitoStringifyDateTime(date, dateTimeParams));
      commit(date);
    };

    const handleConfirm = (date: Date) => {
      setText(maskitoStringifyDateTime(date, dateTimeParams));
      commit(date);
      setOpen(false);
    };

    // A plain button, not `IconButton`: the field's control box already supplies
    // the padding, so a button with its own hit box inflated the field's height.
    const trigger = (
      <button
        type="button"
        className="okkly-date-time-field__trigger"
        disabled={disabled}
        aria-label="Open date time picker"
        aria-expanded={isOpen}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => setOpen(!isOpen)}
      >
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCalendar }} />
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconClock }} />
      </button>
    );

    return (
      <>
        <Field
          block="okkly-date-time-field"
          id={inputId}
          label={label}
          hideLabel={hideLabel}
          size={size}
          color={color}
          error={error}
          helperText={helperText}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          className={className}
          controlProps={{ ref: controlRef }}
          endAdornment={trigger}
        >
          <input
            ref={setInputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            className="okkly-date-time-field__input"
            value={text}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-invalid={error || undefined}
            aria-describedby={helperId}
            onInput={handleInput}
          />
        </Field>

        <Popover
          open={isOpen}
          anchorEl={controlRef.current}
          onClose={() => setOpen(false)}
          placement="bottom-start"
          className="okkly-date-time-field-popover"
        >
          <DateTimePicker
            value={resolvedValue}
            onChange={handlePickerChange}
            onConfirm={handleConfirm}
            min={min}
            max={max}
            color={color}
          />
        </Popover>
      </>
    );
  },
);
