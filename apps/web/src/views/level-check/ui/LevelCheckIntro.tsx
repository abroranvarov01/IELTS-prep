"use client";

import { useTranslations } from "next-intl";
import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type LevelCheckState,
  type Skill,
  setLevelCheckSectionState,
} from "@/entities/level-check";
import {
  type ListeningTest,
  groupNumbers,
  saveSession as saveListeningSession,
  startCheckSession,
} from "@/entities/listening";
import {
  type ReadingTest,
  deviceStorage,
  newSessionId,
  positionCount,
  saveSession,
  startSession,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import {
  InfoIcon,
  LineIcon,
  ListeningIcon,
  ReadingIcon,
} from "@/shared/ui/icons";
import { PRIMARY_ACTION } from "@/shared/ui/primary-action";
import { PictureStage } from "@/shared/ui/StatusMessage";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { type DeviceState, loadDeviceStates } from "../api/load-state";

const noSubscription = () => () => {};
const SKILLS: Skill[] = ["reading", "listening"];
/** When the learner clicked, in ms since the epoch (it starts or opens a visit). */
const clickTime = (event: { timeStamp: number }) =>
  Math.round(performance.timeOrigin + event.timeStamp);
const QUIET_LINK_BUTTON =
  "inline-flex min-h-12 items-center font-medium underline underline-offset-4";

/** English words inside a localized string (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/**
 * The level check's intro (USER_FLOWS.md, The level check with two
 * sections; DESIGN_SYSTEM.md, Level check: two sections): the two sections
 * as rows with their facts and state, the Listening row's notes, the honest
 * line, one red action for the first section not finished (Reading first,
 * owner decision F1) and the other section's action as a quiet link. The
 * cookie's states choose the first render; the device, read after
 * mounting, decides.
 */
export function LevelCheckIntro({
  reading,
  listening,
  cookieState,
  academicNote,
}: {
  reading: ReadingTest;
  listening: ListeningTest;
  cookieState: LevelCheckState;
  /** The learner's goal is General Training: the texts are Academic-style. */
  academicNote: boolean;
}) {
  const t = useTranslations("levelCheck");
  const tRoot = useTranslations();
  const router = useRouter();
  const [device, setDevice] = useState<Record<Skill, DeviceState>>();
  // Storage is read on the client only; the server assumes it can save.
  const canSave = useSyncExternalStore(
    noSubscription,
    () => deviceStorage() !== undefined,
    () => true,
  );

  useEffect(() => {
    let active = true;
    loadDeviceStates(reading, listening).then(
      (states) => {
        if (active) setDevice(states);
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [reading, listening]);

  // Until the device is read, the cookie's states stand in.
  const stateOf = (skill: Skill): DeviceState["kind"] =>
    device?.[skill].kind ??
    (cookieState[skill] === "inProgress"
      ? "inProgress"
      : cookieState[skill] === "done"
        ? "finished"
        : "notStarted");
  const unfinished = SKILLS.filter((skill) => stateOf(skill) !== "finished");
  const lead = unfinished[0];
  const otherSkill = unfinished[1];

  const start = (skill: Skill, now: number) => {
    if (skill === "reading")
      saveSession(
        deviceStorage(),
        startSession(reading, "practice", now, newSessionId()),
      );
    else
      saveListeningSession(
        deviceStorage(),
        listening,
        startCheckSession(listening, now, newSessionId()),
      );
    setLevelCheckSectionState(skill, "inProgress")
      .catch(() => undefined)
      .finally(() => router.push(`/level-check/${skill}?start=${now}`));
  };
  // A section in progress is resumed; any other is started.
  const enter = (skill: Skill, now: number) => {
    if (stateOf(skill) === "inProgress")
      router.push(`/level-check/${skill}?resume=${now}`);
    else start(skill, now);
  };
  const actionLabel = (skill: Skill) =>
    stateOf(skill) === "inProgress"
      ? t(`continue.${skill}`)
      : t(`startSection.${skill}`);

  const total = {
    reading: positionCount(reading),
    listening: listening.parts.flatMap((p) =>
      p.questionGroups.flatMap(groupNumbers),
    ).length,
  };
  const arrow = (
    <LineIcon className="size-4">
      <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
    </LineIcon>
  );

  return (
    <PictureStage picture={(size) => <SkillsPicture size={size} />}>
      <h1 className="text-heading-1 font-extrabold">{t("title")}</h1>
      <ul className="mt-4 flex flex-col">
        {SKILLS.map((skill, i) => {
          const state = device?.[skill];
          return (
            <li
              key={skill}
              className={`flex items-start gap-3 py-4 ${i > 0 ? "border-t border-border-subtle" : ""}`}
            >
              <span
                className={`mt-[0.125rem] ${skill === "reading" ? "text-brand-primary" : "text-skill-listening"}`}
              >
                {skill === "reading" ? <ReadingIcon /> : <ListeningIcon />}
              </span>
              <div className="flex-1">
                <p>{t(`sections.${skill}`)}</p>
                <p className="mt-1 text-meta text-text-secondary">
                  {stateOf(skill) === "finished"
                    ? t("sections.finished")
                    : stateOf(skill) === "inProgress"
                      ? t("sections.inProgress", {
                          answered:
                            state?.kind === "inProgress" ? state.answered : 0,
                          total: total[skill],
                        })
                      : t("sections.notStarted")}
                </p>
                {state?.kind === "inProgress" && (
                  <div
                    aria-hidden="true"
                    className="mt-2 h-1 max-w-[16rem] overflow-hidden rounded-full bg-border-subtle"
                  >
                    <div
                      className="h-full rounded-full bg-brand-primary"
                      style={{
                        width: `${(state.answered / total[skill]) * 100}%`,
                      }}
                    />
                  </div>
                )}
                {skill === "listening" && (
                  <div className="mt-3 flex flex-col gap-2">
                    <Note>{t("listening.playsOnce")}</Note>
                    <Note>{tRoot("listening.start.headphones")}</Note>
                    <Note>{t("listening.temporaryAudio")}</Note>
                    <Note>
                      {tRoot.rich("listening.start.dateFormat", { en })}
                    </Note>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex flex-col gap-2">
        <Note>{t("intro.saved")}</Note>
        <Note>{t("intro.honest")}</Note>
        {academicNote && <Note>{t("intro.academicNote")}</Note>}
        {!canSave && <Note>{t("intro.storageUnavailable")}</Note>}
      </div>
      <div className="mt-6 desktop:mt-8">
        {lead ? (
          <button
            type="button"
            onClick={(event) => enter(lead, clickTime(event))}
            className={PRIMARY_ACTION}
          >
            <span className="inline-flex items-center gap-2">
              {actionLabel(lead)}
              {arrow}
            </span>
          </button>
        ) : (
          <PrimaryLink href="/level-check/result">
            {tRoot("home.nextAction.seeStartingPoints")}
          </PrimaryLink>
        )}
      </div>
      <div className="mt-2 flex flex-col items-start">
        {otherSkill && (
          <button
            type="button"
            className={QUIET_LINK_BUTTON}
            onClick={(event) => enter(otherSkill, clickTime(event))}
          >
            {actionLabel(otherSkill)}
          </button>
        )}
        {lead && stateOf(lead) === "inProgress" && (
          <button
            type="button"
            className={QUIET_LINK_BUTTON}
            onClick={(event) => start(lead, clickTime(event))}
          >
            {t("resume.startOver")}
          </button>
        )}
        {SKILLS.every((skill) => stateOf(skill) === "notStarted") && (
          <QuietLink href="/">{tRoot("onboarding.notNow")}</QuietLink>
        )}
        {SKILLS.filter((skill) => stateOf(skill) === "finished").map(
          (skill) => (
            <button
              type="button"
              className={QUIET_LINK_BUTTON}
              key={skill}
              onClick={(event) => start(skill, clickTime(event))}
            >
              {t(`startSection.${skill}`)}
            </button>
          ),
        )}
      </div>
    </PictureStage>
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
