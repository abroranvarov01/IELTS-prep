import { Literata, Onest } from "next/font/google";

const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-onest",
});

// Passage font. Not preloaded: no page shows a passage yet.
const literata = Literata({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-literata",
  preload: false,
});

// For <html> in the locale layout and in the root-level fallback pages,
// which render their own document.
export const fontVariables = `${onest.variable} ${literata.variable}`;
