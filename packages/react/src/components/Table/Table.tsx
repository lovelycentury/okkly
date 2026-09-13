"use client";

import { forwardRef } from "react";
import "@okkly/design-system/components/Table/Table.scss";
import type {
  TableProps,
  TableContainerProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableHeaderCellProps,
} from "./Table.types";

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "default", children, className, ...rest },
  ref,
) {
  // `okkly-component` here too, not just on the container: the reset that carries
  // `box-sizing: border-box` is scoped to that class, and a `Table` is perfectly
  // legal without a `TableContainer` around it.
  const classes = [
    "okkly-component",
    "okkly-table",
    density === "dense" && "okkly-table--dense",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table ref={ref} className={classes} {...rest}>
      {children}
    </table>
  );
});

export function TableContainer({
  stickyHeader = false,
  children,
  className,
  ...rest
}: TableContainerProps) {
  const classes = [
    "okkly-component",
    "okkly-table-container",
    stickyHeader && "okkly-table-container--sticky",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function TableHead({ children, className, ...rest }: TableHeadProps) {
  const classes = ["okkly-table__head", className].filter(Boolean).join(" ");

  return (
    <thead className={classes} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...rest }: TableBodyProps) {
  const classes = ["okkly-table__body", className].filter(Boolean).join(" ");

  return (
    <tbody className={classes} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ hover = false, children, className, ...rest }: TableRowProps) {
  const classes = ["okkly-table__row", hover && "okkly-table__row--hover", className]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={classes} {...rest}>
      {children}
    </tr>
  );
}

export function TableCell({
  head = false,
  numeric = false,
  children,
  className,
  ...rest
}: TableCellProps) {
  const Tag = head ? "th" : "td";
  const classes = [
    "okkly-table__cell",
    head && "okkly-table__cell--head",
    numeric && "okkly-table__cell--numeric",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} scope={head ? "col" : undefined} {...rest}>
      {children}
    </Tag>
  );
}

export function TableHeaderCell(props: TableHeaderCellProps) {
  return <TableCell head {...props} />;
}
