// ---------------------------------------------------------------------------
// Original content for the embedded diagnostic reasoning assessments.
//
// Two instruments, each administered twice (a baseline before the course and a
// checkpoint after the single unit) with MUTUALLY UNIQUE items:
//   - Ethical Reasoning  (DIT-style): a workplace data-ethics dilemma; the
//     student rates ~12 considerations by importance and ranks the most
//     important few. A principled-reasoning ("P") index is computed from how
//     postconventional considerations are ranked. Stages: P = personal
//     interest, M = maintaining norms/rules/approval, PC = postconventional/
//     principled, X = meaningless (a reliability check — ranking it high
//     signals careless responding).
//   - Critical Reasoning (CCTST-style): multiple-choice items spanning analysis,
//     inference, evaluation, deduction, and induction.
//
// All items are ORIGINAL. No real DIT or CCTST items are reproduced. For every
// MCQ the correct option is written FIRST; at seed time options are rotated so
// the correct answer lands at a varied index (see seedDiagnostics.ts).
// ---------------------------------------------------------------------------

export type Stage = "P" | "M" | "PC" | "X";

export type DilemmaItem = {
  prompt: string;
  decisionOptions: string[];
  considerations: { text: string; stage: Stage }[];
  rankCount: number;
};

export type SkillArea =
  | "analysis"
  | "inference"
  | "evaluation"
  | "deduction"
  | "induction";

export type McqItem = {
  prompt: string;
  // Correct option is listed FIRST. Rotated at seed time.
  options: string[];
  skillArea: SkillArea;
};

export type Phase = "baseline" | "unit1";

export type DiagnosticSeed = {
  instrument: "ethical" | "critical";
  phase: Phase;
  title: string;
  subtitle: string;
  instructions: string;
  dilemmas?: DilemmaItem[];
  mcqs?: McqItem[];
};

const ETHICAL_INSTRUCTIONS =
  "Read the scenario and decide what the person should do. Then rate each consideration by how important it was to your decision, and finally rank your most important considerations. There are no right or wrong answers here — answer honestly. Submitting completes the assessment and you'll receive written feedback on your reasoning.";

const CRITICAL_INSTRUCTIONS =
  "Answer each question by selecting the single best option. Work carefully — these questions measure reasoning, not recall. Submitting completes the assessment and you'll receive written feedback on your performance.";

// ===========================================================================
// ETHICAL REASONING — two unique data-work dilemmas
// ===========================================================================

const DILEMMA_BASELINE: DilemmaItem = {
  prompt:
    "Riley, a data analyst, has finished the quarterly sales report. Growth was essentially flat — about 1%. Riley's manager, who presents to the board tomorrow, asks Riley to start the chart's y-axis high up the scale so the tiny increase 'looks like real momentum.' The underlying numbers would be unchanged — only the chart's scale would be adjusted.\n\nShould Riley refuse and present the chart with an honest zero baseline?",
  decisionOptions: [
    "Riley should refuse and present the chart honestly",
    "Can't decide",
    "Riley should rescale the chart to look more positive, as asked",
  ],
  considerations: [
    { text: "Whether refusing would make Riley look difficult and hurt their standing on the team.", stage: "P" },
    { text: "Whether the board has a right to an accurate picture in order to make sound decisions.", stage: "PC" },
    { text: "Whether Riley's job is simply to produce whatever the manager asks for.", stage: "M" },
    { text: "Whether a rescaled chart, even with unchanged numbers, deceives the people relying on it.", stage: "PC" },
    { text: "Whether Riley would feel more comfortable just going along with the request.", stage: "P" },
    { text: "Whether professional reporting standards call for charts that do not distort the data.", stage: "M" },
    { text: "Whether Riley might be praised by the manager for being a cooperative 'team player'.", stage: "P" },
    { text: "Whether distorting the scale undermines the trust the whole reporting process depends on.", stage: "PC" },
    { text: "Whether the office should upgrade its presentation software.", stage: "X" },
    { text: "Whether 'everyone tweaks charts to look good anyway.'", stage: "M" },
    { text: "Whether the people affected by the board's decision deserve a faithful view of the facts.", stage: "PC" },
    { text: "Whether refusing might cost Riley a future promotion.", stage: "P" },
  ],
  rankCount: 4,
};

