# Module: Food & Nutrition (Stage 2 — not built)

## The metric that matters

**Actions-per-log.** MacroFactor beats MyFitnessPal specifically on this (≈10 actions vs ≈15).
Target ≤10 actions for a typical food log. Keep core logging free (MyFitnessPal paywalling
barcode scan caused a mass migration away — don't repeat that mistake).

## Feature spec (tiered input, cheapest-first)

1. Quick-add calories/macros (manual number entry) — always available, zero setup.
2. Saved meals/recipes for one-tap re-log — the highest-leverage feature for repeat eaters.
3. Barcode scan — free tier.
4. AI photo/voice logging — stub/defer; emerging default but highest implementation cost.

Per-day/meal/week nutritional breakdown. Default to a simple calorie + macro view; put
micronutrients behind a "more detail" disclosure rather than the default view (bachelor
audience, avoid overwhelm per the Bearable lesson).

## Data model sketch

- `foods`: `name, caloriesPerServing, proteinG, carbsG, fatG, servingUnit, isSavedMeal: boolean`
- `foodLogs`: `foodId (FK) | null, freeTextName: string | null, servings: number, mealSlot:
  'breakfast'|'lunch'|'dinner'|'snack', loggedAt`
- Reuses `reminders` (e.g. "log lunch" nudges) and `streaks` (`moduleKey: 'food'`) from the
  shared engine.

## Goal definition for the streak engine

`goal.ts` for this module should probably be "logged at least one meal today" rather than
"hit calorie target" — logging consistency is the habit being reinforced, not diet compliance
(keep it shame-free, matching the Bearable/Finch lesson already baked into the streak engine's
grace-day design).
