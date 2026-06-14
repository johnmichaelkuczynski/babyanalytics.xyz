import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
  seedMetaTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";

// Content version of the seeded curriculum. BUMP THIS whenever the TOPICS or
// ASSIGNMENTS content below changes. On boot, seedIfEmpty compares this against
// the value stored in seed_meta; a mismatch forces a full re-seed, so content
// edits self-heal in every environment (including a republished production)
// without a manual database wipe.
const SEED_CONTENT_VERSION = "2026-06-14-data-for-everyone-v2-no-primers";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Data Analytics for Everyone
  {
    slug: "what-is-data",
    title: "What is data, really?",
    weekNumber: 1,
    blurb: "Data is just things you notice, written down — and you use it every day.",
    lectureTitle: "1.1 What is data, really? (you already think in data every day)",
    body: `# What is data, really?

People hear the word **data** and picture spreadsheets, scientists, or giant computers. But the real idea is much smaller and much friendlier: **data is just facts you notice about the world, recorded so you can use them later.**

A score in a game is data. The temperature outside is data. How many slices of pizza are left is data. None of that needs a computer — it just needs someone paying attention.

## You already think in data

You use data constantly without calling it that:

- You check the weather and decide whether to bring a jacket.
- You notice the bus is usually late on rainy days, so you leave earlier.
- You remember that your phone dies by lunch, so you charge it at night.

Each of those is the same move: you **noticed something**, you **remembered it**, and you **used it to make a choice**. That is the whole heart of data analytics, just done in your head.

## From data to a decision

There is a simple ladder that turns raw facts into something useful:

- **Data** — a plain fact: "It rained Monday, Wednesday, and Friday."
- **Information** — the fact placed in context: "It rained on 3 of the 5 school days last week."
- **Insight** — what it means for you: "Most of this week was wet, so I should keep an umbrella in my bag."

The point of the ladder is the last rung. A fact that never changes a choice is just trivia. **Data is only worth collecting when it can help you decide something.**

## Where everyday data comes from

You can gather data the same ways grown-up analysts do, only simpler:

- **Counting** — how many people brought lunch today.
- **Measuring** — how long it takes you to walk to school.
- **Asking** — a quick survey of which movie your friends want to see.
- **Watching over time** — writing down your bedtime every night for a week.

The trick is to write it down. A memory is fuzzy and changes; a written record stays put and can be checked.

## In the real world

Long before fancy tools existed, a nurse named Florence Nightingale collected data during a war in the 1850s. She simply wrote down what soldiers were dying from — and noticed that far more were dying from dirty conditions and infection than from battle wounds. That was just careful counting, written down. Her records convinced leaders to clean up the hospitals, and far fewer soldiers died. She didn't have a computer. She had the habit of noticing, recording, and acting — which is all data really is.`,
  },
  {
    slug: "spotting-patterns",
    title: "Spotting patterns: how noticing turns into knowing",
    weekNumber: 1,
    blurb: "A pattern is something that repeats or stands out — and patterns are how data becomes knowledge.",
    lectureTitle: "1.2 Spotting patterns: how noticing turns into knowing",
    body: `# Spotting patterns: how noticing turns into knowing

One fact on its own rarely tells you much. The magic happens when you have a few facts and you start to see how they fit together. That fitting-together is called a **pattern** — and spotting patterns is how a pile of data turns into something you actually *know*.

## What a pattern is

A **pattern** is anything that repeats, trends, or clearly stands out. Three kinds show up again and again:

- **A trend** — things moving in one direction over time. "Every week this month, more kids signed up for the club than the week before."
- **A group difference** — one group behaving differently from another. "People who ate breakfast got higher quiz scores than people who skipped it."
- **An outlier** — one thing that doesn't fit the rest. "Everyone scored around 80 on the test, but one paper had a 12."

Once you can name these three, you start seeing them everywhere.

## Noticing, then comparing

Patterns almost always come from **comparing**. A single number ("I made 6 free throws") means little. Compared to something, it comes alive:

- Compared to *yesterday* (you made 3) — you're improving.
- Compared to *your friend* (who made 12) — you have room to grow.
- Compared to *your goal* (10) — you're getting close.

So the habit to build is: don't just look at a number, ask **"compared to what?"** That question turns a fact into a pattern.

## Why outliers matter

The thing that *doesn't* fit is often the most interesting. An outlier is a clue:

- Sometimes it's a **mistake** — that 12 might be a kid who left half the test blank, not a real score.
- Sometimes it's the **real story** — a sudden spike in sick kids might be the first sign of a flu going around.

Good pattern-spotters don't ignore the odd one out; they stop and ask why it's there.

## Careful: a pattern is not always a cause

This is the trap that fools almost everyone. Two things can move together without one causing the other. Ice cream sales and sunburns both go up in summer — but ice cream doesn't cause sunburn; hot, sunny weather causes both. Seeing a pattern is the *start* of understanding, not the end. The right reaction to a pattern is curiosity: "Interesting — I wonder *why*?"

## In the real world

In 1854, a deadly outbreak of a disease called cholera hit a neighborhood in London. A doctor named John Snow marked every death on a map of the streets. Looking at the map, a pattern jumped out: the deaths were clustered tightly around one public water pump. That single pattern — deaths bunched in one spot — pointed straight at the cause: bad water from that pump. The handle was removed, and the outbreak faded. He didn't run any complicated math. He noticed, he compared, and he spotted the pattern that mattered.`,
  },
  {
    slug: "asking-good-questions",
    title: "Asking a good question",
    weekNumber: 1,
    blurb: "The whole game is the question: a sharp, answerable question is half the analysis.",
    lectureTitle: "1.3 Asking a good question (the whole game is the question)",
    body: `# Asking a good question

Here is a secret that professional analysts know and beginners often miss: **the hardest and most important part isn't the answer — it's the question.** A clear question practically tells you what data to collect and when you're done. A fuzzy question sends you wandering forever.

## Fuzzy questions vs. sharp questions

Compare these:

- Fuzzy: *"Is our class healthy?"*
- Sharp: *"How many kids in our class eat breakfast on school days?"*

The fuzzy one sounds important but you can't actually answer it — "healthy" could mean a hundred things. The sharp one is **specific** (it names exactly what to look at) and **answerable** (you can imagine the exact number that would answer it). 

A good question usually has three qualities:

- **Specific** — it names *who* and *what* clearly.
- **Measurable** — you can picture the data that would answer it.
- **Useful** — knowing the answer would actually help someone decide something.

## The question decides the data

The reason the question comes first is that it controls everything after it. The question *"How many kids eat breakfast?"* tells you:

- **Who** to ask (kids in the class),
- **What** to record (yes/no, did you eat breakfast today),
- **When** you're finished (when you've asked everyone).

If you collect data *before* you have a question, you usually end up with a messy pile that doesn't quite answer anything. Question first, data second.

## Narrowing a big question

Big questions aren't bad — they're just starting points. The skill is **narrowing** them into something you can actually check. "Is our school spending too much on snacks?" is huge. Narrow it down:

- "How much do we spend on snacks each month?"
- "Which snack costs the most per student?"
- "Did snack spending go up or down since last year?"

Each smaller question is answerable, and together they chip away at the big one.

## Watch out for sneaky questions

Some questions secretly assume their own answer. *"Why is our cafeteria food so bad?"* has already decided the food is bad before looking at any data. A fairer version — *"What do students think of the cafeteria food?"* — lets the data speak instead of forcing it. Honest questions don't tilt the answer before you start.

## In the real world

When the company that became Netflix wanted to grow, it didn't ask a vague question like "How do we make people happy?" It asked something sharp and answerable: "When does a new viewer decide whether to keep watching a show?" By focusing on that exact, measurable question, they could collect the right data — how far into an episode people stopped — and act on it. The sharp question is what made the data useful. A vague question would have buried them in numbers that pointed nowhere.`,
  },
  {
    slug: "sorting-grouping-counting",
    title: "Sorting, grouping, and counting",
    weekNumber: 1,
    blurb: "The only 'math' you really need: put things in order, gather like with like, and count.",
    lectureTitle: "1.4 Sorting, grouping, and counting (the only \"math\" you need)",
    body: `# Sorting, grouping, and counting

People assume data analytics is full of scary math. The truth is that the most useful moves are ones you learned as a little kid: **putting things in order, gathering things that are alike, and counting.** Master these three and you can answer a surprising number of real questions.

## Sorting: put things in order

**Sorting** means arranging your data from highest to lowest, oldest to newest, A to Z — whatever order fits the question. Sorting instantly answers "what's the most?" and "what's the least?"

If you sort the kids in your class by how far they live from school, the top and bottom of that sorted list immediately tell you who's farthest and closest — no calculation needed. Sorting also makes patterns easier to see, because similar values end up next to each other.

## Grouping: gather like with like

**Grouping** means putting things that belong together into the same bucket. You sort a bag of candy into "red," "green," and "yellow" piles. You split a survey into "kids who walk" and "kids who ride the bus."

Grouping is powerful because it lets you compare. Once your data is in groups, you can ask, "Which group is biggest?" or "Does this group behave differently from that one?" — the exact pattern-spotting from section 1.2.

## Counting and simple summaries

Once things are grouped, you **count** them. How many reds? How many bus-riders? That count is often the whole answer.

A few simple summaries go a little further, and none of them need real math:

- **Total** — add everything up. (How many snacks did the whole class eat?)
- **Most common** — the value that shows up the most. (What's the most popular pizza topping?)
- **Typical (the average)** — roughly the "middle" value, what you'd expect from a normal one. If three friends read 2, 4, and 6 books, the typical number is 4 — right in the middle.

That's it. Sort, group, count, and summarize. Almost every chart and report you'll ever see is built from these few moves stacked together.

## Why this is enough

A grown-up analyst with a powerful computer doing "sales by region" is doing exactly this: grouping sales by region, then counting (totaling) each group, then sorting to see which region is on top. The computer just does it faster and with more rows. The *idea* is the candy piles.

## In the real world

Every election night, the entire country watches sorting, grouping, and counting in action. Votes are **grouped** by candidate, **counted** within each group, and the totals are **sorted** to see who's ahead. There's no advanced math involved in deciding who won — just careful counting of groups. The reason it feels so dramatic is that everyone understands exactly what's being measured. That clarity is the gift of keeping the "math" simple.`,
  },
  {
    slug: "seeing-the-story",
    title: "Seeing the story: pictures that make data obvious",
    weekNumber: 1,
    blurb: "A good chart lets your eyes grasp in a second what a table of numbers hides.",
    lectureTitle: "1.5 Seeing the story: pictures that make data obvious",
    body: `# Seeing the story: pictures that make data obvious

You can have the perfect answer buried in a list of numbers and still have no one understand it. That's because our eyes are far better at reading *pictures* than columns of digits. Turning data into a picture — a **chart** — is how you make the story obvious in a single glance.

## Why a picture beats a list

Read these numbers: 4, 11, 6, 23, 7. To find the biggest, you have to check each one. Now imagine those as five bars of different heights — the tallest one jumps out instantly, no reading required. That's the entire point of a chart: it moves the work from your slow, careful brain to your fast, automatic eyes.

## Picking the right picture for the question

The kind of question decides the kind of chart:

- **Bar chart** — for **comparing groups**. Taller bar means more. ("Which fruit is most popular in our class?") The eye compares heights effortlessly.
- **Line chart** — for showing **change over time**. The line goes up or down as you move left to right. ("How did the temperature change over the week?")
- **Pictograph** — a friendly version of a bar chart that uses little pictures (one apple = 5 apples) instead of bars. Great for getting started.
- **Pie chart** — for showing **parts of a whole**, and only when there are just a few slices. ("What fraction of my allowance goes to snacks?")

Picking the wrong picture hides the story. A line chart only makes sense when the left-to-right order *means* something, like time — using one to compare unrelated groups just confuses people.

## What makes a chart good

A good chart is honest and clear:

- It has a **title** that says what you're looking at.
- Its parts are **labeled** so you know what each bar or slice means.
- It shows **one main idea**, not everything at once.

If someone has to study your chart for a minute to figure out what it says, the chart has failed at its one job.

## Charts can lie (even by accident)

Because pictures are so persuasive, they can also mislead. The most common trick is **stretching the scale**: if a bar chart starts its bottom line at 90 instead of 0, a tiny difference between 91 and 94 suddenly looks enormous. The numbers are technically true, but the picture exaggerates. An honest chart usually starts at zero so the *sizes* you see match the *sizes* that are real. Being able to spot a stretched chart protects you from being fooled by one.

## In the real world

In 1986, the space shuttle *Challenger* launched on an unusually cold morning and broke apart, killing all seven astronauts. Engineers had worried beforehand that cold weather might cause a critical part to fail — and the data showing the danger actually existed. But it was trapped in dense tables of numbers, and no one could see the pattern in time. Experts later showed that a single clear chart of damage versus temperature would have made the risk obvious at a glance. It's a heartbreaking reminder that *how you show data* can matter as much as the data itself.`,
  },
  {
    slug: "hunch-to-decision",
    title: "From hunch to decision: tiny analytics in real life",
    weekNumber: 1,
    blurb: "Turn a guess into a decision with a tiny loop: question, gather, look, decide.",
    lectureTitle: "1.6 From hunch to decision: tiny analytics in real life",
    body: `# From hunch to decision: tiny analytics in real life

You now have all the pieces: data is noticed facts, patterns are how facts connect, a good question points the way, sorting and counting do the work, and a chart shows the story. This last section ties them together into a habit you can use for the rest of your life — turning a **hunch** into a **decision**.

## What a hunch is, and why it isn't enough

A **hunch** is a guess that *feels* true: "I think I sleep worse when I have soda at night." "I bet the morning bus is faster." Hunches are great — they're where most good questions come from. But a hunch is just a feeling, and feelings can be wrong. The whole point of tiny analytics is to **check the hunch against real data** before betting on it.

## The tiny loop

Every analysis, from a kid's experiment to a giant company's report, follows the same small loop:

1. **Question** — turn the hunch into a sharp, answerable question. ("Do I fall asleep faster on nights without soda?")
2. **Gather** — collect a little data. (Write down each night: had soda? how long to fall asleep?)
3. **Look** — sort, group, count, and maybe chart it. (Compare soda nights to no-soda nights.)
4. **Decide** — use what you found to make a choice. (If no-soda nights were clearly faster, skip the late soda.)

Then you often loop back with a new question. That's it — that's the engine behind all of data analytics, shrunk down to fit your life.

## Honesty is the whole point

The loop only works if you're willing to be **proven wrong**. The danger is collecting data just to confirm what you already believe — noticing only the nights that fit your hunch and ignoring the rest. Real analysis means letting the data change your mind. If you check your free-throw practice and it turns out practice *didn't* help your shooting, that's not a failure — that's the data doing its job, saving you from a false belief.

## Small loops, big stakes

The same four steps scale up to decisions that matter enormously: Should a city add a new bus route? Is a new medicine safe? Where should we build a hospital? In every case it's still question, gather, look, decide — just with more data and more care. Learning the loop on small, everyday questions is exactly how you build the judgment to trust it on big ones.

## In the real world

A hospital noticed a hunch among its nurses: patients seemed to recover faster when they could see a window. Instead of just trusting the feeling, someone ran the tiny loop — they asked the question, gathered records of which rooms patients stayed in and how quickly they healed, looked at the two groups, and found the window-room patients really did tend to go home sooner. That checked hunch changed how hospitals are designed. It started exactly where yours will: with a quiet feeling that *something might be true* — and the willingness to actually look.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  {
    kind: "homework",
    title: "Homework 1.1 — Data, patterns, and good questions",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.3. Answer each question in a few sentences (about 3–5) in your own words. There's no need for any math — just explain your thinking clearly. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "what-is-data",
        prompt:
          "Give one example of data you used today without thinking of it as 'data,' and explain how it helped you make a choice. Then explain the difference between a plain fact and an insight. (3–5 sentences.)",
        correctAnswer:
          "An everyday example is checking the weather: seeing that it was cold and cloudy is data, and I used it to decide to bring a jacket. The cold temperature by itself is just a plain fact — a single piece of recorded information about the world. An insight is what that fact means for a decision, like 'it's cold enough that I'll be uncomfortable without a jacket, so I should grab one.' The difference is that a fact just describes something, while an insight tells you what to actually do about it.",
        explanation:
          "Full credit: gives a real everyday use of data tied to a choice, and distinguishes a plain fact (raw recorded information) from an insight (what the fact means for a decision).",
      },
      {
        topicSlug: "what-is-data",
        prompt:
          "Why is it better to write data down than to just remember it? Describe a situation where relying on memory instead of a written record could lead you to the wrong conclusion. (3–5 sentences.)",
        correctAnswer:
          "Writing data down keeps it accurate and unchanging, while memory is fuzzy and tends to drift over time. For example, if I try to remember whether the morning or afternoon bus is usually faster, my memory might just recall the one really bad trip that stuck out, and I'd wrongly conclude the morning bus is always slow. If I had written down each trip's time, I could check the actual record instead of trusting a single dramatic memory. Written records let you check the real pattern rather than the one your memory happened to keep.",
        explanation:
          "Full credit: explains that written records stay accurate while memory drifts/is selective, and gives a concrete case where trusting memory would mislead.",
      },
      {
        topicSlug: "spotting-patterns",
        prompt:
          "Explain what an 'outlier' is in your own words, and describe a case where an outlier turns out to be a mistake versus a case where it turns out to be the real story. (3–5 sentences.)",
        correctAnswer:
          "An outlier is a piece of data that clearly doesn't fit with the rest, like one very high or very low value among a group of similar ones. Sometimes an outlier is a mistake: if everyone in class scored around 80 but one paper shows a 12, that low score might just be someone who left half the test blank rather than a true measure of what they know. Other times the outlier is the real story: a sudden spike of kids out sick on one day might be the first sign of a flu spreading. The point is not to ignore the odd value but to stop and ask why it's there.",
        explanation:
          "Full credit: defines an outlier as a value that doesn't fit the rest, and gives one example of an outlier-as-error and one of an outlier-as-real-signal.",
      },
      {
        topicSlug: "asking-good-questions",
        prompt:
          "Take the fuzzy question 'Is our class doing well in school?' and rewrite it into a sharper, answerable question. Explain what makes your version better. (3–5 sentences.)",
        correctAnswer:
          "A sharper version is 'How many kids in our class turned in last week's homework on time?' This is better because it is specific — it names exactly who (kids in our class) and what (turning in homework on time) — instead of the vague idea of 'doing well.' It is also measurable, since I can picture the exact number that answers it, and I'd know when I'm done collecting the data. The original question sounds important but you can't actually answer it because 'doing well' could mean a hundred different things.",
        explanation:
          "Full credit: turns the vague question into a specific, measurable, answerable one and explains that the improvement is specificity/measurability, not just rewording.",
        hint: "A good question names exactly who and what, and lets you picture the data that would answer it.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Counting, charts, and decisions",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.4–1.6. Answer each question in a few sentences (about 3–5) in your own words. No math is required — explain your reasoning. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "sorting-grouping-counting",
        prompt:
          "Imagine you have a survey of everyone's favorite school lunch. Explain how you would use grouping and counting to find the most popular lunch, and why sorting the results afterward helps. (3–5 sentences.)",
        correctAnswer:
          "First I would group the responses by putting all the same answers together — all the 'pizza' votes in one pile, all the 'tacos' votes in another, and so on. Then I would count how many responses are in each group to see how many people picked each lunch. To find the most popular, I'd look for the group with the highest count. Sorting the groups from most votes to fewest afterward helps because it instantly shows the ranking — the winner is right at the top and the least popular is at the bottom — without having to scan every number.",
        explanation:
          "Full credit: describes grouping identical responses, counting each group, and notes that sorting orders the groups so the most/least popular stand out immediately.",
      },
      {
        topicSlug: "sorting-grouping-counting",
        prompt:
          "Three friends read 2, 4, and 6 books over the summer. Explain what the 'typical' (average) number of books is and what 'typical' is trying to tell you. (3–5 sentences.)",
        correctAnswer:
          "The typical number is 4, which is the middle value you'd get by evening out the three numbers — 2, 4, and 6 balance around 4. 'Typical' is trying to tell you roughly what to expect from a normal one of the group, a single number that stands in for the whole set. It's useful because instead of listing every value, you can say 'a typical friend read about 4 books.' It doesn't mean everyone read exactly 4; it's just the central, representative amount.",
        explanation:
          "Full credit: identifies the average as 4 and explains that 'typical' is a single central value representing what to expect from the group, not a claim that every value equals it.",
        hint: "Think of the average as the 'middle' or 'evened-out' value that stands in for the whole group.",
      },
      {
        topicSlug: "seeing-the-story",
        prompt:
          "You want to show how the temperature changed across the days of one week. Which chart type fits best, and why would a bar chart comparing five friends' heights use a different type? (3–5 sentences.)",
        correctAnswer:
          "A line chart fits the temperature best because it shows change over time, with the days in order from left to right and the line rising or falling to show how the temperature moved. Comparing five friends' heights is a different situation — those are separate groups, not a sequence over time — so a bar chart fits better, since the eye can compare the heights of the bars side by side. The reason they differ is that a line chart's left-to-right order has to mean something, like time, while a bar chart just compares separate groups. Picking the chart that matches the question is what makes the story clear.",
        explanation:
          "Full credit: chooses a line chart for change over time and a bar chart for comparing separate groups, and explains the distinction (ordered sequence vs. independent categories).",
      },
      {
        topicSlug: "hunch-to-decision",
        prompt:
          "You have a hunch that you do better on tests when you study the night before. Walk through how you'd use the tiny loop (question, gather, look, decide) to check it. (3–5 sentences.)",
        correctAnswer:
          "First, I'd turn the hunch into a sharp question: 'Do I score higher on tests when I studied the night before than when I didn't?' Next, I'd gather data by writing down, for each test, whether I studied the night before and what score I got. Then I'd look at it by grouping the tests into 'studied' and 'didn't study' and comparing the typical scores of the two groups. Finally, I'd decide based on what I found — if the studied group scored clearly higher, I'd commit to studying the night before, and I'd stay honest by trusting the data even if it surprised me.",
        explanation:
          "Full credit: applies all four steps (sharp question, gather relevant data, group/compare, decide) to the hunch and ideally notes the willingness to be proven wrong.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit Test — Data Analytics for Everyone",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Covers sections 1.1–1.6. Answer each question in a few sentences (about 4–6) in your own words. No math is required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "what-is-data",
        prompt:
          "Explain the ladder from data to information to insight using one original example of your own. Then explain why an insight is the rung that actually matters. (4–6 sentences.)",
        correctAnswer:
          "Take walking to school as an example. The data is a plain fact: it took me 8, 12, 9, 7, and 13 minutes on five days. The information is that fact placed in context: on average it takes me about 10 minutes, but it was much slower on two days. The insight is what it means for me: those slow days were when it rained, so on rainy mornings I should leave a few minutes earlier. The insight is the rung that matters because it's the only one that changes what I actually do — the raw times and even the average are just trivia until they help me make the choice to leave earlier.",
        explanation:
          "Full credit: gives an original example showing data (raw fact) → information (fact in context) → insight (what to do), and argues the insight matters because it drives a decision.",
      },
      {
        topicSlug: "spotting-patterns",
        prompt:
          "Explain why seeing two things rise together does not prove one causes the other. Give an example of two things that move together for a third, hidden reason. (4–6 sentences.)",
        correctAnswer:
          "Two things moving together is called a pattern, but a pattern only shows that they're linked somehow, not that one makes the other happen. Often both are being driven by a third, hidden cause. For example, ice cream sales and sunburns both go up at the same time of year, but eating ice cream doesn't cause sunburn — hot, sunny weather causes both. If you mistook the pattern for cause, you might wrongly think banning ice cream would stop sunburns. The right response to a pattern is curiosity about why it's happening, not jumping straight to 'one causes the other.'",
        explanation:
          "Full credit: distinguishes correlation from causation, gives a valid example with a hidden third cause (e.g., weather), and notes the danger of assuming cause from a pattern.",
      },
      {
        topicSlug: "asking-good-questions",
        prompt:
          "What are the qualities of a good analytics question, and why does the question have to come before collecting data? Give an example of a question that is too fuzzy to answer. (4–6 sentences.)",
        correctAnswer:
          "A good question is specific (it names exactly who and what), measurable (you can picture the data that would answer it), and useful (the answer would help someone decide something). The question has to come first because it controls everything after it — it tells you who to ask, what to record, and when you're finished collecting. If you gather data before having a question, you usually end up with a messy pile that doesn't quite answer anything. A question that's too fuzzy to answer is something like 'Is our school good?' — 'good' could mean a hundred different things, so you couldn't picture the data that would settle it.",
        explanation:
          "Full credit: lists qualities (specific/measurable/useful), explains the question scopes the data and signals completion, and gives a genuinely unanswerable fuzzy question.",
      },
      {
        topicSlug: "sorting-grouping-counting",
        prompt:
          "A company says it found its 'best-selling product by region.' Explain how sorting, grouping, and counting produce that answer, even with a powerful computer. (4–6 sentences.)",
        correctAnswer:
          "Even with a powerful computer, the underlying moves are the simple ones. First the sales are grouped by region, putting all the sales from each region into its own bucket. Within each region, the products are grouped again and the sales are counted (totaled) to see how much of each product sold there. Then the products are sorted from most to least sold so the top one stands out. The 'best-selling product by region' is just the product at the top of each region's sorted list. The computer only makes this faster and handles more rows — the idea is the same as sorting candy into piles and counting them.",
        explanation:
          "Full credit: maps the business result to grouping (by region/product), counting (totals), and sorting (to find the top), noting the computer only scales the same simple moves.",
      },
      {
        topicSlug: "seeing-the-story",
        prompt:
          "Explain one way a chart can mislead even when its numbers are true, and describe how an honest chart avoids it. (4–6 sentences.)",
        correctAnswer:
          "A common way a chart misleads is by stretching the scale — starting the bottom of a bar chart at, say, 90 instead of 0. When the baseline is cut off, a tiny real difference between 91 and 94 suddenly looks like a huge gap, because the eye reads the *sizes* of the bars as the sizes of the values. The numbers printed on it might be perfectly true, but the picture exaggerates the difference. An honest chart usually starts at zero so that the heights you see actually match the amounts they represent. Knowing this lets you spot a stretched chart and avoid being fooled by one.",
        explanation:
          "Full credit: names a real distortion (e.g., truncated/stretched scale), explains why it misleads despite true numbers, and says the honest fix (start at zero so sizes match values).",
      },
      {
        topicSlug: "hunch-to-decision",
        prompt:
          "Describe the four steps of the 'tiny loop' for turning a hunch into a decision, and explain why being willing to be proven wrong is essential to it. (4–6 sentences.)",
        correctAnswer:
          "The four steps are: turn the hunch into a sharp question, gather a little data, look at it by sorting/grouping/counting or charting it, and decide what to do based on what you found. The loop only works if you're genuinely willing to be proven wrong, because the danger is collecting data just to confirm what you already believe and ignoring anything that doesn't fit. If you only notice the evidence that agrees with your hunch, you haven't really checked it — you've just decorated your guess. Letting the data change your mind is the whole point; it's what saves you from acting on a false belief. So honesty about the result is as important as the steps themselves.",
        explanation:
          "Full credit: names all four steps (question, gather, look, decide) and explains that willingness to be wrong prevents cherry-picking/confirmation and is what makes the check meaningful.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final — Data Analytics for Everyone",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed cumulative final. 45 minutes. Covers the whole course (sections 1.1–1.6). Answer each question in a paragraph (about 5–7 sentences) in your own words. No math is required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "hunch-to-decision",
        prompt:
          "Pick a real everyday hunch of your own and walk it all the way through the tiny loop (question, gather, look, decide), naming each step and what you'd do at it. Then explain why the final 'decide' step is what makes the whole effort worthwhile. (5–7 sentences.)",
        correctAnswer:
          "Take the hunch that I play video games better in the afternoon than late at night. First, Question: turn it into something sharp — 'Do I win more matches in the afternoon than after 10pm?' Second, Gather: for two weeks I write down, for each session, the time of day and how many matches I won. Third, Look: I group the sessions into 'afternoon' and 'late night' and compare the typical wins in each group, maybe even sketching a quick bar chart. Fourth, Decide: if afternoon sessions clearly had more wins, I'd schedule my serious games for the afternoon. The decide step is what makes it worthwhile because everything before it is just gathering and looking — if I never change what I do, all that effort produced no value. Analysis only pays off when it actually changes a choice.",
        explanation:
          "Full credit: applies all four steps to a concrete hunch and argues the 'decide' step delivers the value because analysis exists to change a choice.",
      },
      {
        topicSlug: "what-is-data",
        prompt:
          "Some people think data analytics requires computers and advanced math. Using ideas from across the course, argue that the core of it is really noticing, comparing, and counting. Use one concrete example. (5–7 sentences.)",
        correctAnswer:
          "At its heart, data analytics is just paying attention to facts and using them to decide something, which people do without any computer at all. Data is simply things you notice, written down; patterns come from comparing those facts; and the real work is the simple moves of sorting, grouping, and counting. For example, a kid wondering which recess game is most popular can ask classmates, group the answers, count each group, and see the winner — that's a complete analysis with no math beyond counting. Computers and fancy math don't change the ideas; they just let you handle millions of rows faster. The doctor John Snow stopped a deadly outbreak in 1854 by marking deaths on a map and noticing they clustered around one water pump — pure noticing and comparing. So the tools have grown, but the core skill is the same one you already use every day.",
        explanation:
          "Full credit: argues the core is noticing/comparing/counting (not tools), supports it with a concrete no-computer example, and notes that technology only scales the same ideas.",
      },
      {
        topicSlug: "asking-good-questions",
        prompt:
          "Explain why a vague question can ruin an analysis before it even starts, and describe how you would take a big, fuzzy question and narrow it into something answerable. Use an example. (5–7 sentences.)",
        correctAnswer:
          "A vague question ruins an analysis because the question controls everything after it — what data to collect, who to ask, and when you're done — so if it's fuzzy, the whole effort wanders without a target. For example, 'Is our school spending too much on snacks?' is too big and undefined to answer directly, since 'too much' isn't measurable. To narrow it, I'd break it into specific, answerable pieces: 'How much do we spend on snacks each month?', 'Which snack costs the most per student?', and 'Did snack spending go up or down since last year?' Each smaller question names exactly what to measure and could actually be answered with data. Together they chip away at the big question without ever requiring me to guess what the vague version meant. Starting with a sharp question is what keeps the data focused and useful.",
        explanation:
          "Full credit: explains that the question scopes the whole analysis so vagueness derails it, then narrows a big fuzzy question into specific measurable sub-questions with an example.",
      },
      {
        topicSlug: "seeing-the-story",
        prompt:
          "Someone has a correct set of numbers but presents them in a misleading chart. Explain two specific ways a chart can distort honest data, and argue why showing data honestly is part of doing analytics responsibly. (5–7 sentences.)",
        correctAnswer:
          "Even correct numbers can be twisted by how they're drawn. One way is stretching the scale: if a bar chart starts at 90 instead of 0, a tiny real difference looks like a huge gap because the eye reads bar sizes as value sizes. A second way is choosing the wrong chart for the question — like using a line chart to compare unrelated groups, or a pie chart crammed with so many slices that no pattern is visible — which hides the real story. Both let technically true numbers tell a false story. Showing data honestly is part of responsible analytics because the whole point of a chart is to help someone understand and decide; a chart built to persuade past what the data supports corrupts that decision. It's the picture version of getting the right answer and then lying about it. Choosing a fitting chart and a zero baseline keeps the picture faithful to the facts.",
        explanation:
          "Full credit: names two concrete distortions (e.g., stretched scale, wrong/overloaded chart), explains how each misleads despite true numbers, and argues honest visualization serves the decision the analysis exists for.",
      },
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  // The course was migrated to the Data Analytics for Everyone syllabus.
  // Detect the marker topic; if present and the content version matches, the
  // content is current and we skip. This makes the seed self-healing across
  // environments: a database that still holds older content (e.g. a previous
  // curriculum) is detected and replaced on boot.
  const markerTopic = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(eq(topicsTable.slug, "what-is-data"));
  // Read the stored content version. Tolerate the seed_meta table not yet
  // existing (e.g. a boot that races ahead of schema migration): treat that as
  // "no version recorded", which forces a reseed once the table is present.
  let currentVersion: string | null = null;
  try {
    const storedVersion = await db
      .select({ value: seedMetaTable.value })
      .from(seedMetaTable)
      .where(eq(seedMetaTable.key, "content_version"));
    currentVersion = storedVersion[0]?.value ?? null;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Seed: seed_meta unavailable, treating version as unset");
    currentVersion = null;
  }
  if (markerTopic.length > 0 && currentVersion === SEED_CONTENT_VERSION) {
    logger.info("Seed: course content present and current, skipping");
    return;
  }
  if (markerTopic.length > 0) {
    logger.warn(
      { storedVersion: currentVersion, expected: SEED_CONTENT_VERSION },
      "Seed: course content present but out of date — re-seeding with the current curriculum",
    );
  }

  // No current content. Either the database is empty (fresh) or it still holds
  // an older curriculum. Do the (optional) wipe and the full reseed in a SINGLE
  // transaction so the marker topic only ever becomes visible once the entire
  // curriculum has committed. A crash mid-seed rolls back, so the next boot
  // retries instead of leaving partial content that the marker check would
  // wrongly treat as healthy. TRUNCATE also takes an ACCESS EXCLUSIVE lock, so
  // concurrent readers never observe a half-empty course during the replace
  // window. The diagnostic tables are truncated here too so the (non
  // version-gated) diagnostic seed repopulates them with the current content on
  // the same boot.
  await db.transaction(async (tx) => {
    const existing = await tx.execute(sql`select count(*)::int as n from topics`);
    const row = (existing.rows[0] ?? {}) as { n?: number };
    if ((row.n ?? 0) > 0) {
      logger.warn(
        "Seed: stale course content detected — replacing with the Data Analytics for Everyone curriculum",
      );
      await tx.execute(
        sql`TRUNCATE TABLE answers, attempts, practice_attempts, practice_problems, practice_sessions, problems, assignments, lectures, topics, diagnostic_responses, diagnostic_attempts, diagnostic_items, diagnostic_assessments RESTART IDENTITY CASCADE`,
      );
    } else {
      logger.info("Seed: populating course content");
    }

    // Topics + lectures
    const slugToTopicId = new Map<string, number>();
    for (let i = 0; i < TOPICS.length; i++) {
      const t = TOPICS[i]!;
      const [inserted] = await tx
        .insert(topicsTable)
        .values({
          slug: t.slug,
          title: t.title,
          weekNumber: t.weekNumber,
          blurb: t.blurb,
          position: i,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
      slugToTopicId.set(t.slug, inserted.id);
      await tx.insert(lecturesTable).values({
        topicId: inserted.id,
        weekNumber: t.weekNumber,
        title: t.lectureTitle,
        body: t.body,
      });
    }

    // Assignments + problems
    for (let i = 0; i < ASSIGNMENTS.length; i++) {
      const a = ASSIGNMENTS[i]!;
      const [inserted] = await tx
        .insert(assignmentsTable)
        .values({
          kind: a.kind,
          title: a.title,
          weekNumber: a.weekNumber,
          position: i,
          isTimed: a.isTimed,
          timeLimitMinutes: a.timeLimitMinutes,
          instructions: a.instructions,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
      for (let p = 0; p < a.problems.length; p++) {
        const prob = a.problems[p]!;
        const topicId = slugToTopicId.get(prob.topicSlug);
        if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
        await tx.insert(problemsTable).values({
          assignmentId: inserted.id,
          topicId,
          position: p,
          prompt: prob.prompt,
          correctAnswer: prob.correctAnswer,
          explanation: prob.explanation,
          hint: prob.hint ?? null,
        });
      }
    }

    // Stamp the content version last, inside the same transaction, so the
    // marker check on the next boot only treats the course as "current" once
    // the entire curriculum has committed.
    await tx
      .insert(seedMetaTable)
      .values({ key: "content_version", value: SEED_CONTENT_VERSION })
      .onConflictDoUpdate({
        target: seedMetaTable.key,
        set: { value: SEED_CONTENT_VERSION, updatedAt: new Date() },
      });
  });

  logger.info(
    { topics: TOPICS.length, assignments: ASSIGNMENTS.length, version: SEED_CONTENT_VERSION },
    "Seed complete",
  );
}
