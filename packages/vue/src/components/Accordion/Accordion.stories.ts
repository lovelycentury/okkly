import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { iconPlus } from "@okkly/icons";
import Accordion from "./Accordion.vue";
import AccordionSummary from "./AccordionSummary.vue";
import AccordionDetails from "./AccordionDetails.vue";
import type { AccordionProps } from "./Accordion.types";

/** `modelValue` is the `v-model` — the current expanded state. */
type AccordionArgs = AccordionProps & { modelValue?: boolean };

// Each Accordion draws its own card, so the wrapper only sets width and type.
const surface = {
  display: "grid",
  gap: "8px",
  width: "520px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

/**
 * Expandable section built from three parts: `Accordion` owns the open state,
 * `AccordionSummary` is the button that toggles it, `AccordionDetails` is the
 * content. The panel animates its height in both directions and leaves the DOM
 * once the collapse finishes, so closed content stays out of search and
 * assistive tech.
 *
 * Each `Accordion` is independent — for a set where only one may stay open,
 * drive them from one piece of state, as in the FAQ story below.
 */
const meta: Meta<AccordionArgs> = {
  title: "Navigation/Accordion",
  component: Accordion as unknown as Meta<AccordionArgs>["component"],
  args: {
    defaultExpanded: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Accordion, AccordionSummary, AccordionDetails },
    setup: () => ({ args, surface }),
    template: `
      <div :style="surface">
        <Accordion v-bind="args">
          <AccordionSummary>What is included in the design system?</AccordionSummary>
          <AccordionDetails>
            Tokens, components, and documentation ship from one source — the same definitions drive
            Storybook, the Figma library, and the published packages.
          </AccordionDetails>
        </Accordion>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AccordionArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A support page: several independent sections, the first one open on load.
 */
export const FaqList: Story = {
  name: "FAQ list",
  render: () => ({
    components: { Accordion, AccordionSummary, AccordionDetails },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Accordion default-expanded>
          <AccordionSummary>How do I install the packages?</AccordionSummary>
          <AccordionDetails>
            Add <code>@okkly/vue</code> and <code>@okkly/design-system</code>, then import the root
            stylesheet once in your entry file.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Can I theme the components?</AccordionSummary>
          <AccordionDetails>
            Yes — every component exposes CSS variables. Override them on the component or on a
            wrapper that also carries your own tokens.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Which browsers are supported?</AccordionSummary>
          <AccordionDetails>
            The last two versions of Chrome, Safari, Firefox, and Edge.
          </AccordionDetails>
        </Accordion>
      </div>`,
  }),
};

/**
 * Exclusive group: one state variable decides which panel is open, so opening
 * a section closes the previous one.
 */
export const ExclusiveGroup: Story = {
  render: () => ({
    components: { Accordion, AccordionSummary, AccordionDetails },
    setup() {
      const open = ref<string | null>("shipping");
      const sections = [
        {
          id: "shipping",
          title: "Shipping address",
          body: "Kyiv, Khreshchatyk 1 · delivery in 2–3 business days.",
        },
        { id: "payment", title: "Payment method", body: "Visa •••• 4242, expires 09/29." },
        { id: "review", title: "Review order", body: "3 items · €148.00 including VAT." },
      ];
      return { surface, sections, open };
    },
    template: `
      <div :style="surface">
        <Accordion
          v-for="section in sections"
          :key="section.id"
          :model-value="open === section.id"
          @update:model-value="(expanded) => (open = expanded ? section.id : null)"
        >
          <AccordionSummary>{{ section.title }}</AccordionSummary>
          <AccordionDetails>{{ section.body }}</AccordionDetails>
        </Accordion>
      </div>`,
  }),
};

/**
 * A settings group with richer content inside the panel.
 */
export const RichContent: Story = {
  render: () => ({
    components: { Accordion, AccordionSummary, AccordionDetails },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Accordion default-expanded>
          <AccordionSummary>Advanced build options</AccordionSummary>
          <AccordionDetails>
            <ul style="margin: 0; padding-inline-start: 18px; display: grid; gap: 6px">
              <li>Source maps for production bundles</li>
              <li>Tree-shaken CSS with per-component entry points</li>
              <li>Legacy target for browsers without cascade layers</li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </div>`,
  }),
};

/**
 * A disabled section can't be opened, and a custom `#expand-icon` slot
 * replaces the chevron.
 */
export const DisabledAndCustomIcon: Story = {
  name: "Disabled / custom icon",
  render: () => ({
    components: { Accordion, AccordionSummary, AccordionDetails },
    setup: () => ({ surface, iconPlus }),
    template: `
      <div :style="surface">
        <Accordion>
          <AccordionSummary>
            Custom expand icon
            <template #expand-icon><span v-html="iconPlus" /></template>
          </AccordionSummary>
          <AccordionDetails>
            The icon is yours; the rotation on expand comes from the component.
          </AccordionDetails>
        </Accordion>
        <Accordion disabled>
          <AccordionSummary>Locked while your plan is on trial</AccordionSummary>
          <AccordionDetails>Never reachable — the summary button is disabled.</AccordionDetails>
        </Accordion>
      </div>`,
  }),
};