const DILEMMA_UNIT1: DilemmaItem = {
  prompt:
    "Sam, an analyst at a health app, is asked to build an internal dashboard that would be far more useful if it drew on users' individual records. Users were told their data would be kept private and only ever shown in aggregate. Combining the individual records would help the product team a great deal, and management says 'the data is ours anyway.'\n\nShould Sam refuse to use the individual private records?",
  decisionOptions: [
    "Sam should refuse to use the individual private records",
    "Can't decide",
    "Sam should use the records as management asks",
  ],
  considerations: [
    { text: "Whether users have a right to the privacy they were explicitly promised.", stage: "PC" },
    { text: "Whether Sam could be blamed if the data use later came to light.", stage: "P" },
    { text: "Whether keeping a promise to users matters even when breaking it would be profitable.", stage: "PC" },
    { text: "Whether management's say-so settles what is permissible.", stage: "M" },
    { text: "Whether Sam would gain favor by delivering the richer dashboard.", stage: "P" },
    { text: "Whether company policy or data-protection law governs how the records may be used.", stage: "M" },
    { text: "Whether Sam finds the product team personally likeable.", stage: "P" },
    { text: "Whether the people whose data it is would consent if they were actually asked.", stage: "PC" },
    { text: "Whether the dashboard should use a dark color theme.", stage: "X" },
    { text: "Whether 'the data is ours anyway' is a good enough justification.", stage: "M" },
    { text: "Whether trust between the company and its users depends on honoring such promises.", stage: "PC" },
    { text: "Whether refusing could put Sam's own job at risk.", stage: "P" },
  ],
  rankCount: 4,
};

// ===========================================================================
// CRITICAL REASONING — two unique 10-item forms (correct option listed first)
// ===========================================================================

const CRITICAL_BASELINE: McqItem[] = [
  {
    prompt:
      "Consider: 'All students who studied passed the exam. Maria studied. So Maria passed.' Which unstated assumption does the argument rely on?",
    options: [
      "Maria is among the students the first statement describes.",
      "Studying is the only way to pass the exam.",
      "Maria always studies for her exams.",
      "The exam was unusually difficult.",
    ],
    skillArea: "analysis",
  },
  {
    prompt:
      "'Since the new policy cut accidents by 40%, and fewer accidents mean lower insurance costs, the city should keep the policy. After all, saving money benefits everyone.' What is the main conclusion?",
    options: [
      "The city should keep the policy.",
      "The new policy cut accidents by 40%.",
      "Fewer accidents mean lower insurance costs.",
      "Saving money benefits everyone.",
    ],
    skillArea: "analysis",
  },
  {
    prompt:
      "A survey finds 70% of people who exercise daily report good sleep, versus 30% of those who never exercise. Which conclusion is best supported?",
    options: [
      "People who exercise daily are more likely to report good sleep than those who never exercise.",
      "Exercise guarantees good sleep for everyone.",
      "Poor sleep is what causes people to stop exercising.",
      "Anyone who wants good sleep must exercise daily.",
    ],
    skillArea: "inference",
  },
  {
    prompt:
      "A report notes that ice-cream sales and drowning deaths rise in the same months. A careful reader should infer that:",
    options: [
      "Both may be linked to a third factor, such as hot weather.",
      "Eating ice cream causes drowning.",
      "Drowning incidents cause ice-cream sales.",
      "The data must simply be mistaken.",
    ],
    skillArea: "inference",
  },
  {
    prompt: "Which source would most strengthen the claim 'this medication is safe'?",
    options: [
      "A large, peer-reviewed clinical trial.",
      "A testimonial from one satisfied customer.",
      "An advertisement produced by the manufacturer.",
      "A popular wellness blog post.",
    ],
    skillArea: "evaluation",
  },
  {
    prompt:
      "'My grandfather smoked daily and lived to 95, so smoking isn't really harmful.' The main weakness of this argument is that it:",
    options: [
      "Relies on a single example against strong statistical evidence.",
      "Quotes an unreliable expert.",
      "Contains an internal contradiction.",
      "Appeals purely to emotion.",
    ],
    skillArea: "evaluation",
  },
  {
    prompt:
      "'All mammals are warm-blooded. All whales are mammals. Therefore all whales are warm-blooded.' This argument is:",
    options: [
      "Valid.",
      "Invalid, because whales live in water.",
      "Invalid, because it assumes what it proves.",
      "Invalid, because the premises are uncertain.",
    ],
    skillArea: "deduction",
  },
  {
    prompt:
      "'If it rained, the streets are wet. The streets are not wet.' What necessarily follows?",
    options: [
      "It did not rain.",
      "It rained.",
      "The streets are dry for some other reason.",
      "Nothing at all follows.",
    ],
    skillArea: "deduction",
  },
  {
    prompt:
      "A pollster surveys five of her friends and predicts how the whole country will vote. The strongest objection is that:",
    options: [
      "The sample is far too small and unrepresentative.",
      "Friends never tell the truth.",
      "Polls are always wrong.",
      "Voting is supposed to be private.",
    ],
    skillArea: "induction",
  },
  {
    prompt:
      "Plants given a new fertilizer grew taller than otherwise identical plants without it, all else held equal. The best-supported conclusion is:",
    options: [
      "The fertilizer probably caused the extra growth.",
      "Taller plants attract more fertilizer.",
      "Fertilizer is required for any plant growth at all.",
      "The result was pure coincidence.",
    ],
    skillArea: "induction",
  },
];

