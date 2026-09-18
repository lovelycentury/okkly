import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { iconHeart, iconSearch, iconStar } from "@okkly/icons";
import { ref } from "vue";
import Icon, { ICON_NAMES } from "./Icon.vue";
import type { IconName, IconProps } from "./Icon.types";

/**
 * Renders any glyph from `@okkly/icons`. Pick one by `name` for autocomplete
 * over the whole set, or hand it markup you already imported via `icon` —
 * give neither and the icon renders empty.
 *
 * The icon paints with `currentColor`, so inside a Button, a link, or a
 * Typography block it simply inherits the text colour; reach for `color`
 * only when it should stand apart.
 */
const meta: Meta<IconProps> = {
  title: "Data/Icon",
  component: Icon,
  args: {
    name: "iconStar",
  },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<IconProps>;

/**
 * This example shows the default state: medium size, inheriting the text
 * colour, and hidden from assistive tech as decoration.
 */
export const Default: Story = {};

/**
 * Passing markup directly keeps the bundle to the one icon you imported —
 * the preferred form in application code.
 */
export const FromImportedMarkup: Story = {
  args: { name: undefined, icon: iconHeart },
};

/**
 * `fontSize` matches IconButton's glyph scale, so the two line up side by
 * side. `"inherit"` tracks the surrounding font size instead.
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { Icon },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem">
        <Icon v-bind="args" font-size="small" />
        <Icon v-bind="args" font-size="medium" />
        <Icon v-bind="args" font-size="large" />
        <span style="font-size: 2.5rem"><Icon v-bind="args" font-size="inherit" /></span>
      </div>`,
  }),
};

/**
 * Accent and feedback tones. The default, `"inherit"`, is the one to reach
 * for most of the time.
 */
export const Colors: Story = {
  render: (args) => ({
    components: { Icon },
    setup: () => ({
      args,
      colors: [
        "inherit",
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
        "muted",
      ] as const,
    }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1.25rem">
        <Icon v-for="color in colors" :key="color" v-bind="args" :color="color" :title-access="color" />
      </div>`,
  }),
};

/**
 * With `titleAccess` the icon is exposed as an image with a name. Use it
 * whenever the glyph is the only thing carrying the meaning.
 */
export const WithLabel: Story = {
  args: { name: "iconSearch", titleAccess: "Search" },
};

/**
 * A live picker over the full set — the same union TypeScript autocompletes
 * at the call site.
 */
export const Picker: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const query = ref("");
      const selected = ref<IconName>("iconSearch");
      const matches = () =>
        ICON_NAMES.filter((name) => name.toLowerCase().includes(query.value.toLowerCase())).slice(
          0,
          48,
        );
      return { query, selected, matches, iconSearch };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 34rem">
        <div style="display: flex; align-items: center; gap: 0.75rem">
          <Icon :icon="iconSearch" font-size="small" />
          <input
            v-model="query"
            placeholder="Filter icons…"
            style="flex: 1; padding: 0.5rem 0.75rem"
          />
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
          <button
            v-for="name in matches()"
            :key="name"
            type="button"
            @click="selected = name"
            :title="name"
            style="display: grid; place-items: center; width: 2.5rem; height: 2.5rem; cursor: pointer"
          >
            <Icon :name="name" :color="name === selected ? 'primary' : 'inherit'" />
          </button>
        </div>

        <code>{{ \`<Icon name="\${selected}" />\` }}</code>
      </div>`,
  }),
};

/**
 * Inline with text the icon inherits both colour and — with
 * `fontSize="inherit"` — the surrounding size.
 */
export const InlineWithText: Story = {
  render: () => ({
    components: { Icon },
    setup: () => ({ iconStar }),
    template: `
      <p style="max-width: 30rem">
        Starred items <Icon :icon="iconStar" font-size="inherit" /> stay pinned to the top of the list.
      </p>`,
  }),
};
