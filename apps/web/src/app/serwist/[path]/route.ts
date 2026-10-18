import { createSerwistRoute } from "@serwist/turbopack";

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
    // Listening audio and pictures are never precached: installing the app
    // must not download a test (ADR-0013 §1).
    globIgnores: ["public/media/**/*"],
  });
