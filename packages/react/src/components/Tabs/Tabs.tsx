"use client";

import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import "@okkly/design-system/components/Tabs/Tabs.scss";
import type { TabsProps } from "./Tabs.types";

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  color = "primary",
  variant = "standard",
  orientation = "horizontal",
  className,
  ...rest
}: TabsProps) {
  const [internalValue, setInternalValue] = useState<string>(
    () => defaultValue ?? items[0]?.value ?? "",
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const classes = [
    "okkly-component",
    "okkly-tabs",
    color !== "primary" && `okkly-tabs--color-${color}`,
    variant === "scrollable" && "okkly-tabs--scrollable",
    orientation === "vertical" && "okkly-tabs--vertical",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleTabClick = (event: MouseEvent<HTMLButtonElement>, tabValue: string) => {
    if (!isControlled) setInternalValue(tabValue);
    onChange?.(event, tabValue);
  };

  // Only the selected tab is tabbable (roving tabindex), so the arrow keys are
  // the only way in or out of the rest of the tablist — WAI-ARIA tabs pattern
  // with automatic activation.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    if (!["Home", "End", nextKey, prevKey].includes(event.key)) return;

    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;

    const currentIndex = enabled.findIndex((item) => item.value === currentValue);
    let nextIndex: number;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabled.length - 1;
    else {
      const step = event.key === nextKey ? 1 : -1;
      const from = currentIndex === -1 ? 0 : currentIndex;
      nextIndex = (from + step + enabled.length) % enabled.length;
    }

    const nextTab = enabled[nextIndex];
    if (!nextTab || nextTab.value === currentValue) return;

    event.preventDefault();
    if (!isControlled) setInternalValue(nextTab.value);
    onChange?.(event, nextTab.value);
    tabRefs.current[nextTab.value]?.focus();
  };

  const tabList = (
    <ul className="okkly-tabs__list" role="tablist" aria-orientation={orientation}>
      {items.map((item) => {
        const active = currentValue === item.value;
        return (
          <li key={item.value} role="presentation">
            <button
              type="button"
              role="tab"
              ref={(node) => {
                tabRefs.current[item.value] = node;
              }}
              id={`okkly-tab-${item.value}`}
              aria-selected={active}
              aria-controls={active ? `okkly-tabpanel-${item.value}` : undefined}
              tabIndex={active ? 0 : -1}
              disabled={item.disabled}
              className={["okkly-tabs__tab", active && "okkly-tabs__tab--active"]
                .filter(Boolean)
                .join(" ")}
              onClick={(event) => handleTabClick(event, item.value)}
              onKeyDown={handleKeyDown}
            >
              {item.icon && (
                <span className="okkly-tabs__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={classes} {...rest}>
      {variant === "scrollable" ? <div className="okkly-tabs__scroller">{tabList}</div> : tabList}
    </div>
  );
}
