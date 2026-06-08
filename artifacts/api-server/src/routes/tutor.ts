import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, lecturesTable } from "@workspace/db";
import { AskTutorBody, AskTutorResponse } from "@workspace/api-zod";
import { chatText, chatJson, FAST_MODEL } from "../lib/ai";

const router: IRouter = Router();

router.get("/tutor/suggestions/:lectureId", async (req, res): Promise<void> => {
  const lectureId = Number(req.params.lectureId);
  if (!Number.isFinite(lectureId)) {
    res.status(400).json({ error: "invalid lectureId" });
    return;
  }
  const [lecture] = await db
    .select()
    .from(lecturesTable)
    .where(eq(lecturesTable.id, lectureId));
  if (!lecture) {
    res.status(404).json({ error: "lecture not found" });
    return;
  }

  try {
    const out = await chatJson<{ questions: string[] }>(
      'You are a rigorous college ethics tutor writing study questions. Reply as strict JSON of the form {"questions": string[]} with NO other keys.',
      `From the lecture below, write 6 starter questions a thoughtful student would ask to deepen their UNDERSTANDING of the material — questions that probe reasoning, distinctions, justification, or application, not trivia or recall.\n\n` +
        `Cover several different major ideas in the reading (not just the first one).\n\n` +
        `RULES FOR EVERY QUESTION — no exceptions:\n` +
        `1. Be precise and well-formed. Do NOT presuppose a single answer when several exist. Never write "What is THE difference between X and Y?" when X and Y differ in several ways — instead ask "How do X and Y differ?" or "What distinguishes X from Y, and why does it matter for ethics?".\n` +
        `2. Probe understanding, not memorization. Prefer "why", "how", "what follows if", "how would you decide", "what is an example of", "how does X relate to Y". Avoid yes/no questions and avoid questions answerable by quoting one sentence.\n` +
        `3. Be specific to THIS lecture's actual concepts and examples — name them. No generic filler that could apply to any reading.\n` +
        `4. One clear sentence each, roughly 8–22 words, in the student's own voice. No compound double-questions.\n` +
        `5. Use $...$ for any inline math.\n\n` +
        `Return exactly 6 questions.\n\nLECTURE TITLE: ${lecture.title}\n\nLECTURE BODY:\n"""\n${lecture.body}\n"""`,
      FAST_MODEL,
    );
    const questions = Array.isArray(out?.questions)
      ? out.questions.filter((q) => typeof q === "string" && q.trim().length > 0).slice(0, 8)
      : [];
    res.json({ questions });
  } catch {
    res.json({ questions: [] });
  }
});

router.post("/tutor/ask", async (req, res): Promise<void> => {
  const parsed = AskTutorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { message, selectedLectureText } = parsed.data;

  const sys =
    "You are an encouraging college ethics tutor. Explain step by step, use clear examples and thought experiments, and define key terms (e.g. normative, intrinsic, privative) when they come up. Keep replies short (3-6 sentences) unless the student asks for more detail. Never just give the answer — guide them.";
  const user = selectedLectureText
    ? `Context from the lecture the student is reading:\n"""\n${selectedLectureText}\n"""\n\nStudent question: ${message}`
    : message;

  let text = "";
  try {
    text = await chatText(sys, user);
  } catch {
    text =
      "I'm having trouble reaching the tutor service right now. Try again in a moment, and consider re-reading the relevant section of the lecture.";
  }
  res.json(AskTutorResponse.parse({ text, audioUrl: null }));
});

export default router;
