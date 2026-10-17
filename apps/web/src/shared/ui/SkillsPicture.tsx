import { useTranslations } from "next-intl";
import { Illustration } from "./illustrations";

const SKILLS = ["reading", "listening", "writing", "speaking"] as const;

/**
 * The four IELTS skills around one level: what the level check looks at
 * (onboarding step 3, home, the level check's page). Large: the skills named
 * on their tiles; small, for phones: the icons only. Decorative.
 */
export function SkillsPicture({ size }: { size: "large" | "small" }) {
  const t = useTranslations("skills");
  const large = size === "large";
  const spots = large
    ? {
        reading: "top-[8%] left-[0]",
        listening: "top-[0] right-[6%]",
        writing: "bottom-[0] left-[6%]",
        speaking: "right-[0] bottom-[8%]",
      }
    : {
        reading: "top-[0] left-[0]",
        listening: "top-[0] right-[0]",
        writing: "bottom-[0] left-[0]",
        speaking: "right-[0] bottom-[0]",
      };

  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto ${large ? "size-[22rem]" : "h-[7.5rem] w-[13rem]"}`}
    >
      {large && (
        <div className="absolute inset-[16%] rounded-full border-2 border-dashed border-brand-blush" />
      )}
      <div
        className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-base text-brand-primary ring-brand-blush ${large ? "size-[8rem] ring-8" : "size-16 ring-4"}`}
      >
        <BarsPicture className={large ? "size-12" : "size-8"} />
      </div>
      {SKILLS.map((skill) => (
        <div
          key={skill}
          className={`absolute flex flex-col items-center justify-center gap-2 bg-surface-base ${spots[skill]} ${large ? "size-[6.5rem] rounded-lg" : "size-12 rounded-md"}`}
        >
          {large && (
            <span className="text-meta font-bold text-brand-primary-deep">
              {t(skill)}
            </span>
          )}
          <span
            className={`flex items-center justify-center rounded-full bg-brand-blush-soft text-brand-primary-deep ${large ? "size-12" : "size-8"}`}
          >
            <Illustration className={large ? "size-6" : "size-5"}>
              {SKILL_ICONS[skill]}
            </Illustration>
          </span>
        </div>
      ))}
    </div>
  );
}

const SKILL_ICONS = {
  reading: (
    <path d="M12 6.5C10 5 7 4.5 3.75 4.75v13C7 17.5 10 18 12 19.5c2-1.5 5-2 8.25-1.75v-13C17 4.5 14 5 12 6.5zM12 6.5v13" />
  ),
  listening: (
    <path d="M4.75 15v-3a7.25 7.25 0 0 1 14.5 0v3M4.75 14.5h1.5a1.5 1.5 0 0 1 1.5 1.5v2.5a1.5 1.5 0 0 1-1.5 1.5h-1.5zM19.25 14.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v2.5a1.5 1.5 0 0 0 1.5 1.5h1.5z" />
  ),
  writing: <path d="m15.5 5.5 3 3L9 18l-4 1 1-4zM13.5 7.5l3 3" />,
  speaking: (
    <path d="M5 5.75h14c.69 0 1.25.56 1.25 1.25v9c0 .69-.56 1.25-1.25 1.25h-9l-4 3v-3H5c-.69 0-1.25-.56-1.25-1.25V7c0-.69.56-1.25 1.25-1.25zM8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
  ),
};

/** Three rising bars: a level. Filled, as the one solid mark of the picture. */
function BarsPicture({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <rect x="3.5" y="13" width="4.5" height="7.5" rx="1" />
      <rect x="9.75" y="8.5" width="4.5" height="12" rx="1" />
      <rect x="16" y="3.5" width="4.5" height="17" rx="1" />
    </svg>
  );
}
