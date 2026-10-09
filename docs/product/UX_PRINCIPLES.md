# UX Principles

Canonical owner of the **UX constitution**. These rules apply to every user-facing surface. Other files reference them and do not restate them.

Visual rules: [DESIGN_CONSTITUTION.md](../design/DESIGN_CONSTITUTION.md). Accessibility requirements: [ACCESSIBILITY.md](../design/ACCESSIBILITY.md).

## The rules

### 1. 10-second rule
A first-time user should understand the main action of an important screen within about 10 seconds, without explanation.
*Check:* cover the screen's secondary content. Is the main action still obvious from the heading and the dominant button?

### 2. 3-click rule
Any primary product action should normally be reachable in **3 user actions or fewer** from the home screen. "User actions" means taps, clicks, or deliberate inputs. Scrolling does not count.
*Check:* count the steps in the flow (see [USER_FLOWS.md](USER_FLOWS.md)). If a primary action needs more than 3, justify it in the flow or redesign it.

### 3. One primary action
An important screen has **one** clearly dominant next action. Secondary actions are visually quieter. Two equally loud buttons mean we have not decided what the screen is for.

### 4. Progressive disclosure
Do not show advanced functionality until it is useful. New users see the smallest set of choices that gets them practicing. Advanced options (filters, settings, detailed statistics) appear when the user's history makes them relevant, or one level deeper.

### 5. Mobile first
Design for common phone widths first (360–390 px, and verify 320 px). Desktop gets its own layout where that helps, especially realistic exam simulation. It is not an enlarged phone layout. Breakpoints: [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md#responsive-behavior).

### 6. Plain language
Use the simplest phrase that is accurate, in every interface language.

| Avoid | Prefer |
|---|---|
| Performance analytics | Your progress |
| Knowledge gap assessment | What to improve |
| Diagnostic evaluation | Find your level |
| Module | Section / Practice |
| Submit response | Check answers |

Plain language does not mean imprecise. The honest-feedback wording in [PRODUCT.md](PRODUCT.md#honest-feedback-non-negotiable) always applies.

### 7. No learning curve
If an interaction needs a tutorial, coach marks, or an onboarding carousel to be understood, first ask whether the interaction should be redesigned. A tutorial is a last resort, not a fix.

### 8. Accessibility is a requirement
Accessibility is not polish to add later. Requirements: [ACCESSIBILITY.md](../design/ACCESSIBILITY.md).

## How to apply the rules

- The rules apply to "important screens" and "primary actions". These are the screens and actions on the main product loop (home/next action, practice, results, mistake review, progress). Settings pages still need clarity, but the 3-click budget does not govern them.
- When two rules conflict (for example, realistic exam simulation needs more steps), choose deliberately and write the reason in the flow spec. Do not let the conflict pass silently.
- The UI procedure that checks these rules is the `ui-implementation` skill.
