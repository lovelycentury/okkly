import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Autocomplete from "./Autocomplete.vue";
import OptionRow from "../Option/OptionRow.vue";
import OptionLabel from "../Option/OptionLabel.vue";
import OptionDescription from "../Option/OptionDescription.vue";
import OptionBody from "../Option/OptionBody.vue";
import OptionCheck from "../Option/OptionCheck.vue";
import HighlightMatch from "../Option/HighlightMatch.vue";
import type { AutocompleteOption, AutocompleteProps } from "./Autocomplete.types";

const people: AutocompleteOption[] = [
  { value: "mika", label: "Mika Chen", disabled: false },
  { value: "mika-r", label: "Mika Rossi" },
  { value: "mikael", label: "Mikael Boe" },
  { value: "alex", label: "Alex Rivera" },
];

interface City extends AutocompleteOption {
  region: string;
}

const cities: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
  { value: "osaka", label: "Osaka", region: "Asia" },
  { value: "lisbon", label: "Lisbon", region: "Europe" },
];

/**
 * Text field with a filtered suggestions list. Prefer when options are many or searchable; use Select when the full list should stay visible.
 */
const meta: Meta<AutocompleteProps> = {
  title: "Control/Autocomplete",
  // Autocomplete is a generic SFC (`generic="T = AutocompleteOption"`), whose
  // inferred component type Storybook's own `Meta["component"]` shape can't
  // structurally match — hence the cast, same as any other generic component
  // reference passed to `component`.
  component: Autocomplete as unknown as Meta<AutocompleteProps>["component"],
  args: {
    options: people,
    placeholder: "Search people…",
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    multiple: false,
    freeSolo: false,
    openOnFocus: false,
    loading: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    limitTags: { control: "number" },
  },
  render: (args) => ({
    components: { Autocomplete },
    setup: () => ({ args }),
    template: `<Autocomplete v-bind="args"><template #label>People</template></Autocomplete>`,
  }),
};

export default meta;
type Story = StoryObj<AutocompleteProps>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: { defaultValue: people[0], defaultInputValue: people[0].label },
};
/**
 * This example shows required.
 */
export const Required: Story = {
  args: { required: true, helperText: "Pick at least one person" } as never,
};
/**
 * This example shows multiple.
 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: [people[0], people[3]] },
};
/**
 * This example shows limit tags.
 */
export const LimitTags: Story = {
  name: "Multiple — limitTags",
  args: { multiple: true, limitTags: 2, defaultValue: people },
};
/**
 * This example shows free solo.
 */
export const FreeSolo: Story = {
  name: "freeSolo — Enter commits typed text",
  args: { freeSolo: true },
  render: (args) => ({
    components: { Autocomplete },
    setup: () => ({ args }),
    template: `
      <Autocomplete v-bind="args">
        <template #label>People</template>
        <template #helper-text>Type anything and press Enter</template>
      </Autocomplete>`,
  }),
};
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true, inputValue: "mik" } as never };
/**
 * This example shows the error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: { error: true },
  render: (args) => ({
    components: { Autocomplete },
    setup: () => ({ args }),
    template: `
      <Autocomplete v-bind="args">
        <template #label>People</template>
        <template #helper-text>Pick someone from the list</template>
      </Autocomplete>`,
  }),
};
/**
 * This example shows auto highlight.
 */
export const AutoHighlight: Story = {
  name: "autoHighlight — Enter commits without arrowing",
  args: { autoHighlight: true, defaultInputValue: "mik" },
};
/**
 * This example shows filter selected.
 */
export const FilterSelected: Story = {
  name: "filterSelectedOptions",
  args: { multiple: true, filterSelectedOptions: true, defaultValue: [people[0]] },
};

/**
 * This example shows grouped.
 */
export const Grouped: Story = {
  render: () => ({
    components: { Autocomplete },
    setup: () => ({ cities, groupBy: (option: City) => option.region }),
    template: `
      <Autocomplete :options="cities" :group-by="groupBy">
        <template #label>City</template>
      </Autocomplete>`,
  }),
};

/**
 * This example shows with descriptions.
 */
