import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { iconChevronRight, iconFolder, iconHome } from "@okkly/icons";
import Breadcrumbs from "./Breadcrumbs.vue";
import type { BreadcrumbsProps } from "./Breadcrumbs.types";

const surface = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "14px 16px",
  width: "560px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

/**
 * Trail of parent pages ending at the current location. Crumbs come from an
 * `items` array; the last one is always rendered as the current page, never as
 * a link, and carries `aria-current="page"`.
 */
const meta: Meta<BreadcrumbsProps> = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Home", href: "/", icon: iconHome },
      { label: "Projects", href: "/projects" },
      { label: "Orbit", href: "/projects/orbit" },
      { label: "Settings" },
    ],
    maxItems: 8,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 1,
  },
  argTypes: {
    items: { control: false },
  },
  render: (args) => ({
    components: { Breadcrumbs },
    setup: () => ({ args, surface }),
    template: `<div :style="surface"><Breadcrumbs v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<BreadcrumbsProps>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The page header of a project section — home icon on the root crumb, current
 * page last.
 */
export const PageHeader: Story = {
  render: () => ({
    components: { Breadcrumbs },
    setup: () => ({
      surface,
      items: [
        { label: "Home", href: "/", icon: iconHome },
        { label: "Projects", href: "/projects" },
        { label: "Orbit", href: "/projects/orbit" },
        { label: "Deployments" },
      ],
    }),
    template: `
      <div :style="{ ...surface, display: 'grid', gap: '10px' }">
        <Breadcrumbs :items="items" />
        <h2 style="margin: 0; font-size: 1.25rem; font-weight: 500">Deployments</h2>
      </div>`,
  }),
};

/**
 * A file path is the other common use — swap the separator for a slash and put
 * a folder glyph on the crumbs.
 */
export const FilePath: Story = {
  render: () => ({
    components: { Breadcrumbs },
    setup: () => ({
      surface,
      items: [
        { label: "packages", href: "#", icon: iconFolder },
        { label: "design-system", href: "#" },
        { label: "components", href: "#" },
        { label: "Breadcrumbs.scss" },
      ],
    }),
    template: `
      <div :style="surface">
        <Breadcrumbs :items="items">
          <template #separator>/</template>
        </Breadcrumbs>
      </div>`,
  }),
};

/**
 * Deep trees collapse behind a "…" once the crumb count passes `maxItems`.
 * Clicking it expands the full path in place.
 */
export const Collapsed: Story = {
  name: "Collapsed (maxItems)",
  render: () => ({
    components: { Breadcrumbs },
    setup: () => ({
      surface,
      items: [
        { label: "Home", href: "/", icon: iconHome },
        { label: "Workspace", href: "#" },
        { label: "Projects", href: "#" },
        { label: "Orbit", href: "#" },
        { label: "Services", href: "#" },
        { label: "API gateway", href: "#" },
        { label: "Environment variables" },
      ],
    }),
    template: `
      <div :style="surface">
        <Breadcrumbs :max-items="4" :items-before-collapse="1" :items-after-collapse="2" :items="items" />
      </div>`,
  }),
};

/**
 * A custom separator node — anything renderable works, here a slash and the
 * chevron from `@okkly/icons` at a smaller size.
 */
export const CustomSeparator: Story = {
  render: () => ({
    components: { Breadcrumbs },
    setup: () => ({
      surface,
      iconChevronRight,
      items: [
        { label: "Docs", href: "#" },
        { label: "Components", href: "#" },
        { label: "Breadcrumbs" },
      ],
    }),
    template: `
      <div :style="{ ...surface, display: 'grid', gap: '14px' }">
        <Breadcrumbs :items="items">
          <template #separator>›</template>
        </Breadcrumbs>
        <Breadcrumbs :items="items">
          <template #separator>
            <span style="width: 14px; display: inline-flex" v-html="iconChevronRight" />
          </template>
        </Breadcrumbs>
      </div>`,
  }),
};

/**
 * A single crumb still renders as the current page — useful for top-level
 * screens where the header is shared.
 */
export const SingleCrumb: Story = {
  render: () => ({
    components: { Breadcrumbs },
    setup: () => ({ surface, items: [{ label: "Home", icon: iconHome }] }),
    template: `<div :style="surface"><Breadcrumbs :items="items" /></div>`,
  }),
};
