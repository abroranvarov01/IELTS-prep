import { LineIcon } from "@/shared/ui/icons";

// The player's line icons (DESIGN_SYSTEM.md, M8 components: new icons).

export function PlayIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <path d="M5 3.25v9.5L12.5 8z" />
    </LineIcon>
  );
}

export function PauseIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <path d="M5.5 3.5v9M10.5 3.5v9" />
    </LineIcon>
  );
}

export function RestartIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <path d="M3 8a5 5 0 1 0 1.5-3.6M3 2.5v2.75h2.75" />
    </LineIcon>
  );
}

/** An arrow turning back (or forward, mirrored). */
export function SkipIcon({ direction }: { direction: "back" | "forward" }) {
  return (
    <LineIcon
      className={`size-[1.25rem] ${direction === "forward" ? "-scale-x-100" : ""}`}
    >
      <path d="M3.5 8a4.5 4.5 0 1 0 1.3-3.2M3.5 2.75v2.5H6" />
    </LineIcon>
  );
}

export function SpeakerIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <path d="M2.5 6v4h2.5L8.5 13V3L5 6zM11 5.5a3.5 3.5 0 0 1 0 5" />
    </LineIcon>
  );
}
