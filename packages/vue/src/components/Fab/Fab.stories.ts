import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Fab from "./Fab.vue";
import type { FabColor, FabProps } from "./Fab.types";

/** Icons from `@okkly/icons`, inlined so the stories pull in no build-time import. */
const plusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>`;
const xIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>`;
const micIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></svg>`;
const musicIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>`;
const pencilIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>`;
const uploadIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></svg>`;

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly FabColor[];

/** `label` fills the `label` slot; `aria-label` isn't a declared prop, so it's typed here to reach argTypes. */
type FabArgs = FabProps & { label?: string; "aria-label"?: string };

/**
 * Renders the component with the icon in the default slot and `label` split
 * out into the `label` slot, so it lands there instead of falling through as
 * an attribute.
 */
const render = (icon: string) => (args: FabArgs) => ({
  components: { Fab },
  setup() {
    const { label, ...props } = args;
    return { icon, label, props };
  },
  template: `
    <Fab v-bind="props">
      ${icon}
      <template v-if="label" #label>{{ label }}</template>
    </Fab>`,
});

/**
 * Floating action button for the screen's primary create/navigate action. Keep one FAB per view.
 */
const meta: Meta<FabArgs> = {
  title: "Control/FAB",
  component: Fab,
  args: {
    "aria-label": "Add",
    variant: "standard",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["standard", "soft"] },
    color: { control: "select", options: COLORS },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    label: { control: "text" },
  },
  render: render(plusIcon),
};

export default meta;
type Story = StoryObj<FabArgs>;

/**
 * This example shows standard.
 */
export const Standard: Story = {};
/**
 * This example shows dante.
 */
export const Dante: Story = {
  args: { color: "dante", "aria-label": "Record" },
  render: render(micIcon),
};
/**
 * This example shows extended.
 */
export const Extended: Story = { args: { label: "New track" }, render: render(musicIcon) };
/**
 * This example shows the soft variant.
 */
export const Soft: Story = {
  args: { variant: "soft", "aria-label": "Edit" },
  render: render(pencilIcon),
};
/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };

/**
 * This example shows every available color.
 */
export const Colors: Story = {
  render: () => ({
    components: { Fab },
    setup: () => ({ colors: COLORS, plusIcon }),
    template: `
      <div style="display: flex; gap: 16px">
        <Fab v-for="color in colors" :key="color" :color="color" :aria-label="'Add (' + color + ')'">${plusIcon}</Fab>
      </div>`,
  }),
};

/**
 * This example shows every available size.
 */
export const Sizes: Story = {
  render: () => ({
    components: { Fab },
    setup: () => ({ sizes: ["small", "medium", "large"] as const, plusIcon }),
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        <Fab v-for="size in sizes" :key="size" :size="size" :aria-label="'Add (' + size + ')'">${plusIcon}</Fab>
      </div>`,
  }),
};

/** MUI ships `SpeedDial` as its own component on top of `Fab`; this design has no built-in prop for it — compose plain `Fab`s absolutely-positioned instead. */
export const SpeedDial: Story = {
  name: "Speed dial (composed from plain Fabs)",
  render: () => ({
    components: { Fab },
    setup: () => ({
      items: [
        { top: 0, label: "Import", icon: uploadIcon },
        { top: 58, label: "Record", icon: micIcon },
        { top: 116, label: "New track", icon: musicIcon },
      ],
      xIcon,
    }),
    template: `
      <div style="position: relative; width: 220px; height: 260px">
        <div
          v-for="item in items"
          :key="item.label"
          :style="{ position: 'absolute', top: item.top + 'px', left: 0, right: 0, display: 'flex', justifyContent: 'flex-end', gap: '12px' }"
        >
          <span style="align-self: center; padding: 5px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: #16161a; color: #a9a9b2; font-size: 13px; font-family: var(--okkly-font-family-sans, sans-serif); white-space: nowrap">
            {{ item.label }}
          </span>
          <Fab
            size="small"
            :variant="item.label === 'Record' ? 'standard' : 'soft'"
            :color="item.label === 'Record' ? 'dante' : 'primary'"
            :aria-label="item.label"
            ><span v-html="item.icon"
          /></Fab>
        </div>
        <div style="position: absolute; top: 174px; right: 0">
          <Fab aria-label="Close"><span v-html="xIcon" /></Fab>
        </div>
      </div>`,
  }),
};

/**
 * This example shows the component used as a link.
 */
export const AsLink: Story = {
  args: { href: "https://okkly.dev", "aria-label": "Create" },
};
