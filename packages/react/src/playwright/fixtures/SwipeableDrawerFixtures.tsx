import { useState } from "react";
import {
  SwipeableDrawer,
  type SwipeableDrawerProps,
} from "../../components/SwipeableDrawer/SwipeableDrawer";

type ControlledSwipeableDrawerProps = Omit<
  SwipeableDrawerProps,
  "open" | "onOpen" | "onClose" | "children"
>;

export function ControlledSwipeableDrawer({
  anchor = "left",
  ...props
}: ControlledSwipeableDrawerProps) {
  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(0);
  const [closes, setCloses] = useState(0);

  return (
    <div>
      <span data-testid="opens">{opens}</span>
      <span data-testid="closes">{closes}</span>
      <SwipeableDrawer
        {...props}
        open={open}
        anchor={anchor}
        onOpen={() => {
          setOpen(true);
          setOpens((value) => value + 1);
        }}
        onClose={() => {
          setOpen(false);
          setCloses((value) => value + 1);
        }}
      >
        <div style={{ padding: 16, height: "100%" }}>Panel content</div>
      </SwipeableDrawer>
    </div>
  );
}
