# Design Constitution

Canonical owner of the **approved visual direction**: what the product should look and feel like.

- Concrete values (colors, type, spacing): [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- What to avoid: [UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)
- UX rules: [UX_PRINCIPLES.md](../product/UX_PRINCIPLES.md)

## Approved core (do not change without explicit product approval)

1. **White-first.** Clean white surfaces carry the interface. Color is used with intent, not as wallpaper.
2. **Red is the brand accent.** It is strong and confident, inspired by IELTS's visual identity but **not copied** from it (not the same red, logo treatment, or layouts). Red marks the primary action and key brand moments. It does not flood whole screens.
3. **Bold, modern typography.** Hierarchy comes mainly from type size and weight, not from boxes, borders, and shadows.
4. **Strong contrast.** Text is clearly readable outdoors on a mid-range phone.
5. **Modern education product.** Premium rather than corporate. Friendly without becoming childish.
6. **Simple interaction.** Attractive, and still obvious at a glance.
7. **Mobile-first.** See [UX_PRINCIPLES.md](../product/UX_PRINCIPLES.md#5-mobile-first).

## Supporting color

- Each of the four skills (Reading, Listening, Speaking, Writing) may have a supporting color that helps users recognize it quickly.
- Skill colors are **supporting**: for tags, small accents, and soft background tints. They never compete with red for the primary action.
- Soft supporting tints are used selectively, for example to group related content. They are not applied to every card.

## Typography direction

- **UI:** Manrope, or an equivalent modern and highly readable sans-serif.
- **Long reading passages:** a quality reading serif such as Literata, *if* testing shows it improves long-form reading on phones.
- Font choices must cover Uzbek Latin characters and Cyrillic (see [LOCALIZATION.md](../product/LOCALIZATION.md)).

## Reading is the signature experience

The phone Reading experience is a key differentiator, and its design gets more care than anything else. The approved interaction model (passage-first, question bottom sheet, Pin Evidence, Practice/Exam modes) is owned by [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md).

## Component libraries

shadcn/ui (or Radix) may be used for **behavior and accessibility primitives**. Its default look must not define the brand. Every primitive is restyled through our tokens.

## Quality bar

The product should match the clarity and polish of the best modern education apps. When unsure, choose the option that is **clearer**, not the one that is more decorative.
