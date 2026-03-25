"use client";

import type { Charter, TeamProposal, PMPhase } from "@/lib/charter";
import { useT } from "@/lib/i18n/context";

interface Props {
  charter: Partial<Charter>;
  phase: PMPhase;
  team: TeamProposal | null;
}

export default function CharterDoc({ charter, phase, team }: Props) {
  const { t } = useT();

  const isEmpty =
    !charter.title &&
    !charter.problem &&
    !charter.solution &&
    !charter.targetAudience &&
    (!charter.keyFeatures || charter.keyFeatures.length === 0);

  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.onboard.emptyCharter}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">
      {/* Hero */}
      {(charter.title || charter.tagline) && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
          {charter.title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {charter.title}
            </h1>
          )}
          {charter.tagline && (
            <p className="mt-2 text-muted-foreground text-base italic">
              {charter.tagline}
            </p>
          )}
          {charter.tone && (
            <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {t.onboard.sectionTone}: {charter.tone}
            </span>
          )}
        </div>
      )}

      {/* Problem / Solution */}
      {(charter.problem || charter.solution) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {charter.problem && (
            <Section label={t.onboard.sectionProblem} emoji="🔍" color="rose">
              {charter.problem}
            </Section>
          )}
          {charter.solution && (
            <Section label={t.onboard.sectionSolution} emoji="💡" color="emerald">
              {charter.solution}
            </Section>
          )}
        </div>
      )}

      {/* Target Audience */}
      {charter.targetAudience && (
        <Section label={t.onboard.sectionAudience} emoji="🎯" color="sky">
          {charter.targetAudience}
        </Section>
      )}

      {/* Key Features */}
      {charter.keyFeatures && charter.keyFeatures.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <span>✨</span>
            {t.onboard.sectionFeatures}
          </h3>
          <ul className="flex flex-col gap-2">
            {charter.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Team Proposal */}
      {(phase === "proposing" || phase === "approved") && team && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
            <span>🏢</span>
            {t.onboard.proposedTeam}
          </h3>
          <div className="flex flex-col gap-4">
            {team.departments.map((dept) => {
              const deptAgents = team.agents.filter(
                (a) => a.departmentName === dept.name
              );
              return (
                <div key={dept.name} className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-semibold text-sm">{dept.name}</p>
                  {dept.rationale && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dept.rationale}
                    </p>
                  )}
                  {deptAgents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {deptAgents.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          👤 {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {team.firstTasks && team.firstTasks.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {t.onboard.firstTasks}
              </p>
              <ul className="flex flex-col gap-1.5">
                {team.firstTasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  emoji,
  color,
  children,
}: {
  label: string;
  emoji: string;
  color: "rose" | "emerald" | "sky" | "amber";
  children: React.ReactNode;
}) {
  const colorMap = {
    rose: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800",
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
    sky: "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800",
    amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
        <span>{emoji}</span>
        {label}
      </h3>
      <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
