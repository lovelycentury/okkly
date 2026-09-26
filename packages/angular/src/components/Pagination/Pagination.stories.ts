import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { OkklyPagination } from "./Pagination";
import type { PaginationColor, PaginationShape, PaginationSize } from "./Pagination";

/** Every input the template below binds. */
type PaginationArgs = {
  count: number;
  page: number;
  siblingCount: number;
  boundaryCount: number;
  showFirstButton: boolean;
  showLastButton: boolean;
  size: PaginationSize;
  color: PaginationColor;
  disabled: boolean;
  shape: PaginationShape;
};

const bindings = `
    [count]="count"
    [(page)]="page"
    [siblingCount]="siblingCount"
    [boundaryCount]="boundaryCount"
    [showFirstButton]="showFirstButton"
    [showLastButton]="showLastButton"
    [size]="size"
    [color]="color"
    [disabled]="disabled"
    [shape]="shape"`;

/**
 * Page controls with boundary pages, a sibling window around the current page,
 * and ellipses in between.
 */
const meta: Meta<PaginationArgs> = {
  title: "Navigation/Pagination",
  component: OkklyPagination,
  decorators: [moduleMetadata({ imports: [OkklyPagination] })],
  args: {
    count: 10,
    page: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstButton: false,
    showLastButton: false,
    size: "medium",
    color: "primary",
    disabled: false,
    shape: "rounded",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    shape: { control: "inline-radio", options: ["circular", "rounded"] },
    color: {
      control: "select",
      options: ["primary", "dante", "indigo", "violet", "ember", "ice"],
    },
  },
  render: (args) => ({ props: args, template: `<okkly-pagination${bindings} />` }),
};

export default meta;
type Story = StoryObj<PaginationArgs>;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * With many pages the middle collapses: `boundaryCount` pages pinned at each
 * end, `siblingCount` on each side of the current page, ellipses for the rest.
 */
export const Windowing: Story = {
  render: () => ({
    props: { page: 37 },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        <okkly-pagination [count]="80" [(page)]="page" />
        <okkly-pagination [count]="80" [(page)]="page" [siblingCount]="2" />
        <okkly-pagination [count]="80" [(page)]="page" [boundaryCount]="2" />
      </div>`,
  }),
};

/**
 * First/last buttons help when the list is long enough that dragging through
 * pages is tedious.
 */
export const WithBoundaryButtons: Story = {
  render: () => ({
    props: { page: 6 },
    template: `<okkly-pagination [count]="24" [(page)]="page" showFirstButton showLastButton />`,
  }),
};

/**
 * Sizes and shapes. `circular` suits dense toolbars; `rounded` is the default.
 */
export const SizesAndShapes: Story = {
  render: () => ({
    props: { sizes: ["small", "medium", "large"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
        @for (size of sizes; track size) {
          <okkly-pagination [count]="8" [page]="3" [size]="size" />
        }
        <okkly-pagination [count]="8" [page]="3" shape="circular" />
      </div>`,
  }),
};

/**
 * Every accent tone the active page supports.
 */
export const Colors: Story = {
  render: () => ({
    props: { colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
        @for (color of colors; track color) {
          <okkly-pagination [count]="6" [page]="2" [color]="color" />
        }
      </div>`,
  }),
};

/**
 * Disabled while the page data is loading — every control greys out and stops
 * moving the page.
 */
export const Disabled: Story = {
  render: () => ({
    props: {},
    template: `<okkly-pagination [count]="10" [page]="2" disabled showFirstButton showLastButton />`,
  }),
};