export const WithDescriptions: Story = {
  render: () => ({
    components: { Autocomplete },
    setup: () => ({
      people,
      getOptionDescription: (option: AutocompleteOption) =>
        `${option.label.toLowerCase().replace(" ", ".")}@studio.dev`,
    }),
    template: `
      <Autocomplete :options="people" :get-option-description="getOptionDescription">
        <template #label>People</template>
      </Autocomplete>`,
  }),
};

/**
 * **The customization contract.** Slots hand pieces of the component back to
 * you:
 *
 * - `#option="{ optionAttrs, optionEvents, option, state }"` — bind
 *   `optionAttrs` with `v-bind` and `optionEvents` with `v-on` on a single
 *   `<li>` (or `OptionRow`). Drop them and the row stops being selectable by
 *   keyboard or mouse.
 * - `#input="{ inputAttrs, inputEvents, inputRef }"` — bind on an `<input>`.
 *   The field shell (label, helper text, error, sizes) stays with the
 *   component; only the input itself is yours.
 * - `#group="{ key, label, group }"` — replaces just the header; the row list
 *   underneath (itself customizable through `#option`) stays fixed.
 * - `#no-options` / `#loading` — return a full `<li>`, they sit in the
 *   listbox.
 *
 * `state` carries what a custom row can't recompute: the typed `inputValue`,
 * the field `size` (the popup is portaled and inherits nothing), `multiple`.
 *
 * Rather than copying BEM class names, build rows from the exported
 * primitives — `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`,
 * `OptionCheck`, `HighlightMatch`. They read the listbox they are in and take
 * its styling, so a custom row still scales with `size` and follows the theme.
 */
export const CustomOption: Story = {
  name: "#option",
  render: () => ({
    components: { Autocomplete, OptionRow, OptionLabel, OptionDescription, OptionCheck },
    setup: () => ({ cities }),
    template: `
      <Autocomplete :options="cities">
        <template #label>City</template>
        <template #option="{ optionAttrs, optionEvents, option, state }">
          <OptionRow v-bind="optionAttrs" v-on="optionEvents">
            <OptionLabel>{{ option.label }}</OptionLabel>
            <OptionDescription>{{ option.region }}</OptionDescription>
            <OptionCheck :checked="state.selected" />
          </OptionRow>
        </template>
      </Autocomplete>`,
  }),
};

/**
 * `state.inputValue` is what the user has typed; `HighlightMatch` emphasises
 * the first matching run inside the label. Type "mik" in the field to see it.
 */
export const RecipeHighlightMatch: Story = {
  name: "Recipe — highlight the typed run",
  render: () => ({
    components: { Autocomplete, OptionRow, OptionLabel, OptionCheck, HighlightMatch },
    setup: () => ({ people }),
    template: `
      <Autocomplete :options="people" placeholder="Type “mik”…" default-input-value="mik" open-on-focus>
        <template #label>People</template>
        <template #option="{ optionAttrs, optionEvents, option, state }">
          <OptionRow v-bind="optionAttrs" v-on="optionEvents">
            <OptionLabel><HighlightMatch :text="option.label" :query="state.inputValue" /></OptionLabel>
            <OptionCheck :checked="state.selected" />
          </OptionRow>
        </template>
      </Autocomplete>`,
  }),
};

/**
 * Two-line rows: `OptionBody` stacks a label over its description.
 */
export const RecipeTwoLineOption: Story = {
  name: "Recipe — avatar and two-line row",
  render: () => ({
    components: {
      Autocomplete,
      OptionRow,
      OptionLabel,
      OptionDescription,
      OptionBody,
      OptionCheck,
    },
    setup: () => ({ people }),
    template: `
      <Autocomplete :options="people">
        <template #label>People</template>
        <template #option="{ optionAttrs, optionEvents, option, state }">
          <OptionRow v-bind="optionAttrs" v-on="optionEvents">
            <span
              aria-hidden="true"
              style="display: grid; place-items: center; flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--okkly-bg-surface); font-size: 0.75rem"
              >{{ option.label.charAt(0) }}</span
            >
            <OptionBody>
              <OptionLabel>{{ option.label }}</OptionLabel>
              <OptionDescription>{{ option.label.toLowerCase().replace(" ", ".") }}@studio.dev</OptionDescription>
            </OptionBody>
            <OptionCheck :checked="state.selected" />
          </OptionRow>
        </template>
      </Autocomplete>`,
  }),
};

