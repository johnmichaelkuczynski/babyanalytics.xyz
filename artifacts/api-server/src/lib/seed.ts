import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Foundations of Value
  {
    slug: "what-is-ethics",
    title: "What is ethics?",
    weekNumber: 1,
    blurb: "Normative vs. descriptive statements; what ethics studies.",
    lectureTitle: "1.1 What is ethics? Normative vs. descriptive",
    body: `# What is ethics?

There are two kinds of statements: **descriptive** and **normative**.

A *descriptive* statement says that such and such is the case. It carries no value-judgment. "Smith is over six feet tall" and "grass is green" are descriptive — they simply report facts.

A *normative* statement expresses a **value-judgment**. It says that something falls short of, satisfies, or exceeds some standard or norm. "It was evil of Hitler to commit genocide," "it is wrong to steal," "it is commendable to give to charity," and "Smith acted valiantly in saving the drowning toddler" are all normative.

## What ethics is

Ethics is the discipline that tries to **clarify the structure of normative concepts** — to state as clearly as possible the conditions a thing must satisfy in order to fall under them. What exactly must an act satisfy to be praiseworthy? What must an institution satisfy to be just?

So ethics is not, at bottom, a list of rules. It is an attempt to make explicit what we *mean* when we judge an act good or bad, right or wrong, just or unjust.

## Why the distinction matters

Much confusion in moral argument comes from sliding between description and evaluation — treating "people do X" as if it settled "people ought to do X." Keeping the two kinds of statements apart is the first discipline of clear ethical thinking.`,
  },
  {
    slug: "normative-categories",
    title: "Normative categories",
    weekNumber: 1,
    blurb: "Concepts that occur only in value-judgments.",
    lectureTitle: "1.2 Normative categories",
    body: `# Normative categories

A **normative category** is a concept that occurs *only* in normative judgments — never in purely factual ones.

Examples include: *good, bad, just, unjust, valiant, noble, wicked, depraved, commendable,* and *condemnable*. You cannot use any of these to merely describe the world; to apply them is already to evaluate.

## Contrast with descriptive categories

"Tall," "green," "heavy," and "six feet" are descriptive categories — applying them takes a measurement, not a value-judgment. "Noble" and "depraved" are different in kind: they place an act or person on a scale of worth.

## Ethics as the study of these concepts

Ethics tries to map the **internal structure** of normative categories. When we call an act *condemnable*, what conditions are we claiming it meets? When we call a person *noble*, what are we attributing to them?

A key lesson of this course is that these concepts are subtler than they first appear. "Good" turns out to mean several different things; "right" is not the same as "good"; and "condemnable" is not simply the absence of "commendable." Sorting these categories out carefully is most of the work of ethics.`,
  },
  {
    slug: "instrumental-intrinsic",
    title: "Instrumental vs. intrinsic goodness",
    weekNumber: 1,
    blurb: "Useful-as-a-means vs. good-in-itself; what ethics cares about.",
    lectureTitle: "1.3 Instrumental vs. intrinsic goodness",
    body: `# Two kinds of goodness

The words "good" and "bad" are **ambiguous** — each has more than one meaning, and each has both normative and non-normative uses. Start with "good."

## Instrumental goodness

To say an act is **instrumentally good** is to say it has consequences desired by, or to the advantage of, the agent (the person who acts). If my sole aim is money, then stealing a million dollars from an orphanage — assuming I get away with it — is instrumentally good *for me*. It is *useful*: it serves my practical interest.

But stealing from a charity is obviously not **ethically** good. It is good only in a practical, strategic sense.

## Intrinsic goodness

If something is good in a **non-instrumental** sense — good even when its consequences are set aside — it is **intrinsically good**. Ethics is concerned with intrinsic goodness. It asks: *which things are good in themselves?*

Ethics has no interest in helping thieves steal more efficiently or politicians grab more power. It seeks the courses of action and states of affairs that are good *even if their consequences are disregarded*.

## A tentative list

No two ethicists fully agree, but many count among the intrinsic goods: happiness, intelligence, benevolence, honesty, loyalty, pleasure, life, friendship, compassion, and freedom (freedom from physical coercion, emotional freedom, and intellectual freedom). Helping someone in need at no advantage to oneself is intrinsically good; so is being honest when lying would be easier.

## Not mutually exclusive

The two kinds overlap. A sharp intellect is *instrumentally* good (it improves your position) **and** *intrinsically* good (its value exceeds any advantage it brings). The same holds for happiness, friendship, and honesty.`,
  },
  {
    slug: "goodness-commendableness",
    title: "Goodness and commendableness",
    weekNumber: 1,
    blurb: "Why some intrinsic goods deserve no praise.",
    lectureTitle: "1.4 Goodness vs. commendableness",
    body: `# Goodness vs. commendableness

"Intrinsic good" is *itself* ambiguous. Some intrinsically good things are **commendable** — they deserve praise. Some are not. (Ambiguities within ambiguities are common in philosophy.)

## Good but not praiseworthy

Happiness is intrinsically good. But does a happy person *deserve praise* for being happy? Not necessarily. If Smith is just naturally cheerful — if his good spirits cost him no effort and require no estimable act — then his happiness is genuinely good, yet he merits no praise for it.

The starkest case: a **rabbit's** happiness is a good thing. But given a rabbit's cognitive limits, it cannot act in a praiseworthy way. Its happiness is good without being commendable. ("Commendable" just means "praiseworthy.")

Likewise a naturally gifted pianist who never had to work for his talent: the talent and the joy it brings are intrinsically good, but he deserves no praise for a gift he did nothing to earn.

## Good *and* praiseworthy

Other intrinsic goods *are* commendable. Jones works long hours for a charity knowing he gains nothing practical by it. His behavior is both intrinsically good **and** commendable.

## The bottom line

There are **two kinds of intrinsic goods**: those that are commendable and those that are not. Praiseworthiness is not the same property as goodness — a lesson that becomes central when we turn to judging agents.`,
  },
  {
    slug: "two-kinds-badness",
    title: "Two kinds of intrinsic badness",
    weekNumber: 1,
    blurb: "Why some intrinsic evils deserve no censure.",
    lectureTitle: "1.5 Two kinds of intrinsic badness",
    body: `# Two kinds of intrinsic badness

Goodness split into the commendable and the merely good. **Badness** splits the same way.

## Bad but not blameworthy

It is obviously bad to be unhappy, and the badness is **intrinsic** — being unhappy is bad in itself, even apart from any further misfortune it causes (a weakened immune system, alienated friends).

But one does not always *deserve censure* for being unhappy. Someone grieving the death of a loved one does not merit a reprimand for the grief. If anything, the person who felt *nothing* at such a loss would deserve censure — "only a monster would feel nothing."

So unhappiness is intrinsically bad without being **condemnable**.

## Bad *and* blameworthy

Other intrinsic evils clearly do warrant censure. Causing someone else to suffer for no good reason is intrinsically bad **and** condemnable.

## The bottom line

Some, but not all, intrinsically bad things are condemnable. "Intrinsically bad" is **not** identical with "worthy of condemnation" — just as "intrinsically good" is not identical with "worthy of praise." This symmetry between goodness/commendableness and badness/condemnableness is the backbone of how we will judge acts and agents.`,
  },
  {
    slug: "morally-complex",
    title: "Morally complex situations",
    weekNumber: 1,
    blurb: "How one act can be good in one respect and bad in another.",
    lectureTitle: "1.6 The morally complex structure of situations",
    body: `# Morally complex situations

A single act or state of affairs can be **intrinsically good in one respect and intrinsically bad in another**.

## The piano example

Suppose I am playing the piano beautifully and taking real pleasure in it. That is an intrinsic good. But suppose my playing is waking my very sick roommate, who needs sleep, and I know it. Then my playing — though still an intrinsic good — is also **condemnable**. It is wrong, *and* it is intrinsically good at the same time.

This looks like a paradox but is not, because (as the next section shows) "wrong" is **not** the opposite of "good." Wrongness is not the absence of goodness, and "right" is not identical with "good."

## Commendable *and* condemnable

A single act can also be both praiseworthy and blameworthy. Jones, a tough and vindictive man, insults Smith; Green, Smith's friend, savagely beats Jones to avenge Smith's honor (out of pure loyalty, no self-interest). Green's act is **commendable** — it is loyal and courageous. It is also **condemnable** — it is excessive, unnecessary violence.

## The lesson

Most real situations are mixed. The temptation to label an act simply "good" or simply "bad" usually distorts it. Mature moral judgment means tracking several normative properties of the *same* act at once.`,
  },
  {
    slug: "non-privative",
    title: "The non-privative character of moral attributes",
    weekNumber: 1,
    blurb: "Why good and bad can coexist: badness is a presence, not an absence.",
    lectureTitle: "1.7 The non-privative character of moral attributes",
    body: `# Why good and bad can coexist

There is nothing paradoxical about one act being both commendable and condemnable. The reason is logical: **neither property is the absence of the other**.

## Privative vs. positive properties

A **privative** property is one a thing has by *lacking* something. To be *cold* is to lack heat; to be *dumb* is to lack intelligence; to be *poor* is to lack money. To be sugar-free is to lack sugar.

A **positive** property is one a thing has by *having* something extra. To be *hot, smart, rich,* or *sugary* is not to lack anything — it is to possess something. (Here "positive" is a strictly logical term, with no moral connotation: being *poisonous* is a positive property in this sense.)

## Moral attributes are positive

Being **condemnable** is positive, not privative — it is the presence of something, not the absence of commendableness. Being **commendable** is also positive. So neither is identical with the absence of the other, which is exactly why both can be present in one act.

## Badness is a presence

People resist calling an act both good and bad partly because they wrongly think badness is the *absence* of goodness. It is not. A rock *lacks* goodness, yet a rock is not bad — it is neither good nor bad. To be bad you must have something **extra**: Hitler was bad not because he lacked something but because he *had* something rocks don't — ill will and a willingness to act on it.

The other reason people resist is psychological: it is easier to sort the world into saints and monsters than to see everyone, including oneself, as part-saint and part-monster. But that craving for simplicity does not match the real moral structure of most acts.`,
  },

  // Unit 2 — Obligation, Right, and Wrong
  {
    slug: "weight-of-obligations",
    title: "The weight of moral obligations",
    weekNumber: 2,
    blurb: "Obligations come in degrees; so does wrongness.",
    lectureTitle: "2.1 Moral obligations have weight",
    body: `# Moral obligations have weight

Moral attributes are not binary, and neither are obligations. **Obligations come in degrees** — some are stronger than others.

## A scale of obligation

If I promise to meet you for lunch, I have an obligation to show up. But that obligation is weaker than my obligation to teach the classes a university pays me to teach. And *that* is weaker than a head of state's obligation to serve the interests of hundreds of millions of constituents.

## Degrees of wrongness

It follows that **wrongness comes in degrees** too. It is wrong to skip a lunch I promised to attend; *more* wrong to skip a class I am paid to teach; and *more* wrong still for a head of state to betray the trust of those they govern.

## Why this matters

A binary picture — "obligatory or not," "wrong or not" — cannot capture moral life. Real decisions are about *comparing weights*: which obligation is stronger, which wrong is graver. The next sections build directly on this idea, since conflicts between obligations of different weight are what force the hardest choices.`,
  },
  {
    slug: "outweigh-vs-cancel",
    title: "Outweighing vs. canceling obligations",
    weekNumber: 2,
    blurb: "An outweighed obligation still exists.",
    lectureTitle: "2.2 Outweighing is not canceling",
    body: `# Outweighing is not canceling

We often face **conflicting obligations**. A central point: when one obligation outweighs another, it does **not** cancel it.

## The case

My best friend, who has always been kind to me, keeps a million dollars in a safe I can access. I have a clear obligation not to steal it — doing so would harm a decent person and betray his trust.

But I have five young children who will die without expensive medical treatment I cannot otherwise afford in time. The only way to save them is to take my friend's money. There is no third option.

## The stronger obligation

My obligation to save my children is **stronger** than my obligation not to steal. So the right thing — the *least bad* thing — is to take the money: the moral value of saving five lives exceeds the value of not stealing.

## But the weaker obligation remains

Crucially, that does **not** mean my obligation not to steal *ceases to exist*. In taking the money I still do something to my friend that he has a right not to undergo, and that I therefore had an obligation not to do. An obligation that is outweighed by a stronger one is **overridden, not erased**.

This is why doing "the right thing" in a dilemma can still leave a genuine moral residue — regret, a debt, something owed. The defeated obligation was real.`,
  },
  {
    slug: "right-least-bad",
    title: '"Right" = least bad',
    weekNumber: 2,
    blurb: "Why the right act need not be a good one.",
    lectureTitle: '2.3 "Right" ≠ "good"; "right" = "least bad"',
    body: `# "Right" means "least bad"

It is easy to assume the **right** act is a *good* act. It is not.

## Back to the safe

Recall the dilemma: steal my friend's money or let my children die. The **right** thing is to steal the money — but stealing it is plainly the **lesser of two evils**. It is a bad thing, even a terrible thing; the alternative is simply worse.

So what makes the act *right* is **not** that it is a positive good. It is that it is the **least bad option the circumstances allow**.

## The general definition

In general, "the right course of action" means **the least bad course of action available** under the circumstances. Rightness is comparative: it is defined relative to the alternatives actually open to you, not against some abstract ideal of pure goodness.

## Why this matters

This dissolves the apparent paradox from Unit 1 — that an act can be wrong yet intrinsically good, or right yet bad. "Right" and "good" are simply different concepts. Recognizing that the right choice is often a bad one, chosen only because the others are worse, is essential to thinking honestly about dilemmas.`,
  },
  {
    slug: "wrong-least-good",
    title: '"Wrong" = least good',
    weekNumber: 2,
    blurb: "Why a wrong act can still be a good one.",
    lectureTitle: '2.4 "Wrong" ≠ "bad"; "wrong" = "least good"',
    body: `# "Wrong" means "least good"

Just as "right" is not "good," **"wrong" is not "bad."** A wrong act need not be a bad act. To be **wrong** is to be the **least good** of the available options.

## The rescue case

Suppose I can take exactly one of three actions:

- **(i)** save individuals M1–M10 (save 10, let 7 die),
- **(ii)** save M11–M15 (save 5, let 12 die),
- **(iii)** save M16–M17 (save 1... rather, save 2, let many more die).

Assume everyone is equally worthy of life.

If I choose to save the *smallest* group, I am still doing a **good** thing — saving lives is good. Yet I am doing the **wrong** thing, because it would clearly have been *better* to save the larger group. The more lives saved, the better.

## The lesson

So an act can be **good and wrong at once**: good because it has real positive value, wrong because some available alternative was better. "Wrong" marks not the presence of badness but the *failure to be the best available* — the least good of the live options.

Together with the previous section, this completes the decoupling of right/wrong from good/bad: all four are distinct, comparative notions.`,
  },
  {
    slug: "ought-implies-can",
    title: '"Ought" implies "can"',
    weekNumber: 2,
    blurb: "Obligation requires ability — with a caveat.",
    lectureTitle: '2.5 "Ought" implies "can"',
    body: `# "Ought" implies "can"

A widely accepted principle: you have an obligation to do something **only if you can do it**. "Ought" implies "can."

## The basic idea

Because it is not in my power to heal every sick person on earth, I have no obligation to do so. I have an obligation to treat my students fairly only because doing so *is* within my power. Obligations track ability.

## The caveat

But the principle needs a grain of salt. We saw that one can have **multiple conflicting obligations** — an obligation to do X *and* Y *and* Z — even when it is impossible to do all three. In the safe case I ought to save my children *and* not steal, though I cannot do both. So, strictly, there are things one "ought" to do that one *cannot* do.

## The principle survives, refined

Still, the principle is not simply false. In such a conflict, there is **no single course of action** that I ought to carry out but cannot. It *is* within my power not to steal my friend's money (even if I cannot both refrain *and* save my children). And it seems that, if even that weren't within my power, I would have *no* obligation to refrain. So "ought" implies "can" holds for each obligation taken **singly**, even if the full set of obligations cannot be jointly satisfied.`,
  },
  {
    slug: "legality-morality",
    title: "Legality vs. morality",
    weekNumber: 2,
    blurb: "Legal and moral can come apart — and often overlap.",
    lectureTitle: "2.6 Legality is not morality",
    body: `# Legality is not morality

Legality and morality are **distinct**. They are not the same standard, and they can come apart.

## They can conflict

There are acts that are legal — even legally *required* — yet deeply immoral. In the United States before the Civil War, it was legal to own slaves and **illegal** to free another person's slaves. But owning slaves is exceedingly immoral, and freeing them exceedingly moral. Law and morality pointed in opposite directions.

## They often overlap

At the same time, the two frequently coincide. It is illegal to kill people (except in self-defense), and it is also immoral to do so (same qualification). Much of the law tracks morality reasonably well.

## A delicate relationship

*How* legality and morality are related is a subtle question, not settled by either of the points above. What this course insists on is only the **distinction**: that an act is legal does not make it moral, and that an act is illegal does not make it immoral. Confusing "it's the law" with "it's right" — in either direction — is one of the most common and most dangerous mistakes in practical ethics.`,
  },

  // Unit 3 — Acts, Agents, and Judgment
  {
    slug: "judging-vs-status",
    title: "Judging X vs. the status of X",
    weekNumber: 3,
    blurb: "The morality of passing judgment differs from the morality of the act.",
    lectureTitle: "3.1 Judging X vs. the moral status of X",
    body: `# Judging an act vs. the act itself

The moral status of **passing judgment** on X is *not* the same as the moral status of **X itself**.

## An everyday parallel

Given only that an object weighs 200 pounds, I do not automatically have the *right* to say it does — I might lack the information. Given only that a statement is true, I do not automatically have the right to assert it; I have that right only if I have good reason to believe it.

## The ethical consequence

Suppose Jones is on trial for a murder he in fact committed, but the jury lacks the evidence to know he is guilty. Jones's act is **condemnable** — murder is wrong. Yet the jury does **not** have the right to convict him, because the jury does not *know* he is guilty. It would be **condemnable of the jury** to convict a person it does not know to be guilty, even if that person happens to be guilty.

## The general principle

Even when an act *is* condemnable, one does not automatically have the right to condemn it. One has that right only with sufficient information. To condemn without it is itself to act condemnably — making an accusation one does not know to be correct, even if by coincidence it is. The striking upshot: **it can be condemnable to condemn the condemnable.**`,
  },
  {
    slug: "act-vs-agent",
    title: "Goodness of the act vs. goodness of the agent",
    weekNumber: 3,
    blurb: "Praise and blame track intention, not outcome.",
    lectureTitle: "3.2 The act vs. the agent: intention is what counts",
    body: `# The act vs. the agent

Whether an agent deserves praise or blame depends **not on what they actually bring about, but on what they intend** to bring about.

## Kathy and Mary

**Kathy**, a devoted mother of five, researches carefully, concludes supplement X will help her children, works extra hours to buy it, and feeds it to them. They thrive. Kathy deserves commendation: she did the right thing, and she *intended* to.

**Mary** is psychologically identical to Kathy — same care, same research, same intentions. The evidence available to her points to supplement Y. She works extra to buy it and feeds it to her kids. But Y, despite all testing, turns out to be slowly lethal, and her children die.

Mary did not do "the right thing." But is she **morally worse** than Kathy? No. Her intentions were exactly Kathy's. The only difference is that the world met Kathy halfway and did not meet Mary halfway. **They are equally worthy of praise**, even though one brought about a tragedy.

## Betty

**Betty**, bored with motherhood, intends to kill her children and feeds them substance Z, believed lethal and undetectable. But Z happens to be beneficial to children of their rare blood type, and they flourish. Betty produced a **good** outcome — yet she deserves **condemnation of the severest kind**, because it was her intention to do evil.

## The principle

Praise and blame attach to the **agent's intention**, not to the result. Good outcomes from evil intentions earn no praise; tragic outcomes from good intentions earn no blame.`,
  },
  {
    slug: "intention-attempts",
    title: "Intention and the punishment of attempts",
    weekNumber: 3,
    blurb: "Why law punishes attempts less, and why that's consistent.",
    lectureTitle: "3.3 Why attempts are punished less severely",
    body: `# Why attempts are punished less severely

Attempted murder is punished less harshly than murder. Why — if praise and blame track intention, not outcome?

## Failure is evidence of a weaker intention

Failure to carry out a plan often (not always) suggests the person's **heart wasn't fully in it**. If a smart man flunks out of law school ten times, his heart may not be in it. If a would-be murderer's gun jams, it may be because he never checked it — and a truly resolute killer might have made sure it worked. His failure may reflect reservations, possibly even *moral* reservations.

## The same holds for good deeds

Suppose you keep agreeing to visit a tiresome ailing aunt, and every time some genuine obstacle arises — lost keys, sudden inspiration, an urge to clean. The obstacles are real and not consciously contrived. But that they *always* arise, given how you dread the visits, suggests your intention to go is **feeble**. This is why those who actually carry out good deeds receive more commendation than those who merely attempt them.

## Why this is consistent

It remains true that two people with *exactly* the same intentions deserve exactly the same praise or blame, success or not. But as a **general rule**, success or failure is *evidence* about how resolute the intention was. Those who succeed at crimes are, on average, less conflicted about wanting to. So punishing attempts less severely is consistent with the view that intention — not outcome — is what we are really judging.`,
  },
  {
    slug: "hitler-problem",
    title: "Good intentions and condemnation (the Hitler problem)",
    weekNumber: 3,
    blurb: "Can someone be condemned even if they 'meant well'?",
    lectureTitle: "3.4 The Hitler problem",
    body: `# The Hitler problem

If blame tracks intention, an objection arises: it is agreed that Hitler's acts were wrong and that he deserves condemnation. But "**wasn't it his intention to do good**? His efforts were misguided, but mustn't we say his intentions were good — and isn't that inconsistent with the claim that condemnation tracks intention, not deeds?"

## The response

The premise is false: it pretty clearly was **not** Hitler's intention to do good. (And even if some such intention existed, it was grossly **outweighed** by other intentions.)

Of course he never announced, "It's my intention to do evil." But public speeches tell us nothing about real intentions. Given how obvious it is to anyone of even minimal intelligence that gratuitous torture and murder are wrong, it is **not feasible** to suppose that, as a rule, Hitler's intentions were good ones.

## The general lesson

The "good intentions" defense cannot be granted on a person's say-so, nor inferred from the fact that they cloak their aims in noble language. We judge intentions by the **whole pattern of conduct** and by what any minimally reasonable person in their position would have known. Properly understood, the Hitler case does not refute the intention-based view of blame — it illustrates how to read intentions honestly rather than naively.`,
  },
  {
    slug: "immorality-toward-self",
    title: "Immorality toward oneself",
    weekNumber: 3,
    blurb: "Can one act immorally toward oneself?",
    lectureTitle: "3.5 Can one act immorally toward oneself?",
    body: `# Can one act immorally toward oneself?

This is controversial, but the answer defended here is **yes**. One can sell oneself short, act self-destructively, and do to oneself things one has a right not to undergo.

## Ways of wronging oneself

There are many: being **too easy** on oneself (permitting every excess — drugs, binge-eating) and being **too hard** on oneself (pushing too hard, setting impossibly high standards). The list is far from complete.

## Not the same category as harming others

This does not put self-harmers in the same moral category as those who harm others. People who hurt themselves are often (not always) **hyper-principled**, whereas those who hurt others are often (not always) lacking in principle.

## Principle-driven can still be wrong

"But you said self-harmers behave immorally, and you also call them hyper-principled — isn't that inconsistent?" No. That an act is **principle-driven does not make it right**. There are many ethical principles, and not all are good. Some people felt it their *duty* to support Hitler — that was a principle, just a bad one. By acting on similarly misguided principles, people can wrong **themselves**.

It is even argued elsewhere that, in a sense, *all* acts of immorality are ultimately acts of immorality toward oneself — a thought the next section pursues through the question of punishment.`,
  },
  {
    slug: "self-harm-autonomy",
    title: "Self-harm, punishment, and autonomy",
    weekNumber: 3,
    blurb: "Why we don't punish self-harm — and what that does and doesn't show.",
    lectureTitle: "3.6 Self-harm, punishment, and autonomy",
    body: `# Self-harm, punishment, and autonomy

A common argument: people who harm *others* deserve punishment, while people who harm *themselves* do not; therefore self-destructive behavior is **not immoral**, even if bad in some other way.

## The argument is not probative

This reasoning is weak, because **desert of punishment is not solely a function of having done wrong**. If the good done by punishing someone is grossly outweighed by the harm it does, punishing may be wrong even when wrong was done.

Take little Timmy, who steals a cookie. It was not good of him. But suppose Timmy is emotionally fragile and would completely break down if punished. Then it is probably better to give him a pass — *not* because he did no wrong, but because punishing would do more harm than good.

## Why we don't punish self-harm

Two further reasons. **First**, self-destructive behavior is *its own punishment*; an externally imposed punishment would be redundant — adding insult to injury. **Second**, punishing such a person would violate their **autonomy** — their right to determine their own fate — which might be ethically *worse* than what they did to themselves.

## The conclusion

So the fact that we (rightly) refrain from punishing self-harm does **not** show that self-harm is morally permissible. It shows only that **wrongdoing and desert-of-punishment are separate questions**. An act can be genuinely wrong even when punishing it would be the worse course.`,
  },

  // Unit 4 — Metaethics and Moral Truth
  {
    slug: "ought-from-is",
    title: 'Metaethics: deriving "ought" from "is"',
    weekNumber: 4,
    blurb: "Can value-judgments follow from purely factual ones?",
    lectureTitle: '4.1 Can you derive an "ought" from an "is"?',
    body: `# Metaethics and the is–ought question

**Metaethics** asks what, if anything, ethical statements *mean*. A **valuative** statement is one that expresses a value-judgment — it says something should or should not be done, or that something is or is not good. ("Valuative" means roughly the same as "ethical" or "having ethical content.")

## The classic principle

One famous principle says: **you cannot derive an "ought" from an "is."** If you had a complete list of all true *non-valuative* statements, the claim goes, you still could not justifiably infer any valuative statement — you could never reach "it is obligatory that you do X."

## Why it may be false

Though widely accepted, the principle may well be **false**. Consider two popular moral doctrines:

- "X is a good act" means *X makes people happier than the available alternatives.*
- "X is a good act" means *X promotes the actualization of human potential more than the alternatives.*

If either doctrine — or anything like it — is correct, then an "ought" **can** be inferred from an "is." For "X is what ought to be done" would follow from the factual claim "X is more likely than the alternatives to maximize happiness (or human flourishing)."

## The upshot

So the is–ought barrier is not obviously a barrier at all. Whether it stands depends on substantive questions about what goodness *consists in* — questions metaethics must actually argue, not assume. This sets up Moore's more famous version of the objection.`,
  },
  {
    slug: "open-question",
    title: "Moore's open-question argument",
    weekNumber: 4,
    blurb: "Are moral facts reducible to natural facts?",
    lectureTitle: "4.2 Moore's open-question argument",
    body: `# Moore's open-question argument

G. E. Moore argued that **no amount of purely descriptive, non-moral information is enough to settle a moral judgment**.

## The argument

- **Premise:** No matter how many *factual* truths you know about X, it remains an "open question" whether X is good.
- **Conclusion:** Ethical truths are therefore **not identical with, or reducible to, factual statements.**

The idea is that for any natural property you propose to identify with goodness, you can always still sensibly ask, "but is a thing with that property *good*?" — so goodness must be something over and above any natural fact.

## Why the argument fails

The premise is **false**. As we just saw, if goodness has anything to do with maximizing happiness or human flourishing, then enough factual information *does* settle the moral question.

More directly, the premise is **deeply implausible**. If I know that X is a person who kills others for fun, delights in their pain, and never does anything for anyone, then it is **not** an open question whether X is good. The "openness" simply evaporates once the facts are bad enough. So Moore's argument is no good.

## Why the next section matters

Why did Moore find the question "open" even when the facts are damning? The next section diagnoses the deeper error: a faulty conception of **entailment**.`,
  },
  {
    slug: "entailment-ampliative",
    title: "Entailment as ampliative",
    weekNumber: 4,
    blurb: "Deduction can add to what you know.",
    lectureTitle: "4.3 Entailment is ampliative",
    body: `# Entailment is ampliative

The hidden assumption behind Moore's argument (and Hume's) is a **faulty theory of entailment**.

## The standard view

It is often said that P entails Q only if "there is nothing in Q that isn't already in P" — that entailment is **non-ampliative**, that deduction never *adds* to what you know. On this view, if Jones tortures babies for fun and frames others for it, the badness of Jones still doesn't "follow," because deduction can't deliver anything genuinely new.

## Why it is false

Entailment is in fact **ampliative**. Sure, some cases are trivial ("if P and Q, then Q"), but these are the exception, not the rule. That 1 + 1 = 2 *entails*, by long chains of deduction, that there are continuous functions differentiable nowhere, and that space is metrically amorphous — results no one "sees" in "1 + 1 = 2."

If deduction really added nothing, then those who reason would know no more than those who merely live in the moment — our Pleistocene ancestors would be as knowledgeable as we are. That is absurd. Without deduction we could never organize raw experience into theories at all.

## The payoff for ethics

Once we accept that deduction **extends** knowledge, Moore's "open question" loses its grip. From a rich enough set of facts about Jones, the conclusion that Jones is bad genuinely *follows* — even though the word "bad" never appeared among the premises. The newness of the conclusion is no objection; that is just what good inference does.`,
  },
  {
    slug: "genetic-vs-normative",
    title: "Genetic vs. normative questions",
    weekNumber: 4,
    blurb: "Where a belief came from is not whether it's true.",
    lectureTitle: "4.4 The genetic fallacy in ethics",
    body: `# Genetic vs. normative questions

We must sharply separate **where a belief came from** (the *genetic* question) from **whether it is true** (the *normative* question).

## The Newton example

Legend says Newton hit on the inverse-square law after an apple struck his head. The random, ignominious origin of the idea is **irrelevant** to whether it is correct. What makes an idea correct is whether it *fits the facts* — not who thought of it or how. Ideas reached by impeccable reasoning can be false; ideas reached illogically can be perfectly true. To judge a belief by its origin rather than its fit with the facts is to commit the **genetic fallacy**.

## Applied to morality

Suppose anthropologists discovered that our belief that torturing infants is wrong descended from an ancient cult of a "Volcano god" who supposedly abhorred it. Would that show the belief is **false**? No. It would show our *original grounds* were bad — but a belief with bad original grounds can be true, and we may since have replaced those grounds with good ones (just as a child who believes the Earth is round "because he likes round things" can later acquire real evidence).

## The religion twist

Views actually reached for ordinary reasons are often *redescribed* as divinely revealed, because "God told me X" wins more believers than "my own intellect told me X." But notice: people only believe "God said X" when they *already* find X plausible. Tell people God told you to destroy hospitals and no one believes you; tell them God told you to be kind and a few might. So the appearance of a genetic origin is frequently an illusion — the real grounds were the merits all along.`,
  },
  {
    slug: "truth-vs-use",
    title: "Moral truth vs. its uses and implementation",
    weekNumber: 4,
    blurb: "Abuse and late discovery don't refute moral truth.",
    lectureTitle: "4.5 Moral truth vs. its uses and implementation",
    body: `# Moral truth vs. its uses and its implementation

Two further confusions must be cleared away: confusing a moral truth with the **use** it is put to, and confusing a moral principle with its **social implementation**.

## Use does not impugn truth

Many moral statements *are* pure propaganda — cynical manipulations meant to advance some nefarious agenda. Even **correct** moral statements can be put to evil use: Stalin, climbing to power, often preached the importance of "mercy for one's political rivals." Mercy is genuinely good — but it does not follow that Stalin did good in invoking it, for his use of the principle was deceptive. And conversely: that self-interested actors *call* something a moral truth does not make it one. But — crucially — from the fact that an *alleged* moral truth is false, **it does not follow that there is no moral truth** (just as fake "physical laws" don't show there are no physical laws).

## Discovery is not invention

It is often argued that morality has no objective basis because it is a "human creation" that "came into existence a few thousand years ago." This commits two errors. **First**, there was a time when people first *became aware* the Earth is round — but the Earth was round long before. Likewise, that people became aware of moral truths at some point does not mean those truths were *invented* then. **Second**, it confuses moral principles with the **institutions that enforce them**. Enforcement requires society; the principle does not. Even with no society at all, it is wrong to gouge out someone's eyes for fun. Calculators implementing the laws of arithmetic were built in the 1800s, but those laws existed long before the machines. The same holds for moral law.`,
  },
  {
    slug: "reject-realism",
    title: "Bad reasons to reject ethical realism",
    weekNumber: 4,
    blurb: "Disagreement does not show morality is mere opinion.",
    lectureTitle: "4.6 Bad reasons to reject ethical realism",
    body: `# Bad reasons to reject ethical realism

A popular argument: there is *more disagreement* in ethics than in other fields; therefore ethical statements merely express **opinion**, with no objective basis — so they are either meaningless or categorically false.

## Four problems with this argument

**(i)** There is a great deal of disagreement about **strictly factual** matters too — yet we do not conclude that facts are mere opinion.

**(ii)** Even if there is *more* disagreement in ethics, that does not show ethical claims lack an objective basis. Certain kinds of disagreement actually **presuppose** objective fact, and there is evidence that ethical disagreement is often of this kind.

**(iii)** There is in fact a great deal of **agreement** in ethics; the contrary impression rests largely on misleading appearances. (We notice the controversies, not the vast shared background.)

**(iv)** Much "ethical" disagreement is really disagreement about **matters of fact**, not matters of value — about *what will happen* or *what is the case*, not about what is good.

## The upshot

None of this *proves* ethical realism. But it dismantles the single most common argument *against* it. The mere existence of moral disagreement — even widespread disagreement — is not evidence that there is no moral truth. The next section makes (i) and (iv) concrete.`,
  },
  {
    slug: "disagreement-fact-value",
    title: "Disagreement, fact, and value",
    weekNumber: 4,
    blurb: "Rational debate is the mark of objective truth.",
    lectureTitle: "4.7 Disagreement, fact, and value",
    body: `# Disagreement, fact, and value

To see why disagreement does not doom moral realism, compare two statements.

## A contested factual claim

**(KV)** "If Kennedy hadn't been assassinated, the U.S. would have pulled out of Vietnam before 1970."

KV is **not** a value-judgment — it asserts a causal relation. It is extremely hard to know whether KV is true, and there is no unanimity about it. Yet it is surely **not "just a matter of opinion."** The decisive mark: it makes sense to **cite reasons for and against it** — a speech JFK had drafted, newly uncovered documents about LBJ's views, and so on. KV can be weighed against documents, footage, and testimony. Difficulty of resolution is **not** the same as mere subjectivity.

## A genuine matter of taste

**(CB)** "Chocolate ice cream is better than vanilla" (not nutritionally).

Here there is little I can do to defend my position beyond "I like chocolate more." Reasons get no grip. CB really *is* a matter of opinion.

## The lesson

The test for whether a statement is **truth-apt** is whether reasons can rationally bear on it. Many moral disputes are like **KV**, not **CB**: people marshal evidence, draw distinctions, and change their minds under argument — which is exactly what we would expect if there were a fact of the matter. And much apparent *moral* disagreement turns out, on inspection, to be **factual** disagreement (about consequences, circumstances, who did what) riding underneath a shared value.`,
  },
  {
    slug: "capstone-ethical-truths",
    title: "Capstone: what are ethical truths?",
    weekNumber: 4,
    blurb: "Synthesizing the course into a view of moral truth.",
    lectureTitle: "4.8 Capstone synthesis: what are ethical truths?",
    body: `# Capstone: what are ethical truths?

This final section ties the course together. Each earlier idea is a thread; the question "what *are* ethical truths?" is where they meet.

## What we have established

- **Value is layered.** "Good" splits into instrumental and intrinsic; intrinsic good splits into commendable and merely good; badness splits the same way. Moral attributes are **positive, not privative** — which is why one act can be good *and* bad, commendable *and* condemnable.
- **Right and wrong are comparative.** "Right" = least bad available; "wrong" = least good available. Neither equals "good" or "bad." Obligations have **weight**, and an outweighed obligation is overridden, not erased.
- **We judge agents by intention.** Outcomes can mislead (Kathy, Mary, Betty); attempts are punished less because failure is evidence of a weaker intention; and the moral status of *judging* differs from the status of the act judged.
- **Metaethics defends moral truth.** "Ought" may follow from "is"; Moore's open-question argument fails once we see entailment is **ampliative**; and the genetic fallacy, the abuse of moral language, the late *discovery* of morality, and the mere fact of *disagreement* are all **bad reasons** to deny that there are moral truths.

## A capstone problem

> A government can save more lives overall only by enacting a policy that knowingly, deliberately harms a small, blameless group. Is enacting it *right*? Is it *good*? Does the residual obligation to the harmed group survive? Would a leader who enacts it with the *intention* of protecting the powerful deserve the same praise as one who enacts it reluctantly to save lives?

Answering this well requires the *whole course*: the intrinsic/instrumental distinction, weight and outweighing, "right" as least-bad, intention-based judgment of agents, and a clear-eyed view of whether there is a fact of the matter at all. **That** is ethical reasoning.`,
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
  // Unit 1
  {
    kind: "homework",
    title: "Homework 1.1 — Statements, categories, kinds of goodness",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice. Answer in your own words in the answer box.",
    problems: [
      { topicSlug: "what-is-ethics", prompt: 'Classify this statement as normative or descriptive: "Grass is green."', correctAnswer: "descriptive", explanation: "It reports a fact and expresses no value-judgment." },
      { topicSlug: "what-is-ethics", prompt: 'Classify this statement as normative or descriptive: "It is wrong to steal."', correctAnswer: "normative", explanation: "It expresses a value-judgment against a standard." },
      { topicSlug: "normative-categories", prompt: 'Is "noble" a normative or a descriptive category? Answer in one word.', correctAnswer: "normative", explanation: "It occurs only in value-judgments." },
      { topicSlug: "instrumental-intrinsic", prompt: "Stealing from an orphanage purely to enrich yourself is good in which sense (instrumental or intrinsic)?", correctAnswer: "instrumental", explanation: "It serves the agent's practical interest but is not good in itself." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Commendableness, badness, and mixed acts",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "goodness-commendableness", prompt: "A rabbit's happiness is intrinsically good. Is the rabbit commendable for it? Answer yes or no and give the reason in one sentence.", correctAnswer: "no", explanation: "The rabbit lacks the cognitive capacity to act praiseworthily; goodness and commendableness come apart." },
      { topicSlug: "two-kinds-badness", prompt: "Is a grieving person's unhappiness condemnable? Answer yes or no.", correctAnswer: "no", explanation: "It is intrinsically bad but not blameworthy; some intrinsic evils warrant no censure." },
      { topicSlug: "morally-complex", prompt: "In the piano example, the act is intrinsically good yet also what (one word)?", correctAnswer: "condemnable", explanation: "Playing well is good; knowingly harming the sick roommate's sleep is condemnable." },
      { topicSlug: "non-privative", prompt: 'Is badness the absence of goodness? Answer yes or no, then state whether badness is a "positive" or "privative" property.', correctAnswer: "no; positive", explanation: "Badness is the presence of something extra (e.g., ill will), so it is positive, not privative." },
    ],
  },
  {
    kind: "test",
    title: "Unit 1 Test — Foundations of Value",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions: "Timed. 30 minutes. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      { topicSlug: "what-is-ethics", prompt: "In one sentence, state the difference between a descriptive and a normative statement.", correctAnswer: "A descriptive statement reports that something is the case; a normative statement expresses a value-judgment against a standard.", explanation: "Descriptive = fact; normative = evaluation." },
      { topicSlug: "instrumental-intrinsic", prompt: "Define intrinsic goodness in one sentence.", correctAnswer: "Something is intrinsically good if it is good in itself, apart from its consequences.", explanation: "Ethics concerns intrinsic, not instrumental, goodness." },
      { topicSlug: "goodness-commendableness", prompt: "Name the two kinds of intrinsic goods.", correctAnswer: "those that are commendable and those that are not", explanation: "Some intrinsic goods deserve praise; some do not." },
      { topicSlug: "two-kinds-badness", prompt: 'Give an example of something intrinsically bad but NOT condemnable.', correctAnswer: "the unhappiness of someone grieving a loved one", explanation: "Bad in itself, yet warranting no censure." },
      { topicSlug: "non-privative", prompt: "Why can a single act be both commendable and condemnable? Answer in one sentence.", correctAnswer: "Because both are positive (non-privative) properties, so having one is not the absence of the other.", explanation: "Neither property is the lack of the other, so both can be present." },
    ],
  },

  // Unit 2
  {
    kind: "homework",
    title: "Homework 2.1 — Weight, outweighing, and 'right'",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "weight-of-obligations", prompt: "True or false: all moral obligations have exactly the same strength.", correctAnswer: "false", explanation: "Obligations come in degrees of weight." },
      { topicSlug: "outweigh-vs-cancel", prompt: "When a stronger obligation outweighs a weaker one, does the weaker obligation cease to exist? Answer yes or no.", correctAnswer: "no", explanation: "It is overridden, not erased; a moral residue remains." },
      { topicSlug: "right-least-bad", prompt: 'Complete the definition: the right course of action is the ____ course available.', correctAnswer: "least bad", explanation: "'Right' = least bad option under the circumstances." },
      { topicSlug: "right-least-bad", prompt: "True or false: the right act is always a good act.", correctAnswer: "false", explanation: "The right act may be the lesser of two evils." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — 'Wrong', 'ought', and law",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "wrong-least-good", prompt: 'Complete the definition: a wrong course of action is the ____ course available.', correctAnswer: "least good", explanation: "'Wrong' = least good option, which may still be good." },
      { topicSlug: "wrong-least-good", prompt: "In the rescue case, saving only 2 people when you could save 10 is a good act but also what (one word)?", correctAnswer: "wrong", explanation: "It is the least good available option." },
      { topicSlug: "ought-implies-can", prompt: 'State the principle that links obligation to ability (4 words).', correctAnswer: '"ought" implies "can"', explanation: "You can be obligated only to what you can do." },
      { topicSlug: "legality-morality", prompt: "Before the Civil War, freeing another person's slaves was illegal. Was it immoral? Answer yes or no.", correctAnswer: "no", explanation: "It was moral though illegal — legality is not morality." },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Units 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions: "Cumulative midterm covering Units 1–2. 60 minutes. Pasting disabled; keystrokes screened.",
    problems: [
      { topicSlug: "what-is-ethics", prompt: "What does ethics, as a discipline, attempt to do? Answer in one sentence.", correctAnswer: "It attempts to clarify the structure of normative concepts — the conditions things must satisfy to fall under them.", explanation: "Ethics analyzes normative categories." },
      { topicSlug: "instrumental-intrinsic", prompt: "Can one thing be both instrumentally and intrinsically good? Give a one-word answer and an example.", correctAnswer: "yes; intelligence", explanation: "Intelligence is useful and also good in itself." },
      { topicSlug: "non-privative", prompt: "Why isn't a rock 'bad'? Answer in one sentence.", correctAnswer: "Because a rock merely lacks goodness; to be bad you must possess something extra, like ill will.", explanation: "Badness is positive, not privative." },
      { topicSlug: "weight-of-obligations", prompt: "Rank by typical strength (weakest first): a head of state's duty to constituents; a promise to meet for lunch; a paid teacher's duty to teach.", correctAnswer: "promise to meet for lunch; teacher's duty; head of state's duty", explanation: "Obligations increase in weight with the stakes and trust involved." },
      { topicSlug: "outweigh-vs-cancel", prompt: "In the safe dilemma, after stealing to save your children, do you still owe your friend something? Answer yes or no.", correctAnswer: "yes", explanation: "The overridden obligation persists as a moral residue." },
      { topicSlug: "right-least-bad", prompt: 'Explain why "right" is not the same as "good" in one sentence.', correctAnswer: "Because the right act is the least bad available option, which can itself be a bad thing.", explanation: "Rightness is comparative, not a positive good." },
      { topicSlug: "ought-implies-can", prompt: "Does 'ought implies can' hold for each obligation taken singly, even amid conflicting obligations? Answer yes or no.", correctAnswer: "yes", explanation: "No single obligation requires the impossible, though the full set may not be jointly satisfiable." },
      { topicSlug: "legality-morality", prompt: "Give one example showing legality and morality can conflict.", correctAnswer: "Owning slaves was legal yet immoral; freeing them was illegal yet moral.", explanation: "Pre-Civil-War slavery law diverged from morality." },
    ],
  },

  // Unit 3
  {
    kind: "homework",
    title: "Homework 3.1 — Judgment, act, and agent",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "judging-vs-status", prompt: "A jury lacks evidence but the defendant is in fact guilty. Should it convict? Answer yes or no.", correctAnswer: "no", explanation: "It would be condemnable to convict someone you don't know to be guilty, even if guilty." },
      { topicSlug: "judging-vs-status", prompt: "Complete the slogan: it can be condemnable to ____ the condemnable.", correctAnswer: "condemn", explanation: "Condemning without sufficient information is itself condemnable." },
      { topicSlug: "act-vs-agent", prompt: "Kathy and Mary have identical good intentions, but Mary's children die from faulty information. Is Mary more blameworthy than Kathy? Answer yes or no.", correctAnswer: "no", explanation: "Praise and blame track intention, not outcome." },
      { topicSlug: "act-vs-agent", prompt: "Betty intends to kill her children but they thrive by luck. Does she deserve praise? Answer yes or no.", correctAnswer: "no", explanation: "Her intention was evil; a good outcome by accident earns no praise." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Attempts, intentions, and the self",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "intention-attempts", prompt: "Why does the law often punish attempted crimes less than completed ones? Answer in one sentence.", correctAnswer: "Because failure often suggests a weaker, more conflicted intention to commit the crime.", explanation: "Success is evidence of a more resolute intention." },
      { topicSlug: "hitler-problem", prompt: "Does claiming 'good intentions' in a speech establish that someone actually had them? Answer yes or no.", correctAnswer: "no", explanation: "Intentions are judged by conduct and what any reasonable person would know, not by public claims." },
      { topicSlug: "immorality-toward-self", prompt: "Does being principle-driven guarantee an act is morally good? Answer yes or no.", correctAnswer: "no", explanation: "Some principles are bad ones; principle-driven acts can be wrong." },
      { topicSlug: "self-harm-autonomy", prompt: "Give one reason we don't punish people for self-destructive behavior.", correctAnswer: "It is its own punishment, and punishing it would violate the person's autonomy.", explanation: "Desert of punishment is separate from wrongdoing." },
    ],
  },
  {
    kind: "test",
    title: "Unit 3 Test — Acts, Agents, and Judgment",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 40,
    instructions: "Timed. 40 minutes. Pasting disabled; keystrokes screened.",
    problems: [
      { topicSlug: "judging-vs-status", prompt: "Why is the moral status of judging an act different from the status of the act itself? Answer in one sentence.", correctAnswer: "Because having the right to judge requires sufficient information, which one may lack even when the act really is wrong.", explanation: "Right-to-assert depends on evidence, not just truth." },
      { topicSlug: "act-vs-agent", prompt: "On what does an agent's praise or blame depend — the outcome or the intention?", correctAnswer: "the intention", explanation: "Outcomes can mislead; intention is decisive." },
      { topicSlug: "intention-attempts", prompt: "True or false: two people with identical intentions deserve identical praise even if one succeeds and one fails.", correctAnswer: "true", explanation: "Desert tracks intention; success is only evidence about intention's strength." },
      { topicSlug: "hitler-problem", prompt: "What is the response to the claim that Hitler 'meant well'? Answer in one sentence.", correctAnswer: "It was clearly not his intention to do good, and any such intention was grossly outweighed by his evil intentions.", explanation: "Intentions are read from the whole pattern of conduct." },
      { topicSlug: "self-harm-autonomy", prompt: "Does our refusal to punish self-harm prove that self-harm is morally permissible? Answer yes or no.", correctAnswer: "no", explanation: "Wrongdoing and desert of punishment are separate questions." },
    ],
  },

  // Unit 4
  {
    kind: "homework",
    title: "Homework 4.1 — Is/ought, Moore, and entailment",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "ought-from-is", prompt: "If 'good act' means 'maximizes happiness', can an 'ought' be derived from an 'is'? Answer yes or no.", correctAnswer: "yes", explanation: "Then 'X ought to be done' follows from facts about what maximizes happiness." },
      { topicSlug: "open-question", prompt: "State Moore's conclusion in the open-question argument in one sentence.", correctAnswer: "Ethical truths are not identical with or reducible to factual statements.", explanation: "He infers this from the alleged 'open question'." },
      { topicSlug: "open-question", prompt: "Is the premise of Moore's argument true or false, according to the course?", correctAnswer: "false", explanation: "Enough damning facts close the question of whether someone is good." },
      { topicSlug: "entailment-ampliative", prompt: "Is entailment (deduction) ampliative — does it add to knowledge? Answer yes or no.", correctAnswer: "yes", explanation: "Deduction yields genuinely new knowledge, e.g., advanced theorems from simple axioms." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Genetic fallacy, use, and realism",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "genetic-vs-normative", prompt: "Judging a belief by its origin rather than its truth commits which fallacy?", correctAnswer: "the genetic fallacy", explanation: "Origin is irrelevant to truth." },
      { topicSlug: "truth-vs-use", prompt: "Does the fact that some alleged moral truths are false show there is no moral truth? Answer yes or no.", correctAnswer: "no", explanation: "Fake physical laws don't show there are no physical laws; same for morality." },
      { topicSlug: "truth-vs-use", prompt: "Does the late social implementation of morality show moral principles were invented then? Answer yes or no.", correctAnswer: "no", explanation: "Discovery/implementation is not invention; cf. arithmetic before calculators." },
      { topicSlug: "reject-realism", prompt: "Does the existence of moral disagreement prove there is no moral truth? Answer yes or no.", correctAnswer: "no", explanation: "There is factual disagreement too; disagreement isn't proof of subjectivity." },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — All units",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 90,
    instructions: "Cumulative final covering Units 1–4. 90 minutes. Pasting disabled; keystrokes screened.",
    problems: [
      { topicSlug: "instrumental-intrinsic", prompt: "Which kind of goodness is ethics concerned with — instrumental or intrinsic?", correctAnswer: "intrinsic", explanation: "Ethics studies what is good in itself." },
      { topicSlug: "non-privative", prompt: "Are 'commendable' and 'condemnable' privative or positive properties?", correctAnswer: "positive", explanation: "Neither is the absence of the other; both can co-occur." },
      { topicSlug: "right-least-bad", prompt: 'Define "right" in three words.', correctAnswer: "least bad available", explanation: "Rightness is comparative." },
      { topicSlug: "wrong-least-good", prompt: 'Define "wrong" in three words.', correctAnswer: "least good available", explanation: "A wrong act can still be good." },
      { topicSlug: "outweigh-vs-cancel", prompt: "True or false: an outweighed obligation is erased.", correctAnswer: "false", explanation: "It is overridden but persists as a residue." },
      { topicSlug: "act-vs-agent", prompt: "Betty intends evil but does good by luck; Mary intends good but does harm by bad luck. Who deserves condemnation?", correctAnswer: "Betty", explanation: "Blame tracks intention, not outcome." },
      { topicSlug: "judging-vs-status", prompt: "Can it be condemnable to condemn an act that really is condemnable? Answer yes or no.", correctAnswer: "yes", explanation: "If you lack sufficient information to know it is condemnable." },
      { topicSlug: "open-question", prompt: "Why does Moore's open-question argument fail? Answer in one sentence.", correctAnswer: "Its premise is false: enough factual information can close the question, and entailment is ampliative.", explanation: "Both the premise and its background theory of entailment are mistaken." },
      { topicSlug: "genetic-vs-normative", prompt: "Does discovering a belief has a disreputable origin make the belief false? Answer yes or no.", correctAnswer: "no", explanation: "Origin (genetic question) is separate from truth (normative question)." },
      { topicSlug: "disagreement-fact-value", prompt: "What is the test for whether a statement is truth-apt rather than mere taste? Answer in one sentence.", correctAnswer: "Whether reasons and evidence can rationally bear on it, as with KV but not with chocolate-vs-vanilla.", explanation: "Rational debatability marks objective truth-aptness." },
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as n from topics`);
  const row = (existing.rows[0] ?? {}) as { n?: number };
  if ((row.n ?? 0) > 0) {
    logger.info("Seed: already populated, skipping");
    return;
  }
  logger.info("Seed: populating course content");

  // Topics + lectures
  const slugToTopicId = new Map<string, number>();
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i]!;
    const [inserted] = await db
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
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
  }

  // Assignments + problems
  for (let i = 0; i < ASSIGNMENTS.length; i++) {
    const a = ASSIGNMENTS[i]!;
    const [inserted] = await db
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
      await db.insert(problemsTable).values({
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

  logger.info({ topics: TOPICS.length, assignments: ASSIGNMENTS.length }, "Seed complete");
}
