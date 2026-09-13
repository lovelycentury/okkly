"use client";

import { createContext, useContext, useState, type MouseEvent, type SyntheticEvent } from "react";
import { Collapse } from "../Collapse/Collapse";
import "@okkly/design-system/components/Accordion/Accordion.scss";
import type {
  AccordionContextValue,
  AccordionProps,
  AccordionSummaryProps,
  AccordionDetailsProps,
} from "./Accordion.types";

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`${component} must be used within Accordion`);
  }
  return context;
}

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function Accordion({
  expanded,
  defaultExpanded = false,
  onChange,
  disabled = false,
  children,
  className,
  ...rest
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const toggle = (event: SyntheticEvent) => {
    if (disabled) return;
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onChange?.(event, next);
  };

  const classes = [
    "okkly-component",
    "okkly-accordion",
    isExpanded && "okkly-accordion--expanded",
    disabled && "okkly-accordion--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AccordionContext.Provider value={{ expanded: isExpanded, disabled, toggle }}>
      <div className={classes} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionSummary({
  children,
  expandIcon,
  className,
  onClick,
  ...rest
}: AccordionSummaryProps) {
  const { expanded, disabled, toggle } = useAccordionContext("AccordionSummary");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    toggle(event);
    onClick?.(event);
  };

  const classes = ["okkly-accordion__summary", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      <span className="okkly-accordion__title">{children}</span>
      <span
        className={["okkly-accordion__chevron", expanded && "okkly-accordion__chevron--expanded"]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {expandIcon ?? <ChevronDownIcon />}
      </span>
    </button>
  );
}

export function AccordionDetails({ children, className, ...rest }: AccordionDetailsProps) {
  const { expanded } = useAccordionContext("AccordionDetails");

  const classes = ["okkly-accordion__details", className].filter(Boolean).join(" ");

  // `Collapse` animates both directions and keeps the panel out of the DOM while
  // closed (`mountOnEnter`/`unmountOnExit`), so collapsed content stays
  // unreachable for search and assistive tech. `appear={false}` keeps an
  // already-expanded panel static on first paint.
  return (
    <Collapse in={expanded} timeout="auto" appear={false} mountOnEnter unmountOnExit>
      <div className={classes} role="region" {...rest}>
        {children}
      </div>
    </Collapse>
  );
}
