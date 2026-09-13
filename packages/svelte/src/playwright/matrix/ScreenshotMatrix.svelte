<script lang="ts" module>
  import type { Component } from "svelte";

  /** One capture of a matrix rendered with isolation, served back by route. */
  export interface ScreenshotMatrixImage {
    /** The cell's `grid-area`, `{row}-{column}`. */
    id: string;
    src: string;
    /** The CSS size of the captured box, so a 2x capture is not drawn at 2x. */
    width?: number;
    height?: number;
  }

  /** One live cell of a matrix rendered without isolation. */
  export interface ScreenshotMatrixCell {
    /** The cell's `grid-area`, `{row}-{column}`. */
    id: string;
    props?: Record<string, unknown>;
    /** Snippet props, as raw markup. */
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
    /** Captured cells, for a matrix rendered with isolation. */
    images?: readonly ScreenshotMatrixImage[];
    /** The component every entry of `cells` renders. */
    component?: Component<Record<string, unknown>>;
    /**
     * Cells rendered live, in one pass. Built here rather than passed in as
     * snippets: Playwright can only hand the browser serializable props, and a
     * component reference among them.
     */
    cells?: readonly ScreenshotMatrixCell[];
  }
</script>

<script lang="ts">
  import { createRawSnippet } from "svelte";
  import { escapeGridAreaName, getCellId } from "./gridArea";

  let {
    name,
    columns,
    rows,
    browserName,
    images = [],
    component: Cell,
    cells = [],
  }: ScreenshotMatrixProps = $props();

  /** The same conversion Playwright's Svelte `mount()` applies to `slots`. */
  const toSnippets = (slots: Record<string, string> = {}) =>
    Object.fromEntries(
      Object.entries(slots).map(([slot, markup]) => [
        slot,
        createRawSnippet(() => ({ render: () => markup })),
      ]),
    );

  /**
   * Every cell sets `grid-area` to `{row}-{column}`, so the template places it
   * without the children needing to know their own order.
   */
  const gridTemplateAreas = $derived(
    [
      `"blank ${columns.map((column) => `column-${escapeGridAreaName(column)}`).join(" ")}"`,
      ...rows.map(
        (row) =>
          `"row-${escapeGridAreaName(row)} ${columns.map((column) => getCellId(row, column)).join(" ")}"`,
      ),
    ].join("\n"),
  );
</script>

<div style="width: max-content; font-family: Arial, sans-serif">
  <div style="margin-bottom: 2rem">
    <h1 style="font-size: 1.25rem; line-height: 1.75rem; margin: 0">
      Screenshot test: {name}
    </h1>
    <div>Browser: {browserName}</div>
  </div>

  <div
    style="display: grid; gap: 2rem; grid-template-rows: auto; width: max-content; align-items: center; justify-content: center"
    style:grid-template-columns={`auto repeat(${columns.length}, 1fr)`}
    style:grid-template-areas={gridTemplateAreas}
  >
    <div style="grid-area: blank"></div>
    {#each images as image (image.id)}
      <img
        width={image.width}
        height={image.height}
        style:grid-area={image.id}
        src={image.src}
        alt={image.id}
      />
    {/each}
    {#if Cell}
      {#each cells as cell (cell.id)}
        <div
          style="display: grid; width: max-content"
          style:grid-area={cell.id}
          style:padding={cell.padded ? "1rem" : undefined}
        >
          <Cell {...cell.props} {...toSnippets(cell.slots)} />
        </div>
      {/each}
    {/if}
    {#each rows as row (row)}
      <div style="text-align: center" style:grid-area={`row-${escapeGridAreaName(row)}`}>
        {row}
      </div>
    {/each}
    {#each columns as column (column)}
      <div style="text-align: center" style:grid-area={`column-${escapeGridAreaName(column)}`}>
        {column}
      </div>
    {/each}
  </div>
</div>
