# M6-01 UI audit (snapshot)

A snapshot for the M6-04 owner gate (**decided 2026-10-18: the capped fix list and the reference screens approved as proposed; Q3 beta skills only in pictures; Q4 skill names translated in interface places, English in test content and the level check; Q5 the owner handles the logo asset later**), like the M5-01 review packet. It records what keeps each existing screen from the approved visual language and proposes a **capped** fix list. The rules themselves stay in their canonical documents ([DESIGN_CONSTITUTION.md](../design/DESIGN_CONSTITUTION.md), [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md), [UI_ANTI_PATTERNS.md](../design/UI_ANTI_PATTERNS.md), the [`product-design` skill](../../.claude/skills/product-design/SKILL.md)); where this file and those documents differ, they win.

## Method

- **Tree:** `68acbb2` (M5 complete, M6 activated), production build (`pnpm --filter web build`, `start`), 2026-10-18.
- **Captured:** 13 surfaces × 4 widths (320, 390, 1024, 1280 px) × 3 languages (uz, ru, en) = 156 screenshots, plus the phone-only sheet states (collapsed sheet, navigator). Device state was seeded the way the e2e specs do it. Screenshots are working files in the session scratchpad, not committed (QUALITY_GATES.md).
- **Automated check on every capture:** horizontal overflow and clipped headings, paragraphs, labels, links and buttons: **none found**.
- **Visual review:** per-surface contact sheets (the four widths side by side, each language), judged against the design documents and the `product-design` checklist (§23).
- **Surfaces:** onboarding steps 1–3, Home (with a saved goal), the level-check interim page, not-found, the Reading start screen, the Reading test (phone sheet partial and collapsed, navigator; desktop columns and bar), results with "Mistakes that repeated", review (phone and desktop), retry, the retry safe state. The error page shares the not-found layout (`StatusMessage`) and was not triggered separately.

## Overall judgement

The phone experience is coherent and close to the target feeling: compact type, one red action per screen, quiet secondary actions, outcome icons with words, long Russian and Uzbek strings wrapping without truncation. The Reading test, results and review read as one product.

The problems are **structural rather than cosmetic**, and they matter before M7–M12 add many screens:
1. There is **no navigation**: Reading is reachable only by a direct link, and results, review and retry end in dead ends except the logo.
2. **Desktop compositions are inconsistent:** three unrelated desktop patterns exist, and one of them is a listed anti-pattern.
3. **Home has no identity of its own:** it repeats onboarding step 3's picture and promise, including skills that are post-beta.

The fix list below therefore spends M6 on navigation, the Practice Hub and two or three reusable page compositions, not on restyling components.

## Cross-cutting findings

| # | Finding | Evidence | Rule | Proposed outcome |
|---|---|---|---|---|
| C1 | No product navigation. The shell header holds only the logo and the language switcher; Reading has no entry from the product (direct link only, an M4 decision); results, review, the retry safe state and not-found offer no way to practice except back to Home. | All shell screens; results at every width | UX rules 2 (3-click) and 3; PRODUCT.md "clear next action" | Navigation and a Practice Hub (M6-02, M6-05, M6-06) |
| C2 | Three unrelated desktop compositions: (a) onboarding, level-check interim and not-found use a picture stage beside the task, approved in the onboarding stage composition; (b) Home uses one wide accent panel with small text on its left and the picture on its right; (c) results, the Reading start screen and the test-bar empty and safe states use the 36rem column at the top centre of a 1024–1280 px canvas, with most of the window empty. | home, results, reading-start, retry-unavailable at 1024 and 1280 | UI_ANTI_PATTERNS "tiny centered forms in giant desktop canvases"; skill §5 "Desktop is not stretched mobile" | Two or three named page compositions in DESIGN_SYSTEM.md (M6-03), applied to these screens (M6-07, M6-08) |
| C3 | Home is visually the same as onboarding step 3 and the interim page: the same four-skill picture, the same "Find your level" promise, the same accent panel. A returning learner sees no difference between "set up" and "my home". Context: Home was recomposed at the owner's request on 2026-10-15 in the onboarding's picture language (DESIGN_SYSTEM.md), so the options in M6-03 keep that composition by default. | onboarding-3, home, level-check-interim | Surface direction "Home answers what should I do next"; skill §14 | Home gets its own composition: the next action first, quiet goal context, no repeated onboarding art (M6-07). Its content stays the M3 rule until M7 and M11 |
| C4 | The four-skill picture shows Writing and Speaking, which are post-beta (ROADMAP.md). It also appears on the interim level-check page, which promises "where you are now" for all four. | home, onboarding-3, level-check-interim | Honest feedback and expectation setting (PRODUCT.md) | Show the beta skills only (Reading, Listening), or a skill-neutral picture; owner decision (Q3) |
| C5 | The picture's skill names stay in English in ru and uz ("Reading", "Listening"), from catalog values that are English in all three languages. The picture is `aria-hidden`, so this is a visual and localization question, not a screen-reader defect. | ru and uz home, onboarding-3, interim | LOCALIZATION.md; plain language | Decide: IELTS module names stay English as test terms, or are translated (Q4) |
| C6 | Test-bar screens without a test have only "Exit": the Reading start screen and the retry safe state give no context (which skill, which test) in the bar, and the start screen has no Reading identity (skill tag or icon) or effort hint. | reading-start, retry-unavailable | DESIGN_CONSTITUTION supporting color: skill recognition by name and icon | A compact skill identity on the start screen; the start screen in the task composition of C2 (M6-08) |
| C7 | The header logo looks small and high: the wordmark sits in the top half of its canvas (recorded on 2026-10-12). | every shell screen | Brand presence | A brand-asset fix by the owner, outside M6's code scope unless the owner provides an adjusted asset (Q5) |

