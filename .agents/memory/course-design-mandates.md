---
name: Course design mandates (Data Detective)
description: Non-obvious user mandates about the AI course UX that look removable but are intentional and must be preserved.
---

# Course design mandates

These are explicit user requirements that a future agent might wrongly "clean up"
because they seem unwarranted for a plain-language, no-math course. They are intentional.

## Math keyboard is mandatory everywhere
A symbol palette (`MathKeyboard`) must be present on EVERY freeform input — answer
inputs (practice, practice-assignments, real assignments) AND the AI tutor chat
boxes — even though the course subject is non-technical and "doesn't seem to warrant it."

**Why:** Direct user mandate ("MAKE SURE THE MATH KEYBOARD IS PRESENT, INCLUDING WITH
AI TUTOR, EVEN IF THE SUBJECT-MATTER DOES NOT SEEM TO WARRANT IT").
**How to apply:** Do not remove the keyboard from any input. Math-keyboard insertions
must count as `keystrokeCount` (not bulk-insert) in the keystroke
trace, or legitimate symbol use false-flags the AI-authorship detector.

## Questions must require operational reasoning, never recitation
ALL questions — homeworks, unit test, final, practice assignments, AND the adaptive
topic drill — must pose a specific concrete scenario and require a multi-sentence
reasoned answer. Never a one-word/single-term/"yes-no" answer, never "define X" or
"recite the abstract formulation from the text."

**Why:** Repeated, emphatic user mandate — answers must be "hard to share" and prove
operational understanding, not memorization. The adaptive drill previously generated
single-word concept-ID questions and was the one place that violated this.
**How to apply:** Any new question-generation prompt must forbid definitions/one-word
answers and demand a concrete case + reasoned answer. The semantic `gradeAnswer` grader
already handles reasoned answers, so longer answers are safe to grade.

## Course must read as adult/professional, never childish
The audience is adults entering a new discipline (grad students, postdocs, faculty). The
app name is literal/utilitarian ("Basic X", e.g. "Basic Data Analytics") — never "X for
Children" / "for Kids". Strip ALL childish framing: no children/baby/kid wording, no
"no math!"-style marketing leads, and no classroom-child example contexts (recess,
allowance, "kids in our class", "walk to school", "grown-up analyst", school-snack/lunch
surveys). Replace example contexts with everyday/workplace ones (team, office, commute,
budget, coffee, reports).

**Why:** Emphatic user mandate — framing the course as "for children" slanders a serious
course for professional adults. The subject-matter exception (keep child references only
when the subject is inherently about children, e.g. developmental psychology) does NOT
apply to data analytics, so running classroom-child examples is off-limits here.
**How to apply:** When editing lecture bodies OR answer keys, change example contexts in
lockstep so each lecture↔key pair stays consistent, then bump `SEED_CONTENT_VERSION` to
trigger the self-heal reseed. Keep genuine code (`React.children`) and inclusive phrases
("Data Analytics for Everyone"). Any promo/video YouTube `og:title` must be EXACTLY
"Basic Data Analytics — AI-Powered Course" with no extra descriptors.
