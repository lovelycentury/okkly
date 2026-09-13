<script lang="ts">
import type { Component } from "vue";

/** One live cell of a matrix rendered without isolation. */
export interface ScreenshotMatrixCell {
  /** The cell's `grid-area`, `{row}-{column}`. */
  id: string;
  props?: Record<string, unknown>;
  /** Slot content, as raw markup. */
  slots?: Record<string, string>;
  /** Whether to draw the `1rem` padding around the cell. */
  padded: boolean;
}

export interface ScreenshotMatrixProps {
  /** Shown above the matrix and used as the snapshot filename. */
  name: string;
  columns: readonly string[];
  rows: readonly string[];
  /** The browser the matrix was captured in, printed into the image. */
  browserName: string;
  /** The component every entry of `cells` renders. */
  component?: Component;
  /**
   * Cells rendered live, in one pass. Built here rather than passed in as a
   * render function: Playwright can only hand the browser serializable props,
   * and a component reference among them.
   */
  cells?: readonly ScreenshotMatrixCell[];
}
</script>

<script setup lang="ts">
import { computed, h } from "vue";
import { compileSlot } from "./compileSlot";
import { escapeGridAreaName, getCellId } from "./gridArea";

const props = defineProps<ScreenshotMatrixProps>();

defineSlots<{
  /** One cell per column/row combination, each placed by its `grid-area`. */
  default?: () => unknown;
}>();

const renderCell = (cell: ScreenshotMatrixCell) => () =>
  h(
    props.component!,
    cell.props,
    Object.fromEntries(
      Object.entries(cell.slots ?? {}).map(([name, markup]) => [name, compileSlot(markup)]),
    ),
  );

/**
 * Every cell sets `grid-area` to `{row}-{column}`, so the template places it
 * without the children needing to know their own order.
 */
const gridTemplateAreas = computed(() => {
  const lines = [
    `"blank ${props.columns.map((column) => `column-${escapeGridAreaName(column)}`).join(" ")}"`,
  ];

  props.rows.forEach((row) => {
    const cells = props.columns.map((column) => getCellId(row, column)).join(" ");
    lines.push(`"row-${escapeGridAreaName(row)} ${cells}"`);
  });

  return lines.join("\n");
});

const gridStyle = computed(() => ({
  display: "grid",
  gap: "2rem",
  gridTemplateRows: "auto",
  width: "max-content",
  alignItems: "center",
  justifyContent: "center",
  gridTemplateColumns: `auto repeat(${props.columns.length}, 1fr)`,
  gridTemplateAreas: gridTemplateAreas.value,
}));
</script>

<template>
  <div style="width: max-content; font-family: Arial, sans-serif">
    <div style="margin-bottom: 2rem">
      <h1 style="font-size: 1.25rem; line-height: 1.75rem; margin: 0">
        Screenshot test: {{ name }}
      </h1>
      <div>Browser: {{ browserName }}</div>
    </div>

    <div :style="gridStyle">
      <div style="grid-area: blank" />
      <slot />
      <div
        v-for="cell in cells"
        :key="cell.id"
        :style="{
          display: 'grid',
          gridArea: cell.id,
          width: 'max-content',
          padding: cell.padded ? '1rem' : undefined,
        }"
      >
        <component :is="renderCell(cell)" />
      </div>
      <div
        v-for="row in rows"
        :key="`row-${row}`"
        :style="{ textAlign: 'center', gridArea: `row-${escapeGridAreaName(row)}` }"
      >
        {{ row }}
      </div>
      <div
        v-for="column in columns"
        :key="`column-${column}`"
        :style="{ textAlign: 'center', gridArea: `column-${escapeGridAreaName(column)}` }"
      >
        {{ column }}
      </div>
    </div>
  </div>
</template>
