# Visual references

Canonical owner of the **approved visual reference screenshots** and of the rules for adding them.

- These screenshots are **approved visual references**: local, version-controlled source material for how IELTS Prep should look. With the design docs, they are the visual source of truth. The order in which sources win, and how Claude uses them, is in the [`product-design` skill](../../../.claude/skills/product-design/SKILL.md).
- **Only owner-approved screenshots belong here.** Screenshots taken while implementing or reviewing a change are working files. They are never committed here automatically.
- **A screenshot defines composition and visual quality.** That covers layout, hierarchy, density, proportions and overall feel. Exact reusable values (colors, type sizes, spacing, radii, shadows) stay owned by [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md). A screenshot never overrides approved behavior in a feature spec.
- **When a screenshot and a document disagree,** record the contradiction and get it resolved by the owner (update the document, or replace the screenshot). Do not choose silently.
- No external design tool is needed to create or use these files ([DESIGN_CONSTITUTION.md, Visual sources and design tooling](../DESIGN_CONSTITUTION.md#visual-sources-and-design-tooling)).

## Promoting a screenshot

1. The owner approves the screen, usually from implementation screenshots or an exported design.
2. Save the image (PNG) in the area folder under a descriptive name, such as `reading/reading-mobile-sheet.png`.
3. Commit it with a one-line note in [PROGRESS.md](../../execution/PROGRESS.md) saying what it is the reference for and who approved it.
4. To replace a reference, overwrite the file in a commit that says so. Git keeps the history.

## Folders

| Folder | For | Files, and suggested ones |
|---|---|---|
| `brand/` | Overall look, logo use | `direction-2026-10-18.png` (the owner's composition image for ten screens, [Direction v2](../DESIGN_CONSTITUTION.md#direction-v2-owner-2026-10-18); its screens for features not built yet are direction, not approved behavior), `logo-reference.png` |
| `home/` | Home and next action | `home-mobile.png` |
| `reading/` | Reading test and review | `reading-mobile-practice.png`, `reading-mobile-sheet.png`, `reading-desktop.png`, `reading-review.png` |
| `listening/` | Listening practice and review | `listening-practice.png`, `listening-matching.png`, `listening-map.png`, `listening-notes.png`, `listening-review.png` |
| `progress/` | Progress | `progress-mobile.png` |
| `mock/` | Mock test results | `mock-result.png` |

Each folder holds a `.gitkeep` only until its first approved image arrives.
