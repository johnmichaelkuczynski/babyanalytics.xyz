# 📊 Data 101

**A One-Unit Foundations of Data Analytics Course — From the Analytics Workflow to SQL, pandas, and Dashboards**

---

## 🧩 Overview

Data 101 is a self-paced, single-user web course that teaches the foundations most analytics tutorials rush past: *what is this work, really?* What does an analyst actually do? How is data structured? How do you pull the rows you need, clean the mess that's left, analyze it, and turn the result into something a team can act on?

It is a complete, taught-and-graded data analytics course delivered end to end by AI: depth-adjustable lectures, a tutor that answers questions about the exact passage you're reading, adaptive practice that meets you at your level, and homework, a unit test, and a final that are graded with written feedback. The curriculum is one focused unit — the practical backbone an analyst meets in their first quarter — presented as six connected topics.

Designed for **students, self-learners, and instructors evaluating AI-taught coursework**, Data 101 pairs a real six-topic syllabus with a built-in academic-integrity layer — so the course is one students can trust to be fair, and instructors can trust to be honest.

---

## 🧠 What It Does

- **One-Unit Curriculum of 6 Topics** — A complete foundations syllabus, organized by the real analytics workflow:
  - **1.1 — What data analytics is and the workflow.** What an analyst does and how the work differs from guessing; the ask → collect → clean → analyze → communicate loop; and why skipping a stage is where bad conclusions come from.
  - **1.2 — Data types, structure, and spreadsheets.** Categorical vs. numeric, continuous vs. discrete; tidy rows-and-columns structure; and working with data in a spreadsheet (Excel / Google Sheets).
  - **1.3 — Querying data with SQL.** Pulling exactly the rows and columns you need with `SELECT`, `WHERE`, `GROUP BY`, and joins.
  - **1.4 — Cleaning and transforming data.** Handling missing values, fixing types and formats, deduplicating, and reshaping data into an analyzable form.
  - **1.5 — Analysis with Python (pandas).** Loading, filtering, grouping, and aggregating data in pandas to answer real questions.
  - **1.6 — Data visualization and dashboards.** Choosing the right chart, telling an honest story with data, and building dashboards in Tableau / Power BI.
- **One Real Example per Lecture** — Every topic grounds its idea in a concrete case — a churn investigation, a sales table with dates stored as text, a misleading y-axis — so abstractions always land on something you can picture.
- **Three-Depth Lectures** — Every lecture reads at **Short / Medium / Long** length, preserving the same examples and learning objectives. Skim the concept in a minute, expand it on demand, or read the full deep cut.
- **Section-Scoped AI Tutor** — Ask a question about the exact paragraph you're on and the answer streams back live, grounded in that lecture section. Suggested starter questions come ready for each lecture.
- **Adaptive Practice** — Problem sets that get harder as you build a streak and ease off after a miss, with an explanation on every answer. Your level carries over, so each drill picks up where the last left off.
- **Graded Assignments** — The unit ships with homework, a timed unit test, and a cumulative final exam. Every submission is graded with per-problem feedback and a percent score on the attempt.
- **Built-In Diagnostic Reasoning Assessments** — Two original reasoning instruments run alongside the coursework and measure how your thinking grows over the course:
  - **Ethical Reasoning (dilemma-based).** Read a data-work dilemma — a misleading chart, a question of using private user data — decide what the person should do, then rate how much each of a dozen considerations weighed on you and rank your top few — a behavioral measure of *which kinds of reasons* drive your judgment, not whether you picked a "correct" answer.
  - **Critical Reasoning (multiple-choice).** Ten questions spanning the five core thinking skills — analysis, inference, evaluation, deduction, and induction.
  - **Given twice each.** Once as a **baseline** before the unit, then again after it — so your end-of-course reasoning can be compared against where you started. Every question across both administrations is mutually unique, so retaking never means repeating an item.
  - **Pass on submit, with written feedback.** Completing an instrument counts as a pass and returns a plain-language critique of your reasoning; skipping it is a fail. The two diagnostics jointly count for **20% of your final grade**, with coursework the other **80%**.
  - **Built-in prep.** Short primer lectures teach the method behind each instrument before you sit it.
