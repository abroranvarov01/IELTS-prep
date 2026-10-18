"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type SectionState,
  setLevelCheckSectionState,
} from "@/entities/level-check";
import {
  type ReadingTest,
  answeredNumbers,
  deviceStorage,
  newSessionId,
  positionCount,
  saveSession,
  startSession,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import { InfoIcon, LineIcon, ReadingIcon } from "@/shared/ui/icons";
import { PRIMARY_ACTION } from "@/shared/ui/primary-action";
import { PictureStage } from "@/shared/ui/StatusMessage";
import { QuietLink } from "@/shared/ui/QuietLink";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { type DeviceState, loadDeviceState } from "../api/load-state";

const noSubscription = () => () => {};

/**
 * The level check's intro (USER_FLOWS.md, Level check flows (M7);
 * DESIGN_SYSTEM.md, M7 components): what the check covers, the honest line
 * and one red action, in the form the device's state asks for: start,
 * continue (with "Start over") or take it again. The cookie's state chooses
 * the first render; the device, read after mounting, decides.
 */
export function LevelCheckIntro({
  form,
  cookieState,
  academicNote,
}: {
  form: ReadingTest;
  cookieState: SectionState;
  /** The learner's goal is General Training: the texts are Academic-style. */
  academicNote: boolean;
}) {
  const t = useTranslations("levelCheck");
  const tCommon = useTranslations();
  const formatter = useFormatter();
  const router = useRouter();
  const [device, setDevice] = useState<DeviceState>();
  // Storage is read on the client only; the server assumes it can save.
  const canSave = useSyncExternalStore(
    noSubscription,
    () => deviceStorage() !== undefined,
    () => true,
  );
  const total = positionCount(form);

  useEffect(() => {
    let active = true;
    loadDeviceState(form).then(
      (state) => {
        if (active) setDevice(state);
      },
      () => {
        if (active) setDevice({ kind: "notStarted" });
      },
    );
    return () => {
      active = false;
    };
  }, [form]);

  // Until the device is read, the cookie's state stands in (never the score).
  const kind =
    device?.kind ??
    (cookieState === "inProgress"
      ? "inProgress"
      : cookieState === "done"
        ? "finished"
        : "notStarted");

  const start = () => {
    const session = startSession(form, "practice", Date.now(), newSessionId());
    saveSession(deviceStorage(), session);
    setLevelCheckSectionState("reading", "inProgress")
      .catch(() => undefined)
      .finally(() => router.push(`/level-check/reading?start=${Date.now()}`));
  };

  const facts = (
    <ul className="mt-4 flex flex-col gap-2">
      <Fact icon={<ReadingIcon />}>
        {t("intro.covers", {
          passages: form.passages.length,
          questions: total,
        })}
      </Fact>
      <Fact icon={<ClockIcon />}>
        {t("intro.time", { minutes: form.durationMinutes })}
      </Fact>
      <Fact icon={<DeviceIcon />}>{t("intro.saved")}</Fact>
    </ul>
  );
  const notes = (
    <div className="mt-4 flex flex-col gap-2">
      <Note>{t("intro.honest")}</Note>
      {academicNote && <Note>{t("intro.academicNote")}</Note>}
      {!canSave && <Note>{t("intro.storageUnavailable")}</Note>}
    </div>
  );
  const arrow = (
    <LineIcon className="size-4">
      <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
    </LineIcon>
  );

  return (
    <PictureStage picture={(size) => <SkillsPicture size={size} />}>
      {kind === "inProgress" ? (
        <>
          <h1 className="text-heading-1 font-extrabold">{t("resume.title")}</h1>
          {device?.kind === "inProgress" && (
            <ResumeProgress
              answered={answeredNumbers(device.session, form).size}
              total={total}
            />
          )}
          {!canSave && (
            <div className="mt-4">
              <Note>{t("intro.storageUnavailable")}</Note>
            </div>
          )}
          <div className="mt-6 desktop:mt-8">
            <button
              type="button"
              onClick={() =>
                router.push(`/level-check/reading?resume=${Date.now()}`)
              }
              className={PRIMARY_ACTION}
            >
              <span className="inline-flex items-center gap-2">
                {t("resume.continue")}
                {arrow}
              </span>
            </button>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={start}
              className="inline-flex min-h-12 items-center font-medium underline underline-offset-4"
            >
              {t("resume.startOver")}
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-heading-1 font-extrabold">{t("title")}</h1>
          {facts}
          {notes}
          {kind === "finished" && device?.kind === "finished" && (
            <div className="mt-2 flex flex-col gap-2">
              <Note>
                {t("retake.body", {
                  date: formatter.dateTime(new Date(device.finishedAt), {
                    dateStyle: "long",
                  }),
                  level:
                    device.level === undefined ||
                    device.level === "insufficient"
                      ? "—"
                      : t(`levels.${device.level}`),
                })}
              </Note>
              <Note>{t("retake.sameQuestions")}</Note>
            </div>
          )}
          <div className="mt-6 desktop:mt-8">
            <button type="button" onClick={start} className={PRIMARY_ACTION}>
              <span className="inline-flex items-center gap-2">
                {kind === "finished" ? t("retake.start") : t("intro.start")}
                {arrow}
              </span>
            </button>
          </div>
          <div className="mt-2">
            {kind === "finished" ? (
              <QuietLink href="/level-check/result">
                {tCommon("home.nextAction.seeStartingPoint")}
              </QuietLink>
            ) : (
              <QuietLink href="/">{tCommon("onboarding.notNow")}</QuietLink>
            )}
          </div>
        </>
      )}
    </PictureStage>
  );
}

/** "You answered 6 of 14 questions…" with a decorative bar of the answered share. */
function ResumeProgress({
  answered,
  total,
}: {
  answered: number;
  total: number;
}) {
  const t = useTranslations("levelCheck");
  return (
    <>
      <p className="mt-2 text-text-secondary">
        {t("resume.body", { answered, total })}
      </p>
      <div
        aria-hidden="true"
        className="mt-3 h-1 max-w-[16rem] overflow-hidden rounded-full bg-border-subtle"
      >
        <div
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>
    </>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[0.125rem] text-text-secondary">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}

function ClockIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.5 1.75" />
    </LineIcon>
  );
}

function DeviceIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <rect x="4.25" y="1.75" width="7.5" height="12.5" rx="1.5" />
      <path d="M7 12h2" />
    </LineIcon>
  );
}
