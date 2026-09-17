import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, ref } from "vue";
import Pagination from "./Pagination.vue";
import type { PaginationColor, PaginationProps, PaginationSize } from "./Pagination.types";

/** `modelValue` is the `v-model` — the current page. */
type PaginationArgs = PaginationProps & { modelValue?: number };

const surface = {
  background: "var(--okkly-bg-surface-raised)",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "12px",
  padding: "16px",
  width: "fit-content",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const cellStyle =
  "padding: 10px 12px; font-size: var(--okkly-font-size-sm); text-align: left; border-bottom: 1px solid var(--okkly-border-subtle)";

/**
 * Page controls with boundary pages, a sibling window around the current page,
 * and ellipses in between.
 *
 * The component is controlled: it renders exactly the `page` you `v-model` and
 * writes back into it, the same way every story below wires it.
 */
const meta: Meta<PaginationArgs> = {
  title: "Navigation/Pagination",
  component: Pagination as unknown as Meta<PaginationArgs>["component"],
  args: {
    count: 10,
    modelValue: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstButton: false,
    showLastButton: false,
    size: "medium",
    shape: "rounded",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    shape: { control: "inline-radio", options: ["circular", "rounded"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, surface }),
    template: `<div :style="surface"><Pagination v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<PaginationArgs>;

/**
 * Play with every prop from the controls panel. `page` is fixed here — see
 * Table below for the wired version.
 */
export const Playground: Story = {};

/**
 * The real job: a table footer that pages through rows. Note how `v-model`
 * writes back into state and the slice follows.
 */
export const Table: Story = {
  name: "Table footer (wired)",
  render: () => ({
    components: { Pagination },
    setup() {
      const rows = Array.from({ length: 43 }, (_, index) => ({
        id: 1043 - index,
        title: [
          "Fix flaky login test",
          "Bump vite to 6.1",
          "Add empty state",
          "Tune ripple timing",
        ][index % 4],
        author: ["Maria", "Tomas", "Oleksii", "Ana"][index % 4],
      }));
      const perPage = 5;
      const page = ref(1);
      const pageCount = Math.ceil(rows.length / perPage);
      const visible = computed(() => rows.slice((page.value - 1) * perPage, page.value * perPage));
      const rangeLabel = computed(
        () =>
          `${(page.value - 1) * perPage + 1}–${Math.min(page.value * perPage, rows.length)} of ${rows.length}`,
      );
      return { surface, cellStyle, visible, rangeLabel, page, pageCount };
    },
    template: `
      <div :style="{ ...surface, width: '480px', padding: 0 }">
        <table style="width: 100%; border-collapse: collapse">
          <tbody>
            <tr v-for="row in visible" :key="row.id">
              <td :style="{ ...cellStyle, color: 'var(--okkly-text-muted)', width: '72px' }">#{{ row.id }}</td>
              <td :style="cellStyle">{{ row.title }}</td>
              <td :style="{ ...cellStyle, color: 'var(--okkly-text-secondary)', width: '96px' }">{{ row.author }}</td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px">
          <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">{{ rangeLabel }}</span>
          <Pagination v-model="page" :count="pageCount" />
        </div>
      </div>`,
  }),
};

/**
 * With many pages the middle collapses: `boundaryCount` pages pinned at each
 * end, `siblingCount` on each side of the current page, ellipses for the rest.
 */
export const Windowing: Story = {
  render: () => ({
    components: { Pagination },
    setup() {
      const page = ref(37);
      return { surface, page };
    },
    template: `
      <div :style="{ ...surface, display: 'grid', gap: '16px' }">
        <Pagination v-model="page" :count="80" />
        <Pagination v-model="page" :count="80" :sibling-count="2" />
        <Pagination v-model="page" :count="80" :boundary-count="2" />
        <span style="font-size: var(--okkly-font-size-sm); color: var(--okkly-text-secondary)">
          {{ \`default · siblingCount=2 · boundaryCount=2 — page \${page} of 80\` }}
        </span>
      </div>`,
  }),
};

/**
 * First/last buttons help when the list is long enough that dragging through
 * pages is tedious.
 */
export const WithBoundaryButtons: Story = {
  render: () => ({
    components: { Pagination },
    setup() {
      const page = ref(6);
      return { surface, page };
    },
    template: `
      <div :style="surface">
        <Pagination v-model="page" :count="24" show-first-button show-last-button />
      </div>`,
  }),
};

/**
 * Sizes and shapes. `circular` suits dense toolbars; `rounded` is the default.
 */
export const SizesAndShapes: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ surface, sizes: ["small", "medium", "large"] as PaginationSize[] }),
    template: `
      <div :style="{ ...surface, display: 'grid', gap: '16px' }">
        <Pagination v-for="size in sizes" :key="size" :count="8" :model-value="3" :size="size" />
        <Pagination :count="8" :model-value="3" shape="circular" />
      </div>`,
  }),
};

/**
 * Every accent tone the active page supports.
 */
export const Colors: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({
      surface,
      colors: ["primary", "dante", "indigo", "violet", "ember", "ice"] as PaginationColor[],
    }),
    template: `
      <div :style="{ ...surface, display: 'grid', gap: '12px' }">
        <Pagination v-for="color in colors" :key="color" :count="6" :model-value="2" :color="color" />
      </div>`,
  }),
};

/**
 * Disabled while the page data is loading — every control greys out and stops
 * updating the model.
 */
export const Disabled: Story = {
  render: () => ({
    components: { Pagination },
    setup: () => ({ surface }),
    template: `
      <div :style="surface">
        <Pagination :count="10" :model-value="2" disabled show-first-button show-last-button />
      </div>`,
  }),
};
