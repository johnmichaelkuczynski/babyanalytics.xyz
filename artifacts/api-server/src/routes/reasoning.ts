import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  attemptsTable,
  lecturesTable,
  diagnosticAssessmentsTable,
  diagnosticItemsTable,
  diagnosticAttemptsTable,
  diagnosticResponsesTable,
} from "@workspace/db";
import {
  ListReasoningAssessmentsResponse,
  GetReasoningAssessmentResponse,
  StartReasoningAttemptResponse,
  StartReasoningAttemptBody,
  SubmitReasoningAttemptResponse,
  SubmitReasoningAttemptBody,
  GetGradebookResponse,
} from "@workspace/api-zod";
import {
  generateItems,
  gradeAttempt,
  generateFeedback,
  buildReview,
  publicItem,
  type DiagnosticItemRow,
  type GeneratedItemContent,
  type ResponseInput,
  type ReasoningMetric,
  type ScoreSummary,
} from "../lib/reasoning";
import {
  totalItemCount,
  type Kind,
  type Format,
  type Length,
  type Phase,
} from "../lib/diagnosticContent";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

type ItemRowRaw = typeof diagnosticItemsTable.$inferSelect;

function mapItemRows(rows: ItemRowRaw[]): DiagnosticItemRow[] {
  return rows.map((r) => ({
    id: r.id,
    position: r.position,
    type: r.type as "mcq" | "written",
    prompt: r.prompt,
    payload: r.payload,
    scoring: r.scoring,
  }));
}

// The items generated for a specific attempt (every attempt has its own).
async function loadAttemptItems(attemptId: number): Promise<DiagnosticItemRow[]> {
  const rows = await db
    .select()
    .from(diagnosticItemsTable)
    .where(eq(diagnosticItemsTable.attemptId, attemptId))
    .orderBy(asc(diagnosticItemsTable.position));
  return mapItemRows(rows);
}

// Prompts already used by any prior attempt of this assessment, so freshly
// generated questions never repeat earlier ones.
async function priorPrompts(assessmentId: number): Promise<string[]> {
  // Most-recent first so the generator's avoid-list cap keeps the freshest
  // history (the questions a retake is most likely to accidentally repeat).
  const rows = await db
    .select({ prompt: diagnosticItemsTable.prompt })
    .from(diagnosticItemsTable)
    .where(eq(diagnosticItemsTable.assessmentId, assessmentId))
    .orderBy(desc(diagnosticItemsTable.id));
  return rows.map((r) => r.prompt);
}

// For SUBJECT diagnostics we ground generation in the actual course material so
// the questions verify the skills the course teaches. Returns concatenated
// lecture text (bounded by the generator).
let lectureTextCache: { text: string; at: number } | null = null;
async function loadLectureText(): Promise<string> {
  if (lectureTextCache && Date.now() - lectureTextCache.at < 5 * 60_000) {
    return lectureTextCache.text;
  }
  const rows = await db
    .select({ title: lecturesTable.title, body: lecturesTable.body })
    .from(lecturesTable)
    .orderBy(asc(lecturesTable.weekNumber));
  const text = rows.map((r) => `## ${r.title}\n${r.body}`).join("\n\n");
  lectureTextCache = { text, at: Date.now() };
  return text;
}

// Persist freshly generated items, tagged to an attempt.
async function insertAttemptItems(
  assessmentId: number,
  attemptId: number,
  contents: GeneratedItemContent[],
): Promise<void> {
  if (contents.length === 0) return;
  await db.insert(diagnosticItemsTable).values(
    contents.map((c, i) => ({
      assessmentId,
      attemptId,
      position: i,
      type: c.type,
      prompt: c.prompt,
      payload: c.payload,
      scoring: c.scoring,
    })),
  );
}

router.get("/reasoning/assessments", async (_req, res) => {
  const assessments = await db
    .select()
    .from(diagnosticAssessmentsTable)
    .orderBy(asc(diagnosticAssessmentsTable.position));
  const result = await Promise.all(
    assessments.map(async (a) => {
      const attempts = await db
        .select()
        .from(diagnosticAttemptsTable)
        .where(eq(diagnosticAttemptsTable.assessmentId, a.id))
        .orderBy(asc(diagnosticAttemptsTable.id));
      const submitted = attempts.find((x) => x.status === "submitted");
      const inProgress = attempts.find((x) => x.status === "in_progress");
      const status: "not_started" | "in_progress" | "passed" = submitted
        ? "passed"
        : inProgress
          ? "in_progress"
          : "not_started";
      const last = attempts[attempts.length - 1];
      return {
        id: a.id,
        kind: a.kind as Kind,
        format: a.format as Format,
        length: a.length as Length,
        phase: a.phase as Phase,
        title: a.title,
        subtitle: a.subtitle,
        itemCount: totalItemCount(a.format as Format, a.length as Length),
        status,
        lastAttemptId: last?.id ?? null,
      };
    }),
  );
  res.json(ListReasoningAssessmentsResponse.parse(result));
});

