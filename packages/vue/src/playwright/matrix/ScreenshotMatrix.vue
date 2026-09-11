<script lang="ts">
export interface ScreenshotMatrixProps {
  /** Shown above the matrix and used as the snapshot filename. */
  name: string;
  columns: readonly string[];
  rows: readonly string[];
  /** The browser the matrix was captured in, printed into the image. */
  browserName: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { escapeGridAreaName, getCellId } from "./gridArea";

const props = defineProps<ScreenshotMatrixProps>();

defineSlots<{
  /** One cell per column/row combination, each placed by its `grid-area`. */
  default?: () => unknown;
}>();

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
