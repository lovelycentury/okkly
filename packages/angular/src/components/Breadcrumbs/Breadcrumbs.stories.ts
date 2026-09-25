import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { iconChevronRight, iconFolder, iconHome } from "@okkly/icons";
import { OkklyIcon } from "../Icon/Icon";
import { OkklyBreadcrumbs, OkklyBreadcrumbsSeparator, type BreadcrumbItem } from "./Breadcrumbs";

/** Every input the Playground binds. */
type BreadcrumbsArgs = {
  items: BreadcrumbItem[];
  separator?: string;
  maxItems: number;
  itemsBeforeCollapse: number;
  itemsAfterCollapse: number;
  expandAriaLabel: string;
};

const surface =
  "background: var(--okkly-bg-surface-raised); border: 1px solid var(--okkly-border-subtle); border-radius: 12px; padding: 14px 16px; width: 560px; font-family: var(--okkly-font-family-sans); color: var(--okkly-text-primary)";

/**
 * Trail of parent pages ending at the current location. Crumbs come from an
 * `items` array; the last one is always rendered as the current page, never as
 * a link, and carries `aria-current="page"`.
 */
const meta: Meta<BreadcrumbsArgs> = {
  title: "Navigation/Breadcrumbs",
  component: OkklyBreadcrumbs,
  decorators: [
    moduleMetadata({ imports: [OkklyBreadcrumbs, OkklyBreadcrumbsSeparator, OkklyIcon] }),
  ],
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
    expandAriaLabel: "Show all crumbs",
  },
  argTypes: {
    items: { control: false },
    separator: { control: "text" },
    maxItems: { control: "number" },
    itemsBeforeCollapse: { control: "number" },
    itemsAfterCollapse: { control: "number" },
  },
  parameters: { controls: { exclude: ["crumbs", "expanded", "separatorTemplate"] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="${surface}">
        <okkly-breadcrumbs
          [items]="items"
          [separator]="separator"
          [maxItems]="maxItems"
          [itemsBeforeCollapse]="itemsBeforeCollapse"
          [itemsAfterCollapse]="itemsAfterCollapse"
          [expandAriaLabel]="expandAriaLabel"
        />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<BreadcrumbsArgs>;

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
    props: {
      items: [
        { label: "Home", href: "/", icon: iconHome },
        { label: "Projects", href: "/projects" },
        { label: "Orbit", href: "/projects/orbit" },
        { label: "Deployments" },
      ],
    },
    template: `
      <div style="${surface}; display: grid; gap: 10px">
        <okkly-breadcrumbs [items]="items" />
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
    props: {
      items: [
        { label: "packages", href: "#", icon: iconFolder },
        { label: "design-system", href: "#" },
        { label: "components", href: "#" },
        { label: "Breadcrumbs.scss" },
      ],
    },
    template: `
      <div style="${surface}">
        <okkly-breadcrumbs separator="/" [items]="items" />
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
    props: {
      items: [
        { label: "Home", href: "/", icon: iconHome },
        { label: "Workspace", href: "#" },
        { label: "Projects", href: "#" },
        { label: "Orbit", href: "#" },
        { label: "Services", href: "#" },
        { label: "API gateway", href: "#" },
        { label: "Environment variables" },
      ],
    },
    template: `
      <div style="${surface}">
        <okkly-breadcrumbs [items]="items" [maxItems]="4" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="2" />
      </div>`,
  }),
};

/**
 * A custom separator — plain text through `separator`, or any markup in an
 * `okklyBreadcrumbsSeparator` template, here the chevron from `@okkly/icons`
 * at a smaller size.
 */
export const CustomSeparator: Story = {
  render: () => ({
    props: {
      chevron: iconChevronRight,
      items: [
        { label: "Docs", href: "#" },
        { label: "Components", href: "#" },
        { label: "Breadcrumbs" },
      ],
    },
    template: `
      <div style="${surface}; display: grid; gap: 14px">
        <okkly-breadcrumbs separator="›" [items]="items" />
        <okkly-breadcrumbs [items]="items">
          <ng-template okklyBreadcrumbsSeparator>
            <okkly-icon [icon]="chevron" fontSize="inherit" style="width: 14px; height: 14px" />
          </ng-template>
        </okkly-breadcrumbs>
      </div>`,
  }),
};

/**
 * A single crumb still renders as the current page — useful for top-level
 * screens where the header is shared.
 */
export const SingleCrumb: Story = {
  render: () => ({
    props: { items: [{ label: "Home", icon: iconHome }] },
    template: `
      <div style="${surface}">
        <okkly-breadcrumbs [items]="items" />
      </div>`,
  }),
};
