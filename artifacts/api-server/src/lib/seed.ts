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
const SEED_CONTENT_VERSION = "2026-06-11-data-analytics-v1";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Foundations of Data Analytics
  {
    slug: "what-is-data-analytics",
    title: "What data analytics is and the analytics workflow",
    weekNumber: 1,
    blurb: "What analytics is, its four types, and the end-to-end workflow.",
    lectureTitle: "1.1 What data analytics is and the analytics workflow",
    body: `# What data analytics is

**Data analytics** is the practice of examining raw data in order to answer a question, support a decision, or reveal a pattern. The goal is to turn **data** (raw, unorganized facts and figures) into **information** (data placed in context so it means something), and finally into **insight** that someone can act on.

A useful slogan: *data is not the point — decisions are.* An analysis that never changes what anyone does has failed, no matter how clever the math.

## The four types of analysis

Most analytics questions fall into one of four levels, in increasing order of value and difficulty:

- **Descriptive** — *What happened?* Summaries of the past: total sales last quarter, average response time. This is reporting.
- **Diagnostic** — *Why did it happen?* Drilling into the descriptive numbers to find causes: sales fell because one region underperformed.
- **Predictive** — *What is likely to happen next?* Using patterns in past data to forecast: this customer is likely to churn.
- **Prescriptive** — *What should we do about it?* Recommending an action: offer this customer a discount now.

A beginner course like this one lives mostly in the **descriptive** and **diagnostic** levels — the foundation everything else is built on.

## The analytics workflow

Real analytics is a repeatable process, not a single calculation. A common version of the workflow has six steps:

1. **Ask** — state the question or decision precisely. A vague question ("how are we doing?") produces a vague answer.
2. **Acquire** — collect the data you need from spreadsheets, databases, files, or APIs.
3. **Clean** — fix the errors, gaps, and inconsistencies that real data always has. This is usually the most time-consuming step.
4. **Analyze** — filter, aggregate, compare, and look for patterns.
5. **Visualize / Communicate** — present the result so a decision-maker can understand it quickly.
6. **Act** — use the result to make a decision, then often loop back with a new question.

The rest of this course walks through the tools for these steps: spreadsheets and SQL to acquire and query, Excel and Python to clean and analyze, and Tableau or Power BI to visualize.

## In the real world

In 1854 a cholera outbreak killed hundreds in London's Soho district. Physician John Snow **acquired** data by marking each death on a street map, **analyzed** the clustering, and saw the deaths ringed a single public water pump on Broad Street. He **communicated** the finding and the pump handle was removed; the outbreak subsided. Snow had no computer — but he ran the entire analytics workflow, and the *decision* (close the pump), not the map itself, is what saved lives.`,
  },
  {
    slug: "data-types-spreadsheets",
    title: "Data types, structure, and spreadsheets",
    weekNumber: 1,
    blurb: "Structured data, variable types, tidy tables, and Excel fundamentals.",
    lectureTitle: "1.2 Data types, structure, and spreadsheets (Excel fundamentals)",
    body: `# Data types, structure, and spreadsheets

Before you can analyze data you have to understand how it is *shaped* and what *kind* of values it holds.

## Structured vs. unstructured data

**Structured data** is organized into a table of rows and columns — like a spreadsheet or a database table. **Unstructured data** has no predefined shape: free-form text, images, audio. This course works almost entirely with structured data, the kind spreadsheets and SQL were built for.

In a structured table:

- a **row** is one **observation** (one customer, one sale, one day);
- a **column** is one **variable** (an attribute measured for every observation, such as "price" or "city").

## Variable types

Each column holds one *type* of value, and the type determines what you can do with it:

- **Numeric** — numbers you can do arithmetic on (price, age, quantity). Split into *continuous* (can take any value, like weight) and *discrete* (whole counts, like number of orders).
- **Categorical** — labels from a fixed set (country, payment method). You can count and group them but not average them.
- **Datetime** — dates and timestamps, which you can sort and compute durations from.
- **Boolean** — true/false (is_subscriber).
- **Text** — free-form strings (a review comment).

Treating a variable as the wrong type is a classic error: storing a price as text means you cannot sum it; storing a ZIP code as a number drops the leading zero.

## Tidy data

Analysis is far easier when data is **tidy**:

- each variable is its own column,
- each observation is its own row,
- each cell holds a single value.

Untidy data — totals mixed into the rows, two values jammed in one cell, the same category spelled three ways — has to be cleaned before it can be analyzed (the subject of section 1.4).

## Excel fundamentals

A **spreadsheet** is a grid of **cells** addressed by column letter and row number (e.g. \`B2\`). Cells can hold values or **formulas**, which begin with \`=\`.

- **Functions** are built-in calculations: \`=SUM(B2:B10)\`, \`=AVERAGE(B2:B10)\`, \`=COUNT(...)\`, \`=IF(B2>100,"big","small")\`.
- **Cell references** can be **relative** (\`B2\`, which shifts when you copy the formula) or **absolute** (\`$B$2\`, which stays fixed). Mixing these up is the most common spreadsheet bug.
- **Lookups** — \`VLOOKUP\` and the newer \`XLOOKUP\` pull a matching value from another table, the spreadsheet equivalent of a join.
- **PivotTables** summarize a table by grouping on one field and aggregating another — e.g. total sales by region — without writing any formula.

## In the real world

In 2012 JPMorgan Chase lost over six billion dollars in the "London Whale" trading episode. A contributing factor, later documented, was a risk model run in **Excel** where a value was accidentally divided by a *sum* instead of an *average*, understating risk. The lesson is not that spreadsheets are bad — they run much of the financial world — but that knowing exactly what a formula and a cell reference do is not optional.`,
  },
  {
    slug: "sql-queries",
    title: "Querying data with SQL",
    weekNumber: 1,
    blurb: "SELECT, WHERE, ORDER BY, JOIN, and GROUP BY aggregation.",
    lectureTitle: "1.3 Querying data with SQL (SELECT, filter, join, aggregate)",
    body: `# Querying data with SQL

When data lives in a **relational database** — many tables that relate to one another — you retrieve it with **SQL** (Structured Query Language). SQL is *declarative*: you describe the result you want and the database figures out how to produce it.

## SELECT and filtering

The core statement is \`SELECT\`. It names the columns you want and the table they come from:

\`\`\`sql
SELECT name, price
FROM products;
\`\`\`

Add a \`WHERE\` clause to **filter** rows to the ones you care about, and \`ORDER BY\` to sort:

\`\`\`sql
SELECT name, price
FROM products
WHERE price > 50
ORDER BY price DESC;
\`\`\`

\`WHERE\` keeps only rows where the condition is true. Conditions can combine with \`AND\` / \`OR\`.

## Joining tables

Data is split across tables to avoid repetition. A **JOIN** recombines them by matching a column they share (a *key*). An **inner join** keeps only rows that match in both tables:

\`\`\`sql
SELECT orders.id, customers.name
FROM orders
JOIN customers ON orders.customer_id = customers.id;
\`\`\`

A **left join** keeps every row from the left table even when there is no match on the right (filling the missing side with nulls) — useful for finding, say, customers who have never ordered.

## Aggregating

To answer "how many?" or "what is the total/average?", use an **aggregate function** (\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`) together with \`GROUP BY\`, which collapses rows that share a value into one summary row per group:

\`\`\`sql
SELECT category, COUNT(*) AS n, AVG(price) AS avg_price
FROM products
GROUP BY category;
\`\`\`

To filter on an aggregated value, use \`HAVING\` (not \`WHERE\`, which acts on individual rows before grouping):

\`\`\`sql
SELECT category, COUNT(*) AS n
FROM products
GROUP BY category
HAVING COUNT(*) > 10;
\`\`\`

The order the database evaluates the pieces — \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` — explains why \`WHERE\` cannot see an aggregate and \`HAVING\` can.

## In the real world

Every time you check a bank balance, search a flight, or load a product page, a SQL query runs behind the scenes against a relational database. Analysts at companies from Amazon to small startups spend much of their day writing \`SELECT\` statements to pull exactly the slice of data a question needs — which is why SQL remains, decades after its invention, the single most requested skill in data-analyst job postings.`,
  },
  {
    slug: "data-cleaning",
    title: "Cleaning and transforming data",
    weekNumber: 1,
    blurb: "Fixing missing values, duplicates, types, and inconsistent categories.",
    lectureTitle: "1.4 Cleaning and transforming data (Excel/Python)",
    body: `# Cleaning and transforming data

Real data is **dirty**. Analysts commonly spend the majority of a project not analyzing but cleaning — getting the data into a state where the analysis can be trusted. The principle behind it all is **garbage in, garbage out**: a flawless calculation on flawed data gives a confident wrong answer.

## Common data problems

- **Missing values** — empty cells, often shown as blanks, \`NA\`, or \`null\`.
- **Duplicates** — the same observation recorded more than once, which inflates counts and totals.
- **Wrong types** — numbers stored as text, dates stored as strings, so they cannot be computed on.
- **Inconsistent categories** — "USA", "U.S.A.", and "United States" treated as three different groups.
- **Outliers and impossible values** — an age of 200, a negative price; sometimes real, sometimes a data-entry error.

## Handling missing values

There are two basic strategies:

- **Drop** the rows (or columns) with missing data — safe when they are few and random.
- **Impute** (fill in) a reasonable value — for example the column's mean or median, or a category like "Unknown" — when dropping would throw away too much.

The wrong move is to silently let blanks be treated as zero, which quietly distorts averages and sums.

## Other transformations

- **Deduplicate** — remove repeated rows (Excel's *Remove Duplicates*; pandas' \`drop_duplicates\`).
- **Convert types** — parse text into real numbers or dates so they sort and compute correctly.
- **Standardize text** — trim stray spaces (\`TRIM\`), fix capitalization, and map variant spellings to one canonical label so categories group correctly.
- **Reshape** — split a combined column ("City, State") into two, or restructure so the data is tidy.

In Excel these are done with tools like *Text to Columns*, \`TRIM\`, and *Remove Duplicates*; in Python with pandas methods like \`fillna\`, \`drop_duplicates\`, and \`astype\`.

## In the real world

In 2020 Public Health England under-reported nearly 16,000 COVID-19 cases because case data was collated in an older Excel file format that silently capped the number of rows it could hold — rows beyond the limit were simply dropped. No analysis step was wrong; the *data* was incomplete and no one validated it. It is a textbook reminder that cleaning and checking data is not busywork before the "real" analysis — it *is* the real analysis.`,
  },
  {
    slug: "pandas-analysis",
    title: "Analysis with Python (pandas basics)",
    weekNumber: 1,
    blurb: "DataFrames, selecting, filtering, grouping, and merging in pandas.",
    lectureTitle: "1.5 Analysis with Python (pandas basics)",
    body: `# Analysis with Python (pandas basics)

When data outgrows a spreadsheet, or when you need a repeatable, automated analysis, analysts reach for **Python** and its data library **pandas**. pandas brings spreadsheet-style tables into code, where every step is written down and can be re-run.

## The DataFrame

The central object is the **DataFrame**: a table of rows and columns, just like a spreadsheet or a SQL result. A single column is a **Series**. You usually start by loading a file:

\`\`\`python
import pandas as pd
df = pd.read_csv("sales.csv")
\`\`\`

To get oriented, three methods do most of the work:

- \`df.head()\` — show the first few rows.
- \`df.info()\` — column names, types, and how many values are missing.
- \`df.describe()\` — quick summary statistics (count, mean, min, max) for numeric columns.

## Selecting and filtering

Pick a column with \`df["price"]\`. **Filter** rows with a boolean condition (a *boolean mask*), the pandas equivalent of SQL's \`WHERE\`:

\`\`\`python
expensive = df[df["price"] > 50]
\`\`\`

The condition produces True/False for every row, and pandas keeps the True rows.

## Grouping and aggregating

\`groupby\` is the pandas counterpart of SQL's \`GROUP BY\`: split the data into groups, then aggregate each one:

\`\`\`python
df.groupby("category")["price"].mean()
\`\`\`

This gives the average price per category. You can aggregate with \`sum\`, \`count\`, \`min\`, \`max\`, and more.

## Combining tables

\`pd.merge\` joins two DataFrames on a shared key, exactly like a SQL join:

\`\`\`python
pd.merge(orders, customers, on="customer_id", how="left")
\`\`\`

And \`sort_values\` orders the result:

\`\`\`python
df.sort_values("price", ascending=False)
\`\`\`

Notice the deliberate parallel to SQL and to spreadsheets: select columns, filter rows, group-and-aggregate, join, sort. The *concepts* are the same across all three tools — only the syntax changes.

## In the real world

pandas was created in 2008 by Wes McKinney at a quantitative investment firm that needed to analyze financial data faster than spreadsheets allowed. It is now one of the most downloaded packages in the world and a standard tool on data teams at companies large and small — the bridge between knowing what analysis you want and being able to repeat it on a million rows without touching a mouse.`,
  },
  {
    slug: "data-visualization",
    title: "Data visualization and dashboards",
    weekNumber: 1,
    blurb: "Choosing the right chart, building dashboards, and avoiding distortion.",
    lectureTitle: "1.6 Data visualization and dashboards (Tableau/Power BI)",
    body: `# Data visualization and dashboards

The last step of the workflow is **communication**. A correct analysis that no one understands changes no decisions. Good visualization turns a table of numbers into a picture a decision-maker grasps in seconds.

## Choosing the right chart

The chart should match the *question*:

- **Bar chart** — compare a value across **categories** (sales by region).
- **Line chart** — show a **trend over time** (revenue by month).
- **Scatter plot** — show the **relationship** between two numeric variables (ad spend vs. sales).
- **Histogram** — show the **distribution** of a single numeric variable (how ages are spread).
- **Pie chart** — show parts of a whole, and only with a few slices (use sparingly; bars are usually clearer).

Picking the wrong type — a line chart across unordered categories, a pie chart with twenty slices — hides the very pattern you are trying to show.

## Dashboards

A **dashboard** collects several related charts and **KPIs** (key performance indicators — the few headline numbers that matter, like monthly active users) onto one screen that updates as new data arrives. Tools like **Tableau** and **Power BI** let analysts build interactive dashboards by dragging fields onto a canvas, with filters the viewer can adjust — no code required.

A good dashboard answers a specific audience's recurring questions at a glance; a bad one is a wall of every chart that could be made.

## Honest visualization

Charts can mislead, sometimes by accident:

- **Truncated axes** — starting a bar chart's y-axis above zero exaggerates small differences.
- **Dual axes and 3-D effects** — distort comparisons and should usually be avoided.
- **Cherry-picked ranges** — showing only the window that supports a conclusion.

The analyst's duty is the same as in section 1.1: serve the decision honestly. A chart designed to *persuade* past what the data supports is the visualization version of garbage out.

## In the real world

The night before the 1986 *Challenger* launch, engineers worried that cold weather would cause O-ring failure. The data existed, but it was presented in dense tables that buried the relationship between temperature and damage. A clear scatter plot of damage versus launch temperature would have made the danger obvious. The shuttle launched in record cold and broke apart, killing seven astronauts. Edward Tufte later used the case to argue that how data is *shown* can be a matter of life and death.`,
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
    title: "Homework 1.1 — Analytics, data structure, and SQL",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.3. Answer each question in a short paragraph (about 3–5 sentences) in your own words; one-word answers will not receive credit.",
    problems: [
      {
        topicSlug: "what-is-data-analytics",
        prompt:
          "Distinguish descriptive from diagnostic analysis, give one original example of each, and explain why a business might need both. (3–5 sentences.)",
        correctAnswer:
          "Descriptive analysis answers 'what happened' by summarizing past data — for example, reporting that website sign-ups fell 12% last month. Diagnostic analysis answers 'why it happened' by drilling into those numbers to find a cause — for example, discovering the drop was concentrated on mobile devices after a checkout redesign. A business needs both because the descriptive number tells it something is wrong while the diagnostic step tells it what to fix; knowing the decline without knowing the cause does not point to an action.",
        explanation:
          "Full credit: separates 'what happened' (descriptive) from 'why' (diagnostic), gives a valid example of each, and notes that descriptive surfaces the issue while diagnostic guides action.",
      },
      {
        topicSlug: "what-is-data-analytics",
        prompt:
          "The analytics workflow begins with 'Ask' before any data is collected. Explain why starting with a precise question matters, and what tends to go wrong when an analysis skips this step. (3–5 sentences.)",
        correctAnswer:
          "Starting with a precise question defines what data you need, what analysis is relevant, and what a useful answer looks like, so the rest of the workflow stays focused. A vague question like 'how are we doing?' gives no guidance on which data to acquire or how to judge the result. Analyses that skip this step tend to collect whatever is handy, produce charts no one asked for, and end without changing any decision. Because the point of analytics is to support a decision, an unclear question usually yields an unactionable answer.",
        explanation:
          "Full credit: ties a precise question to scoping data/analysis and notes that skipping it leads to unfocused, unactionable work.",
      },
      {
        topicSlug: "data-types-spreadsheets",
        prompt:
          "Explain what 'tidy data' means and why a ZIP code is usually better stored as text than as a number. (3–5 sentences.)",
        correctAnswer:
          "Tidy data is structured so that each variable is its own column, each observation is its own row, and each cell holds a single value, which makes it straightforward to filter, group, and analyze. A ZIP code should be stored as text because it is an identifier label, not a quantity you do arithmetic on. Stored as a number, a leading-zero ZIP like 02134 loses its zero and becomes 2134. Choosing the type by how the value is used, not by what characters it contains, prevents this kind of silent corruption.",
        explanation:
          "Full credit: states the three tidy-data rules and explains the ZIP-as-text point via leading zeros / identifier-not-quantity.",
      },
      {
        topicSlug: "sql-queries",
        prompt:
          "A query needs the number of orders per customer, but only for customers with more than five orders. Explain why this requires GROUP BY together with HAVING rather than WHERE. (3–5 sentences.)",
        correctAnswer:
          "Counting orders per customer is an aggregation, so you GROUP BY the customer and use COUNT(*) to get one count per group. The condition 'more than five orders' tests that aggregated count, not an individual row. WHERE is evaluated before grouping and therefore cannot see an aggregate, so filtering on COUNT(*) in WHERE would fail. HAVING is evaluated after the grouping, so it is the clause that can filter groups by their aggregated value.",
        explanation:
          "Full credit: identifies the need for GROUP BY + an aggregate and explains that WHERE runs pre-aggregation while HAVING filters on the aggregate.",
        hint: "Think about the order the database evaluates clauses: WHERE comes before GROUP BY; HAVING comes after.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Cleaning, pandas, and visualization",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.4–1.6. Answer each question in a short paragraph (about 3–5 sentences) in your own words; one-word answers will not receive credit.",
    problems: [
      {
        topicSlug: "data-cleaning",
        prompt:
          "A dataset has a few rows with missing income values. Explain the trade-off between dropping those rows and imputing the missing values, and name one situation favoring each choice. (3–5 sentences.)",
        correctAnswer:
          "Dropping rows is simple and avoids inventing data, but it throws away whatever else those rows contained and can bias results if the missingness is not random. Imputing fills the gaps — for example with the column's median — so you keep the rest of each row, but it introduces estimated values that can distort the analysis if overused. Dropping is reasonable when the missing rows are few and appear random; imputing is preferable when the missing values are numerous and dropping would discard too much useful data. The choice depends on how much data is missing and whether the missingness is random.",
        explanation:
          "Full credit: states that dropping loses data/can bias and imputing invents values, and gives an appropriate situation for each.",
      },
      {
        topicSlug: "data-cleaning",
        prompt:
          "Explain the principle 'garbage in, garbage out' and why an analyst should validate data before, not after, running the analysis. (3–5 sentences.)",
        correctAnswer:
          "'Garbage in, garbage out' means that flawed input data produces flawed results no matter how correct the analysis itself is. A perfectly executed calculation on duplicated, mistyped, or incomplete data yields a confident but wrong answer. Validating data first — checking for duplicates, missing values, and wrong types — catches these problems before they propagate into the conclusions. Validating only afterward risks acting on results that were corrupted from the start, which is far more costly than cleaning up front.",
        explanation:
          "Full credit: defines garbage-in-garbage-out and argues that up-front validation prevents flawed data from invalidating an otherwise-correct analysis.",
      },
      {
        topicSlug: "pandas-analysis",
        prompt:
          "Describe what df.groupby(\"region\")[\"sales\"].sum() does in pandas, and name the SQL operation it corresponds to. (3–5 sentences.)",
        correctAnswer:
          "It splits the DataFrame into groups, one per distinct value of the region column, and then sums the sales column within each group, returning total sales per region. The result is one number per region rather than one per original row. This is the pandas equivalent of a SQL GROUP BY region with SUM(sales). Both express the same split-apply-combine idea: group rows by a key, then aggregate a column for each group.",
        explanation:
          "Full credit: explains group-by-region then sum-of-sales producing per-region totals, and maps it to SQL GROUP BY with SUM.",
        hint: "groupby corresponds directly to one specific SQL clause used with an aggregate function.",
      },
      {
        topicSlug: "data-visualization",
        prompt:
          "You want to show how monthly revenue changed over the past year. Which chart type fits best, and explain why starting the y-axis above zero could mislead the viewer. (3–5 sentences.)",
        correctAnswer:
          "A line chart fits best because the goal is to show a trend over time, and a line naturally connects ordered time points to reveal rises and falls. Starting the y-axis above zero is misleading because it exaggerates the visual size of small changes: a modest increase can look dramatic when the baseline is cut off. The viewer reads the height of the line as the magnitude of change, so a truncated axis distorts that judgment. An honest chart usually starts the axis at zero or clearly signals that it does not.",
        explanation:
          "Full credit: chooses a line chart for a time trend and explains that a truncated y-axis exaggerates small differences and misleads.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit Test — Foundations of Data Analytics",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Covers sections 1.1–1.6. Answer each question in a short paragraph (about 4–6 sentences) in your own words. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "what-is-data-analytics",
        prompt:
          "Name the four types of analysis in order of increasing value, define predictive and prescriptive analysis, and give an example that shows how the two differ. (4–6 sentences.)",
        correctAnswer:
          "The four types, in increasing order, are descriptive, diagnostic, predictive, and prescriptive. Predictive analysis uses patterns in past data to forecast what is likely to happen — for example, estimating that a particular customer has a high probability of canceling their subscription. Prescriptive analysis goes one step further and recommends an action to take in response — for example, advising that this at-risk customer be offered a discount now. The difference is that prediction tells you what will probably happen while prescription tells you what to do about it. Prescriptive analysis is harder and more valuable because it must weigh options and consequences, not just project a trend.",
        explanation:
          "Full credit: lists the four types in order, defines predictive (forecast) vs prescriptive (recommended action), and gives a contrasting example.",
      },
      {
        topicSlug: "data-types-spreadsheets",
        prompt:
          "Explain the difference between a relative and an absolute cell reference in a spreadsheet, and describe a situation where using the wrong one produces an incorrect result. (4–6 sentences.)",
        correctAnswer:
          "A relative reference like B2 shifts when the formula is copied to another cell, so copying it down a column makes it point to B3, B4, and so on. An absolute reference like $B$2 stays fixed no matter where the formula is copied. The two behave differently because relative references are meant to repeat a calculation across rows while absolute references are meant to always point at one fixed cell. A common error is dividing each row's value by a single total stored in one cell using a relative reference: when copied down, the divisor drifts to empty cells and the percentages come out wrong. Using an absolute reference for the total fixes it.",
        explanation:
          "Full credit: defines relative (shifts on copy) vs absolute ($, fixed) and gives a concrete case where a relative reference to a fixed total breaks when copied.",
      },
      {
        topicSlug: "sql-queries",
        prompt:
          "Explain what a JOIN does in SQL and how an inner join differs from a left join. Give an example question that specifically requires a left join. (4–6 sentences.)",
        correctAnswer:
          "A JOIN combines rows from two tables by matching a shared key column, letting you bring related data together. An inner join keeps only the rows that have a match in both tables. A left join keeps every row from the left table even when there is no matching row on the right, filling the missing columns with nulls. They differ in how they treat unmatched left-side rows: an inner join discards them while a left join preserves them. A question that requires a left join is 'list all customers and how many orders each has placed, including customers who have never ordered,' because the never-ordered customers have no rows in the orders table and would vanish under an inner join.",
        explanation:
          "Full credit: defines JOIN by key matching, distinguishes inner (matches only) from left (all left rows + nulls), and gives a question needing unmatched left rows.",
      },
      {
        topicSlug: "data-cleaning",
        prompt:
          "A sales table lists the same country as 'USA', 'U.S.A.', and 'United States'. Explain what problem this causes for analysis and how you would fix it. (4–6 sentences.)",
        correctAnswer:
          "These are inconsistent category labels for a single real category. When you group or count by country, the database treats the three spellings as three separate groups, so the United States total is split three ways and every per-country comparison is wrong. The fix is to standardize the text by mapping all the variants to one canonical label, for example converting 'U.S.A.' and 'United States' to 'USA'. In Excel this is done with find-and-replace or a lookup table, and in pandas by replacing the variant strings. After standardizing, grouping by country produces one correct total per country.",
        explanation:
          "Full credit: identifies that inconsistent categories split a single group and fragment aggregations, and proposes standardizing variants to one canonical label.",
      },
      {
        topicSlug: "pandas-analysis",
        prompt:
          "Describe how filtering rows with a boolean mask works in pandas, and explain how the same idea appears in both SQL and Excel. (4–6 sentences.)",
        correctAnswer:
          "In pandas you write a condition such as df['price'] > 50, which produces a True/False value for every row — a boolean mask. Passing that mask back into the DataFrame, df[df['price'] > 50], keeps only the rows where the condition is True. The underlying idea is row filtering: keep the observations that satisfy a test and drop the rest. In SQL the same idea is the WHERE clause, which keeps rows meeting a condition, and in Excel it appears as a filter on a column or an IF test. So the concept is identical across the three tools and only the syntax changes.",
        explanation:
          "Full credit: explains the True/False mask selecting rows and maps the same filtering concept to SQL WHERE and Excel filters/IF.",
      },
      {
        topicSlug: "data-visualization",
        prompt:
          "Choose the appropriate chart for (a) comparing total sales across five regions and (b) showing the relationship between advertising spend and sales, and justify each choice. (4–6 sentences.)",
        correctAnswer:
          "For comparing total sales across five regions, a bar chart is appropriate because bars compare a single value across distinct categories and their heights are easy to read side by side. For showing the relationship between advertising spend and sales, a scatter plot is appropriate because it plots two numeric variables against each other so you can see whether they move together. The choices follow from the questions: one is a comparison across categories and the other is a relationship between two numbers. A line chart would be wrong for the regions because the categories are not ordered over time, and a bar chart would hide the spend-versus-sales relationship a scatter plot reveals.",
        explanation:
          "Full credit: picks bar for category comparison and scatter for a two-variable relationship, justifying each by the question type.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — Foundations of Data Analytics",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed cumulative final. 45 minutes. Covers the whole course (sections 1.1–1.6). Answer each question in a paragraph (about 5–7 sentences) in your own words. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "what-is-data-analytics",
        prompt:
          "Walk through the six-step analytics workflow for a concrete question of your choosing, naming each step and saying what you would do at it. Then explain why the final 'Act' step is what makes the whole effort worthwhile. (5–7 sentences.)",
        correctAnswer:
          "Take the question 'why did customer churn rise last quarter?' First, Ask: state the question precisely, including what counts as churn and the time window. Second, Acquire: pull the relevant subscription and cancellation data from the database. Third, Clean: remove duplicate accounts, fix mistyped dates, and handle missing fields. Fourth, Analyze: filter to the quarter, group churn by plan and region, and compare against prior periods. Fifth, Visualize and communicate: chart churn over time and by segment so the pattern is clear to decision-makers. Sixth, Act: use the finding — say, churn concentrated in one plan — to change that plan, which is the point, because an analysis that changes no decision has produced no value no matter how rigorous the earlier steps were.",
        explanation:
          "Full credit: names all six steps (Ask, Acquire, Clean, Analyze, Visualize/Communicate, Act) applied to one question, and argues that Act is what delivers value because analytics exists to support decisions.",
      },
      {
        topicSlug: "sql-queries",
        prompt:
          "Explain how SQL, pandas, and spreadsheets express the same core analytics operations (filtering, grouping/aggregating, joining). Use one operation to show the parallel concretely. (5–7 sentences.)",
        correctAnswer:
          "All three tools support the same small set of core operations: filtering rows to those that meet a condition, grouping rows and aggregating a value per group, and joining tables on a shared key. The concepts are identical and only the syntax differs. Take grouping and aggregating: in SQL you write GROUP BY category with an aggregate like AVG(price); in pandas you write df.groupby('category')['price'].mean(); in Excel you build a PivotTable that groups on category and averages price. Each produces one summary value per category from many rows. Filtering shows the same parallel — SQL's WHERE, a pandas boolean mask, and an Excel filter all keep rows that satisfy a test. Because the underlying ideas transfer, learning one tool makes the others much faster to pick up.",
        explanation:
          "Full credit: states that filtering, grouping/aggregating, and joining are shared across the three tools, and demonstrates one operation (e.g., group-and-aggregate) in all three with matching meaning.",
      },
      {
        topicSlug: "data-cleaning",
        prompt:
          "Using a real or invented example, explain how dirty data can lead to a confidently wrong conclusion, and describe the cleaning steps that would prevent it. Connect this to the 'garbage in, garbage out' principle. (5–7 sentences.)",
        correctAnswer:
          "Suppose an analyst reports average order value, but the order table contains duplicate rows for some orders and a batch of prices accidentally stored as text. The duplicates inflate the count and totals, and the text prices are dropped from the average, so the reported figure is wrong even though the AVG calculation itself is flawless. This is garbage in, garbage out: the formula is correct but the input is corrupt, so the output is a confident wrong number. Cleaning prevents it: remove duplicate rows so each order is counted once, convert the text prices to real numbers so they are included, and check for missing or impossible values before computing. Validating the data before the analysis, not after, ensures the average reflects reality. The lesson is that data cleaning is not preliminary busywork but part of producing a trustworthy result.",
        explanation:
          "Full credit: gives a concrete way dirty data (duplicates, wrong types, missing) skews a correct calculation, prescribes the matching cleaning steps, and ties it explicitly to garbage-in-garbage-out and up-front validation.",
      },
      {
        topicSlug: "data-visualization",
        prompt:
          "An analyst has a correct result but presents it in a chart that misleads the audience. Explain two specific ways a chart can distort honest data, and argue why honest visualization is part of the analyst's responsibility. (5–7 sentences.)",
        correctAnswer:
          "Even correct numbers can be distorted by how they are drawn. One way is a truncated y-axis: starting a bar or line chart above zero magnifies small differences so a trivial change looks dramatic. A second way is choosing the wrong chart or a cherry-picked range — for instance a 3-D pie with many slices, or showing only the time window that supports a desired conclusion — which hides the real pattern. Both let a technically accurate dataset tell a false story. Honest visualization is the analyst's responsibility because the purpose of the whole workflow is to help someone make a good decision, and a chart engineered to persuade beyond what the data supports defeats that purpose. It is the visualization version of garbage out: misleading communication corrupts the decision just as surely as bad input data would. Choosing a fitting chart, a zero baseline, and the full relevant range keeps the presentation faithful to the analysis.",
        explanation:
          "Full credit: names two concrete distortions (e.g., truncated axis, misleading chart type / cherry-picked range), explains how each misleads despite correct data, and argues honest visualization serves the decision the analysis exists to support.",
      },
    ],
  },
];

type SeedPrimer = SeedTopic;

const REASONING_PRIMERS: SeedPrimer[] = [
  {
    slug: "reasoning-primer-ethical",
    title: "How to reason about data-judgment dilemmas",
    weekNumber: 1,
    blurb:
      "Assessment primer: weighing considerations in real data-work decisions.",
    lectureTitle: "Primer: How to reason about data-judgment dilemmas",
    body: `# How to reason about data-judgment dilemmas

This short primer prepares you for the **Professional Judgment** diagnostic. That instrument does not ask for the "right" answer — it asks *which considerations you give weight to* when you decide. Here is the method it rewards.

## A dilemma is a clash of considerations

A genuine dilemma in data work is a situation where several real considerations pull in different directions: a privacy duty, pressure to deliver a result, a stakeholder's interest, the accuracy of what you report. Reasoning well does not mean ignoring the considerations you act against — it means being honest that they had weight, and saying why other considerations outweighed them.

## Three levels of consideration

When you justify a decision, the *kind* of reason you appeal to matters:

- **Personal-interest reasons** — what is easiest, safest, or most rewarding *for the decider*. ("It would be awkward to flag the error.")
- **Maintaining-norms reasons** — what the rules, the law, or one's role formally require. ("Company policy says to.") These keep order, but a rule can itself be inadequate.
- **Principle-based reasons** — appeals to honesty, fairness, and the impartial interests of *everyone affected*, justifiable to any reasonable person. ("The people relying on this report deserve an accurate picture.")

The diagnostic's **principled-reasoning index** rises when you give the most weight to principle-based considerations rather than to convenience or to "because that's the rule."

## How to take the instrument well

1. **Decide the action** the person should take.
2. **Rate every consideration** by how much it actually weighed on you — be honest, not strategic.
3. **Rank your top few.** Ranking is where you say what *most* drove the decision.
4. **Read each consideration carefully.** Some are deliberately hollow or jargon-filled and reward nothing; ranking one high is a reliability flag.

There is no penalty for the action you choose. What is measured is the *quality of the reasons* you stand behind.`,
  },
  {
    slug: "reasoning-primer-critical",
    title: "Core critical-thinking skills",
    weekNumber: 1,
    blurb:
      "Assessment primer: analysis, inference, evaluation, deduction, and induction.",
    lectureTitle: "Primer: Core critical-thinking skills",
    body: `# Core critical-thinking skills

This short primer prepares you for the **Critical Reasoning** diagnostic — a set of multiple-choice items that test five distinct reasoning skills. These are the same skills you use when you decide what a dataset really shows, so they matter directly for analytics.

## The five skills

- **Analysis** — break an argument into parts: identify its **conclusion**, its stated **premises**, and any **unstated assumption** it depends on. Ask: "What is this arguing *for*, and what does it take for granted?"
- **Inference** — work out what *follows* from given information, and how strongly. Distinguish what must be true, what is likely, and what is merely possible.
- **Evaluation** — judge how much support the reasons actually give the conclusion. Spot when evidence is irrelevant, a source is unreliable, or a step does not connect.
- **Deduction** — reason where a true set of premises *guarantees* the conclusion. In a valid deduction, the conclusion cannot be false if the premises are true. Watch for invalid forms (e.g. affirming the consequent).
- **Induction** — reason from evidence or examples to a *probable* generalization or prediction. Good induction has a large, representative sample; weak induction over-generalizes from too little.

## A recurring trap: correlation is not causation

Most wrong answers are statements that are *plausible* or sound data-driven but are **not actually supported by the evidence given**. The discipline this instrument rewards is the same one analytics demands: keep apart what the data **shows**, what you are **assuming**, and what only *sounds* reasonable. Two things rising together does not prove one causes the other.

## How to take the instrument well

1. Find the **conclusion** first, then the premises.
2. Ask which of the five skills the question targets (an assumption question is analysis; a "what follows" question is inference or deduction; a "how good is this reasoning" question is evaluation).
3. Choose the option that follows **only** from what is given — not the one that is merely true or appealing.`,
  },
];

// Insert any teaching-to-the-test primer lectures whose slug is not yet present.
// Safe to run on every boot: it only adds what is missing.
export async function seedReasoningPrimersIfMissing(): Promise<void> {
  let added = 0;
  for (let i = 0; i < REASONING_PRIMERS.length; i++) {
    const t = REASONING_PRIMERS[i]!;
    const existing = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.slug, t.slug));
    if (existing.length > 0) continue;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: 900 + i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert primer ${t.slug}`);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
    added += 1;
  }
  if (added > 0) {
    logger.info({ added }, "Reasoning primers seeded");
  } else {
    logger.info("Reasoning primers: already present, skipping");
  }
}

export async function seedIfEmpty(): Promise<void> {
  // The course was migrated to the Foundations of Data Analytics syllabus.
  // Detect the marker topic; if present and the content version matches, the
  // content is current and we skip. This makes the seed self-healing across
  // environments: a database that still holds older content (e.g. the previous
  // Ethics curriculum) is detected and replaced on boot.
  const markerTopic = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(eq(topicsTable.slug, "what-is-data-analytics"));
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
        "Seed: stale course content detected — replacing with the Data Analytics curriculum",
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
