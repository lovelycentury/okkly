"use client";

import { useState, type ReactNode } from "react";
import { Popover, type PopoverProps } from "../../components/Popover/Popover";
import { Popper, type PopperProps } from "../../components/Popper/Popper";

/**
 * Test fixtures for the anchored overlays.
 *
 * `anchorEl` wants a live DOM element, and a Playwright component test cannot
 * hand one across from Node — props are serialized. These wrappers own the
 * anchor themselves, so the anchoring happens entirely inside the browser while
 * the test still drives everything through ordinary serializable props.
 *
 * They live under `src/playwright/` and are excluded from the published build.
 */

export type AnchoredFixtureProps = {
  /** Label on the trigger button. */
  triggerLabel?: string;
  /** Overlay body. */
  children?: ReactNode;
  /** Start with the overlay already open. */
  defaultOpen?: boolean;
};

export type AnchoredPopperProps = AnchoredFixtureProps &
  Pick<PopperProps, "placement" | "keepMounted">;

/** A button that toggles a `Popper` anchored to itself. */
export function AnchoredPopper({
  triggerLabel = "Toggle",
  children = "Popper content",
  defaultOpen = false,
  ...popperProps
}: AnchoredPopperProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  // A single root element: Playwright's mount result must resolve to one node.
  return (
    <div className="fixture-root">
      <button ref={setAnchorEl} type="button" onClick={() => setOpen((value) => !value)}>
        {triggerLabel}
      </button>
      <Popper {...popperProps} open={open} anchorEl={anchorEl}>
        <div className="fixture-panel">{children}</div>
      </Popper>
    </div>
  );
}

export type AnchoredPopoverProps = AnchoredFixtureProps &
  Pick<PopoverProps, "placement" | "hideBackdrop"> & {
    /** Reports every close, so a test can assert the reason it was given. */
    onCloseReason?: (reason: string) => void;
  };

/** A button that toggles a `Popover` anchored to itself. */
export function AnchoredPopover({
  triggerLabel = "Toggle",
  children = "Panel content",
  defaultOpen = false,
  onCloseReason,
  ...popoverProps
}: AnchoredPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  // A single root element: Playwright's mount result must resolve to one node.
  return (
    <div className="fixture-root">
      <button ref={setAnchorEl} type="button" onClick={() => setOpen((value) => !value)}>
        <span>{triggerLabel}</span>
      </button>
      <Popover
        {...popoverProps}
        open={open}
        anchorEl={anchorEl}
        onClose={(_event, reason) => {
          onCloseReason?.(reason);
          setOpen(false);
        }}
      >
        {children}
      </Popover>
    </div>
  );
}
