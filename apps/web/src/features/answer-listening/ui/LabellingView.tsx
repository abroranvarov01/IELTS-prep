"use client";

import { useTranslations } from "next-intl";
import {
  type QuestionGroup,
  mediaUrl,
  useListening,
} from "@/entities/listening";
import { LabelledPicture } from "@/shared/ui/LabelledPicture";
import { GapField, LetterChoice, OptionsBox } from "./controls";

type Labelling = Extract<QuestionGroup, { type: "labelling" }>;

/**
 * Plan, map and diagram labelling (LISTENING_EXPERIENCE.md): the picture,
 * then the questions, each answered with a letter or typed; on desktop side
 * by side.
 */
export function LabellingView({ group }: { group: Labelling }) {
  const t = useTranslations("picture");
  const { test, session } = useListening();
  const options =
    group.answer.kind === "choose"
      ? group.answer.options
      : group.answer.kind === "marker"
        ? group.markers.flatMap((m) =>
            m.option ? [{ id: m.option, text: m.label }] : [],
          )
        : [];
  return (
    <div className="flex flex-col gap-4 desktop:grid desktop:grid-cols-[11fr_9fr] desktop:items-start desktop:gap-8">
      <div className="desktop:sticky desktop:top-[8rem]">
        <LabelledPicture
          src={mediaUrl(test, group.image.src)}
          image={group.image}
          markers={group.markers}
          currentQuestion={session.currentQuestion}
          labels={{
            enlarge: t("enlarge"),
            zoomIn: t("zoomIn"),
            zoomOut: t("zoomOut"),
            close: t("close"),
          }}
        />
      </div>
      <div className="flex flex-col gap-4" lang="en">
        {group.answer.kind === "choose" && (
          <OptionsBox options={group.answer.options} />
        )}
        {group.questions.map((q) =>
          group.answer.kind === "typed" ? (
            <p key={q.number} className="leading-loose">
              {q.prompt && <span className="me-2 font-bold">{q.prompt}</span>}
              <GapField number={q.number} limit={group.answer.wordLimit} />
            </p>
          ) : (
            <LetterChoice
              key={q.number}
              number={q.number}
              label={q.prompt ?? ""}
              options={options}
            />
          ),
        )}
      </div>
    </div>
  );
}
