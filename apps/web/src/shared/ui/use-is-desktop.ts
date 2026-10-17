import { useSyncExternalStore } from "react";

// From the approved desktop breakpoint (64rem, DESIGN_SYSTEM.md) a screen may
// render a different tree from the phone's, such as Reading's two columns.
const DESKTOP = "(min-width: 64rem)";
const subscribeToDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Whether the window is at the desktop breakpoint; false while rendering on the server. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}
