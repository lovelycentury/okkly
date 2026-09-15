"use client";

import { useState, type ReactNode } from "react";
import "@okkly/design-system/components/Breadcrumbs/Breadcrumbs.scss";
import type { BreadcrumbItem, BreadcrumbsProps } from "./Breadcrumbs.types";

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export function Breadcrumbs({
  items,
  separator = <ChevronRightIcon />,
  maxItems = 8,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  expandAriaLabel = "Show all crumbs",
  className,
  ...rest
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);

  const classes = ["okkly-component", "okkly-breadcrumbs", className].filter(Boolean).join(" ");

  const renderCrumb = (item: BreadcrumbItem, isLast: boolean) => {
    const inner = (
      <>
        {item.icon && (
          <span className="okkly-breadcrumbs__icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </>
    );

    if (isLast || !item.href) {
      return (
        <span className="okkly-breadcrumbs__current" aria-current={isLast ? "page" : undefined}>
          {inner}
        </span>
      );
    }

    return (
      <a className="okkly-breadcrumbs__link" href={item.href}>
        {inner}
      </a>
    );
  };

  const separatorNode = (key: string) => (
    <li className="okkly-breadcrumbs__separator" aria-hidden="true" key={key}>
      {separator}
    </li>
  );

  const canCollapse =
    !expanded && items.length > maxItems && itemsBeforeCollapse + itemsAfterCollapse < items.length;

  const visible: ReactNode[] = [];
  if (canCollapse) {
    items.slice(0, itemsBeforeCollapse).forEach((item, index) => {
      visible.push(
        <li className="okkly-breadcrumbs__item" key={`before-${index}`}>
          {renderCrumb(item, false)}
        </li>,
      );
      visible.push(separatorNode(`sep-before-${index}`));
    });
    visible.push(
      <li key="ellipsis">
        <button
          type="button"
          className="okkly-breadcrumbs__ellipsis"
          aria-label={expandAriaLabel}
          onClick={() => setExpanded(true)}
        >
          …
        </button>
      </li>,
    );
    visible.push(separatorNode("sep-ellipsis"));
    items.slice(items.length - itemsAfterCollapse).forEach((item, index) => {
      const isLast = index === itemsAfterCollapse - 1;
      visible.push(
        <li className="okkly-breadcrumbs__item" key={`after-${index}`}>
          {renderCrumb(item, isLast)}
        </li>,
      );
      if (!isLast) visible.push(separatorNode(`sep-after-${index}`));
    });
  } else {
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      visible.push(
        <li className="okkly-breadcrumbs__item" key={index}>
          {renderCrumb(item, isLast)}
        </li>,
      );
      if (!isLast) visible.push(separatorNode(`sep-${index}`));
    });
  }

  return (
    <nav aria-label="breadcrumb" className={classes} {...rest}>
      <ol className="okkly-breadcrumbs__list">{visible}</ol>
    </nav>
  );
}
