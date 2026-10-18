"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  type Explanations,
  type ListeningAttempt,
  type ListeningKey,
  type ListeningTest,
  type ResultRecord,
  SPEEDS,
  type Transcript,
  cachedPartUrl,
  mediaUrl,
} from "@/entities/listening";
import { PracticePlayer } from "@/features/listening-player";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { ChevronIcon, InfoIcon, LineIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import {
  evidenceOf,
  reviewAudioSource,
  reviewCards,
  reviewPosition,
} from "../model/review";
import { ReviewCard, ReviewHeading } from "./ReviewCard";
import { ReviewNavigator } from "./ReviewNavigator";

type Cue = {
  id: number;
  kind: "show" | "play" | "pause";
  fromMs?: number;
  toMs?: number;
};

/**
 * The Listening review on phones and tablets (LISTENING_EXPERIENCE.md,
 * Evidence-first review (M9)): the test bar, the review player for the
 * current card's part, the card as the page's `main`, and the bottom bar
 * with "All questions", Previous and Next. Changing card moves the player to
 * the card's evidence, paused; playing never changes the card.
 */
export function ReviewWorkspace({
  test,
  answerKey,
  transcript,
  explanations,
  attempt,
  record,
  bar,
  notice,
}: {
  test: ListeningTest;
  answerKey: ListeningKey;
  transcript: Transcript;
  explanations: Explanations | undefined;
  attempt: ListeningAttempt;
  record: ResultRecord;
  bar: (partNumber: number) => ReactNode;
  notice: ReactNode;
}) {
  const t = useTranslations("reading");
  const l = useTranslations("listening");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const all = useMemo(() => reviewCards(test, record), [test, record]);
  const position = reviewPosition(all, params.get("set"), params.get("q"));
  const card = position.cards[position.index] ?? all[0];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const allQuestions = useRef<HTMLDialogElement>(null);

  const go = (number: number, set = position.set) => {
    const next = new URLSearchParams({
      attempt: attempt.id,
      q: String(number),
      set,
    });
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  // Every card change: the heading takes the focus, the page starts at the top.
  const key = card?.unit.key;
  useEffect(() => {
    if (key === undefined) return;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [key]);

  // The part's audio: a valid cached copy, else the network, else none.
  const part = card ? test.parts[card.unit.partNumber - 1] : undefined;
  const [sources, setSources] = useState<Record<string, string | null>>({});
  useEffect(() => {
    if (!part || part.id in sources) return;
    let active = true;
    void cachedPartUrl(test, part).then((cached) => {
      if (!active) return;
      const src = reviewAudioSource({
        cached,
        online: navigator.onLine,
        networkUrl: mediaUrl(test, part.audio.src),
      });
      setSources((s) => ({ ...s, [part.id]: src ?? null }));
    });
    return () => {
      active = false;
    };
  }, [part, sources, test]);
  const src = part ? sources[part.id] : undefined;

  // The player follows the card: its evidence, paused (with the lead-in).
  const heard = card ? evidenceOf(card.unit, answerKey, transcript) : [];
  const first = heard[0]?.segment;
  const [cue, setCue] = useState<Cue>();
  const [playingId, setPlayingId] = useState<number>();
  const [playingSegment, setPlayingSegment] = useState<string>();
  const cueId = useRef(0);
  const nextCue = (c: Omit<Cue, "id">) => {
    cueId.current += 1;
    setCue({ ...c, id: cueId.current });
    return cueId.current;
  };
  const firstStart = first?.startMs;
  useEffect(() => {
    if (firstStart === undefined) return;
    cueId.current += 1;
    setCue({
      id: cueId.current,
      kind: "show",
      fromMs: Math.max(0, firstStart - 3000),
    });
  }, [key, firstStart]);
  const [speed, setSpeed] = useState(1);

  if (!card || !part) return null;
  const sequence = position.cards;
  const index = position.index;
  const explanation = explanations?.items[card.unit.key];
  const signals = record.signals[card.unit.key] ?? [];

  return (
    <>
      {bar(part.number)}
      {src ? (
        <PracticePlayer
          src={src}
          partNumber={part.number}
          savedPositionMs={0}
          speed={speed}
          speeds={SPEEDS}
          onPosition={() => {}}
          onSpeed={setSpeed}
          cue={cue}
          onCuePlaying={(id) => {
            setPlayingId(id);
            if (id === undefined) setPlayingSegment(undefined);
          }}
          marksMs={heard.map((h) => h.segment.startMs)}
        />
      ) : src === null ? (
        <p className="sticky top-12 z-10 flex items-start gap-2 border-b border-border-subtle bg-surface-base px-gutter py-3">
          <InfoIcon />
          <span>{l("review.audioUnavailable")}</span>
        </p>
      ) : (
        <p className="sticky top-12 z-10 border-b border-border-subtle bg-surface-base px-gutter py-3 text-meta text-text-secondary">
          {l("player.loading")}
        </p>
      )}
      <main id="main" className="px-gutter pb-40 tablet:pb-28">
        <div className="mx-auto max-w-measure pt-4">
          {notice}
          <ReviewHeading
            card={card}
            headingRef={headingRef}
            progress={
              position.set === "mistakes"
                ? t("review.toReview", {
                    current: index + 1,
                    total: sequence.length,
                  })
                : undefined
            }
          />
          <div className="mt-6">
            <ReviewCard
              key={card.unit.key}
              test={test}
              card={card}
              attempt={attempt}
              answerKey={answerKey}
              transcript={transcript}
              signals={signals}
              explanation={explanation}
              playing={playingId !== undefined ? playingSegment : undefined}
              audioAvailable={src !== null}
              onPlay={(stretch, segmentId) => {
                nextCue({ kind: "play", ...stretch });
                setPlayingSegment(segmentId);
              }}
              onPause={() => nextCue({ kind: "pause" })}
            />
          </div>
        </div>
      </main>
      <nav
        aria-label={t("navigator.open")}
        className="fixed inset-x-[0] bottom-[0] z-10 border-t border-border-subtle bg-surface-base px-gutter py-2 shadow-raised"
      >
        <div className="mx-auto flex max-w-measure flex-col gap-1 tablet:flex-row tablet:items-center">
          <button
            type="button"
            onClick={() => allQuestions.current?.showModal()}
            className={`${QUIET_BUTTON} -ms-3 self-start`}
          >
            <LineIcon className="size-4">
              <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z" />
            </LineIcon>
            {t("navigator.open")}
          </button>
          <div className="grid grid-cols-2 gap-2 whitespace-nowrap tablet:ms-auto tablet:flex">
            <SecondaryButton
              onClick={() => {
                const previous = sequence[index - 1];
                if (previous) go(previous.unit.numbers[0] ?? 1);
              }}
            >
              <ChevronIcon direction="left" />
              {t("question.previous")}
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                const next = sequence[index + 1];
                if (next) go(next.unit.numbers[0] ?? 1);
              }}
            >
              {t("question.next")}
              <ChevronIcon direction="right" />
            </SecondaryButton>
          </div>
        </div>
      </nav>
      <ReviewNavigator
        dialogRef={allQuestions}
        test={test}
        cards={all}
        current={card}
        onChoose={(n) => go(n, "all")}
      />
    </>
  );
}
