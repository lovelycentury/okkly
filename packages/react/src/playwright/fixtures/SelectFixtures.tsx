"use client";

import {
  Select,
  type SelectOption,
  type SelectOptionState,
  type SelectProps,
} from "../../components/Select/Select";
import {
  OptionBody,
  OptionCheck,
  OptionDescription,
  OptionLabel,
  OptionRow,
} from "../../components/Option/Option";

/**
 * Test fixtures for `Select`.
 *
 * Its customization API is built from render props — `renderOption`,
 * `renderInput`, `renderGroup`, `renderNoOptions`, `renderLoading` — plus
 * `groupBy`. All of them must return a value synchronously inside the browser,
 * which a function prop sent from Node cannot do. These wrappers supply them in
 * the browser and expose what a test needs to vary as serializable props.
 *
 * They live under `src/playwright/` and are excluded from the published build.
 */

export interface City extends SelectOption {
  region: string;
}

export const CITIES: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
];

type SharedProps = Pick<
  SelectProps,
  "label" | "open" | "size" | "multiple" | "loading" | "defaultValue" | "onChange"
>;

export type GroupedSelectProps = SharedProps & {
  /** Swap in a custom group header that also prints the group's size. */
  customGroups?: boolean;
  /** Render an empty list, to reach the no-options slot. */
  empty?: boolean;
  /** Replace the empty and loading slots with custom rows. */
  customSlots?: boolean;
};

/** A `Select` grouped by city region, with optional custom group/empty/loading slots. */
export function GroupedSelect({ customGroups, empty, customSlots, ...props }: GroupedSelectProps) {
  return (
    <Select
      label="City"
      {...props}
      options={empty ? [] : CITIES}
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
      renderNoOptions={customSlots ? () => <li>Nothing archived yet</li> : undefined}
      renderLoading={customSlots ? () => <li>Fetching…</li> : undefined}
    />
  );
}

export type CustomOptionSelectProps = SharedProps & {
  options: SelectOption[];
  /** Receives the state handed to each rendered row. */
  onOptionState?: (state: SelectOptionState) => void;
  /** Render a two-line row using the option primitives. */
  twoLine?: boolean;
};

/** A `Select` whose rows are built by hand from the option primitives. */
export function CustomOptionSelect({
  options,
  onOptionState,
  twoLine,
  ...props
}: CustomOptionSelectProps) {
  return (
    <Select
      label="Team"
      {...props}
      options={options}
      renderOption={(rowProps, option, state) => {
        onOptionState?.(state);
        return twoLine ? (
          <OptionRow {...rowProps}>
            <OptionBody>
              <OptionLabel>{option.label}</OptionLabel>
              <OptionDescription>{(option as City).region}</OptionDescription>
            </OptionBody>
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

export type CustomInputSelectProps = SharedProps & {
  options: SelectOption[];
  /**
   * `"badge"` builds the whole trigger by hand; `"wrapper"` keeps the default
   * trigger content and only relocates the adornments.
   */
  variant?: "badge" | "wrapper";
};

/** A `Select` whose trigger is taken over through `renderInput`. */
export function CustomInputSelect({
  options,
  variant = "badge",
  ...props
}: CustomInputSelectProps) {
  return (
    <Select
      label="Team"
      {...props}
      options={options}
      renderInput={({ triggerProps, selected, value, endAdornment }) =>
        variant === "badge" ? (
          <div {...triggerProps}>
            <span data-testid="badge">{selected[0]?.label.charAt(0)}</span>
            <span>{selected[0]?.label ?? "Pick a team"}</span>
            {endAdornment}
          </div>
        ) : (
          <div data-testid="trigger-wrapper">
            <div {...triggerProps}>{value}</div>
            {endAdornment}
          </div>
        )
      }
    />
  );
}

export type RenderValueSelectProps = SharedProps & {
  options: SelectOption[];
};

/** A `Select` that joins its selected labels through `renderValue`. */
export function RenderValueSelect({ options, ...props }: RenderValueSelectProps) {
  return (
    <Select
      label="Team"
      {...props}
      options={options}
      renderValue={(selected) => <b>{selected.map((option) => option.label).join(" / ")}</b>}
    />
  );
}
