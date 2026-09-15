"use client";

import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { iconCheck, iconChevronDown, iconChevronUp, iconX } from "@okkly/icons";
import { useAutocomplete, type AutocompleteOption } from "@okkly/react-hooks";
import "@okkly/design-system/components/Autocomplete/Autocomplete.scss";
import { Popper } from "../Popper/Popper";
import { Chip } from "../Chip/Chip";
import { Spinner } from "../Spinner/Spinner";
import { Field, getFieldIds } from "../Field/Field";
import { useOutsideDismiss } from "../Field/useOutsideDismiss";
import { OptionScope } from "../Option/Option";
import type { AutocompleteTagProps, AutocompleteProps } from "./Autocomplete.types";

function AutocompleteInner<T = AutocompleteOption>(
  {
    options,
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    onChange,
    onInputChange,
    getOptionLabel,
    getOptionDescription,
    isOptionEqualToValue,
    filterOptions,
    groupBy,
    multiple = false,
    freeSolo = false,
    disabled = false,
    required = false,
    openOnFocus = false,
    open,
    onOpenChange,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    clearOnEscape = false,
    clearOnBlur,
    filterSelectedOptions = false,
    disableCloseOnSelect,
    disableClearable = false,
    limitTags = -1,
    label,
    hideLabel = false,
    placeholder = "Search…",
    size = "medium",
    color = "primary",
    error = false,
    helperText,
    fullWidth = false,
    loading = false,
    name,
    renderOption,
    renderInput,
    renderGroup,
    renderNoOptions,
    renderLoading,
    renderTags,
    noOptionsText = "No results",
    loadingText = "Loading…",
    clearText = "Clear",
    openText = "Open options",
    closeText = "Close options",
    popupWidth,
    className,
    id,
  }: AutocompleteProps<T>,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const { helperId } = getFieldIds(fieldId, Boolean(label), Boolean(helperText));
  const controlRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
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

  const autocomplete = useAutocomplete({
    options,
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    onChange,
    onInputValueChange: onInputChange,
    getOptionLabel,
    isOptionEqualToValue,
    filterOptions,
    groupBy,
    multiple,
    freeSolo,
    disabled,
    openOnFocus,
    open,
    onOpenChange,
    autoHighlight,
    autoSelect,
    blurOnSelect,
    clearOnEscape,
    clearOnBlur,
    filterSelectedOptions,
    disableCloseOnSelect,
    disableClearable,
  });

  // Popper, unlike Popover, has no backdrop and no dismissal of its own.
  useOutsideDismiss([controlRef, panelRef], autocomplete.isOpen, () => autocomplete.setOpen(false));

  /**
   * The chevron, the clear button and the field's own padding all sit outside
   * the input, so without this the only live target in the control is the input
   * itself. A click anywhere in the box puts the caret in the input and opens
   * the list, as MUI's Autocomplete does.
   *
   * Two exclusions: the popup is portaled but still a React child, and React
   * routes synthetic events along its own tree, so option clicks would arrive
   * here and reopen what they just closed; and the toggle/clear buttons and tag
   * × buttons run their own handlers.
   */
  function handleControlClick(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    if (!controlRef.current?.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest("button, input")) return;
    inputElementRef.current?.focus();
    autocomplete.setOpen(true);
  }

  const labelFor = autocomplete.getOptionLabel;
  const tags = multiple && Array.isArray(autocomplete.value) ? autocomplete.value : [];
  const shownTags = limitTags < 0 ? tags : tags.slice(0, limitTags);
  const tagOverflow = tags.length - shownTags.length;

  const { ref: inputRef, ...inputProps } = autocomplete.getInputProps({
    id: fieldId,
    className: "okkly-autocomplete__input",
    placeholder: tags.length > 0 ? "Add…" : placeholder,
    required,
    "aria-invalid": error || undefined,
    "aria-describedby": helperId,
  });

  const mergedInputRef = (node: HTMLInputElement | null) => {
    inputRef(node);
    inputElementRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const clearProps = autocomplete.getClearProps({
    className: "okkly-autocomplete__clear",
    "aria-label": clearText,
  });

  const getTagProps = (index: number): AutocompleteTagProps => ({
    ...autocomplete.getTagProps(index),
    key: `${labelFor(tags[index])}-${index}`,
    onRemove: () => autocomplete.removeTag(index),
  });

  function renderTagRow() {
    if (tags.length === 0) return null;
    if (renderTags) return renderTags(tags, getTagProps);

    return (
      <div className="okkly-autocomplete__tags">
        {shownTags.map((tag, index) => {
          const { key, onRemove, ...tagProps } = getTagProps(index);
          return (
            <span key={key} {...tagProps}>
              <Chip
                label={labelFor(tag)}
                size="small"
                variant="solid"
                removable={!disabled}
                onRemove={onRemove}
              />
            </span>
          );
        })}
        {tagOverflow > 0 && <span className="okkly-autocomplete__overflow">+{tagOverflow}</span>}
      </div>
    );
  }

  function renderRow(index: number) {
    const option = autocomplete.filteredOptions[index];
    const highlighted = autocomplete.highlightedIndex === index;
    const selected = autocomplete.isSelected(option);
    const optionProps = autocomplete.getOptionProps(index, {
      className: [
        "okkly-autocomplete__option",
        highlighted && "okkly-autocomplete__option--highlighted",
        selected && "okkly-autocomplete__option--selected",
      ]
        .filter(Boolean)
        .join(" "),
    });
    const key = `${labelFor(option)}-${index}`;

    if (renderOption) {
      // The row is keyed here rather than through `props`: React 19 warns when
      // a spread object carries `key`, and `<li {...props}>` is the whole point
      // of the prop. Callers get a props object they can spread as-is.
      return (
        <Fragment key={key}>
          {renderOption(optionProps as HTMLAttributes<HTMLLIElement>, option, {
            selected,
            highlighted,
            index,
            inputValue: autocomplete.inputValue,
            multiple,
            size,
          })}
        </Fragment>
      );
    }

    const description = getOptionDescription?.(option);

    return (
      <li key={key} {...optionProps}>
        <span className="okkly-autocomplete__option-label">{labelFor(option)}</span>
        {description && <span className="okkly-autocomplete__option-meta">{description}</span>}
        {selected && (
          <span
            className="okkly-autocomplete__option-check"
            dangerouslySetInnerHTML={{ __html: iconCheck }}
            aria-hidden="true"
          />
        )}
      </li>
    );
  }

  function renderListContent() {
    if (loading) {
      if (renderLoading) return renderLoading({ inputValue: autocomplete.inputValue });
      return (
        <li className="okkly-autocomplete__loading">
          <Spinner size="small" />
          {loadingText}
        </li>
      );
    }
    if (autocomplete.filteredOptions.length === 0) {
      if (renderNoOptions) return renderNoOptions({ inputValue: autocomplete.inputValue });
      return <li className="okkly-autocomplete__empty">{noOptionsText}</li>;
    }
    if (autocomplete.groupedOptions) {
      return autocomplete.groupedOptions.map((group) => {
        const children = group.options.map(({ index }) => renderRow(index));
        if (renderGroup)
          return renderGroup({ key: group.key, label: group.label, group, children });
        return (
          <li key={group.key} role="presentation">
            <span className="okkly-autocomplete__group-label" role="presentation">
              {group.label}
            </span>
            <ul className="okkly-autocomplete__group-options" role="group" aria-label={group.label}>
              {children}
            </ul>
          </li>
        );
      });
    }
    return autocomplete.filteredOptions.map((_, index) => renderRow(index));
  }

  const endAdornment = (
    <>
      {!disableClearable && (
        <button {...clearProps}>
          <span dangerouslySetInnerHTML={{ __html: iconX }} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="okkly-autocomplete__toggle"
        tabIndex={-1}
        aria-label={autocomplete.isOpen ? closeText : openText}
        onClick={() => autocomplete.setOpen(!autocomplete.isOpen)}
        disabled={disabled}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: autocomplete.isOpen ? iconChevronUp : iconChevronDown,
          }}
          aria-hidden="true"
        />
      </button>
    </>
  );

  const selectedForForm = multiple
    ? tags
    : autocomplete.value != null
      ? [autocomplete.value as T]
      : [];

  /**
   * A custom control decides where the clear and toggle buttons go, so they are
   * handed to `renderInput` instead of being placed by the Field. Leaving them
   * in both places would draw two chevrons.
   */
  const controlContent = renderInput ? (
    renderInput({
      inputProps: { ...inputProps, ref: mergedInputRef },
      tags: renderTagRow(),
      endAdornment,
      state: {
        open: autocomplete.isOpen,
        disabled,
        error,
        multiple,
        size,
        color,
        inputValue: autocomplete.inputValue,
        value: autocomplete.value,
      },
    })
  ) : (
    // Tags and the input wrap together in their own row, so the clear/toggle
    // buttons — siblings of this in `__control` — never get pushed onto a
    // wrapped line of their own.
    <div className="okkly-autocomplete__body">
      {renderTagRow()}
      <input {...inputProps} ref={mergedInputRef} />
    </div>
  );

  return (
    <Field
      block="okkly-autocomplete"
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
      controlProps={{ ref: setControlRef, onClick: handleControlClick }}
      className={className}
    >
      {controlContent}

      {name &&
        selectedForForm.map((item, index) => (
          <input
            key={`${labelFor(item)}-${index}`}
            type="hidden"
            name={name}
            value={labelFor(item)}
          />
        ))}

      <Popper
        open={autocomplete.isOpen}
        anchorEl={controlNode}
        placement="bottom-start"
        className="okkly-autocomplete-popper"
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
              ? "okkly-autocomplete-popover"
              : `okkly-autocomplete-popover okkly-autocomplete-popover--${size}`
          }
        >
          {/* Names the BEM block for the option primitives, so a `renderOption`
              built from them picks up this listbox's styling. */}
          <OptionScope block="okkly-autocomplete">
            <ul {...autocomplete.getListboxProps({ className: "okkly-autocomplete__listbox" })}>
              {renderListContent()}
            </ul>
          </OptionScope>
        </div>
      </Popper>
    </Field>
  );
}

export const Autocomplete = forwardRef(AutocompleteInner) as <T = AutocompleteOption>(
  props: AutocompleteProps<T> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReactElement;
