"use client";

import { type KeyboardEvent, type MouseEvent } from "react";
import "@okkly/design-system/components/ChipGroup/ChipGroup.scss";
import { Chip } from "../Chip/Chip";
import type { ChipGroupItem, ChipGroupProps } from "./ChipGroup.types";

function itemKey(item: ChipGroupItem, index: number) {
  return item.value ?? String(index);
}

function isItemSelected(
  itemValue: string,
  value: string | string[] | undefined,
  item: ChipGroupItem,
  exclusive: boolean,
) {
  if (value !== undefined) {
    return exclusive ? value === itemValue : Array.isArray(value) && value.includes(itemValue);
  }
  return item.selected ?? false;
}

export function ChipGroup({
  children,
  items,
  value,
  onChange,
  exclusive = false,
  color = "primary",
  disabled = false,
  className,
}: ChipGroupProps) {
  const classes = [
    "okkly-component",
    "okkly-chip-group",
    color !== "primary" && `okkly-chip-group--color-${color}`,
    disabled && "okkly-chip-group--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
    item: ChipGroupItem,
    itemValue: string,
  ) => {
    if (disabled || item.disabled) return;

    if (onChange) {
      if (exclusive) {
        onChange(itemValue);
      } else {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(itemValue)
          ? current.filter((entry) => entry !== itemValue)
          : [...current, itemValue];
        onChange(next);
      }
    }

    item.onClick?.(event, item);
  };

  return (
    <div className={classes} role={items && (onChange || exclusive) ? "group" : undefined}>
      {items
        ? items.map((item, index) => {
            const itemValue = itemKey(item, index);
            const selected = isItemSelected(itemValue, value, item, exclusive);
            const interactive = !!onChange || !!item.onClick;
            const chipDisabled = disabled || item.disabled;

            return (
              <Chip
                key={itemValue}
                label={item.label}
                selected={selected}
                disabled={chipDisabled}
                removable={!!item.onRemove}
                onRemove={item.onRemove ? (event) => item.onRemove?.(event, item) : undefined}
                onClick={interactive ? (event) => handleToggle(event, item, itemValue) : undefined}
              />
            );
          })
        : children}
    </div>
  );
}
