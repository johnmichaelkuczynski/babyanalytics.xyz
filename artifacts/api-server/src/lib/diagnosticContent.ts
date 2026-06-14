// ---------------------------------------------------------------------------
// Configuration for the diagnostic assessments.
//
// Diagnostics are independent, ungraded ability checks offered along four
// dimensions:
//   - KIND:   subject (data-analytics mastery) | reasoning (general reasoning)
//   - FORMAT: mcq | written | hybrid
//   - LENGTH: short | medium | long
//   - PHASE:  before | during1 | during2 | after
//
// The full catalog is the cross product (2 × 3 × 3 × 4 = 72 selectable
// configurations). No questions are stored here — every attempt generates
// fresh, never-repeated items (see reasoning.ts). This module only describes
// the catalog: how many of each item type a configuration contains, and the
// human-facing titles, subtitles, and instructions.
// ---------------------------------------------------------------------------

export type Kind = "subject" | "reasoning";
export type Format = "mcq" | "written" | "hybrid";
export type Length = "short" | "medium" | "long";
export type Phase = "before" | "during1" | "during2" | "after";

export const KINDS: Kind[] = ["subject", "reasoning"];
export const FORMATS: Format[] = ["mcq", "written", "hybrid"];
export const LENGTHS: Length[] = ["short", "medium", "long"];
export const PHASES: Phase[] = ["before", "during1", "during2", "after"];

export const KIND_LABELS: Record<Kind, string> = {
  subject: "Subject Mastery",
  reasoning: "General Reasoning",
};

export const FORMAT_LABELS: Record<Format, string> = {
  mcq: "Multiple choice",
  written: "Written",
  hybrid: "Hybrid",
};

export const LENGTH_LABELS: Record<Length, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

export const PHASE_LABELS: Record<Phase, string> = {
  before: "Before the course",
  during1: "During the course — checkpoint 1",
  during2: "During the course — checkpoint 2",
  after: "After the course",
};

// Item counts. MCQ-only and written-only formats use the full count for that
// type; hybrid splits roughly evenly between the two.
const MCQ_COUNTS: Record<Length, number> = { short: 4, medium: 8, long: 15 };
const WRITTEN_COUNTS: Record<Length, number> = { short: 2, medium: 4, long: 6 };
const HYBRID_MCQ: Record<Length, number> = { short: 2, medium: 4, long: 6 };
const HYBRID_WRITTEN: Record<Length, number> = { short: 2, medium: 4, long: 6 };

export type ItemCounts = { mcq: number; written: number };

export function itemCounts(format: Format, length: Length): ItemCounts {
  if (format === "mcq") return { mcq: MCQ_COUNTS[length], written: 0 };
  if (format === "written") return { mcq: 0, written: WRITTEN_COUNTS[length] };
  return { mcq: HYBRID_MCQ[length], written: HYBRID_WRITTEN[length] };
}

export function totalItemCount(format: Format, length: Length): number {
  const c = itemCounts(format, length);
  return c.mcq + c.written;
}

function instructionsFor(kind: Kind, format: Format): string {
  const closing =
    "Submitting completes the check and you'll receive written feedback. This diagnostic does not affect your course grade, and you can retake it as many times as you like — you'll get fresh questions every time.";
  const subject =
    kind === "subject"
      ? "These questions independently check your data-analytics ability — the plain-language skills of noticing, comparing, grouping, and reading what data shows."
      : "These questions check your general reasoning ability. They do not test course facts; answer using careful, everyday thinking.";
  let how: string;
  if (format === "mcq") {
    how = "Select the single best option for each question.";
  } else if (format === "written") {
    how =
      "Answer each question in a sentence or two — keep it short and to the point. No long essays are needed.";
  } else {
    how =
      "Some questions are multiple choice; others ask for a short written answer of a sentence or two. Keep written answers brief.";
  }
  return `${subject} ${how} ${closing}`;
}

export type CatalogEntry = {
  kind: Kind;
  format: Format;
  length: Length;
  phase: Phase;
  title: string;
  subtitle: string;
  instructions: string;
  position: number;
};

// Build the full 72-entry catalog. Position orders by kind, then format, then
// length, then phase so the listing is stable and groupable.
export function buildCatalog(): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  let position = 0;
  for (const kind of KINDS) {
    for (const format of FORMATS) {
      for (const length of LENGTHS) {
        for (const phase of PHASES) {
          entries.push({
            kind,
            format,
            length,
            phase,
            title: `${KIND_LABELS[kind]} — ${FORMAT_LABELS[format]}, ${LENGTH_LABELS[length]}`,
            subtitle: PHASE_LABELS[phase],
            instructions: instructionsFor(kind, format),
            position: position++,
          });
        }
      }
    }
  }
  return entries;
}

// Bump when the catalog shape or any catalog metadata changes so the seed
// re-populates the diagnostic_assessments table on the next boot.
export const DIAGNOSTIC_CATALOG_VERSION = "diag-v2-kinds-formats-lengths";
