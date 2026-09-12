import { useDrawerState } from "../../components/Drawer/Drawer";

/** Prints the enclosing drawer's state, so a test can read what the hook reports. */
export function DrawerStateProbe() {
  const { open, mini, variant, anchor } = useDrawerState();
  return (
    <span data-testid="drawer-state">
      {`${open ? "open" : "closed"} ${mini ? "mini" : "full"} ${variant} ${anchor}`}
    </span>
  );
}
