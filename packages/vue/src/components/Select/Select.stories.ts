import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import Select from "./Select.vue";
import OptionRow from "../Option/OptionRow.vue";
import OptionLabel from "../Option/OptionLabel.vue";
import OptionDescription from "../Option/OptionDescription.vue";
import OptionBody from "../Option/OptionBody.vue";
import OptionCheck from "../Option/OptionCheck.vue";
import type { SelectOption, SelectProps } from "./Select.types";

const teamOptions: SelectOption[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
];

interface City extends SelectOption {
  region: string;
}

const cityOptions: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
  { value: "osaka", label: "Osaka", region: "Asia" },
  { value: "lisbon", label: "Lisbon", region: "Europe" },
];

/**
 * Closed list of options in a field. Prefer Autocomplete when the list is long or searchable.
 */
const meta: Meta<SelectProps> = {
  title: "Control/Select",
  // Select is a generic SFC (`generic="T = string"`), whose inferred
  // component type Storybook's own `Meta["component"]` shape can't
  // structurally match — hence the cast, same as any other generic component
  // reference passed to `component`.
  component: Select as unknown as Meta<SelectProps>["component"],
  args: {
    placeholder: "Choose a team…",
    options: teamOptions,
    size: "medium",
    color: "primary",
    error: false,
    disabled: false,
    fullWidth: false,
    multiple: false,
    loading: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    limitTags: { control: "number" },
  },
  render: (args) => ({
    components: { Select },
    setup: () => ({ args }),
    template: `<Select v-bind="args"><template #label>Team</template></Select>`,
  }),
};

export default meta;
type Story = StoryObj<SelectProps>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};
/**
 * This example shows filled.
 */
export const Filled: Story = { args: { defaultValue: "engineering" } };
/**
 * This example shows required.
 */
export const Required: Story = {
  args: { required: true } as never,
  render: (args) => ({
    components: { Select },
    setup: () => ({ args }),
    template: `
      <Select v-bind="args">
        <template #label>Team</template>
        <template #helper-text>Team is required</template>
      </Select>`,
  }),
};
/**
 * This example shows the error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: { error: true } as never,
  render: (args) => ({
    components: { Select },
    setup: () => ({ args }),
    template: `
      <Select v-bind="args">
        <template #label>Team</template>
        <template #helper-text>Please choose a team</template>
      </Select>`,
  }),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true, defaultValue: "engineering" } };
/**
 * This example shows the loading state.
 */
export const Loading: Story = { args: { loading: true } };

/**
 * This example shows multiple.
 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["design", "engineering", "operations"] },
};

/**
 * This example shows limit tags.
 */
export const LimitTags: Story = {
  name: "Multiple — limitTags",
  args: {
    multiple: true,
    limitTags: 2,
    defaultValue: ["design", "engineering", "marketing", "operations"],
  },
};

/**
 * This example shows grouped.
 */
export const Grouped: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ cities: cityOptions, groupBy: (option: City) => option.region }),
    template: `
      <Select placeholder="Choose a city…" :options="cities" :group-by="groupBy">
        <template #label>City</template>
      </Select>`,
  }),
};

/**
 * This example shows custom value.
 */
export const CustomValue: Story = {
  name: "#value",
  render: () => ({
    components: { Select },
    setup: () => ({ teamOptions }),
    template: `
      <Select :options="teamOptions" multiple :default-value="['design', 'engineering']">
        <template #label>Team</template>
        <template #value="{ selected }">
          {{ selected.length === 0 ? "None" : \`\${selected.length} teams selected\` }}
        </template>
      </Select>`,
  }),
};

/**
 * **The customization contract.** Slots hand pieces of the component back to
 * you:
 *
 * - `#option="{ optionAttrs, optionEvents, option, state }"` — bind
 *   `optionAttrs` with `v-bind` and `optionEvents` with `v-on` on a single
 *   `<li>` (or `OptionRow`). They carry `role="option"`, the id
 *   `aria-activedescendant` points at, the selected/highlighted/disabled
 *   modifiers and the pointer handlers.
 * - `#value="{ selected }"` — the light touch: it changes only the text
 *   inside the trigger. Reach for it before `#trigger`.
 * - `#trigger="{ triggerAttrs, triggerEvents, triggerRef, value, endAdornment, selected, state }"`
 *   — rebuilds the trigger itself. Bind `triggerAttrs`/`triggerEvents` with
 *   `v-bind`/`v-on` and `triggerRef` with `:ref` on **one** element, and do
 *   not make that element a `<button>`: removable chips render buttons
 *   inside it. `endAdornment` (clear + chevron), rendered via
 *   `<component :is="endAdornment" />`, is handed over rather than placed
 *   for you.
 * - `#group="{ key, label, group }"` — keep the row list inside a list
 *   container of your own.
 * - `#no-options` / `#loading` — return a full `<li>`, they sit in the
 *   listbox.
 *
 * `state` carries what a custom row can't recompute: `multiple` (the default
 * row draws a checkbox rather than a tick), the field `size` (the popup is
 * portaled and inherits nothing), and the option's own `disabled`.
 *
 * Rather than copying BEM class names, build rows from the exported
 * primitives — `OptionRow`, `OptionLabel`, `OptionDescription`, `OptionBody`,
 * `OptionCheck`. They read the listbox they are in and take its styling.
 */
