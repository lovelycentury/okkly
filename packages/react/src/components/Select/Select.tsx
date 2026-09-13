"use client";

import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { iconCheck, iconChevronDown, iconX } from "@okkly/icons";
import { useSelect, type SelectOption } from "@okkly/react-hooks";
import "@okkly/design-system/components/Select/Select.scss";
import { Popper } from "../Popper/Popper";
import { Checkbox } from "../Checkbox/Checkbox";
import { Chip } from "../Chip/Chip";
import { Spinner } from "../Spinner/Spinner";
import { Field, getFieldIds } from "../Field/Field";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import { OptionScope } from "../Option/Option";
import type { SelectRenderInputParams, SelectProps } from "./Select.types";

function SelectInner<T = string>(
  {
    options,
    value,
    defaultValue,
    multiple = false,
    onChange,
    disabled = false,
    required = false,
    open,
    onOpenChange,
    label,
    hideLabel = false,
    placeholder = "Select…",
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    loading = false,
    name,
    groupBy,
    isOptionEqualToValue,
    limitTags = 2,
    disableCloseOnSelect,
    disableClearable = false,
    renderValue,
    renderOption,
    renderInput,
    renderGroup,
    renderNoOptions,
    renderLoading,
    noOptionsText = "No options",
    loadingText = "Loading…",
    clearText = "Clear",
    popupWidth,
    className,
    id,
  }: SelectProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { labelId, helperId } = getFieldIds(fieldId, Boolean(label), Boolean(helperText));
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /**
   * The anchor has to be state, not just the ref: `anchorEl` is read during
   * render, and attaching a ref does not schedule one. With a plain ref, a
   * popup that is already open on the first render — a controlled `open` — sees
   * `null` and never gets positioned at all, so it lands at the viewport
   * origin. The ref is kept alongside for the click/dismiss containment checks,
   * which run in handlers where a re-render would be wasted.
   */
  const [controlNode, setControlNode] = useState<HTMLDivElement | null>(null);
  const setControlRef = useCallback((node: HTMLDivElement | null) => {
    controlRef.current = node;
    setControlNode(node);
  }, []);

  const select = useSelect({
    options,
    value,
    defaultValue,
    multiple,
    onChange,
    disabled,
    open,
    onOpenChange,
    isOptionEqualToValue,
    groupBy,
    disableCloseOnSelect,
    disableClearable,
  });

  // Popper, unlike Popover, has no backdrop and no dismissal of its own. The
  // whole control counts as "inside" — clicking its padding opens the popup, so
  // it must not close it on the way down.
  useOutsideDismiss([controlRef, panelRef], select.isOpen, () => select.setOpen(false));

  /**
   * The chevron and the field's own padding live outside the trigger div (they
   * are Field adornments), so without this they would be dead space. Clicks
   * that started on the trigger, a chip's × or the clear button are left to
   * their own handlers — otherwise every one of them would toggle twice.
   */
  function handleControlClick(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    // The popup is portaled out of the control but still React's child, and
    // React propagates synthetic events along its own tree — so without this a
    // click on an option would arrive here and toggle the popup shut again.
    if (!controlRef.current?.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest("button, [role='combobox']")) return;
    select.setOpen(!select.isOpen);
    triggerRef.current?.focus();
  }

  const { selectedOptions } = select;
  const hasValue = selectedOptions.length > 0;

  const triggerProps = select.getTriggerProps({
    id: fieldId,
    className: "okkly-select__trigger okkly-select__input",
    "aria-invalid": error || undefined,
    "aria-required": required || undefined,
    "aria-labelledby": labelId,
    "aria-describedby": helperId,
    ref: (node) => {
      triggerRef.current = node as HTMLDivElement | null;
      if (typeof forwardedRef === "function") forwardedRef(node as HTMLDivElement | null);
      else if (forwardedRef) forwardedRef.current = node as HTMLDivElement | null;
    },
  });

  const clearProps = select.getClearProps({
    className: "okkly-select__clear",
    "aria-label": clearText,
  });

  function renderTriggerContent() {
    if (renderValue) return renderValue(selectedOptions);

    if (!hasValue) {
      return (
        <span className="okkly-select__value okkly-select__value--placeholder">{placeholder}</span>
      );
    }

    if (!multiple) {
      return <span className="okkly-select__value">{selectedOptions[0]?.label}</span>;
    }

    const shown = limitTags < 0 ? selectedOptions : selectedOptions.slice(0, limitTags);
    const overflow = selectedOptions.length - shown.length;

    return (
      <span className="okkly-select__chips">
        {shown.map((option) => (
          <Chip
            key={String(option.value)}
            label={option.label}
            size="small"
            variant="solid"
            removable={!disabled}
            // The trigger is a div rather than a button precisely so these
            // remove buttons are legal here; stopping propagation keeps the
            // click from also toggling the popup.
            onRemove={(event) => {
              event?.stopPropagation?.();
              select.removeValue(event ?? null, option);
            }}
          />
        ))}
        {overflow > 0 && <span className="okkly-select__overflow">+{overflow}</span>}
      </span>
    );
  }

  function renderRow(option: SelectOption<T>, index: number) {
    const selected = select.isSelected(option);
    const highlighted = select.highlightedIndex === index;
    const optionProps = select.getOptionProps(index, {
      className: [
        "okkly-select__option",
        highlighted && "okkly-select__option--highlighted",
        selected && "okkly-select__option--selected",
        option.disabled && "okkly-select__option--disabled",
      ]
        .filter(Boolean)
        .join(" "),
    });
    const key = `${String(option.value)}-${index}`;

    if (renderOption) {
      // The row is keyed here rather than through `props`: React 19 warns when
      // a spread object carries `key`, and `<li {...props}>` is the whole point
      // of the prop. Callers get a props object they can spread as-is.
      return (
        <Fragment key={key}>
          {renderOption(optionProps as React.HTMLAttributes<HTMLLIElement>, option, {
            selected,
            highlighted,
            index,
            disabled: option.disabled === true,
            multiple,
            size,
          })}
        </Fragment>
      );
    }

    return (
      <li key={key} {...optionProps}>
        {multiple && (
          <Checkbox
            checked={selected}
            disabled={option.disabled}
            size="small"
            readOnly
            tabIndex={-1}
          />
        )}
        <span className="okkly-select__option-label">{option.label}</span>
        {!multiple && selected && (
          <span
            className="okkly-select__option-check"
            dangerouslySetInnerHTML={{ __html: iconCheck }}
            aria-hidden="true"
          />
        )}
      </li>
    );
  }

  function renderListContent() {
    if (loading) {
      if (renderLoading) return renderLoading();
      return (
        <li className="okkly-select__loading">
          <Spinner size="small" />
          {loadingText}
        </li>
      );
    }
    if (select.flatOptions.length === 0) {
      if (renderNoOptions) return renderNoOptions();
      return <li className="okkly-select__empty">{noOptionsText}</li>;
    }
    if (select.groupedOptions) {
      return select.groupedOptions.map((group) => {
        const children = group.options.map(({ option, index }) => renderRow(option, index));
        if (renderGroup)
          return renderGroup({ key: group.key, label: group.label, group, children });
        return (
          <li key={group.key} role="presentation">
            <span className="okkly-select__group-label" role="presentation">
              {group.label}
            </span>
            <ul className="okkly-select__group-options" role="group" aria-label={group.label}>
              {children}
            </ul>
          </li>
        );
      });
    }
    return select.flatOptions.map((option, index) => renderRow(option, index));
  }

  const endAdornment = (
    <>
      {!disableClearable && hasValue && !disabled && (
        <button {...clearProps}>
          <span dangerouslySetInnerHTML={{ __html: iconX }} aria-hidden="true" />
        </button>
      )}
      <span
        className="okkly-select__chevron"
        dangerouslySetInnerHTML={{ __html: iconChevronDown }}
        aria-hidden="true"
      />
    </>
  );

  return (
    <Field
      block="okkly-select"
      id={fieldId}
      label={label}
      hideLabel={hideLabel}
      required={required}
      size={size}
      color={color}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      endAdornment={renderInput ? undefined : endAdornment}
      // A `<label for>` can only target a real form control, and the trigger is
      // a div[role="combobox"]; the trigger points back with aria-labelledby.
      htmlFor={false}
      controlProps={{ ref: setControlRef, onClick: handleControlClick }}
      className={className}
    >
      {/* A custom trigger decides where the clear button and chevron go, so
          they are handed to `renderInput` instead of being placed by the
          Field — leaving them in both places would draw two chevrons. */}
      {renderInput ? (
        renderInput({
          triggerProps: triggerProps as SelectRenderInputParams<T>["triggerProps"],
          value: renderTriggerContent(),
          selected: selectedOptions,
          endAdornment,
          state: { open: select.isOpen, disabled, error, multiple, size, color },
        })
      ) : (
        <div {...triggerProps}>{renderTriggerContent()}</div>
      )}

      {name &&
        (multiple ? selectedOptions : selectedOptions.slice(0, 1)).map((option) => (
          <input
            key={String(option.value)}
            type="hidden"
            name={name}
            value={String(option.value)}
          />
        ))}

      <Popper
        open={select.isOpen}
        // The bordered control box, not the trigger div inside it: the trigger
        // sits within the control's padding, so anchoring there made the panel
        // narrower than the field and started it 12px too high — swallowing the
        // gap and confusing `flip` about how much room is left below.
        anchorEl={controlNode}
        placement="bottom-start"
        className="okkly-select-popper"
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
        matchAnchorWidth="min"
        style={popupWidth === undefined ? undefined : { width: popupWidth }}
        role="presentation"
      >
        {/* The panel is portaled to <body>, so the field's size modifier does
            not reach it by inheritance — it is copied on explicitly. */}
        <div
          ref={panelRef}
          className={
            size === "medium"
              ? "okkly-select-popover"
              : `okkly-select-popover okkly-select-popover--${size}`
          }
        >
          {/* Names the BEM block for the option primitives, so a `renderOption`
              built from them picks up this listbox's styling. */}
          <OptionScope block="okkly-select">
            <ul {...select.getListboxProps({ className: "okkly-select__listbox" })}>
              {renderListContent()}
            </ul>
          </OptionScope>
        </div>
      </Popper>
    </Field>
  );
}

export const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
