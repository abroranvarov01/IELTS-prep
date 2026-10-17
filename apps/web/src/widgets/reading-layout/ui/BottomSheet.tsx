"use client";

import { useTranslations } from "next-intl";
import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SheetState } from "@/entities/reading";

/** Sheet heights per state (DESIGN_SYSTEM.md, M4: question sheet). */
export const SHEET_HEIGHT: Record<SheetState, string> = {
  collapsed: "5rem",
  partial: "max(45dvh, 15rem)",
  expanded: "calc(100dvh - 3rem)",
};

// A drag shorter than this is a tap on the handle.
const DRAG_THRESHOLD_PX = 8;
const COLLAPSED_PX = 80;

type Drag = {
  startY: number;
  startHeight: number;
  height: number;
  moved: boolean;
};

/**
 * The persistent, non-modal bottom sheet of the Reading screens
 * (READING_EXPERIENCE.md, Mobile reading screen; ADR-0007): three states, each
 * reachable by the handle button as well as by dragging, docked above the
 * phone keyboard while typing. The test's question sheet and the review's
 * card sheet fill it; `header` sits in the handle's area, so the grab area is
 * large without a row of its own.
 */
export function BottomSheet({
  label,
  state,
  onStateChange,
  bodyId,
  header,
  children,
}: {
  label: string;
  state: SheetState;
  /** A tap on the handle, or a drag released near a state. */
  onStateChange: (state: SheetState) => void;
  /** The element that scrolls inside the sheet, which the handle controls. */
  bodyId: string;
  header: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("reading");
  const sheetRef = useRef<HTMLElement>(null);
  const wasDragged = useRef(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [keyboard, setKeyboard] = useState({ inset: 0, viewport: 0 });

  // Keep the sheet above the on-screen keyboard (VisualViewport, ADR-0007).
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      setKeyboard({
        inset: Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        ),
        viewport: viewport.height,
      });
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  // When the sheet's height settles (a state change, or the keyboard taking
  // room), a control focused while it was moving may now be below the body's
  // visible part. Scroll only the body back to it; the passage never moves.
  const keepFocusInView = () => {
    const body = sheetRef.current?.querySelector(`#${bodyId}`);
    const focused = document.activeElement;
    if (!body || !(focused instanceof HTMLElement) || !body.contains(focused))
      return;
    const room = body.getBoundingClientRect();
    const box = focused.getBoundingClientRect();
    if (box.bottom > room.bottom) body.scrollTop += box.bottom - room.bottom;
    else if (box.top < room.top) body.scrollTop -= room.top - box.top;
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const height = sheetRef.current?.getBoundingClientRect().height ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      startY: event.clientY,
      startHeight: height,
      height,
      moved: false,
    });
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const delta = drag.startY - event.clientY;
    setDrag({
      ...drag,
      height: Math.max(
        COLLAPSED_PX,
        Math.min(window.innerHeight - 48, drag.startHeight + delta),
      ),
      moved: drag.moved || Math.abs(delta) > DRAG_THRESHOLD_PX,
    });
  };
  const onPointerUp = () => {
    if (!drag) return;
    wasDragged.current = drag.moved;
    if (drag.moved) onStateChange(nearestState(drag.height));
    setDrag(null);
  };
  const onHandleClick = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    onStateChange(state === "collapsed" ? "partial" : "collapsed");
  };

  const height = drag
    ? `${drag.height}px`
    : keyboard.inset > 0
      ? `min(${SHEET_HEIGHT[state]}, ${keyboard.viewport}px - 3rem)`
      : SHEET_HEIGHT[state];
  const isOpen = state !== "collapsed";

  return (
    <section
      ref={sheetRef}
      aria-label={label}
      className={`fixed inset-x-[0] z-10 mx-auto flex max-w-measure flex-col rounded-t-xl bg-surface-base shadow-raised ${
        drag ? "" : "transition-[height] duration-(--duration-base)"
      }`}
      style={{ height, bottom: keyboard.inset }}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === "height"
        )
          keepFocusInView();
      }}
    >
      <div className="relative shrink-0 px-gutter pt-2 pb-1">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onHandleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setDrag(null)}
          className="absolute inset-[0] w-full touch-none rounded-t-xl"
        >
          <span className="sr-only">
            {isOpen ? t("sheet.hide") : t("sheet.show")}
          </span>
        </button>
        <span
          aria-hidden="true"
          className="mx-auto block h-1 w-8 rounded-full bg-border-control"
        />
        <div className="pointer-events-none relative mt-3">{header}</div>
      </div>
      {children}
    </section>
  );
}

function nearestState(height: number): SheetState {
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const heights: [SheetState, number][] = [
    ["collapsed", COLLAPSED_PX],
    ["partial", Math.max(viewport * 0.45, 240)],
    ["expanded", viewport - 48],
  ];
  return heights.reduce((best, candidate) =>
    Math.abs(candidate[1] - height) < Math.abs(best[1] - height)
      ? candidate
      : best,
  )[0];
}