router.get("/reasoning/assessments/:assessmentId", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.assessmentId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [a] = await db
    .select()
    .from(diagnosticAssessmentsTable)
    .where(eq(diagnosticAssessmentsTable.id, id));
  if (!a) {
    res.status(404).json({ error: "not found" });
    return;
  }
  // Items are generated fresh per attempt; the assessment itself exposes none.
  res.json(
    GetReasoningAssessmentResponse.parse({
      id: a.id,
      kind: a.kind as Kind,
      format: a.format as Format,
      length: a.length as Length,
      phase: a.phase as Phase,
      title: a.title,
      subtitle: a.subtitle,
      instructions: a.instructions,
      items: [],
    }),
  );
});

router.post("/reasoning/assessments/:assessmentId/start", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.assessmentId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const parsedBody = StartReasoningAttemptBody.safeParse(req.body ?? {});
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }
  const retake = parsedBody.data.retake === true;

  const [a] = await db
    .select()
    .from(diagnosticAssessmentsTable)
    .where(eq(diagnosticAssessmentsTable.id, id));
  if (!a) {
    res.status(404).json({ error: "assessment not found" });
    return;
  }

  // Resume an in-progress attempt if one exists (so a refresh mid-assessment
  // never loses progress). On a normal open we surface an already-submitted
  // attempt for review; on a retake we start a brand-new attempt.
  const existing = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.assessmentId, id))
    .orderBy(asc(diagnosticAttemptsTable.id));
  const reusable = retake
    ? existing.find((x) => x.status === "in_progress")
    : (existing.find((x) => x.status === "in_progress") ??
      existing.find((x) => x.status === "submitted"));
  if (reusable) {
    const items = await loadAttemptItems(reusable.id);
    const reviewed = reusable.status === "submitted";
    const summary = reviewed
      ? (reusable.scoreSummary as ScoreSummary | null)
      : null;
    const storedResponses = reviewed
      ? ((reusable.responses as ResponseInput[] | null) ?? [])
      : [];
    res.json(
      StartReasoningAttemptResponse.parse({
        id: reusable.id,
        assessmentId: reusable.assessmentId,
        status: reusable.status as "in_progress" | "submitted",
        startedAt: reusable.startedAt.toISOString(),
        submittedAt: reusable.submittedAt?.toISOString() ?? null,
        passed: reusable.passed,
        feedback: reusable.feedback,
        headline: summary?.headline ?? null,
        metrics: (summary?.metrics as ReasoningMetric[] | undefined) ?? null,
        review: reviewed ? buildReview(items, storedResponses, summary) : null,
        items: items.map(publicItem),
      }),
    );
    return;
  }

  const [created] = await db
    .insert(diagnosticAttemptsTable)
    .values({ assessmentId: id, status: "in_progress" })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed to create" });
    return;
  }

  // Generate fresh, never-repeated questions for this attempt of the chosen
  // kind, format, and length. Subject diagnostics are grounded in course text.
  const kind = a.kind as Kind;
  const avoidPrompts = await priorPrompts(id);
  const lectureText = kind === "subject" ? await loadLectureText() : undefined;
  const generated = await generateItems(
    kind,
    a.format as Format,
    a.length as Length,
    { avoidPrompts, lectureText },
  );
  await insertAttemptItems(id, created.id, generated);
  const items = await loadAttemptItems(created.id);

  res.json(
    StartReasoningAttemptResponse.parse({
      id: created.id,
      assessmentId: created.assessmentId,
      status: "in_progress",
      startedAt: created.startedAt.toISOString(),
      submittedAt: null,
      passed: null,
      feedback: null,
      items: items.map(publicItem),
    }),
  );
});

