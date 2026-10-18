"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  CHECK_MS,
  type DownloadedAudio,
  type ExamClock,
  ListeningContext,
  type ListeningEvent,
  type ListeningSession,
  type ListeningTest,
  SPEEDS,
  answeredNumbers,
  examClock,
  groupNumbers,
  mediaUrl,
  questionUnits,
  useListening,
} from "@/entities/listening";
import { GroupView } from "@/features/answer-listening";
import { ExamPlayer, PracticePlayer } from "@/features/listening-player";
import { ChevronIcon, GridIcon, InfoIcon, LineIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import { useIsDesktop } from "@/shared/ui/use-is-desktop";
import { Dialog } from "./Dialog";
import { clockText } from "./Preparing";
import { TestBar } from "./TestBar";

const TOTAL = 40;

/**
 * The Listening screen (LISTENING_EXPERIENCE.md, Listening screen: phone and
 * desktop): the test bar, the player, the notices, the part's questions
 * whole, the bottom bar and the navigator. The screen never moves by itself
 * because the recording did (L4).
 */
export function Workspace({
  test,
  session,
  send,
  now,
  audio,
  canSave,
}: {
  test: ListeningTest;
  session: ListeningSession;
  send: (event: ListeningEvent) => void;
  now: number;
  audio?: DownloadedAudio;
  canSave: boolean;
}) {
  const units = questionUnits(test);
  return (
    <ListeningContext.Provider value={{ test, units, session, send }}>
      <Screen now={now} audio={audio} canSave={canSave} />
    </ListeningContext.Provider>
  );
}

function Screen({
  now,
  audio,
  canSave,
}: {
  now: number;
  audio?: DownloadedAudio;
  canSave: boolean;
}) {
  const t = useTranslations("listening");
  const reading = useTranslations("reading");
  const { test, session, send } = useListening();
  const clock: ExamClock =
    session.mode === "exam"
      ? examClock(session, test, now)
      : { phase: "notStarted" };
  const part = test.parts[session.view.part - 1] ?? test.parts[0]!;
  const paused = session.exam?.pause?.kind === "audioFailed";

  const navigate = (number: number) => {
    send({ type: "goTo", number });
    // After the part on screen has rendered: show the question and focus it.
    window.setTimeout(() => {
      const block = document.querySelector<HTMLElement>(
        `[data-question="${number}"]`,
      );
      block?.scrollIntoView({ block: "center" });
      block
        ?.querySelector<HTMLElement>("input, button")
        ?.focus({ preventScroll: true });
    }, 0);
  };
  const firstOfPart = (n: number) =>
    groupNumbers(test.parts[n - 1]!.questionGroups[0]!)[0] ?? 1;

  return (
    <>
      <a
        href="#questions"
        className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:bg-surface-base focus:p-3"
      >
        {t("skipToQuestions")}
      </a>
      <TestBar confirmExit={session.mode === "exam"}>
        <span className="font-medium">
          {t("partOf", { number: session.view.part, total: test.parts.length })}
        </span>
        {clock.phase === "checking" && (
          <span
            role="timer"
            className={`tabular-nums ${clock.remainingMs <= 30_000 ? "font-extrabold" : "font-bold"}`}
          >
            {t("check.timer", { time: clockText(clock.remainingMs) })}
          </span>
        )}
      </TestBar>
      {session.mode === "practice" && session.practice ? (
        <PracticePlayer
          key={part.id}
          src={mediaUrl(test, part.audio.src)}
          partNumber={part.number}
          savedPositionMs={session.practice.positions[part.id] ?? 0}
          speed={session.practice.speed}
          speeds={SPEEDS}
          onPosition={(positionMs) =>
            send({ type: "setPosition", partId: part.id, positionMs })
          }
          onSpeed={(speed) =>
            send({ type: "setSpeed", speed: speed as (typeof SPEEDS)[number] })
          }
        />
      ) : clock.phase === "recording" && audio ? (
        <ExamPlayer
          partNumber={clock.part}
          src={audio[test.parts[clock.part - 1]!.id]!}
          offsetMs={clock.offsetMs}
          running={!session.exam?.pause}
          onStall={() => send({ type: "stall" })}
          onResume={() => send({ type: "resume" })}
          onFailed={() => send({ type: "audioFailed" })}
        />
      ) : null}
      <p aria-live="polite" className="sr-only">
        {announcement(clock, t)}
      </p>
      <main
        id="questions"
        tabIndex={-1}
        className="px-gutter pb-[10rem] tablet:pb-[7rem]"
      >
        <div className="mx-auto flex max-w-measure flex-col gap-8 py-6 desktop:max-w-content desktop:gap-12">
          {!canSave && (
            <p className="flex items-start gap-2">
              <InfoIcon />
              {reading("storage.unavailable")}
            </p>
          )}
          {clock.phase === "recording" && clock.part !== session.view.part && (
            <p className="flex flex-wrap items-center gap-2 rounded-md bg-skill-listening-tint px-4 py-3">
              <InfoIcon />
              <span>{t("partStarted", { number: clock.part })}</span>
              <button
                type="button"
                className={`${QUIET_BUTTON} ms-auto`}
                onClick={() => navigate(firstOfPart(clock.part))}
              >
                {t("goToPart", { number: clock.part })}
              </button>
            </p>
          )}
          {part.questionGroups.map((group) => (
            <div
              key={group.id}
              className={
                group.type === "labelling"
                  ? ""
                  : "desktop:mx-auto desktop:w-full desktop:max-w-measure"
              }
            >
              <GroupView group={group} />
            </div>
          ))}
        </div>
      </main>
      <BottomBar onNavigate={navigate} />
      {paused && clock.phase === "recording" && (
        <Dialog title={t("interrupted.title")} open>
          <p className="mt-2">
            {t("interrupted.body", {
              part: clock.part,
              time: clockText(clock.offsetMs),
            })}
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => send({ type: "resume" })}>
              {t("player.retry")}
            </PrimaryButton>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => send({ type: "finish" })}
            >
              {t("interrupted.finish")}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

/** What a screen reader hears from the Exam: a new part, the check, its last 30 seconds. */
function announcement(
  clock: ExamClock,
  t: ReturnType<typeof useTranslations<"listening">>,
): string {
  if (clock.phase === "recording" && clock.part > 1 && clock.offsetMs < 3000)
    return t("partStarted", { number: clock.part });
  if (clock.phase === "checking" && clock.remainingMs > CHECK_MS - 3000)
    return t("check.announcement", { minutes: CHECK_MS / 60_000 });
  if (
    clock.phase === "checking" &&
    clock.remainingMs <= 30_000 &&
    clock.remainingMs > 27_000
  )
    return t("check.warning");
  return "";
}

function BottomBar({ onNavigate }: { onNavigate: (n: number) => void }) {
  const t = useTranslations("listening");
  const reading = useTranslations("reading");
  const { test, session, send } = useListening();
  const navigator = useRef<HTMLDialogElement>(null);
  const finish = useRef<HTMLDialogElement>(null);
  const n = session.currentQuestion;
  const flagged = session.flagged.includes(n);
  const answered = answeredNumbers(session, test);
  const unanswered = TOTAL - answered.size;
  const isDesktop = useIsDesktop();

  return (
    <nav
      aria-label={reading("navigator.open")}
      className="fixed inset-x-[0] bottom-[0] z-10 border-t border-border-subtle bg-surface-base px-gutter py-2 shadow-raised"
    >
      <div className="mx-auto flex max-w-measure flex-col gap-1 tablet:flex-row tablet:items-center desktop:max-w-content">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-pressed={flagged}
            onClick={() => send({ type: "toggleFlag", number: n })}
            className={`${QUIET_BUTTON} -ms-3`}
          >
            <LineIcon className="size-4">
              <path
                d="M3.5 14V2.5h8l-1.5 3 1.5 3h-8"
                fill={flagged ? "currentColor" : "none"}
              />
            </LineIcon>
            {flagged ? reading("flag.remove") : reading("flag.add")}
          </button>
          {isDesktop ? (
            <DesktopParts answered={answered} onNavigate={onNavigate} />
          ) : (
            <button
              type="button"
              onClick={() => navigator.current?.showModal()}
              className={QUIET_BUTTON}
            >
              <GridIcon />
              {reading("navigator.open")}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 whitespace-nowrap tablet:ms-auto tablet:flex tablet:shrink-0">
          <SecondaryButton onClick={() => onNavigate(Math.max(1, n - 1))}>
            <ChevronIcon direction="left" />
            {reading("question.previous")}
          </SecondaryButton>
          {n < TOTAL && (
            <SecondaryButton onClick={() => onNavigate(n + 1)}>
              {reading("question.next")}
              <ChevronIcon direction="right" />
            </SecondaryButton>
          )}
          {(n === TOTAL || isDesktop) && (
            <PrimaryButton onClick={() => finish.current?.showModal()}>
              {reading("finish.button")}
            </PrimaryButton>
          )}
        </div>
      </div>
      <Dialog dialogRef={navigator} title={reading("navigator.open")}>
        {test.parts.map((p) => (
          <section key={p.id} className="mt-4">
            <h3 className="font-bold">
              {t("navigator.part", { number: p.number })}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1">
              {p.questionGroups.flatMap(groupNumbers).map((q) => (
                <li key={q}>
                  <QuestionCell
                    number={q}
                    answered={answered.has(q)}
                    onChoose={() => {
                      navigator.current?.close();
                      onNavigate(q);
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton
            onClick={() => {
              navigator.current?.close();
              finish.current?.showModal();
            }}
          >
            {reading("finish.button")}
          </PrimaryButton>
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => navigator.current?.close()}
          >
            {reading("sheet.back")}
          </button>
        </div>
      </Dialog>
      <Dialog dialogRef={finish} title={reading("finish.title")}>
        {unanswered > 0 && (
          <p className="mt-2">
            {reading("finish.unanswered", { count: unanswered })}
          </p>
        )}
        <div className="mt-6">
          <PrimaryButton onClick={() => send({ type: "finish" })}>
            {reading("finish.confirm")}
          </PrimaryButton>
        </div>
        <div className="mt-2">
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => finish.current?.close()}
          >
            {reading("finish.cancel")}
          </button>
        </div>
      </Dialog>
    </nav>
  );
}

/** A question in the navigator: its number, answered or not, marked, current; all in its name. */
function QuestionCell({
  number,
  answered,
  onChoose,
}: {
  number: number;
  answered: boolean;
  onChoose: () => void;
}) {
  const reading = useTranslations("reading");
  const { session } = useListening();
  const flagged = session.flagged.includes(number);
  const current = number === session.currentQuestion;
  const states = [
    answered ? reading("navigator.answered") : reading("navigator.unanswered"),
    ...(flagged ? [reading("navigator.flagged")] : []),
    ...(current ? [reading("navigator.current")] : []),
  ].join(", ");
  return (
    <button
      type="button"
      aria-label={reading("navigator.item", { number, states })}
      onClick={onChoose}
      className={`relative flex size-[2.75rem] items-center justify-center rounded-sm font-bold tabular-nums ${answered ? "bg-ink text-surface-base" : "border border-border-control"} ${current ? "underline decoration-2 underline-offset-4" : ""}`}
    >
      {number}
      {flagged && (
        <span
          aria-hidden="true"
          className="absolute -end-1 -top-1 size-[0.75rem] rounded-full border border-ink bg-surface-base"
        />
      )}
    </button>
  );
}

/**
 * The desktop navigator bar (LISTENING_EXPERIENCE.md, Desktop): the part on
 * screen's numbers first, the other parts as quiet buttons with their
 * progress.
 */
function DesktopParts({
  answered,
  onNavigate,
}: {
  answered: Set<number>;
  onNavigate: (n: number) => void;
}) {
  const t = useTranslations("listening");
  const { test, session } = useListening();
  return (
    <>
      <ul className="flex flex-wrap gap-1">
        {test.parts[session.view.part - 1]!.questionGroups.flatMap(
          groupNumbers,
        ).map((q) => (
          <li key={q}>
            <QuestionCell
              number={q}
              answered={answered.has(q)}
              onChoose={() => onNavigate(q)}
            />
          </li>
        ))}
      </ul>
      {test.parts
        .filter((p) => p.number !== session.view.part)
        .map((p) => {
          const numbers = p.questionGroups.flatMap(groupNumbers);
          return (
            <button
              key={p.id}
              type="button"
              className={QUIET_BUTTON}
              onClick={() => onNavigate(numbers[0] ?? 1)}
            >
              {t("navigator.partProgress", {
                number: p.number,
                answered: numbers.filter((q) => answered.has(q)).length,
                total: numbers.length,
              })}
              <ChevronIcon direction="right" />
            </button>
          );
        })}
    </>
  );
}
