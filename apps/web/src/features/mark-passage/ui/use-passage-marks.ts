import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_PINS, type Passage, unitOf, useReading } from "@/entities/reading";

/**
 * Highlighting and Pin Evidence on the passage on screen (READING_EXPERIENCE.md;
 * ADR-0007): the selected sentence (its action bar is open), the sentence that
 * holds the passage's one Tab stop, the actions on the selected sentence, and
 * what they announce. Taps and keys reach the sentences through listeners on
 * the passage element (`passageRef`), so the sentences stay plain text.
 */
export function usePassageMarks(passage: Passage | undefined) {
  const t = useTranslations("reading");
  const { units, session, send } = useReading();
  const passageElement = useRef<HTMLElement>(null);
  const firstAction = useRef<HTMLButtonElement>(null);
  const sentenceIds = useMemo(
    () =>
      passage?.paragraphs.flatMap((p) => p.sentences.map((s) => s.id)) ?? [],
    [passage],
  );
  // Both belong to the passage on screen.
  const [selection, setSelection] = useState<string | null>(null);
  const [lastFocused, setLastFocused] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // The sentence whose pin was refused at the limit, to say why.
  const [limitFor, setLimitFor] = useState<string | null>(null);
  const selected =
    selection && sentenceIds.includes(selection) ? selection : null;
  const focusable =
    lastFocused && sentenceIds.includes(lastFocused)
      ? lastFocused
      : (sentenceIds[0] ?? "");

  // The listeners live on the passage element and follow it when the layout
  // changes between phone and desktop (a callback ref with a cleanup).
  const passageRef = useCallback((article: HTMLElement | null) => {
    passageElement.current = article;
    if (!article) return;
    const sentenceOf = (target: EventTarget | null) =>
      (target instanceof Element ? target : null)?.closest<HTMLElement>(
        "[data-sentence]",
      );
    const onClick = (event: MouseEvent) => {
      const sentence = sentenceOf(event.target);
      // A long press that selected text natively (to copy) is left alone.
      if (!sentence || !window.getSelection()?.isCollapsed) return;
      const id = sentence.dataset.sentence ?? null;
      setSelection((current) => (current === id ? null : id));
      setLastFocused(id);
      setAnnouncement("");
      setLimitFor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const sentence = sentenceOf(event.target);
      if (!sentence) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const all = [
          ...article.querySelectorAll<HTMLElement>("[data-sentence]"),
        ];
        const next =
          all[all.indexOf(sentence) + (event.key === "ArrowDown" ? 1 : -1)];
        if (!next) return;
        setLastFocused(next.dataset.sentence ?? null);
        next.focus();
      } else if (event.key === "Enter") {
        event.preventDefault();
        setSelection(sentence.dataset.sentence ?? null);
        setAnnouncement("");
        setLimitFor(null);
      }
    };
    article.addEventListener("click", onClick);
    article.addEventListener("keydown", onKeyDown);
    return () => {
      article.removeEventListener("click", onClick);
      article.removeEventListener("keydown", onKeyDown);
      passageElement.current = null;
    };
  }, []);

  // The selected sentence's first action, which takes the focus when its bar
  // opens (SentenceActions).
  const firstActionRef = useCallback((button: HTMLButtonElement | null) => {
    firstAction.current = button;
  }, []);

  // Focus goes back to the sentence without moving the passage.
  function closeActions(id: string) {
    setSelection(null);
    setLimitFor(null);
    sentenceIn(passageElement.current, id)?.focus({ preventScroll: true });
  }

  // Opening the action bar moves focus into it; Escape, or scrolling the
  // sentence out of view, closes it. Escape is heard on the whole page: on
  // phones the bar, which has the focus, sits outside the passage.
  useEffect(() => {
    const sentence = selected && sentenceIn(passageElement.current, selected);
    if (!sentence) return;
    firstAction.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeActions(selected);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) closeActions(selected);
    });
    document.addEventListener("keydown", onKeyDown);
    observer.observe(sentence);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      observer.disconnect();
    };
  }, [selected]);

  // Pin Evidence (Practice only) goes to the current question; a "choose
  // several" item keeps its pins under its first number.
  const pinNumber =
    session.mode === "practice"
      ? unitOf(units, session.currentQuestion)?.numbers[0]
      : undefined;
  const pinned = pinNumber === undefined ? [] : (session.pins[pinNumber] ?? []);
  const togglePin = (number: number, id: string) => {
    if (pinned.includes(id)) {
      send({ type: "unpin", number, sentenceId: id });
      setAnnouncement("");
    } else if (pinned.length >= MAX_PINS) {
      setLimitFor(id);
      setAnnouncement(t("evidence.limit", { max: MAX_PINS }));
      return;
    } else {
      send({ type: "pin", number, sentenceId: id });
      setAnnouncement(t("mark.pinned", { number }));
    }
    closeActions(id);
  };
  const isHighlighted =
    selected !== null && session.highlights.includes(selected);

  return {
    /** For PassageView: the passage element. */
    passageRef,
    selected,
    focusable,
    highlights: new Set(session.highlights),
    pins:
      pinNumber === undefined
        ? null
        : { number: pinNumber, sentenceIds: new Set(pinned) },
    /** The selected sentence's actions, for SentenceActions; null when none is selected. */
    actions:
      selected === null
        ? null
        : {
            isHighlighted,
            pin:
              pinNumber === undefined
                ? undefined
                : {
                    number: pinNumber,
                    isPinned: pinned.includes(selected),
                    onToggle: () => togglePin(pinNumber, selected),
                  },
            message:
              limitFor === selected
                ? t("evidence.limit", { max: MAX_PINS })
                : undefined,
            firstActionRef,
            onToggleHighlight: () => {
              send({ type: "toggleHighlight", sentenceId: selected });
              setAnnouncement(isHighlighted ? "" : t("mark.highlighted"));
              closeActions(selected);
            },
            onCancel: () => closeActions(selected),
          },
    /** What the last action changed, for a polite live region. */
    announcement,
    /** "Show in passage": the passage moves to the sentence and selects it. */
    show: (id: string) => {
      sentenceIn(passageElement.current, id)?.scrollIntoView({
        block: "start",
      });
      if (selected === id) firstAction.current?.focus();
      setSelection(id);
      setLastFocused(id);
      setAnnouncement("");
      setLimitFor(null);
    },
  };
}

function sentenceIn(passage: HTMLElement | null, id: string) {
  return passage?.querySelector<HTMLElement>(`[data-sentence="${id}"]`);
}
