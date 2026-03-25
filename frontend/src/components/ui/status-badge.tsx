"use client";

import type { AgentStatus } from "@/lib/agentStatus/types";

const CONFIG: Record<AgentStatus, { dot: string; label: { en: string; ko: string }; pulse: boolean }> = {
  working: {
    dot: "bg-emerald-500",
    label: { en: "Working", ko: "작업 중" },
    pulse: true,
  },
  idle: {
    dot: "bg-slate-400",
    label: { en: "Idle", ko: "대기 중" },
    pulse: false,
  },
  blocked: {
    dot: "bg-amber-500",
    label: { en: "Needs Input", ko: "입력 필요" },
    pulse: false,
  },
};

export function StatusBadge({
  status,
  lang = "en",
  showLabel = true,
}: {
  status: AgentStatus;
  lang?: "en" | "ko";
  showLabel?: boolean;
}) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium
      ${status === "working" ? "bg-emerald-50 text-emerald-700" : ""}
      ${status === "idle"    ? "bg-slate-100 text-slate-500"    : ""}
      ${status === "blocked" ? "bg-amber-50 text-amber-700"     : ""}
    `}>
      <span className={`size-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {showLabel && cfg.label[lang]}
    </span>
  );
}