/**
 * `#input` rebuilds the `<input>` itself. Here a search glyph sits before it.
 *
 * Note what is *not* rebuilt: the label, the helper text, the tag row, the
 * clear/toggle buttons, the focus ring and the error colours all still come
 * from the component — unlike React's `renderInput`, this slot only replaces
 * the input (see `Autocomplete.types.ts` for why).
 */
export const RecipeCustomInput: Story = {
  name: "Recipe — #input with a leading glyph",
  render: () => ({
    components: { Autocomplete },
    setup: () => ({ people }),
    template: `
      <Autocomplete :options="people" placeholder="Search people…">
        <template #label>People</template>
        <template #helper-text>The label, helper text and focus ring are still the field's</template>
        <template #input="{ inputAttrs, inputEvents, inputRef }">
          <span aria-hidden="true" style="flex-shrink: 0; font-size: 1.25rem">⌕</span>
          <input :ref="inputRef" v-bind="inputAttrs" v-on="inputEvents" class="okkly-autocomplete__input" />
        </template>
      </Autocomplete>`,
  }),
};

/**
 * `#group` for a `groupBy` header, `#no-options` for the empty state.
 */
export const RecipeGroupsAndEmpty: Story = {
  name: "Recipe — #group / #no-options",
  render: () => ({
    components: { Autocomplete },
    setup: () => ({ cities, groupBy: (option: City) => option.region }),
    template: `
      <Autocomplete :options="cities" placeholder="Search cities…" :group-by="groupBy">
        <template #label>City</template>
        <template #group="{ label, group }">
          <span
            role="presentation"
            style="display: flex; justify-content: space-between; padding: 6px 10px 2px; color: var(--okkly-text-muted); font-size: var(--okkly-font-size-sm)"
          >
            {{ label }}<span>{{ group.options.length }}</span>
          </span>
        </template>
        <template #no-options="{ inputValue }">
          <li style="padding: 10px 13px; color: var(--okkly-text-muted)">No city matches "{{ inputValue }}"</li>
        </template>
      </Autocomplete>`,
  }),
};

/**
 * This example shows wider popup.
 */
export const WiderPopup: Story = {
  name: "popupWidth",
  args: { popupWidth: 420 },
  render: (args) => ({
    components: { Autocomplete },
    setup: () => ({ args }),
    template: `
      <Autocomplete v-bind="args">
        <template #label>People</template>
        <template #helper-text>Panel is wider than the field</template>
      </Autocomplete>`,
  }),
};

/**
 * This example shows near page bottom.
 */
export const NearPageBottom: Story = {
  name: "Flips up near the bottom",
  render: () => ({
    components: { Autocomplete },
    setup: () => ({ people }),
    template: `
      <div style="display: flex; flex-direction: column; height: 150vh; justify-content: flex-end">
        <Autocomplete :options="people" placeholder="Search people…">
          <template #label>People</template>
        </Autocomplete>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Autocomplete },
    setup: () => ({ people, sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; width: 320px">
        <Autocomplete v-for="size in sizes" :key="size" :size="size" :options="people" placeholder="Search…">
          <template #label>People</template>
        </Autocomplete>
      </div>`,
  }),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { Autocomplete },
    setup() {
      const value = ref<AutocompleteOption | null>(people[0]);
      const reason = ref("—");
      function handleChange(
        _event: Event | null,
        next: AutocompleteOption | AutocompleteOption[] | null,
        changeReason: string,
      ) {
        value.value = next as AutocompleteOption | null;
        reason.value = changeReason;
      }
      return { people, value, reason, handleChange };
    },
    template: `
      <Autocomplete v-model="value" :options="people" @change="handleChange">
        <template #label>People</template>
        <template #helper-text>{{ (value ? \`Selected: \${value.label}\` : "None selected") + " · reason: " + reason }}</template>
      </Autocomplete>`,
  }),
};
