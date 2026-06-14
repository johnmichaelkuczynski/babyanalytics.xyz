import React from "react";
import { useListReasoningAssessments } from "@workspace/api-client-react";
import type { ReasoningAssessmentSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Compass, Brain, CheckCircle2 } from "lucide-react";

type Phase = "before" | "during1" | "during2" | "after";

const HEADINGS: Record<Phase, string> = {
  before: "Start here: take a baseline check",
  during1: "Mid-course check-in",
  during2: "Mid-course check-in",
  after: "End of course: measure your growth",
};

const BLURBS: Record<Phase, string> = {
  before:
    "Optional, ungraded checks of your data-analytics ability and general reasoning. Take one now so you have a starting point to measure against later.",
  during1:
    "Optional, ungraded ability checks. Take one to see how you're tracking partway through the course.",
  during2:
    "Optional, ungraded ability checks. Take one to see how you're tracking partway through the course.",
  after:
    "Take an ungraded check one last time to see how far your data-analytics ability and reasoning have come.",
};

function Row({ a }: { a: ReasoningAssessmentSummary }) {
  const Icon = a.kind === "subject" ? Compass : Brain;
  const passed = a.status === "passed";
  return (
    <Link href={`/reasoning/${a.id}`}>
      <div
        className="flex items-center justify-between gap-4 p-3 rounded-md border border-border bg-background hover:bg-secondary/50 cursor-pointer"
        data-testid={`callout-reasoning-${a.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{a.title}</span>
        </div>
        {passed ? (
          <span className="inline-flex items-center gap-1 text-xs text-chart-2 font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        ) : (
          <Button size="sm" variant="default" className="shrink-0">
            {a.status === "in_progress" ? "Resume" : "Begin"}
          </Button>
        )}
      </div>
    </Link>
  );
}

export function ReasoningCallout({ phase }: { phase: Phase }) {
  const { data } = useListReasoningAssessments();
  // Show one representative check per kind for this phase: the shortest
  // multiple-choice option, so the callout stays compact. The full catalog of
  // formats and lengths lives on the Assessments page.
  const forPhase = (data ?? []).filter(
    (a) => a.phase === phase && a.format === "mcq" && a.length === "short",
  );
  if (forPhase.length === 0) return null;

  const rank = (a: ReasoningAssessmentSummary) => (a.kind === "subject" ? 0 : 1);
  const sorted = forPhase.slice().sort((x, y) => rank(x) - rank(y));

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif font-semibold">{HEADINGS[phase]}</h3>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Ungraded
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{BLURBS[phase]}</p>
        <div className="flex flex-col gap-2">
          {sorted.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
        <Link href="/reasoning">
          <span className="text-xs text-primary hover:underline cursor-pointer">
            See all formats and lengths →
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