- **Built-In Academic-Integrity Check** — Every submitted answer is screened for signs of AI authorship, and each verdict comes with a plain-language explanation rather than an opaque flag.
- **Live Analytics** — A dashboard of progress at a glance: attempts, accuracy, and streak; per-topic mastery; and a recent-activity feed that surfaces weak spots and momentum.
- **Built-In Product Demo Video** — A short screencast of the live product ships alongside the course, so it can show itself without anyone narrating it.

---

## ⚙️ Technical Features

- **AI That Teaches at Your Depth** — Lectures rewrite themselves to the length you want without losing the examples or the point, so the same topic works for a quick refresher or a deep study session.
- **A Tutor That Stays on Topic** — Answers stream in live and stay anchored to the section you're reading, instead of wandering off into the whole syllabus.
- **Practice That Adapts in Real Time** — Difficulty tracks your performance from problem to problem, keeping you in the productive zone between "too easy" and "overwhelming."
- **Grading You Can Read** — Assignments are scored on whether your answer *means* the right thing, not whether it matches a string — and every result comes with a written rationale.
- **A Two-Layer Integrity Check** — Submissions are screened both for AI-style writing and for telltale authoring behavior, catching misuse that simple text checks miss — always with a human-readable reason.
- **Reasoning Diagnostics That Track Growth** — Two original, validated-style instruments — a dilemma-based ethical-reasoning inventory and a multiple-choice critical-reasoning test — are administered at baseline and after the unit. Each item across both administrations is unique, every individual response is stored for later review, and the gradebook folds the diagnostics and the coursework into one weighted score (20% / 80%).
- **Three One-Click Self-Tests** — The course can verify its own health end to end before you trust a session: a full system check, a simulated student run through the whole course, and an answer-key quality review that confirms every graded answer is sound.
- **A Real Demo, Not a Slideshow** — The walkthrough video is the actual product in motion — live typing, streaming answers, and synced audio — captured straight from the running app.

---

## 🔒 Required Secrets

Configuration values the app expects at startup:

- `DATABASE_URL` — connection string for the course database.
- `OPENAI_API_KEY` — provided by the Replit OpenAI integration; powers the tutor, the practice generator, the AI graders, and the written feedback on diagnostic assessments.
- `GPTZERO_API_KEY` — powers the AI-authorship detection layer.
- `CLERK_SECRET_KEY` / `VITE_CLERK_PUBLISHABLE_KEY` — power sign-in and session management (provided by the Replit Clerk integration).

---

## 🎓 Designed For

- **College Students & Self-Learners** — A complete data analytics foundations course with on-demand tutoring and adaptive practice, no instructor required.
- **Anyone Switching Into a Data Role Who Wants the Fundamentals First** — A structured tour of the concepts behind the tools: the workflow, data types, SQL, cleaning, pandas, and visualization.
- **Instructors Evaluating AI-Taught Coursework** — A working example of what an AI-taught, AI-graded, integrity-screened course actually looks like from the student's seat.
- **Curious Minds Who Want the Ideas, Not Just the Syntax** — Read the idea, see it in a real case, then write the answer in your own words.

---

## 💡 Core Idea

Most analytics tutorials jump straight to the *tools* — here's a SQL query, here's a pandas one-liner. Far fewer go back to the *workflow* underneath: what question you're actually answering, how the data is shaped, why it has to be cleaned, and how to tell an honest story with the result. This course is built around that second list.

Read the idea, ground it in a real example, then state the answer in your own words — and let the course check your reasoning fairly every step of the way.

**Data 101 — ask the question, work the data, tell the story.**