export const CustomOption: Story = {
  name: "#option",
  render: () => ({
    components: { Select, OptionRow, OptionBody, OptionLabel, OptionDescription, OptionCheck },
    setup: () => ({ cities: cityOptions }),
    template: `
      <Select :options="cities">
        <template #label>City</template>
        <template #option="{ optionAttrs, optionEvents, option, state }">
          <OptionRow v-bind="optionAttrs" v-on="optionEvents">
            <span
              aria-hidden="true"
              :style="{
                flexShrink: 0,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: state.selected ? 'var(--okkly-accent-primary)' : 'var(--okkly-border-subtle)',
              }"
            />
            <OptionBody>
              <OptionLabel>{{ option.label }}</OptionLabel>
              <OptionDescription>{{ option.region }}</OptionDescription>
            </OptionBody>
            <OptionCheck :checked="state.selected" />
          </OptionRow>
        </template>
      </Select>`,
  }),
};

/**
 * `#trigger` rebuilds the trigger. Here the selected team is shown with an
 * initial badge, and the chevron is kept where the default puts it.
 *
 * The one hard rule: `triggerAttrs`/`triggerEvents`/`triggerRef` go on a
 * single non-button element. It carries `role="combobox"`,
 * `aria-expanded`, the tabindex, the keyboard handling and the
 * `aria-labelledby` that ties the trigger to the field's label — none of
 * which survives being split across two elements.
 */
export const RecipeRenderInput: Story = {
  name: "Recipe — #trigger",
  render: () => ({
    components: { Select },
    setup: () => ({ teamOptions }),
    template: `
      <Select :options="teamOptions" default-value="engineering">
        <template #label>Team</template>
        <template #helper-text>The label, helper text and focus ring are still the field's</template>
        <template #trigger="{ triggerAttrs, triggerEvents, triggerRef, selected, endAdornment, state }">
          <div
            :ref="triggerRef"
            v-bind="triggerAttrs"
            v-on="triggerEvents"
            style="display: flex; align-items: center; gap: 8px; flex: 1"
          >
            <span
              aria-hidden="true"
              style="display: grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: var(--okkly-bg-surface); font-size: 0.75rem"
              >{{ selected[0]?.label.charAt(0) ?? "?" }}</span
            >
            <span style="flex: 1">{{ selected[0]?.label ?? "Pick a team" }}</span>
            <span aria-hidden="true" :style="{ opacity: state.open ? 1 : 0.5 }">
              <component :is="endAdornment" />
            </span>
          </div>
        </template>
      </Select>`,
  }),
};

/**
 * When only the trigger's *text* changes, `#value` is the smaller tool — it
 * leaves the trigger element, its role and its adornments alone. Compare
 * with the `#trigger` recipe above before reaching for the bigger slot.
 *
 * The listbox's own furniture is replaceable in the same way: `#group` for a
 * `groupBy` header, `#no-options` for an empty list.
 */
export const RecipeGroupsAndEmpty: Story = {
  name: "Recipe — #group / #no-options",
  render: () => ({
    components: { Select },
    setup: () => ({ cities: cityOptions, groupBy: (option: City) => option.region }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <Select :options="cities" :group-by="groupBy">
          <template #label>City</template>
          <template #group="{ key, label, group }">
            <span
              role="presentation"
              style="display: flex; justify-content: space-between; padding: 6px 10px 2px; color: var(--okkly-text-muted); font-size: var(--okkly-font-size-sm)"
            >
              {{ label }}<span>{{ group.options.length }}</span>
            </span>
          </template>
        </Select>
        <Select label="Archived teams" :options="[]">
          <template #label>Archived teams</template>
          <template #no-options>
            <li style="padding: 10px 13px; color: var(--okkly-text-muted)">Nothing archived yet</li>
          </template>
        </Select>
      </div>`,
  }),
};

/**
 * This example shows wider popup.
 */
export const WiderPopup: Story = {
  name: "popupWidth",
  args: { popupWidth: 420 } as never,
  render: (args) => ({
    components: { Select },
    setup: () => ({ args }),
    template: `
      <Select v-bind="args">
        <template #label>Team</template>
        <template #helper-text>Panel is wider than the field</template>
      </Select>`,
  }),
};

/**
 * This example shows near page bottom.
 */
export const NearPageBottom: Story = {
  name: "Flips up near the bottom",
  render: () => ({
    components: { Select },
    setup: () => ({ teamOptions }),
    template: `
      <div style="display: flex; flex-direction: column; height: 150vh; justify-content: flex-end">
        <Select placeholder="Choose a team…" :options="teamOptions">
          <template #label>Team</template>
        </Select>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ teamOptions, sizes: ["small", "medium", "large"] as const }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <Select v-for="size in sizes" :key="size" :size="size" :options="teamOptions" default-value="engineering">
          <template #label>Team</template>
        </Select>
      </div>`,
  }),
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref<string>("engineering");
      const reason = ref("—");
      function handleChange(_event: Event | null, next: unknown, changeReason: string) {
        value.value = (next as string) ?? "";
        reason.value = changeReason;
      }
      return { teamOptions, value, reason, handleChange };
    },
    template: `
      <Select v-model="value" :options="teamOptions" @change="handleChange">
        <template #label>Team</template>
        <template #helper-text>{{ \`Selected: \${value || "none"} · reason: \${reason}\` }}</template>
      </Select>`,
  }),
};

/**
 * This example shows in aform.
 */
export const InAForm: Story = {
  name: "Native form submit",
  render: () => ({
    components: { Select },
    setup() {
      const submitted = ref("—");
      function handleSubmit(event: Event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget as HTMLFormElement);
        submitted.value = data.getAll("team").join(", ") || "nothing";
      }
      return { teamOptions, submitted, handleSubmit };
    },
    template: `
      <form @submit="handleSubmit" style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
        <Select name="team" :options="teamOptions" multiple :default-value="['design']">
          <template #label>Team</template>
        </Select>
        <button type="submit">Submit</button>
        <span>{{ \`FormData: \${submitted}\` }}</span>
      </form>`,
  }),
};
