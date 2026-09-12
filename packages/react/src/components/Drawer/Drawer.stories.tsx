import { useCallback, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { iconFolder, iconHome, iconSearch, iconStar } from "@okkly/icons";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Drawer, useDrawerState, type DrawerAnchor } from "./Drawer";

/**
 * A panel that slides in from an edge and takes the page with it. Use it for
 * navigation on narrow screens, for a filter rail beside a table, or for a bottom
 * sheet of actions — anything that is a *place* rather than a question. A question
 * is a `Dialog`.
 *
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration. The drawer adds the anchored, sliding paper — and keeps itself
 * mounted for the length of the slide-out, since unmounting on the tick `open`
 * flips would cut the animation short.
 *
 * Size comes from CSS variables rather than props: `--okkly-drawer-width` for the
 * left and right anchors, `--okkly-drawer-height` for top and bottom. Set them on
 * the drawer itself through `style` — they are declared on the component element,
 * so an override on an ancestor will not reach them.
 *
 * Props follow MUI's Drawer (`anchor`, `variant`, plus the Modal pass-throughs).
 * `variant="temporary"` (the default) is what the controls below demo — an
 * overlay through `Modal`. For an always-on or toggleable in-flow sidebar, see
 * `variant="permanent"`/`"persistent"` in the stories further down; for a
 * `temporary` drawer that also opens/closes on an edge swipe, see
 * `SwipeableDrawer`.
 */
const meta: Meta<typeof Drawer> = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    anchor: "right",
    variant: "temporary",
    keepMounted: false,
    hideBackdrop: false,
    disableEscapeKeyDown: false,
    disableScrollLock: false,
  },
  argTypes: {
    anchor: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    variant: { control: false },
    keepMounted: { control: "boolean" },
    hideBackdrop: { control: "boolean" },
    disableEscapeKeyDown: { control: "boolean" },
    disableScrollLock: { control: "boolean" },
    open: { control: false },
    onClose: { control: false },
    children: { control: false },
    container: { control: false },
    slotProps: { control: false },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" onClick={() => setOpen(true)}>
          Open the drawer
        </Button>
        <Drawer {...args} open={open} onClose={handleClose}>
          <div style={panel}>
            <h2 style={heading}>Panel</h2>
            <p style={{ margin: 0 }}>Change `anchor` from the controls and reopen.</p>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const surface: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

// The paper is a bare flex column — it brings a background and a border and nothing
// else. Padding and rhythm are the caller's, the same bargain `Modal` makes.
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

const navItem: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  color: "var(--okkly-text-secondary)",
  textDecoration: "none",
};

const caption: CSSProperties = {
  margin: 0,
  width: "100%",
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-muted)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * The common case: the navigation of a site that does not have room for it. Anchored
 * left, because that is where a menu button is, and closing on every item — a
 * drawer that stays open after you have chosen makes you close it twice.
 */
export const ANavigationPanel: Story = {
  name: "A navigation panel",
  render: () => {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState("Library");
    const handleClose = useCallback(() => setOpen(false), []);
    const pages = ["Library", "Releases", "Analytics", "Settings"];
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Menu
        </Button>
        <Drawer open={open} onClose={handleClose} anchor="left">
          <nav style={{ ...panel, gap: "4px", width: "100%" }} aria-label="Main">
            <h2 style={{ ...heading, marginBottom: "12px" }}>Okryshto</h2>
            {pages.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  ...navItem,
                  background: page === item ? "var(--okkly-bg-surface-raised)" : "transparent",
                  color:
                    page === item ? "var(--okkly-text-primary)" : "var(--okkly-text-secondary)",
                }}
                onClick={() => {
                  setPage(item);
                  handleClose();
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </Drawer>
        <p style={caption}>Current page: {page}</p>
      </div>
    );
  },
};

/**
 * All four edges. `left` and `right` take `--okkly-drawer-width`, `top` and
 * `bottom` take `--okkly-drawer-height`; the bottom anchor also rounds its top
 * corners, which is what makes it read as a sheet rather than a bar.
 */
