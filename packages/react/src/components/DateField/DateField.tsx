"use client";

import { forwardRef, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { iconCalendar } from "@okkly/icons";
import {
  maskitoDate,
  maskitoParseDate,
  maskitoStringifyDate,
  type MaskitoDateParams,
} from "@maskito/kit";
import { useMaskito } from "@maskito/react";
import "@okkly/design-system/components/DateField/DateField.scss";
import { Calendar, calendarToneStyle } from "../Calendar/Calendar";
import { Field, getFieldIds } from "../Field/Field";
import { Popover } from "../Popover/Popover";
import type { DateFieldProps } from "./DateField.types";

const DATE_PARAMS: MaskitoDateParams = { mode: "dd/mm/yyyy", separator: "." };

function stringifyDate(value: Date | null | undefined): string {
  if (!value) return "";
  return maskitoStringifyDate(value, DATE_PARAMS);
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
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
    placeholder = "dd.mm.yyyy",
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
    stringifyDate(valueProp !== undefined ? valueProp : defaultValue),
  );
  const valueKey =
    valueProp === undefined ? "uncontrolled" : valueProp ? valueProp.getTime() : "null";

  useEffect(() => {
    if (valueProp === undefined) return;
    setText(stringifyDate(valueProp));
  }, [valueKey, valueProp]);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = openProp !== undefined ? openProp : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const dateParams = useMemo<MaskitoDateParams>(() => ({ ...DATE_PARAMS, min, max }), [min, max]);
  const maskOptions = useMemo(() => maskitoDate(dateParams), [dateParams]);
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
    const parsed = maskitoParseDate(next, dateParams);
    if (parsed) commit(parsed);
  };

  const handleSelect = (date: Date) => {
    setText(maskitoStringifyDate(date, dateParams));
    commit(date);
    setOpen(false);
  };

  // A plain button, not `IconButton`: the field's own control box supplies the
  // padding, so a button with its own 36–52px hit box made the field 14px taller
  // than every other control in a row.
  const trigger = (
    <button
      type="button"
      className="okkly-date-field__trigger"
      disabled={disabled}
      aria-label="Open calendar"
      aria-expanded={isOpen}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={() => setOpen(!isOpen)}
      dangerouslySetInnerHTML={{ __html: iconCalendar }}
    />
  );

  return (
    <>
      <Field
        block="okkly-date-field"
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
          className="okkly-date-field__input"
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
        className="okkly-date-field-popover"
      >
        {/* The popover is portaled, so the field's own colour modifier cannot
            reach the calendar by inheritance — the tone is handed over as an
            inline variable instead. */}
        <Calendar
          value={resolvedValue}
          onSelect={handleSelect}
          min={min}
          max={max}
          style={calendarToneStyle(color)}
        />
      </Popover>
    </>
  );
});
