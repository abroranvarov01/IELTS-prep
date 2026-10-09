import type { MetadataRoute } from "next";
import messages from "../../messages/uz.json";
import { routing } from "@/i18n/routing";

// Platform metadata cannot read CSS variables, so colors mirror tokens.css
// (allowlisted in scripts/check-tokens.mjs, guarded by manifest.test.ts).
const SURFACE_BASE = "#ffffff";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: messages.app.name,
    short_name: messages.app.name,
    lang: routing.defaultLocale,
    start_url: "/",
    display: "standalone",
    background_color: SURFACE_BASE,
    theme_color: SURFACE_BASE,
    // Placeholder icons until the owner supplies final ones.
    icons: [
      {
        src: "/icons/placeholder-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/placeholder-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/placeholder-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