export const Anchors: Story = {
  render: () => {
    // `anchor` and `open` are deliberately separate state: closing must not
    // also clear the anchor, or the drawer would switch edges mid-close —
    // `anchor` picks where it opens from, `open` alone decides visibility.
    const [anchor, setAnchor] = useState<DrawerAnchor>("right");
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    const anchors: DrawerAnchor[] = ["left", "right", "top", "bottom"];
    return (
      <div style={surface}>
        {anchors.map((item) => (
          <Button
            key={item}
            size="small"
            variant="secondary"
            onClick={() => {
              setAnchor(item);
              setOpen(true);
            }}
          >
            {item}
          </Button>
        ))}
        <Drawer open={open} onClose={handleClose} anchor={anchor}>
          <div style={panel}>
            <h2 style={heading}>anchor = {anchor}</h2>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

/**
 * A bottom sheet of filters, sized with `--okkly-drawer-height` rather than a prop.
 * The variable is declared on the drawer element, so it has to be set there —
 * putting it on a wrapper will not reach it.
 */
export const ABottomSheet: Story = {
  name: "A bottom sheet",
  render: () => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string[]>(["Albums"]);
    const handleClose = useCallback(() => setOpen(false), []);
    const filters = ["Albums", "Singles", "Remixes", "Unreleased"];
    const toggle = (filter: string) =>
      setActive((current) =>
        current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
      );
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Filters
        </Button>
        <Drawer
          open={open}
          onClose={handleClose}
          anchor="bottom"
          style={{ "--okkly-drawer-height": "18rem" } as CSSProperties}
        >
          <div style={{ ...panel, width: "100%" }}>
            <h2 style={heading}>Filters</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {filters.map((filter) => (
                <Button
                  key={filter}
                  size="small"
                  variant={active.includes(filter) ? "primary" : "ghost"}
                  onClick={() => toggle(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Show results
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Active: {active.join(", ") || "none"}</p>
      </div>
    );
  },
};

/**
 * `--okkly-drawer-width` for the side anchors. There is no `width` prop on purpose:
 * the value belongs to the design, not to the call site, so a theme can set it once
 * for every drawer in the app.
 */
export const Widths: Story = {
  render: () => {
    const [width, setWidth] = useState<string | null>(null);
    const handleClose = useCallback(() => setWidth(null), []);
    return (
      <div style={surface}>
        {["16rem", "20rem", "32rem"].map((value) => (
          <Button key={value} size="small" variant="secondary" onClick={() => setWidth(value)}>
            {value}
          </Button>
        ))}
        <Drawer
          open={width !== null}
          onClose={handleClose}
          anchor="right"
          style={{ "--okkly-drawer-width": width ?? "20rem" } as CSSProperties}
        >
          <div style={panel}>
            <h2 style={heading}>{width}</h2>
            <p style={{ margin: 0 }}>Set through `--okkly-drawer-width` on the drawer itself.</p>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

/**
 * `onClose` receives `(event, reason)` — `"backdropClick"` or `"escapeKeyDown"` —
 * so a drawer holding a half-finished form can refuse the stray click and still
 * honour Escape. The reason of the last close is shown below.
 */
export const ClosingReasons: Story = {
  name: "Closing reasons",
  render: () => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string | null>(null);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Drawer
          open={open}
          onClose={(_event, closeReason) => {
            setReason(closeReason);
            setOpen(false);
          }}
        >
          <div style={panel}>
            <h2 style={heading}>Close me</h2>
            <p style={{ margin: 0 }}>Click the scrim, or press Escape, and compare the reason.</p>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setReason("your own handler");
                setOpen(false);
              }}
            >
              Close from a button
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Last reason: {reason ?? "—"}</p>
      </div>
    );
  },
};

/**
 * The drawer traps focus while it is open and puts focus back on the trigger when
 * it closes — both inherited from `Modal`, and neither true of this component
 * before it was built on one.
 *
 * Tab from inside the panel: focus cycles within it and never reaches the buttons on
 * the page behind. Close it, and the caret returns to the button you opened it with.
 */
export const FocusHandling: Story = {
  name: "Focus handling",
  render: () => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
      <div style={surface}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          Open, then Tab around
        </Button>
        <Button size="small" variant="ghost">
          A button on the page
        </Button>
        <Drawer open={open} onClose={handleClose}>
          <div style={panel}>
            <h2 style={heading}>Trapped</h2>
            <Button size="small" variant="ghost">
              First
            </Button>
            <Button size="small" variant="ghost">
              Second
            </Button>
            <Button size="small" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Drawer>
        <p style={caption}>Tab never reaches “A button on the page” while the drawer is open.</p>
      </div>
    );
  },
};

const appShell: CSSProperties = {
  display: "flex",
  height: "20rem",
  border: "1px solid var(--okkly-border-subtle)",
  borderRadius: "16px",
  overflow: "hidden",
  fontFamily: "var(--okkly-font-family-sans)",
};

const appMain: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "24px",
  color: "var(--okkly-text-secondary)",
};

/**
 * `variant="permanent"` renders no `Modal` at all — no portal, no backdrop, no
 * focus trap — just the anchored paper as a normal in-flow element. It is
 * always shown; `open`/`onClose` do nothing. This is the shape for an app's
 * own persistent navigation rail, sized by `--okkly-drawer-width` like any
 * other side anchor.
 */
export const APermanentSidebar: Story = {
  name: "A permanent sidebar",
  render: () => (
    <div style={appShell}>
      <Drawer
        variant="permanent"
        anchor="left"
        style={{ "--okkly-drawer-width": "14rem" } as CSSProperties}
      >
        <nav style={{ ...panel, gap: "4px", width: "100%" }} aria-label="Main">
          <h2 style={{ ...heading, marginBottom: "12px" }}>Okkly</h2>
          {["Library", "Releases", "Analytics", "Settings"].map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                ...navItem,
                background: index === 0 ? "var(--okkly-bg-surface-raised)" : "transparent",
                color: index === 0 ? "var(--okkly-text-primary)" : "var(--okkly-text-secondary)",
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </Drawer>
      <main style={appMain}>
        <p style={{ margin: 0 }}>
          The sidebar beside this is always there — there is no state to toggle.
        </p>
      </main>
    </div>
  ),
};

/**
 * `variant="persistent"` toggles through `open`/`onClose` like `temporary`,
 * but never overlays the page: it collapses its own width to 0 instead of
 * sliding off-screen, so the content beside it reclaims that space rather
 * than a backdrop dimming it. No portal, no backdrop, no focus trap here
 * either — the caller's own toggle (below, the menu button) is both the open
 * and the close trigger, the same way a real app shell's would be.
 */
export const APersistentSidebar: Story = {
  name: "A persistent sidebar",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={surface}>
          <Button size="small" variant="secondary" onClick={() => setOpen((value) => !value)}>
            {open ? "Collapse" : "Expand"} sidebar
          </Button>
        </div>
        <div style={appShell}>
          <Drawer
            variant="persistent"
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            style={{ "--okkly-drawer-width": "14rem" } as CSSProperties}
          >
            <nav style={{ ...panel, gap: "4px", width: "100%" }} aria-label="Main">
              <h2 style={{ ...heading, marginBottom: "12px" }}>Okkly</h2>
              {["Library", "Releases", "Analytics", "Settings"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  style={{
                    ...navItem,
                    background: index === 0 ? "var(--okkly-bg-surface-raised)" : "transparent",
                    color:
                      index === 0 ? "var(--okkly-text-primary)" : "var(--okkly-text-secondary)",
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
          </Drawer>
          <main style={appMain}>
            <p style={{ margin: 0 }}>
              The content here reflows as the sidebar collapses and expands.
            </p>
          </main>
        </div>
      </div>
    );
  },
};

const railItems = [
  { label: "Library", icon: iconHome },
  { label: "Releases", icon: iconFolder },
  { label: "Favourites", icon: iconStar },
  { label: "Search", icon: iconSearch },
];

function RailNavItem({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  // `useDrawerState` is the JS route for reacting to `mini` — here, trading the
  // label for a native tooltip. The CSS-only route is the
  // `okkly-drawer--mini` class on the drawer root.
  const { mini } = useDrawerState();
  return (
    <a
      href={`#${label.toLowerCase()}`}
      title={mini ? label : undefined}
      aria-label={mini ? label : undefined}
      style={{
        ...navItem,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        whiteSpace: "nowrap",
        background: active ? "var(--okkly-bg-surface-raised)" : "transparent",
        color: active ? "var(--okkly-text-primary)" : "var(--okkly-text-secondary)",
      }}
    >
      <Icon icon={icon} fontSize="small" />
      {!mini && <span>{label}</span>}
    </a>
  );
}

type RailState = "closed" | "mini" | "open";

/**
 * `mini` gives a `persistent` drawer a third state between closed and open: a
 * short view, `--okkly-drawer-mini-width` wide (`--okkly-drawer-mini-height`
 * tall for the top/bottom anchors). `open` still decides whether it shows at
 * all; `mini` only narrows an open one. The paper keeps its full size and is
 * clipped toward the anchored edge, so the icon column stays in view.
 *
 * Content can react two ways: CSS against the `okkly-drawer--mini` class on
 * the drawer root, or `useDrawerState()` in JS — the nav items below use the
 * hook to swap their labels for tooltips.
 */
export const APersistentSidebarWithAShortView: Story = {
  name: "A persistent sidebar with a short view",
  render: () => {
    const [state, setState] = useState<RailState>("mini");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={surface}>
          {(["closed", "mini", "open"] as const).map((value) => (
            <Button
              key={value}
              size="small"
              variant={state === value ? "primary" : "secondary"}
              onClick={() => setState(value)}
            >
              {value}
            </Button>
          ))}
        </div>
        <div style={appShell}>
          <Drawer
            variant="persistent"
            anchor="left"
            open={state !== "closed"}
            mini={state === "mini"}
            onClose={() => setState("closed")}
            style={{ "--okkly-drawer-width": "14rem" } as CSSProperties}
          >
            <nav style={{ ...panel, gap: "4px", width: "100%", padding: "12px" }} aria-label="Main">
              {railItems.map((item, index) => (
                <RailNavItem key={item.label} {...item} active={index === 0} />
              ))}
            </nav>
          </Drawer>
          <main style={appMain}>
            <p style={{ margin: 0 }}>
              Closed, a short icon rail, or fully open — the content reflows each time.
            </p>
          </main>
        </div>
      </div>
    );
  },
};
