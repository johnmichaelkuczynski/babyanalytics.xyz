import { chatText, chatJson } from "./ai";
import { logger } from "./logger";
import type { Kind, Format, Length } from "./diagnosticContent";
import { itemCounts } from "./diagnosticContent";

// Shape of a persisted diagnostic item row (payload/scoring are jsonb).
export interface DiagnosticItemRow {
  id: number;
  position: number;
  type: "mcq" | "written";
  prompt: string;
  payload: unknown;
  scoring: unknown;
}

// One student response (matches ReasoningResponseInput in the OpenAPI spec).
export interface ResponseInput {
  itemId: number;
  selectedIndex?: number | null;
  writtenAnswer?: string | null;
}

export interface ReasoningMetric {
  label: string;
  value: string;
  detail?: string | null;
}

export interface ScoreSummary {
  kind: Kind;
  headline: string;
  metrics: ReasoningMetric[];
  // Persisted so a later review shows the same correct answers / verdicts.
  correctByItem?: Record<number, number>;
  writtenById?: Record<number, { correct: boolean; rationale: string }>;
}

interface McqPayload {
  options: string[];
}
interface McqScoring {
  correctIndex: number;
}
interface WrittenScoring {
  modelAnswer: string;
  gradingNote: string;
}

// Content of an item ready to be inserted (no id / attemptId / position yet).
export interface GeneratedItemContent {
  type: "mcq" | "written";
  prompt: string;
  payload: unknown;
  scoring: unknown;
}

// --- helpers --------------------------------------------------------------

function rotateOptions(options: string[]): {
  options: string[];
  correctIndex: number;
} {
  const n = options.length;
  const off = Math.floor(Math.random() * n);
  const rotated = new Array<string>(n);
  for (let k = 0; k < n; k++) {
    rotated[(k + off) % n] = options[k]!;
  }
  return { options: rotated, correctIndex: off };
}

