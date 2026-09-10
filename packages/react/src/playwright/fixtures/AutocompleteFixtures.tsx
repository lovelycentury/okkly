"use client";

import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteOptionState,
  type AutocompleteProps,
} from "../../components/Autocomplete/Autocomplete";
import {
  HighlightMatch,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../../components/Option/Option";

/**
 * Test fixtures for `Autocomplete`.
 *
 * Its customization API is built from render props — `renderOption`,
 * `renderInput`, `renderTags`, `renderGroup`, `renderNoOptions`,
 * `renderLoading` — plus `groupBy`. All of them must return a value
 * synchronously inside the browser, which a function prop sent from Node cannot
 * do. These wrappers supply them in the browser and expose what a test needs to
 * vary as serializable props.
 *
 * They live under `src/playwright/` and are excluded from the published build.
 */

export interface City extends AutocompleteOption {
  region: string;
}

export const AUTOCOMPLETE_CITIES: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
];

type SharedProps = Pick<
  AutocompleteProps,
  | "label"
  | "open"
  | "openOnFocus"
  | "size"
  | "multiple"
  | "loading"
  | "inputValue"
  | "defaultInputValue"
  | "defaultValue"
  | "onChange"
  | "limitTags"
>;

export type GroupedAutocompleteProps = SharedProps & {
  /** Swap in a custom group header that also prints the group's size. */
  customGroups?: boolean;
  /** Render an empty list, to reach the no-options slot. */
  empty?: boolean;
  /** Replace the empty and loading slots with custom rows. */
  customSlots?: boolean;
};

/** An `Autocomplete` grouped by city region, with optional custom slots. */
export function GroupedAutocomplete({
  customGroups,
  empty,
  customSlots,
  ...props
}: GroupedAutocompleteProps) {
  return (
    <Autocomplete
      label="City"
      {...props}
      options={empty ? [] : AUTOCOMPLETE_CITIES}
      groupBy={empty ? undefined : (option) => (option as City).region}
      renderGroup={
        customGroups
          ? ({ key, label, group, children }) => (
              <li key={key} role="presentation">
                <span role="presentation">{`${label} (${group.options.length})`}</span>
                <ul role="group" aria-label={label}>
                  {children}
                </ul>
              </li>
            )
          : undefined
      }
      renderNoOptions={
        customSlots ? ({ inputValue }) => <li>{`No match for ${inputValue}`}</li> : undefined
      }
      renderLoading={customSlots ? () => <li>Fetching…</li> : undefined}
    />
  );
}

export type CustomOptionAutocompleteProps = SharedProps & {
  options: AutocompleteOption[];
  /** Receives the state handed to each rendered row. */
  onOptionState?: (state: AutocompleteOptionState) => void;
  /** Render the row with a highlighted run plus a description line. */
  highlight?: boolean;
};

/** An `Autocomplete` whose rows are built by hand from the option primitives. */
export function CustomOptionAutocomplete({
  options,
  onOptionState,
  highlight,
  ...props
}: CustomOptionAutocompleteProps) {
  return (
    <Autocomplete
      label="People"
      {...props}
      options={options}
      renderOption={(rowProps, option, state) => {
        onOptionState?.(state);
        return highlight ? (
          <OptionRow {...rowProps}>
            <OptionLabel>
              <HighlightMatch text={option.label} query="mik" />
            </OptionLabel>
            <OptionDescription>Design</OptionDescription>
          </OptionRow>
        ) : (
          <OptionRow {...rowProps}>
            <OptionLabel>{option.label}</OptionLabel>
            <OptionCheck checked={state.selected} />
          </OptionRow>
        );
      }}
    />
  );
}

export type CustomInputAutocompleteProps = SharedProps & {
  options: AutocompleteOption[];
  /**
   * `"glyph"` rebuilds the whole control; `"wrapper"` only relocates the
   * adornments into a box of the caller's own.
   */
  variant?: "glyph" | "wrapper";
};

/** An `Autocomplete` whose control is taken over through `renderInput`. */
export function CustomInputAutocomplete({
  options,
  variant = "glyph",
  ...props
}: CustomInputAutocompleteProps) {
  return (
    <Autocomplete
      label="People"
      {...props}
      options={options}
      renderInput={({ inputProps, tags, endAdornment }) =>
        variant === "glyph" ? (
          <>
            <span data-testid="glyph">⌕</span>
            {tags}
            <input {...inputProps} />
            {endAdornment}
          </>
        ) : (
          <div data-testid="control">
            <input {...inputProps} />
            {endAdornment}
          </div>
        )
      }
    />
  );
}

export type RenderTagsAutocompleteProps = SharedProps & {
  options: AutocompleteOption[];
};

/** An `Autocomplete` that summarises its selection through `renderTags`. */
export function RenderTagsAutocomplete({ options, ...props }: RenderTagsAutocompleteProps) {
  return (
    <Autocomplete
      label="People"
      multiple
      {...props}
      options={options}
      renderTags={(value) => <span>{value.length} selected</span>}
    />
  );
}
