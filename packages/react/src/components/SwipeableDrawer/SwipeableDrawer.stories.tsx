import { useCallback, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { SwipeableDrawer } from "./SwipeableDrawer";

/**
 * `Drawer` plus a swipe: an edge drag opens it, a drag on the open panel
 * closes it, and the panel tracks the finger the whole way rather than
 * jumping once the gesture ends. Try it with a mouse too — the drag is not
 * touch-only.
 *
 * It only ever renders `variant="temporary"` (a `Modal` overlay) — there is
 * nothing to swipe open on a `permanent`/`persistent` sidebar, since those are
 * already always in the layout. For those, use `Drawer` directly.
 *
 * The edge strip that starts an opening swipe is invisible and, on the canvas
 * below, sits along the *story's* own left edge — drag from inside the grey
 * card, close to that edge, not from the browser window's edge.
 */
const meta: Meta<typeof SwipeableDrawer> = {
  title: "Overlays/SwipeableDrawer",
  component: SwipeableDrawer,
  args: {
    anchor: "left",
    disableSwipeToOpen: false,
    swipeAreaWidth: 20,
    hysteresis: 0.5,
    minFlingVelocity: 0.6,
    peekSize: 0,
    disableDiscovery: false,
    showHandle: false,
    handleDragOnly: false,
    handleLength: 32,
    handleThickness: 4,
    handlePosition: "center",
  },
  argTypes: {
    anchor: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    disableSwipeToOpen: { control: "boolean" },
    swipeAreaWidth: { control: { type: "number", min: 4, max: 64, step: 4 } },
    hysteresis: { control: { type: "number", min: 0.1, max: 0.9, step: 0.05 } },
    minFlingVelocity: { control: { type: "number", min: 0.1, max: 2, step: 0.1 } },
    peekSize: { control: { type: "number", min: 0, max: 120, step: 4 } },
    disableDiscovery: { control: "boolean" },
    showHandle: { control: "boolean" },
    handleDragOnly: { control: "boolean" },
    handleLength: { control: { type: "number", min: 8, max: 120, step: 4 } },
    handleThickness: { control: { type: "number", min: 2, max: 12, step: 1 } },
    handlePosition: { control: "inline-radio", options: ["start", "center", "end"] },
    handleColor: { control: "color" },
    open: { control: false },
    onOpen: { control: false },
    onClose: { control: false },
    children: { control: false },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={handleOpen}>
          Open the drawer
        </Button>
        <SwipeableDrawer {...args} open={open} onOpen={handleOpen} onClose={handleClose}>
          <div style={panel}>
            <h2 style={heading}>Swipe me closed</h2>
            <p style={{ margin: 0 }}>Drag anywhere on this panel toward the edge to dismiss it.</p>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </SwipeableDrawer>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof SwipeableDrawer>;

const surface: CSSProperties = {
  position: "relative",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  minHeight: "20rem",
  padding: "16px",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "16px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const panel: CSSProperties = {
  display: "grid",
  gap: "16px",
  alignContent: "start",
  justifyItems: "start",
  padding: "24px",
  fontFamily: "var(--okkly-font-family-sans)",
  fontSize: "var(--okkly-font-size-sm)",
  lineHeight: "var(--okkly-font-line-height-sm)",
  color: "var(--okkly-text-secondary)",
};

const heading: CSSProperties = {
  margin: 0,
  fontSize: "var(--okkly-font-size-lg)",
  color: "var(--okkly-text-primary)",
};

/**
 * Play with every prop from the controls panel. Note that on this canvas the
 * edge strip sits at the *story frame's* edge, not the drawer's own — drag
 * from near the left side of the grey card.
 */
export const Playground: Story = {};

/**
 * Every anchor. Whichever edge it opens from, dragging the open panel back
 * toward that same edge closes it.
 */
export const Anchors: Story = {
  render: () => {
    const [state, setState] = useState<{
      anchor: "left" | "right" | "top" | "bottom";
      open: boolean;
    }>({
      anchor: "left",
      open: false,
    });
    const anchors = ["left", "right", "top", "bottom"] as const;
    return (
      <div style={surface}>
        {anchors.map((anchor) => (
          <Button
            key={anchor}
            size="small"
            variant="secondary"
            onClick={() => setState({ anchor, open: true })}
          >
            {anchor}
          </Button>
        ))}
        <SwipeableDrawer
          open={state.open}
          anchor={state.anchor}
          onOpen={() => setState((current) => ({ ...current, open: true }))}
          onClose={() => setState((current) => ({ ...current, open: false }))}
        >
          <div style={panel}>
            <h2 style={heading}>anchor = {state.anchor}</h2>
            <p style={{ margin: 0 }}>Drag me back toward the {state.anchor} edge.</p>
          </div>
        </SwipeableDrawer>
      </div>
    );
  },
};

/**
 * `disableSwipeToOpen` drops the invisible edge strip — the drawer still
 * closes on a swipe once it is open by other means (here, the button).
 */
export const NoSwipeToOpen: Story = {
  name: "No swipe to open",
  args: { disableSwipeToOpen: true },
};

/**
 * A bottom sheet that never fully leaves: `peekSize` keeps a strip of it on
 * screen while closed, and `showHandle` puts a grab handle on that strip. On
 * mount it plays the discovery hint once — slides out a little further, then
 * settles — unless `disableDiscovery` is set. Drag the strip (or the handle)
 * up to open; drag the sheet down to close.
 *
 * Toggle `handleDragOnly` in the controls to make the handle the only thing
 * that starts a drag.
 */
export const APeekingBottomSheet: Story = {
  name: "A peeking bottom sheet",
  args: {
    anchor: "bottom",
    peekSize: 56,
    showHandle: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={handleOpen}>
          Open
        </Button>
        <SwipeableDrawer {...args} open={open} onOpen={handleOpen} onClose={handleClose}>
          <div style={{ ...panel, paddingTop: "24px" }}>
            <h2 style={heading}>51 results</h2>
            <p style={{ margin: 0 }}>Everything below the fold of the sheet goes here.</p>
          </div>
        </SwipeableDrawer>
      </div>
    );
  },
};