// Normalize a prompt for duplicate detection (case/whitespace/punctuation
// insensitive), so a retake never shows two of the same question.
function normPrompt(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function subjectContext(lectureText: string | undefined): string {
  const trimmed = (lectureText ?? "").trim();
  if (!trimmed) {
    return "Cover the plain-language skills of data analytics: noticing patterns, comparing, grouping and counting, asking a good question of data, reading what a chart shows, and moving from evidence to a sensible decision. No math, code, or spreadsheets.";
  }
  // Keep the grounding text bounded so the prompt stays small.
  const excerpt = trimmed.slice(0, 6000);
  return `Ground the questions in the SKILLS taught by this course material (test the ability, like an independent certification would — do NOT quote it verbatim or test recall of its exact wording):\n"""\n${excerpt}\n"""`;
}

// ===========================================================================
// Item generation — fresh, never-repeated questions per attempt
// ===========================================================================

async function generateMcqItems(
  kind: Kind,
  count: number,
  opts: { avoidPrompts: string[]; lectureText?: string },
): Promise<GeneratedItemContent[]> {
  if (count <= 0) return [];
  const system =
    kind === "subject"
      ? "You are an assessment author writing ORIGINAL multiple-choice questions that INDEPENDENTLY verify a learner's data-analytics ability — the plain-language skills of noticing patterns, comparing, grouping and counting, asking good questions of data, reading charts, and moving from evidence to a sensible decision. Measure genuine ability the way a third-party certification would, NOT recall of any specific lesson's wording. Each question has exactly four options with ONE unambiguously best answer. List the CORRECT option FIRST, then three plausible but wrong distractors. " +
        'Respond ONLY as JSON {"items":[{"prompt":"...","options":["correct","wrong","wrong","wrong"]}]}.'
      : "You are an assessment author writing ORIGINAL multiple-choice questions that measure GENUINE general reasoning ability — drawing valid conclusions, spotting unsupported leaps, weighing evidence, and everyday logical inference. Do NOT test memorized facts or any course content. Do NOT reward mere agreement, compliance, or docility — reward correct reasoning only. Each question has exactly four options with ONE unambiguously best answer. List the CORRECT option FIRST, then three plausible but wrong distractors. " +
        'Respond ONLY as JSON {"items":[{"prompt":"...","options":["correct","wrong","wrong","wrong"]}]}.';
  const grounding =
    kind === "subject" ? subjectContext(opts.lectureText) : "Use varied, concrete everyday situations.";
  const avoid =
    opts.avoidPrompts.length > 0
      ? `\nDo NOT repeat or closely paraphrase any of these previously-used questions:\n${JSON.stringify(opts.avoidPrompts.slice(0, 60))}`
      : "";
  const user = `Write ${count} fresh, distinct questions.\n${grounding}${avoid}`;

  const out = await chatJson<{
    items?: { prompt?: unknown; options?: unknown }[];
  }>(system, user);
  const raw = out.items;
  if (!Array.isArray(raw)) throw new Error("mcq generation: no items");
  const items: GeneratedItemContent[] = [];
  const seen = new Set<string>(opts.avoidPrompts.map(normPrompt));
  for (const q of raw) {
    const prompt = q.prompt;
    const options = q.options;
    if (typeof prompt !== "string" || prompt.trim().length < 8) continue;
    if (seen.has(normPrompt(prompt))) continue;
    if (
      !Array.isArray(options) ||
      options.length !== 4 ||
      !options.every((o) => typeof o === "string" && o.trim().length > 0)
    ) {
      continue;
    }
    const { options: rotated, correctIndex } = rotateOptions(
      (options as string[]).map((o) => o.trim()),
    );
    seen.add(normPrompt(prompt));
    items.push({
      type: "mcq",
      prompt: prompt.trim(),
      payload: { options: rotated } satisfies McqPayload,
      scoring: { correctIndex } satisfies McqScoring,
    });
    if (items.length === count) break;
  }
  if (items.length !== count) {
    throw new Error(`mcq generation: wanted ${count}, got ${items.length}`);
  }
  return items;
}

async function generateWrittenItems(
  kind: Kind,
  count: number,
  opts: { avoidPrompts: string[]; lectureText?: string },
): Promise<GeneratedItemContent[]> {
  if (count <= 0) return [];
  const system =
    kind === "subject"
      ? "You are an assessment author writing ORIGINAL SHORT-ANSWER questions that INDEPENDENTLY verify a learner's data-analytics ability (noticing patterns, comparing, grouping/counting, asking good questions of data, reading charts, evidence-to-decision). Each question must be answerable in ONE or TWO sentences — never an essay. Provide a concise model answer and a one-line grading note describing what a correct answer must capture. " +
        'Respond ONLY as JSON {"items":[{"prompt":"...","modelAnswer":"...","gradingNote":"..."}]}.'
      : "You are an assessment author writing ORIGINAL SHORT-ANSWER questions that measure GENUINE general reasoning ability (valid conclusions, spotting unsupported leaps, weighing evidence, everyday logic). Do NOT test memorized facts or course content; do NOT reward compliance or docility, only correct reasoning. Each question must be answerable in ONE or TWO sentences — never an essay. Provide a concise model answer and a one-line grading note describing what a correct answer must capture. " +
        'Respond ONLY as JSON {"items":[{"prompt":"...","modelAnswer":"...","gradingNote":"..."}]}.';
  const grounding =
    kind === "subject" ? subjectContext(opts.lectureText) : "Use varied, concrete everyday situations.";
  const avoid =
    opts.avoidPrompts.length > 0
      ? `\nDo NOT repeat or closely paraphrase any of these previously-used questions:\n${JSON.stringify(opts.avoidPrompts.slice(0, 60))}`
      : "";
  const user = `Write ${count} fresh, distinct short-answer questions (each answerable in 1-2 sentences).\n${grounding}${avoid}`;

  const out = await chatJson<{
    items?: { prompt?: unknown; modelAnswer?: unknown; gradingNote?: unknown }[];
  }>(system, user);
  const raw = out.items;
  if (!Array.isArray(raw)) throw new Error("written generation: no items");
  const items: GeneratedItemContent[] = [];
  const seen = new Set<string>(opts.avoidPrompts.map(normPrompt));
  for (const q of raw) {
    const prompt = q.prompt;
    const modelAnswer = q.modelAnswer;
    const gradingNote = q.gradingNote;
    if (typeof prompt !== "string" || prompt.trim().length < 8) continue;
    if (seen.has(normPrompt(prompt))) continue;
    if (typeof modelAnswer !== "string" || modelAnswer.trim().length < 2) continue;
    seen.add(normPrompt(prompt));
    items.push({
      type: "written",
      prompt: prompt.trim(),
      payload: {},
      scoring: {
        modelAnswer: modelAnswer.trim(),
        gradingNote:
          typeof gradingNote === "string" && gradingNote.trim().length > 0
            ? gradingNote.trim()
            : "Answer captures the core idea of the model answer.",
      } satisfies WrittenScoring,
    });
    if (items.length === count) break;
  }
  if (items.length !== count) {
    throw new Error(`written generation: wanted ${count}, got ${items.length}`);
  }
  return items;
}

// Deterministic fallback so an attempt is never blocked when the model is
// unavailable. Each bank holds several DISTINCT questions; we shuffle and take
// the count needed, and if the bank is smaller than the count we cycle with a
// distinguishing scenario label so no two prompts in one attempt are identical.
const FALLBACK_MCQ_BANK: Record<Kind, { prompt: string; options: string[] }[]> = {
  subject: [
    {
      prompt:
        "A shop counts visitors each day for a week: Mon 20, Tue 22, Wed 21, Thu 23, Fri 60, Sat 25, Sun 24. Which day stands out as unusual?",
      options: ["Friday", "Monday", "Sunday", "Wednesday"],
    },
    {
      prompt:
        "A class scored: 7, 8, 7, 9, 8, 8, 7. What is the most common score (the mode)?",
      options: ["8", "7", "9", "There is no most common score"],
    },
    {
      prompt:
        "You want to know if students prefer apples or oranges. Which is the best way to find out?",
      options: [
        "Ask a fair sample of students which they prefer",
        "Count how many apples the cafeteria ordered",
        "Ask only your two closest friends",
        "Guess based on what you like",
      ],
    },
    {
      prompt:
        "A chart's bars start at 90 instead of 0, making a tiny difference look huge. What is the problem?",
      options: [
        "The scale exaggerates small differences",
        "The colors are wrong",
        "There are too many bars",
        "Bar charts can't show differences",
      ],
    },
    {
      prompt:
        "Ice-cream sales and sunburns both rise in summer. What is the safest conclusion?",
      options: [
        "Both are linked to a third thing (hot weather), not to each other",
        "Ice cream causes sunburns",
        "Sunburns cause people to buy ice cream",
        "One must cause the other",
      ],
    },
    {
      prompt:
        "A table shows daily steps: 5000, 5200, 4900, 5100, 12000. Which value is the outlier?",
      options: ["12000", "4900", "5100", "5000"],
    },
  ],
  reasoning: [
    {
      prompt:
        "Every dog at the park today is friendly. Rex is a dog at the park today. What follows?",
      options: [
        "Rex is friendly.",
        "Rex is unfriendly.",
        "Rex is not a dog.",
        "Nothing follows.",
      ],
    },
    {
      prompt:
        "If it is raining, the ground is wet. The ground is wet. What can you correctly conclude?",
      options: [
        "Possibly it rained, but something else could have wet the ground.",
        "It is definitely raining.",
        "It is definitely not raining.",
        "The ground cannot be wet.",
      ],
    },
    {
      prompt:
        "A sign says 'Sale: up to 70% off.' What does this guarantee about a given item?",
      options: [
        "Nothing — some items may be discounted far less, or not at all.",
        "Every item is 70% off.",
        "Every item is at least 70% off.",
        "The cheapest item is 70% off.",
      ],
    },
    {
      prompt:
        "All cats Maria has met purr. She concludes every cat in the world purrs. How strong is this reasoning?",
      options: [
        "Weak — she generalizes from a limited set of cases.",
        "Airtight — it cannot be wrong.",
        "Strong, because cats are similar.",
        "It is a valid deduction.",
      ],
    },
    {
      prompt:
        "Someone argues a new café must be good because it is always busy. What hidden assumption does this rely on?",
      options: [
        "That busy places are good — which isn't always true.",
        "That the café sells coffee.",
        "That the café is new.",
        "That cafés can be busy.",
      ],
    },
    {
      prompt:
        "A study finds people who carry umbrellas have more accidents. What is the most likely explanation?",
      options: [
        "Rainy days cause both umbrellas and accidents.",
        "Umbrellas cause accidents.",
        "Accidents make people buy umbrellas.",
        "There is no possible explanation.",
      ],
    },
  ],
};

const FALLBACK_WRITTEN_BANK: Record<
  Kind,
  { prompt: string; modelAnswer: string; gradingNote: string }[]
> = {
  subject: [
    {
      prompt:
        "In one sentence: if most days a café sells 40 coffees but yesterday it sold 80, what is one good question to ask about yesterday?",
      modelAnswer:
        "Ask what was different yesterday (e.g. an event, weather, or promotion) that could explain the doubling.",
      gradingNote: "Names a possible cause/context to investigate the spike.",
    },
    {
      prompt:
        "In one sentence: why might asking only your friends 'what's the most popular hobby?' give a misleading answer?",
      modelAnswer:
        "Your friends aren't a fair sample of everyone, so their answers may not represent the whole group.",
      gradingNote: "Identifies that a small/biased sample isn't representative.",
    },
    {
      prompt:
        "In one or two sentences: a chart's vertical axis starts at 95 instead of 0. How could that mislead a reader?",
      modelAnswer:
        "Starting above zero makes small differences look much bigger than they really are.",
      gradingNote: "Notes the truncated axis exaggerates differences.",
    },
  ],
  reasoning: [
    {
      prompt:
        "In one sentence: a friend says 'it rained the last three Saturdays, so it will rain every Saturday.' Why is that reasoning weak?",
      modelAnswer:
        "Three cases are too few to support an 'always' rule — past Saturdays don't guarantee future ones.",
      gradingNote: "Identifies overgeneralization from too few cases.",
    },
    {
      prompt:
        "In one sentence: 'Everyone I asked likes this show, so it must be the most popular show on TV.' What's the flaw?",
      modelAnswer:
        "The people asked aren't a fair sample of all viewers, so the conclusion isn't supported.",
      gradingNote: "Points to a biased/unrepresentative sample.",
    },
    {
      prompt:
        "In one or two sentences: 'The rooster crows, then the sun rises, so the rooster makes the sun rise.' Why is this wrong?",
      modelAnswer:
        "Two things happening in order doesn't mean one causes the other — the timing is a coincidence.",
      gradingNote: "Identifies the order-doesn't-prove-cause error.",
    },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Produce a prompt distinct from everything in `seen` by appending an
// incrementing scenario label until it no longer collides. Records the result.
function uniquePrompt(base: string, seen: Set<string>): string {
  if (!seen.has(normPrompt(base))) {
    seen.add(normPrompt(base));
    return base;
  }
  for (let n = 2; ; n++) {
    const candidate = `(Scenario ${n}) ${base}`;
    if (!seen.has(normPrompt(candidate))) {
      seen.add(normPrompt(candidate));
      return candidate;
    }
  }
}

function fallbackMcq(
  kind: Kind,
  count: number,
  avoidPrompts: string[] = [],
): GeneratedItemContent[] {
  if (count <= 0) return [];
  // Seed the seen-set with prior-attempt prompts so the fallback path is fresh
  // across retakes too, not just within one attempt.
  const seen = new Set<string>(avoidPrompts.map(normPrompt));
  const bank = shuffle(FALLBACK_MCQ_BANK[kind]);
  return Array.from({ length: count }, (_, i) => {
    const base = bank[i % bank.length]!;
    const prompt = uniquePrompt(base.prompt, seen);
    const { options, correctIndex } = rotateOptions(base.options.slice());
    return {
      type: "mcq" as const,
      prompt,
      payload: { options } satisfies McqPayload,
      scoring: { correctIndex } satisfies McqScoring,
    };
  });
}

function fallbackWritten(
  kind: Kind,
  count: number,
  avoidPrompts: string[] = [],
): GeneratedItemContent[] {
  if (count <= 0) return [];
  const seen = new Set<string>(avoidPrompts.map(normPrompt));
  const bank = shuffle(FALLBACK_WRITTEN_BANK[kind]);
  return Array.from({ length: count }, (_, i) => {
    const base = bank[i % bank.length]!;
    const prompt = uniquePrompt(base.prompt, seen);
    return {
      type: "written" as const,
      prompt,
      payload: {},
      scoring: {
        modelAnswer: base.modelAnswer,
        gradingNote: base.gradingNote,
      } satisfies WrittenScoring,
    };
  });
}

// Generate the full item set for one attempt of the given configuration.
export async function generateItems(
  kind: Kind,
  format: Format,
  length: Length,
  opts: { avoidPrompts: string[]; lectureText?: string },
): Promise<GeneratedItemContent[]> {
  const counts = itemCounts(format, length);

  let mcq: GeneratedItemContent[];
  try {
    mcq = await generateMcqItems(kind, counts.mcq, opts);
  } catch (err) {
    logger.warn(
      { kind, format, length, err: err instanceof Error ? err.message : String(err) },
      "mcq generation failed; using fallback items",
    );
    mcq = fallbackMcq(kind, counts.mcq, opts.avoidPrompts);
  }

  let written: GeneratedItemContent[];
  try {
    written = await generateWrittenItems(kind, counts.written, opts);
  } catch (err) {
    logger.warn(
      { kind, format, length, err: err instanceof Error ? err.message : String(err) },
      "written generation failed; using fallback items",
    );
    written = fallbackWritten(kind, counts.written, opts.avoidPrompts);
  }

  return [...mcq, ...written];
}

// ===========================================================================
// Grading
// ===========================================================================

// Lenient LLM grading of short-answer items. Returns a verdict per item id.
// Falls back to a token-overlap heuristic if the model is unavailable.
async function gradeWritten(
  items: DiagnosticItemRow[],
  responses: ResponseInput[],
): Promise<Record<number, { correct: boolean; rationale: string }>> {
  const written = items.filter((it) => it.type === "written");
  const result: Record<number, { correct: boolean; rationale: string }> = {};
  if (written.length === 0) return result;
  const byItem = new Map(responses.map((r) => [r.itemId, r]));

  const graded = written.map((it) => {
    const resp = byItem.get(it.id);
    const answer = (resp?.writtenAnswer ?? "").trim();
    const scoring = it.scoring as WrittenScoring;
    return { it, answer, scoring };
  });

  try {
    const out = await chatJson<{
      answers?: { id: number; correct: boolean; rationale?: string }[];
    }>(
      "You are a lenient but fair grader of SHORT answers. For each question decide whether the student's answer is essentially correct — i.e. it captures the key idea described by the model answer and grading note. Be generous about wording, brevity, and spelling; a short answer that shows the right understanding is correct. Mark incorrect only if it is empty, off-topic, or misses the core idea. " +
        'Return strict JSON {"answers":[{"id":number,"correct":boolean,"rationale":"one short sentence"}]} with one entry per question id.',
      JSON.stringify({
        questions: graded.map((g) => ({
          id: g.it.id,
          question: g.it.prompt,
          modelAnswer: g.scoring.modelAnswer,
          gradingNote: g.scoring.gradingNote,
          studentAnswer: g.answer,
        })),
      }),
    );
    for (const a of out.answers ?? []) {
      if (typeof a.id !== "number" || typeof a.correct !== "boolean") continue;
      result[a.id] = {
        correct: a.correct,
        rationale:
          typeof a.rationale === "string" && a.rationale.trim().length > 0
            ? a.rationale.trim()
            : a.correct
              ? "Captures the key idea."
              : "Misses the key idea.",
      };
    }
  } catch (err) {
    logger.warn({ err }, "gradeWritten failed; using heuristic fallback");
  }

  // Fill any item the model didn't return with a heuristic verdict.
  for (const g of graded) {
    if (result[g.it.id]) continue;
    if (g.answer.length === 0) {
      result[g.it.id] = { correct: false, rationale: "No answer was given." };
      continue;
    }
    const model = g.scoring.modelAnswer.toLowerCase();
    const ans = g.answer.toLowerCase();
    const modelWords = new Set(model.split(/\W+/).filter((w) => w.length > 3));
    const ansWords = new Set(ans.split(/\W+/).filter((w) => w.length > 3));
    let overlap = 0;
    for (const w of ansWords) if (modelWords.has(w)) overlap += 1;
    const ratio = modelWords.size > 0 ? overlap / modelWords.size : 0;
    const correct = ratio >= 0.2;
    result[g.it.id] = {
      correct,
      rationale: correct
        ? "Overlaps with the key idea of the model answer."
        : "Does not clearly cover the key idea of the model answer.",
    };
  }
  return result;
}

// A per-question review row: the item, the student's answer, and the correct
// answer / verdict. Built after submission so the student can see their work.
export interface ReviewItem {
  itemId: number;
  type: "mcq" | "written";
  prompt: string;
  options: string[] | null;
  selectedIndex: number | null;
  correctIndex: number | null;
  writtenAnswer: string | null;
  modelAnswer: string | null;
  rationale: string | null;
  isCorrect: boolean | null;
}

export interface GradeResult {
  summary: ScoreSummary;
  review: ReviewItem[];
}

// Grade a whole attempt: trust the generated key for mcq (low-stakes), and
// LLM-grade written items leniently. Returns a score summary and per-question
// review with everything the client and the persistence layer need.
export async function gradeAttempt(
  kind: Kind,
  items: DiagnosticItemRow[],
  responses: ResponseInput[],
): Promise<GradeResult> {
  const byItem = new Map(responses.map((r) => [r.itemId, r]));
  const writtenVerdicts = await gradeWritten(items, responses);

  const correctByItem: Record<number, number> = {};
  let correct = 0;
  let mcqCorrect = 0;
  let mcqTotal = 0;
  let writtenCorrect = 0;
  let writtenTotal = 0;

  const review: ReviewItem[] = items.map((item) => {
    const resp = byItem.get(item.id);
    if (item.type === "mcq") {
      mcqTotal += 1;
      const payload = item.payload as McqPayload;
      const scoring = item.scoring as McqScoring;
      correctByItem[item.id] = scoring.correctIndex;
      const selectedIndex =
        typeof resp?.selectedIndex === "number" ? resp.selectedIndex : null;
      const isCorrect =
        selectedIndex === null ? false : selectedIndex === scoring.correctIndex;
      if (isCorrect) {
        correct += 1;
        mcqCorrect += 1;
      }
      return {
        itemId: item.id,
        type: "mcq" as const,
        prompt: item.prompt,
        options: payload.options,
        selectedIndex,
        correctIndex: scoring.correctIndex,
        writtenAnswer: null,
        modelAnswer: null,
        rationale: null,
        isCorrect: selectedIndex === null ? null : isCorrect,
      };
    }
    writtenTotal += 1;
    const scoring = item.scoring as WrittenScoring;
    const verdict = writtenVerdicts[item.id] ?? {
      correct: false,
      rationale: "Not graded.",
    };
    const writtenAnswer = (resp?.writtenAnswer ?? "").trim() || null;
    if (verdict.correct) {
      correct += 1;
      writtenCorrect += 1;
    }
    return {
      itemId: item.id,
      type: "written" as const,
      prompt: item.prompt,
      options: null,
      selectedIndex: null,
      correctIndex: null,
      writtenAnswer,
      modelAnswer: scoring.modelAnswer,
      rationale: verdict.rationale,
      isCorrect: writtenAnswer === null ? null : verdict.correct,
    };
  });

  const total = items.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const metrics: ReasoningMetric[] = [
    { label: "Overall", value: `${correct} / ${total} (${percent}%)` },
  ];
  if (mcqTotal > 0) {
    metrics.push({ label: "Multiple choice", value: `${mcqCorrect} / ${mcqTotal}` });
  }
  if (writtenTotal > 0) {
    metrics.push({ label: "Written", value: `${writtenCorrect} / ${writtenTotal}` });
  }

  const summary: ScoreSummary = {
    kind,
    headline: `You answered ${correct} of ${total} correctly (${percent}%).`,
    metrics,
    correctByItem,
    writtenById: writtenVerdicts,
  };
  return { summary, review };
}

// --- Written feedback (AI with deterministic fallback) --------------------

function deterministicFeedback(summary: ScoreSummary): string {
  const overall = summary.metrics.find((m) => m.label === "Overall");
  const lead =
    summary.kind === "subject"
      ? "Thank you for completing this data-analytics check."
      : "Thank you for completing this reasoning check.";
  const close =
    summary.kind === "subject"
      ? "Keep practicing how to notice what data shows, compare fairly, and move from evidence to a sensible decision."
      : "Keep practicing how to separate what is stated from what is merely assumed, and follow only what the evidence supports.";
  return `${lead} ${overall ? `You scored ${overall.value}.` : ""} This diagnostic does not affect your grade — it's a snapshot of where you are. ${close}`;
}

export async function generateFeedback(
  assessmentTitle: string,
  summary: ScoreSummary,
): Promise<string> {
  const metricsText = summary.metrics
    .map((m) => `- ${m.label}: ${m.value}${m.detail ? ` (${m.detail})` : ""}`)
    .join("\n");
  const system =
    summary.kind === "subject"
      ? "You are a data-analytics instructor giving warm, specific feedback on a student's ungraded mastery check. 2-4 sentences. Note overall performance and one concrete way to improve a data skill. Use only the metrics provided; do not invent numbers. Mention that the check does not affect their grade. Plain prose, no markdown headings."
      : "You are an instructor giving warm, specific feedback on a student's ungraded general-reasoning check. 2-4 sentences. Note overall performance and one concrete way to reason more carefully. Use only the metrics provided; do not invent numbers. Mention that the check does not affect their grade. Plain prose, no markdown headings.";
  const user = `Assessment: ${assessmentTitle}\nResult summary: ${summary.headline}\nMetrics:\n${metricsText}`;
  try {
    const text = await chatText(system, user);
    if (text && text.length > 20) return text;
  } catch {
    // fall through to deterministic feedback
  }
  return deterministicFeedback(summary);
}

// Reconstruct the per-question review for an already-submitted attempt using
// the verdicts persisted on the score summary — no LLM re-grading. Used when a
// student reopens a submitted attempt to review their work.
export function buildReview(
  items: DiagnosticItemRow[],
  responses: ResponseInput[],
  summary: ScoreSummary | null,
): ReviewItem[] {
  const byItem = new Map(responses.map((r) => [r.itemId, r]));
  const correctByItem = summary?.correctByItem ?? {};
  const writtenById = summary?.writtenById ?? {};
  return items.map((item) => {
    const resp = byItem.get(item.id);
    if (item.type === "mcq") {
      const payload = item.payload as McqPayload;
      const scoring = item.scoring as McqScoring;
      const correctIndex = correctByItem[item.id] ?? scoring.correctIndex;
      const selectedIndex =
        typeof resp?.selectedIndex === "number" ? resp.selectedIndex : null;
      return {
        itemId: item.id,
        type: "mcq" as const,
        prompt: item.prompt,
        options: payload.options,
        selectedIndex,
        correctIndex,
        writtenAnswer: null,
        modelAnswer: null,
        rationale: null,
        isCorrect: selectedIndex === null ? null : selectedIndex === correctIndex,
      };
    }
    const scoring = item.scoring as WrittenScoring;
    const verdict = writtenById[item.id];
    const writtenAnswer = (resp?.writtenAnswer ?? "").trim() || null;
    return {
      itemId: item.id,
      type: "written" as const,
      prompt: item.prompt,
      options: null,
      selectedIndex: null,
      correctIndex: null,
      writtenAnswer,
      modelAnswer: scoring.modelAnswer,
      rationale: verdict?.rationale ?? null,
      isCorrect: writtenAnswer === null ? null : (verdict?.correct ?? false),
    };
  });
}

// Strip the hidden scoring key before sending an item to the client.
export function publicItem(item: DiagnosticItemRow) {
  const base = {
    id: item.id,
    position: item.position,
    type: item.type,
    prompt: item.prompt,
  };
  if (item.type === "mcq") {
    const payload = item.payload as McqPayload;
    return { ...base, options: payload.options };
  }
  return { ...base, options: null };
}