## Per-surface findings

Priority: **must** (M6 fixes it), **should** (M6 fixes it if the capped scope allows, otherwise deferred with a reason), **later** (recorded, not in M6).

| Surface | Finding | Priority | Needs a new design value |
|---|---|---|---|
| Shell header | No navigation (C1) | must | Yes: navigation at each breakpoint (M6-03) |
| Home, phone | Repeats onboarding step 3 (C3); the picture takes the first screen height before the action at 320 px | must | Yes: Home composition |
| Home, desktop | Wide accent panel with small left-aligned text and the action far from the goal line; goal line and "Change goal" at opposite edges at 1280 px | must | Yes: Home composition |
| Home and onboarding art | Post-beta skills shown (C4); English skill names in ru and uz (C5) | should (after Q3, Q4) | No (copy or picture change) |
| Onboarding steps 1–3 | Consistent and approved (stage composition, 2026-10-12); at 1280 px the stage and task sit in the left two thirds, leaving the right third empty | later | No |
| Level-check interim | Same picture and promise as Home (C3, C4); replaced by the real level check in M7 | later (M7 replaces it) | No |
| Not-found and error | Consistent with the picture-stage pattern | none | No |
| Reading start | Narrow form at the top of an empty desktop canvas (C2c); no skill identity (C6) | must | Uses the task composition (M6-03) |
| Reading test, phone | At 320 px in ru the tool row wraps "Mark for review" and "All questions" onto two lines each; the partial sheet shows mostly the group instruction (recorded in M4 and the 2026-10-12 overhaul as the content's length) | later | No |
| Reading test, desktop | Matches the approved M4 layout; the bar takes two rows at 1024 and 1280 px as approved | none | No |
| Results | Desktop: the 36rem column at the top centre of a wide canvas (C2c); the score, the honest line and the review action are well ordered. Phone: two pattern cards push the quiet links far down; acceptable | must (desktop) | Uses the results composition (M6-03) |
| Review, phone and desktop | Consistent with M5's approved values; the partial sheet shows little of the card at 360 × 800 (recorded in M5-07) | later | No |
| Retry | Consistent with the test screen | none | No |
| Retry safe state, review empty states | Same as C2c and C6 | should | Uses the task composition |

## Proposed capped fix list for M6

The list is capped at these items; anything else found during M6 is recorded for later, not added.

1. **Navigation and responsive shell** (C1) — must. M6-02 decides the model; M6-05 builds it.
2. **Practice Hub** (C1) — must. M6-02, M6-06.
3. **Page compositions** (C2) — must. M6-03 names two or three compositions with their values: the picture-stage composition (existing, onboarding and status pages), a task composition for start, result and safe-state pages on desktop, and Home's composition.
4. **Home recomposed** (C3) — must; content unchanged until M7 and M11.
5. **Reading start screen and results on desktop** in the task composition (C2, C6) — must.
6. **Test-bar safe and empty states** in the task composition (C2, C6) — should.
7. **Skills in the picture** (C4, C5) — should, after the owner's answers to Q3 and Q4.

Not in M6: the logo asset (C7, owner), onboarding's 1280 px balance, the 320 px tool row in ru, the review sheet's partial height.

## Proposed reference screens (approved at M6-09)

Home (phone 390, desktop 1280), onboarding step 1 (390, 1280), Practice Hub (390, 1280), Reading test (phone with the partial sheet at 390; desktop at 1280), results (390, 1280), review (phone 390, desktop 1280). English for the composition, plus Russian at 320 px for Home and the Practice Hub, where the longest strings live.

## Questions for the owner (M6-04)

- **Q1** Approve the capped fix list above (or move items between must, should and later).
- **Q2** Approve the reference screens above.
- **Q3** Skills in the shared picture: show only the beta skills (Reading, Listening), keep all four as the product's direction, or use a skill-neutral picture. Recommendation: beta skills only, so the picture never promises what the beta does not have.
- **Q4** Skill names (Reading, Listening, …) in ru and uz: keep the IELTS module names in English as test terms, or translate them. Recommendation: keep English inside test content and the level check (as IELTS names them), translate in navigation and Home, where they are interface words.
- **Q5** The logo asset (C7): provide an adjusted asset, or accept the current one for beta.
