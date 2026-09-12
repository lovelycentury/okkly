import { useState } from "react";
import { SwipeableDrawer } from "../../components/SwipeableDrawer/SwipeableDrawer";
import type { DrawerAnchor } from "../../components/Drawer/Drawer";

export function ControlledSwipeableDrawer({
  anchor = "left",
  disableSwipeToOpen,
}: {
  anchor?: DrawerAnchor;
  disableSwipeToOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(0);
  const [closes, setCloses] = useState(0);

  return (
    <div>
      <span data-testid="opens">{opens}</span>
      <span data-testid="closes">{closes}</span>
      <SwipeableDrawer
        open={open}
        anchor={anchor}
        disableSwipeToOpen={disableSwipeToOpen}
        onOpen={() => {
          setOpen(true);
          setOpens((value) => value + 1);
        }}
        onClose={() => {
          setOpen(false);
          setCloses((value) => value + 1);
        }}
      >
        <div style={{ padding: 16, width: 240, height: "100%" }}>Panel content</div>
      </SwipeableDrawer>
    </div>
  );
}
