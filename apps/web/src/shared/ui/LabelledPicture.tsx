"use client";

import { useRef, useState } from "react";
import type { ImageAsset, Marker } from "@/shared/content/shapes";
import { CloseIcon, LineIcon } from "./icons";
import { QUIET_BUTTON } from "./quiet-action";

const ZOOMS = [1, 1.5, 2, 3];

/**
 * A labelling picture, shared by Listening and Reading (DESIGN_SYSTEM.md, M8:
 * plan, map and diagram labelling): the image with app-drawn markers,
 * letters in circles and question numbers in rounded squares, the current
 * question's marker in the selected look, and an enlarged view whose zoom
 * works with buttons as well as gestures. The image's long description is
 * its text alternative.
 */
export function LabelledPicture({
  src,
  image,
  markers,
  currentQuestion,
  labels,
}: {
  src: string;
  image: ImageAsset;
  markers: Marker[];
  currentQuestion?: number;
  labels: { enlarge: string; zoomIn: string; zoomOut: string; close: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(0);
  const descriptionId = `${image.sha256.slice(0, 8)}-description`;

  const picture = (scale: number) => (
    <div className="relative" style={{ width: `${scale * 100}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- content SVG shown as an image so nothing in it runs (ADR-0012 §6) */}
      <img
        src={src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        aria-describedby={descriptionId}
        className="block h-auto w-full"
      />
      {markers.map((m) => {
        const current =
          m.question !== undefined && m.question === currentQuestion;
        return (
          <span
            key={m.id}
            aria-hidden="true"
            className={`absolute flex size-[1.75rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 font-bold outline-2 outline-surface-base ${m.option ? "rounded-full" : "rounded-sm"} ${current ? "border-ink bg-brand-blush-soft ring-1 ring-ink ring-inset" : "border-ink bg-surface-base"}`}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            {m.label}
          </span>
        );
      })}
    </div>
  );

  return (
    <figure>
      <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-base">
        {picture(1)}
      </div>
      <p id={descriptionId} lang="en" className="sr-only">
        {image.description}
      </p>
      <button
        type="button"
        className={`${QUIET_BUTTON} -ms-3 mt-2`}
        onClick={() => {
          setZoom(0);
          dialog.current?.showModal();
        }}
      >
        <LineIcon className="size-4">
          <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
        </LineIcon>
        {labels.enlarge}
      </button>
      <dialog
        ref={dialog}
        aria-label={image.alt}
        className="m-[0] h-dvh max-h-none w-screen max-w-none bg-surface-base p-[0] backdrop:bg-ink/40"
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-gutter">
            {picture(ZOOMS[zoom] ?? 1)}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-gutter py-2">
            <button
              type="button"
              className={QUIET_BUTTON}
              disabled={zoom >= ZOOMS.length - 1}
              onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
            >
              <LineIcon className="size-4">
                <path d="M8 3v10M3 8h10" />
              </LineIcon>
              {labels.zoomIn}
            </button>
            <button
              type="button"
              className={QUIET_BUTTON}
              disabled={zoom === 0}
              onClick={() => setZoom((z) => Math.max(0, z - 1))}
            >
              <LineIcon className="size-4">
                <path d="M3 8h10" />
              </LineIcon>
              {labels.zoomOut}
            </button>
            <button
              type="button"
              className={`${QUIET_BUTTON} ms-auto`}
              onClick={() => dialog.current?.close()}
            >
              <CloseIcon />
              {labels.close}
            </button>
          </div>
        </div>
      </dialog>
    </figure>
  );
}