const CRITICAL_UNIT1: McqItem[] = [
  {
    prompt: "'We should ban the chemical because it's unnatural.' This argument assumes that:",
    options: [
      "Natural things are always safe and unnatural things are harmful.",
      "The chemical is expensive to produce.",
      "Bans are easy to enforce.",
      "Most people dislike the chemical.",
    ],
    skillArea: "analysis",
  },
  {
    prompt:
      "'The bridge must be inspected, because cracks have appeared and ignoring cracks has caused collapses before.' Which is a premise supporting the conclusion?",
    options: [
      "Cracks have appeared on the bridge.",
      "The bridge must be inspected.",
      "The bridge is quite old.",
      "Inspections are expensive.",
    ],
    skillArea: "analysis",
  },
  {
    prompt:
      "A study finds students who eat breakfast score higher on morning tests than those who skip it. Which is best supported?",
    options: [
      "Eating breakfast is associated with higher morning test scores.",
      "Breakfast makes everyone a genius.",
      "Skipping breakfast should be banned.",
      "Tests should always be held in the afternoon.",
    ],
    skillArea: "inference",
  },
  {
    prompt: "'All items on the shelf are on sale. The blue mug is on the shelf.' Therefore:",
    options: [
      "The blue mug is on sale.",
      "The blue mug is expensive.",
      "Only mugs are on sale.",
      "The shelf is completely full.",
    ],
    skillArea: "inference",
  },
  {
    prompt: "To evaluate the claim 'crime is rising,' which is the most relevant evidence?",
    options: [
      "Official crime statistics gathered over several years.",
      "A friend's sense that things seem worse lately.",
      "A dramatic recent news headline.",
      "A popular movie about crime.",
    ],
    skillArea: "evaluation",
  },
  {
    prompt:
      "'You can't trust her argument for the policy — she's not even an economist.' This response is weak because it:",
    options: [
      "Attacks the person rather than the argument.",
      "Relies on too much data.",
      "Is far too detailed.",
      "Simply restates the policy.",
    ],
    skillArea: "evaluation",
  },
  {
    prompt:
      "'If a number is divisible by 4, it is even. Twelve is divisible by 4.' What necessarily follows?",
    options: [
      "Twelve is even.",
      "Twelve is odd.",
      "All even numbers are divisible by 4.",
      "Nothing follows.",
    ],
    skillArea: "deduction",
  },
  {
    prompt:
      "'If she practiced, she improved. She improved. Therefore she practiced.' This reasoning is:",
    options: [
      "Invalid, because she might have improved for another reason.",
      "Valid and certain.",
      "Invalid, because practice never helps.",
      "Valid only on weekends.",
    ],
    skillArea: "deduction",
  },
  {
    prompt:
      "After three rainy Mondays in a row, someone concludes 'it always rains on Mondays.' This generalization is:",
    options: [
      "Hasty — based on far too few cases.",
      "A valid logical deduction.",
      "Certainly true.",
      "Impossible to evaluate at all.",
    ],
    skillArea: "induction",
  },
  {
    prompt:
      "A new drug cured 95% of patients in a large, well-designed trial. The best-supported prediction is:",
    options: [
      "The drug will likely help most future patients with the condition.",
      "The drug will cure every disease.",
      "The drug works only inside trials.",
      "The drug is probably unsafe.",
    ],
    skillArea: "induction",
  },
];

export const DIAGNOSTIC_SEED: DiagnosticSeed[] = [
  {
    instrument: "ethical",
    phase: "baseline",
    title: "Ethical Reasoning Inventory — Baseline",
    subtitle: "Before the course",
    instructions: ETHICAL_INSTRUCTIONS,
    dilemmas: [DILEMMA_BASELINE],
  },
  {
    instrument: "critical",
    phase: "baseline",
    title: "Critical Reasoning Assessment — Baseline",
    subtitle: "Before the course",
    instructions: CRITICAL_INSTRUCTIONS,
    mcqs: CRITICAL_BASELINE,
  },
  {
    instrument: "ethical",
    phase: "unit1",
    title: "Ethical Reasoning Inventory — Course Checkpoint",
    subtitle: "After Unit 1: Foundations of Data Analytics",
    instructions: ETHICAL_INSTRUCTIONS,
    dilemmas: [DILEMMA_UNIT1],
  },
  {
    instrument: "critical",
    phase: "unit1",
    title: "Critical Reasoning Assessment — Course Checkpoint",
    subtitle: "After Unit 1: Foundations of Data Analytics",
    instructions: CRITICAL_INSTRUCTIONS,
    mcqs: CRITICAL_UNIT1,
  },
];
