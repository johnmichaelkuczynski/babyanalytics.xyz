import React, { useState } from "react";
import { useListReasoningAssessments } from "@workspace/api-client-react";
import type { ReasoningAssessmentSummary } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Compass, Brain } from "lucide-react";

type Kind = "subject" | "reasoning";
type Format = "mcq" | "written" | "hybrid";
type Length = "short" | "medium" | "long";
type Phase = "before" | "during1" | "during2" | "after";

const KIND_LABELS: Record<Kind, string> = {
  subject: "Subject Mastery",
  reasoning: "General Reasoning",
};
const FORMAT_LABELS: Record<Format, string> = {
  mcq: "Multiple choice",
  written: "Written",
  hybrid: "Hybrid",
};
const LENGTH_LABELS: Record<Length, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};
const PHASE_LABELS: Record<Phase, string> = {
  before: "Before the course",
  during1: "During — checkpoint 1",
  during2: "During — checkpoint 2",
  after: "After the course",
};
const PHASE_ORDER: Phase[] = ["before", "during1", "during2", "after"];

function statusBadge(status: string) {
  const cls =
    status === "passed"
      ? "bg-chart-2/15 text-chart-2"
      : status === "in_progress"
        ? "bg-chart-4/20 text-chart-4"
        : "bg-secondary text-secondary-foreground";
  const label =
    status === "passed"
      ? "completed"
      : status === "in_progress"
        ? "in progress"
        : "not started";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function Selector<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary font-medium"
                  : "border-border hover:bg-secondary"
              }`}
              data-testid={`select-${label.toLowerCase()}-${opt}`}
            >
              {labels[opt]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PhaseCard({ a, kind }: { a: ReasoningAssessmentSummary; kind: Kind }) {
  const Icon = kind === "subject" ? Compass : Brain;
  return (
    <Card className="flex flex-col justify-between" data-testid={`card-reasoning-${a.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Icon className="w-3.5 h-3.5" />
            {PHASE_LABELS[a.phase as Phase] ?? a.phase}
          </span>
          {statusBadge(a.status)}
        </div>
        <CardTitle className="text-base leading-snug">{a.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {a.itemCount} question{a.itemCount === 1 ? "" : "s"} · fresh every time · does not
          affect your grade
        </p>
        <Link href={`/reasoning/${a.id}`}>
          <Button
            className="w-full"
            variant={a.status === "passed" ? "outline" : "default"}
            data-testid={`button-open-reasoning-${a.id}`}
          >
            {a.status === "passed"
              ? "Review / Retake"
              : a.status === "in_progress"
                ? "Resume"
                : "Begin"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Reasoning() {
  const { data: assessments, isLoading } = useListReasoningAssessments();
  const [kind, setKind] = useState<Kind>("subject");
  const [format, setFormat] = useState<Format>("mcq");
  const [length, setLength] = useState<Length>("short");

  const selected = (assessments ?? [])
    .filter(
      (a) => a.kind === kind && a.format === format && a.length === length,
    )
    .slice()
    .sort(
      (x, y) =>
        PHASE_ORDER.indexOf(x.phase as Phase) -
        PHASE_ORDER.indexOf(y.phase as Phase),
    );

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Diagnostic Assessments
          </h1>
          <p className="text-muted-foreground">
            Optional, ungraded ability checks. Pick a kind, a format, and a length, then
            take it at any point in the course. Every attempt gives you fresh questions,
            you can retake as many times as you like, and none of it affects your course
            grade.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-5 flex flex-col gap-5">
                <Selector
                  label="Kind"
                  value={kind}
                  options={["subject", "reasoning"]}
                  labels={KIND_LABELS}
                  onChange={setKind}
                />
                <Selector
                  label="Format"
                  value={format}
                  options={["mcq", "written", "hybrid"]}
                  labels={FORMAT_LABELS}
                  onChange={setFormat}
                />
                <Selector
                  label="Length"
                  value={length}
                  options={["short", "medium", "long"]}
                  labels={LENGTH_LABELS}
                  onChange={setLength}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-serif font-semibold border-b pb-2">
                {KIND_LABELS[kind]} · {FORMAT_LABELS[format]} · {LENGTH_LABELS[length]}
              </h2>
              <p className="text-sm text-muted-foreground -mt-2">
                Choose when to take it — the same check is available before, during, and
                after the course.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selected.map((a) => (
                  <PhaseCard key={a.id} a={a} kind={kind} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
