/**
 * The element with this id that is on screen. Pages left behind by client
 * navigation stay mounted but hidden (Next.js Cache Components), so an id can
 * appear more than once in the document; a hidden copy has no layout boxes.
 */
export function visibleElementById(id: string): HTMLElement | null {
  return (
    [...document.querySelectorAll<HTMLElement>(`[id="${id}"]`)].find(
      (element) => element.getClientRects().length > 0,
    ) ?? null
  );
}
