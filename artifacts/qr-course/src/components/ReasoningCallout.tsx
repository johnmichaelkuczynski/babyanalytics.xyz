import React from "react";
import { useListReasoningAssessments } from "@workspace/api-client-react";
import type { ReasoningAssessmentSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Scale, Brain, CheckCircle2 } from "lucide-react";

type Phase = "baseline" | "unit1";

const HEADINGS: Record<Phase, string> = {
  baseline: "Start here: Baseline reasoning assessments",
  unit1: "End of Unit 1: Reasoning checkpoint",
};

const BLURBS: Record<Phase, string> = {
  baseline:
    "Take both short diagnostics before you begin so your progress can be measured against where you started.",
  unit1: "Take both diagnostics one last time to capture your end-of-course growth.",
};

function Row({ a }: { a: ReasoningAssessmentSummary }) {
  const isEthical = a.instrument === "ethical";
  const Icon = isEthical ? Scale : Brain;
  const passed = a.status === "passed";
  return (
    <Link href={`/reasoning/${a.id}`}>
      <div
        className="flex items-center justify-between gap-4 p-3 rounded-md border border-border bg-background hover:bg-secondary/50 cursor-pointer"
        data-testid={`callout-reasoning-${a.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">
            {isEthical ? "Ethical Reasoning" : "Critical Reasoning"}
          </span>
        </div>
        {passed ? (
          <span className="inline-flex items-center gap-1 text-xs text-chart-2 font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
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
  const items = (data ?? []).filter((a) => a.phase === phase);
  if (items.length === 0) return null;

  const rank = (a: ReasoningAssessmentSummary) => (a.instrument === "ethical" ? 0 : 1);
  const sorted = items.slice().sort((x, y) => rank(x) - rank(y));

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif font-semibold">{HEADINGS[phase]}</h3>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            20% of grade
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{BLURBS[phase]}</p>
        <div className="flex flex-col gap-2">
          {sorted.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
