---
name: Diagnostic retake freshness
description: How diagnostic retakes stay fresh per attempt, and the invariants that must hold.
---

# Diagnostic retakes (subject + reasoning)

The diagnostic system has two KINDS (`subject` = data-analytics mastery,
`reasoning` = general reasoning, NOT docility/agreement) × 3 FORMATS
(mcq/written/hybrid) × 3 LENGTHS (short/medium/long) × 4 PHASES
(before/during1/during2/after) = 72 catalog rows. Diagnostics NEVER affect the
grade — coursework is 100%. Retakes are unlimited and every attempt gets fresh
questions.

Catalog rows are seeded WITHOUT items. Items only ever exist per attempt
(`diagnostic_items.attemptId = <attempt>`), so every attempt owns its own set.
Never gate freshness on prior-attempt existence — always generate per new attempt
(a past version that only generated "on retake" re-served identical questions
after a reset wiped attempts).

**Freshness invariants (must all hold for both the LLM path and the fallback):**
- The real correctness guard is full-history dedup: a generated prompt is
  rejected if its normalized form matches ANY prior-attempt prompt, not just the
  recent ones. The list of prior prompts shown to the LLM is capped only as a
  prompt-size guard — it is guidance, NOT the dedup mechanism.
- No two prompts may repeat within a single attempt.
- The deterministic fallback (used when the model is unavailable) must be
  freshness-aware too: it is seeded with the prior-attempt prompt history and
  must never block submission. **Why:** an earlier fallback ignored history and
  cloned one template N times, producing identical questions.

**Resume vs. retake — a deliberate, easily-mistaken behavior:**
- A retake resumes an existing IN-PROGRESS (unsubmitted) attempt if one exists,
  to preserve progress on a mid-assessment refresh. Fresh questions only appear
  after the prior attempt is SUBMITTED and a new attempt starts.
- **Testing gotcha:** two retakes back-to-back WITHOUT submitting return the same
  item set (same in-progress attempt) — this is NOT a freshness bug. Always
  verify freshness via start → submit → retake, never start → start.

**Scoring uses the attempt's own items, graded on model-judged correctness;
stored keys/modelAnswers are fallible hints.** Written grading is lenient and
never blocks submission. An UNANSWERED mcq reports `isCorrect: null` (neutral
"No answer"), never `false`. The client item response omits the answer key.

**Known limit:** fallback bank-exhaustion uniqueness is lexical (scenario-label
suffix), not semantic — only relevant if the model is down for many consecutive
retakes; expand the bank if true semantic novelty is ever required.
