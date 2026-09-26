import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import {
  OkklyAccordion,
  OkklyAccordionDetails,
  OkklyAccordionExpandIcon,
  OkklyAccordionSummary,
} from "./Accordion";

/** Every input the Playground binds. */
type AccordionArgs = {
  expanded: boolean;
  disabled: boolean;
};

// Each Accordion draws its own card, so the wrapper only sets width and type.
const surface =
  "display: grid; gap: 8px; width: 520px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

/**
 * Expandable section built from three parts: `okkly-accordion` owns the open
 * state, `button[okklyAccordionSummary]` is the button that toggles it,
 * `okkly-accordion-details` is the content. The panel animates its height in
 * both directions and leaves the DOM once the collapse finishes, so closed
 * content stays out of search and assistive tech.
 *
 * Each `okkly-accordion` is independent — for a set where only one may stay
 * open, drive them from one piece of state, as in the exclusive-group story
 * below.
 */
const meta: Meta<AccordionArgs> = {
  title: "Navigation/Accordion",
  component: OkklyAccordion,
  decorators: [
    moduleMetadata({
      imports: [
        OkklyAccordion,
        OkklyAccordionSummary,
        OkklyAccordionDetails,
        OkklyAccordionExpandIcon,
      ],
    }),
  ],
  args: {
    expanded: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-accordion [expanded]="expanded" [disabled]="disabled">
          <button type="button" okklyAccordionSummary>What is included in the design system?</button>
          <okkly-accordion-details>
            Tokens, components, and documentation ship from one source — the same definitions drive
            Storybook, the Figma library, and the published packages.
          </okkly-accordion-details>
        </okkly-accordion>
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
    template: `
      <div style="${surface}">
        <okkly-accordion [expanded]="true">
          <button type="button" okklyAccordionSummary>How do I install the packages?</button>
          <okkly-accordion-details>
            Add <code>@okkly/angular</code> and <code>@okkly/design-system</code>, then import the root
            stylesheet once in your entry file.
          </okkly-accordion-details>
        </okkly-accordion>
        <okkly-accordion>
          <button type="button" okklyAccordionSummary>Can I theme the components?</button>
          <okkly-accordion-details>
            Yes — every component exposes CSS variables. Override them on the component or on a
            wrapper that also carries your own tokens.
          </okkly-accordion-details>
        </okkly-accordion>
        <okkly-accordion>
          <button type="button" okklyAccordionSummary>Which browsers are supported?</button>
          <okkly-accordion-details>
            The last two versions of Chrome, Safari, Firefox, and Edge.
          </okkly-accordion-details>
        </okkly-accordion>
      </div>`,
  }),
};

/**
 * Exclusive group: one state variable decides which panel is open, so opening
 * a section closes the previous one.
 */
export const ExclusiveGroup: Story = {
  name: "Exclusive group",
  render: () => ({
    props: {
      open: "shipping" as string | null,
      sections: [
        {
          id: "shipping",
          title: "Shipping address",
          body: "Kyiv, Khreshchatyk 1 · delivery in 2–3 business days.",
        },
        { id: "payment", title: "Payment method", body: "Visa •••• 4242, expires 09/29." },
        { id: "review", title: "Review order", body: "3 items · €148.00 including VAT." },
      ],
    },
    template: `
      <div style="${surface}">
        @for (section of sections; track section.id) {
          <okkly-accordion
            [expanded]="open === section.id"
            (expandedChange)="open = $event ? section.id : null"
          >
            <button type="button" okklyAccordionSummary>{{ section.title }}</button>
            <okkly-accordion-details>{{ section.body }}</okkly-accordion-details>
          </okkly-accordion>
        }
      </div>`,
  }),
};

/**
 * A settings group with richer content inside the panel.
 */
export const RichContent: Story = {
  name: "Rich content",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-accordion [expanded]="true">
          <button type="button" okklyAccordionSummary>Advanced build options</button>
          <okkly-accordion-details>
            <ul style="margin: 0; padding-inline-start: 18px; display: grid; gap: 6px">
              <li>Source maps for production bundles</li>
              <li>Tree-shaken CSS with per-component entry points</li>
              <li>Legacy target for browsers without cascade layers</li>
            </ul>
          </okkly-accordion-details>
        </okkly-accordion>
      </div>`,
  }),
};

/**
 * A disabled section can't be opened, and a custom expand icon replaces the
 * chevron.
 */
export const DisabledAndCustomIcon: Story = {
  name: "Disabled / custom icon",
  render: () => ({
    template: `
      <div style="${surface}">
        <okkly-accordion>
          <button type="button" okklyAccordionSummary>
            Custom expand icon
            <svg
              okklyAccordionExpandIcon
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <okkly-accordion-details>
            The icon is yours; the rotation on expand comes from the component.
          </okkly-accordion-details>
        </okkly-accordion>
        <okkly-accordion [disabled]="true">
          <button type="button" okklyAccordionSummary>Locked while your plan is on trial</button>
          <okkly-accordion-details>Never reachable — the summary button is disabled.</okkly-accordion-details>
        </okkly-accordion>
      </div>`,
  }),
};
