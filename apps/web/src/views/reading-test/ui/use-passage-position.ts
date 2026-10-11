import { type RefObject, useEffect } from "react";
import { unitOf, useReading } from "@/entities/reading";

/**
 * Each passage is shown where the user last left it (READING_EXPERIENCE.md):
 * its scroll position is restored when it comes on screen, and moving to a
 * question on another passage first keeps this one's position. Changing
 * question never scrolls the passage. The passage scrolls in `column` on
 * desktop and with the page on phones. Returns the way to move to a question.
 */
export function usePassagePosition(
  column: RefObject<HTMLElement | null>,
  isDesktop: boolean,
): (number: number) => void {
  const { test, units, session, send } = useReading();
  const passage = test.passages[session.view.passage - 1] ?? test.passages[0];
  const savedScroll = passage ? (session.view.scroll[passage.id] ?? 0) : 0;

  useEffect(() => {
    (isDesktop ? column.current : window)?.scrollTo(0, savedScroll);
  }, [passage?.id, savedScroll, isDesktop, column]);

  return (number) => {
    const target = unitOf(units, number);
    if (passage && target && target.passageNumber !== passage.number) {
      send({
        type: "setView",
        view: {
          scroll: {
            ...session.view.scroll,
            [passage.id]: isDesktop
              ? (column.current?.scrollTop ?? 0)
              : window.scrollY,
          },
        },
      });
    }
    send({ type: "goTo", number });
  };
}