router.post("/reasoning/assessments/:assessmentId/submit", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.assessmentId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const parsed = SubmitReasoningAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [a] = await db
    .select()
    .from(diagnosticAssessmentsTable)
    .where(eq(diagnosticAssessmentsTable.id, id));
  if (!a) {
    res.status(404).json({ error: "assessment not found" });
    return;
  }

  const responses = parsed.data.responses as ResponseInput[];

  // Attach to the in-progress attempt if present, else the most recent one.
  // Score against THAT attempt's own generated items.
  const attempts = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.assessmentId, id))
    .orderBy(asc(diagnosticAttemptsTable.id));
  const target =
    attempts.find((x) => x.status === "in_progress") ??
    attempts[attempts.length - 1];
  if (!target) {
    res.status(400).json({ error: "no attempt to submit" });
    return;
  }

  const items = await loadAttemptItems(target.id);
  const kind = a.kind as Kind;
  const { summary, review } = await gradeAttempt(kind, items, responses);
  const feedback = await generateFeedback(a.title, summary);

  // Pass/Fail policy: submitting the diagnostic completes it (always a pass).
  // Diagnostics never affect the course grade.
  const passed = true;

  await db
    .update(diagnosticAttemptsTable)
    .set({
      status: "submitted",
      passed,
      feedback,
      responses,
      scoreSummary: summary,
      submittedAt: new Date(),
    })
    .where(eq(diagnosticAttemptsTable.id, target.id));

  // Persist one normalized row per item (replacing any prior rows). isCorrect
  // comes from the review (set for both mcq and written items).
  await db
    .delete(diagnosticResponsesTable)
    .where(eq(diagnosticResponsesTable.attemptId, target.id));
  const byItem = new Map(responses.map((r) => [r.itemId, r]));
  const byReview = new Map(review.map((r) => [r.itemId, r]));
  const rows = items.map((item) => {
    const resp = byItem.get(item.id);
    const rev = byReview.get(item.id);
    return {
      attemptId: target.id,
      itemId: item.id,
      selectedIndex: resp?.selectedIndex ?? null,
      writtenAnswer: resp?.writtenAnswer ?? null,
      isCorrect: rev?.isCorrect ?? null,
    };
  });
  if (rows.length > 0) {
    await db.insert(diagnosticResponsesTable).values(rows);
  }

  res.json(
    SubmitReasoningAttemptResponse.parse({
      attemptId: target.id,
      passed,
      feedback,
      headline: summary.headline,
      metrics: summary.metrics,
      review,
    }),
  );
});

router.get("/reasoning/grades", async (_req, res) => {
  // Coursework is 100% of the grade; diagnostics are ungraded.
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .orderBy(asc(assignmentsTable.weekNumber), asc(assignmentsTable.position));
  const coursework = await Promise.all(
    assignments.map(async (a) => {
      const attempts = await db
        .select()
        .from(attemptsTable)
        .where(eq(attemptsTable.assignmentId, a.id));
      const submitted = attempts.filter((x) => x.status === "submitted");
      const inProgress = attempts.some((x) => x.status === "in_progress");
      const best = submitted.reduce(
        (b, x) => (x.scorePercent != null && x.scorePercent > b ? x.scorePercent : b),
        -1,
      );
      const status: "not_started" | "in_progress" | "submitted" =
        submitted.length > 0 ? "submitted" : inProgress ? "in_progress" : "not_started";
      return {
        id: a.id,
        kind: a.kind as "homework" | "test" | "midterm" | "final",
        title: a.title,
        weekNumber: a.weekNumber,
        status,
        bestScore: best < 0 ? null : best,
      };
    }),
  );
  const courseworkAvg =
    coursework.length === 0
      ? 0
      : coursework.reduce((s, c) => s + (c.bestScore ?? 0), 0) / coursework.length;

  const overall = courseworkAvg;
  const letterGrade =
    overall >= 90
      ? "A"
      : overall >= 80
        ? "B"
        : overall >= 70
          ? "C"
          : overall >= 60
            ? "D"
            : "F";

  res.json(
    GetGradebookResponse.parse({
      overallPercent: Math.round(overall * 10) / 10,
      letterGrade,
      components: [
        {
          key: "coursework",
          label: "Coursework",
          weightPercent: 100,
          earnedPercent: Math.round(courseworkAvg * 10) / 10,
          detail: `Average ${Math.round(courseworkAvg)}% across ${coursework.length} assignments`,
        },
      ],
      coursework,
    }),
  );
});

export default router;
