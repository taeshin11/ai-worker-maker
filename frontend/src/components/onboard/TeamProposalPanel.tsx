"use client";

import { CheckIcon, RefreshCwIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeamProposal } from "@/lib/charter";
import { useT } from "@/lib/i18n/context";

interface Props {
  team: TeamProposal;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}

export default function TeamProposalPanel({ team, onApprove, onReject, loading }: Props) {
  const { t } = useT();

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏢</span>
        <h3 className="font-semibold text-sm text-foreground">
          {t.onboard.proposedTeam}
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {team.departments.map((dept) => {
          const deptAgents = team.agents.filter(
            (a) => a.departmentName === dept.name
          );
          return (
            <div key={dept.name} className="rounded-lg bg-background border p-3">
              <p className="font-semibold text-sm">{dept.name}</p>
              {dept.rationale && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {dept.rationale}
                </p>
              )}
              {deptAgents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {deptAgents.map((a) => (
                    <span
                      key={a.name}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium"
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            {t.onboard.firstTasks}
          </p>
          <ul className="flex flex-col gap-1">
            {team.firstTasks.map((task, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          onClick={onApprove}
          disabled={loading}
          className="flex-1"
          size="sm"
        >
          {loading ? (
            <LoaderIcon className="size-3.5 animate-spin" />
          ) : (
            <CheckIcon className="size-3.5" />
          )}
          {loading ? t.onboard.approving : t.onboard.approveTeam}
        </Button>
        <Button
          onClick={onReject}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCwIcon className="size-3.5" />
          {t.onboard.rejectTeam}
        </Button>
      </div>
    </div>
  );
}
