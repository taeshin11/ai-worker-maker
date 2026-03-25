"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, MessageSquareIcon, BuildingIcon, SparklesIcon, TrashIcon, LoaderIcon, LightbulbIcon, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyData } from "@/lib/useCompanyData";
import { useT } from "@/lib/i18n/context";
import { useAgentStatus } from "@/lib/agentStatus/context";
import { StatusBadge } from "@/components/ui/status-badge";


const DEPT_ACCENTS = [
  { border: "border-l-violet-400", iconBg: "bg-violet-100", iconText: "text-violet-600", badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  { border: "border-l-sky-400",    iconBg: "bg-sky-100",    iconText: "text-sky-600",    badge: "bg-sky-50 text-sky-700 ring-sky-200" },
  { border: "border-l-emerald-400",iconBg: "bg-emerald-100",iconText: "text-emerald-600",badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { border: "border-l-amber-400",  iconBg: "bg-amber-100",  iconText: "text-amber-600",  badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  { border: "border-l-rose-400",   iconBg: "bg-rose-100",   iconText: "text-rose-600",   badge: "bg-rose-50 text-rose-700 ring-rose-200" },
];

const AGENT_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function getDeptIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("market") || n.includes("마케")) return "📣";
  if (n.includes("hr") || n.includes("human") || n.includes("인사")) return "👥";
  if (n.includes("dev") || n.includes("eng") || n.includes("개발")) return "💻";
  if (n.includes("finance") || n.includes("account") || n.includes("재무") || n.includes("회계")) return "💰";
  if (n.includes("sales") || n.includes("영업")) return "🎯";
  if (n.includes("legal") || n.includes("법무")) return "⚖️";
  if (n.includes("ops") || n.includes("operat") || n.includes("운영")) return "⚙️";
  if (n.includes("design") || n.includes("디자인")) return "🎨";
  return "🏢";
}

export default function CompanyDashboard() {
  const router = useRouter();
  const { t, lang } = useT();
  const { statusMap } = useAgentStatus();
  const {
    departments, agents, loading,
    addDepartment, deleteDepartment, addAgent, updateAgent, deleteAgent,
  } = useCompanyData();

  const [vision, setVision] = useState<{ title: string; tagline: string; status: string } | null>(null);

  useEffect(() => {
    fetch("/api/visions")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setVision({ title: d.title, tagline: d.tagline, status: d.status }))
      .catch(() => {});
  }, []);

  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [saving, setSaving] = useState(false);

  const [hiringInDept, setHiringInDept] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  function startEditAgent(agent: { id: string; systemPrompt: string }) {
    setEditingAgentId(agent.id);
    setEditPrompt(agent.systemPrompt);
  }

  async function saveEditAgent() {
    if (!editingAgentId || editSaving) return;
    setEditSaving(true);
    await updateAgent(editingAgentId, { systemPrompt: editPrompt });
    setEditingAgentId(null);
    setEditSaving(false);
  }

  async function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!deptName.trim() || saving) return;
    setSaving(true);
    await addDepartment(deptName.trim());
    setDeptName("");
    setShowDeptForm(false);
    setSaving(false);
  }

  async function handleHireAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agentName.trim() || !agentPrompt.trim() || !hiringInDept || saving) return;
    setSaving(true);
    await addAgent(agentName.trim(), agentPrompt.trim(), hiringInDept);
    setAgentName("");
    setAgentPrompt("");
    setHiringInDept(null);
    setSaving(false);
  }

  function openHireForm(deptId: string) {
    setHiringInDept(deptId);
    setAgentName("");
    setAgentPrompt("");
    setShowDeptForm(false);
  }

  function agentsInDept(deptId: string) {
    return agents.filter((a) => a.departmentId === deptId);
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-muted/30">
        <div className="border-b bg-background">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-16 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/8 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      {/* Page header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.pageTitle}</h1>
              <p className="text-muted-foreground mt-1">
                {t.dashboard.stats(departments.length, agents.length)}
              </p>
            </div>
            <Button
              variant="outline"
              className="shadow-sm"
              onClick={() => { setShowDeptForm((v) => !v); setHiringInDept(null); }}
            >
              <BuildingIcon />
              {t.dashboard.newDept}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-6">
        {/* Vision banner */}
        <button
          onClick={() => router.push("/onboard")}
          className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-md ${
            vision?.status === "approved"
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
              : "bg-primary/5 border-primary/20 hover:bg-primary/10"
          }`}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LightbulbIcon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            {vision?.title ? (
              <>
                <p className="font-semibold text-sm truncate">{vision.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {vision.tagline || t.dashboard.visionView}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">
                  {t.dashboard.visionDefine}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.dashboard.visionDefineDesc}
                </p>
              </>
            )}
          </div>
          <span className={`text-xs font-medium shrink-0 px-2.5 py-1 rounded-full ${
            vision?.status === "approved"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-primary/10 text-primary"
          }`}>
            {vision?.status === "approved"
              ? t.dashboard.visionApproved
              : vision?.title
              ? t.dashboard.visionDraft
              : `${t.dashboard.visionStart} →`}
          </span>
        </button>

        {/* New Department form */}
        {showDeptForm && (
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle>{t.dashboard.deptFormTitle}</CardTitle>
              <CardDescription>{t.dashboard.deptFormDesc}</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDepartment}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dept-name">{t.dashboard.deptNameLabel}</Label>
                  <Input
                    id="dept-name"
                    placeholder={t.dashboard.deptNamePlaceholder}
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoaderIcon className="size-4 animate-spin" /> : t.dashboard.createDeptBtn}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowDeptForm(false)}>
                  {t.dashboard.cancel}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Empty state */}
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-4xl shadow-inner">
              🏢
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.dashboard.noDepts}</p>
              <p className="text-muted-foreground text-sm mt-1">{t.dashboard.noDeptsDesc}</p>
            </div>
            <Button onClick={() => setShowDeptForm(true)}>
              <BuildingIcon />
              {t.dashboard.createDept}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, idx) => {
              const accent = DEPT_ACCENTS[idx % DEPT_ACCENTS.length];
              const deptAgents = agentsInDept(dept.id);
              const isHiring = hiringInDept === dept.id;

              return (
                <div
                  key={dept.id}
                  className={`group flex flex-col rounded-xl bg-card ring-1 ring-foreground/8 shadow-sm hover:shadow-md transition-shadow border-l-4 ${accent.border} overflow-hidden`}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-5 pb-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${accent.iconBg}`}>
                      {getDeptIcon(dept.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{dept.name}</h3>
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${accent.badge}`}>
                        {t.dashboard.employees(deptAgents.length)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(t.dashboard.deleteDeptConfirm(dept.name))) deleteDepartment(dept.id);
                      }}
                      className="shrink-0 p-1 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      title={t.dashboard.deleteDept}
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Agent list */}
                  <div className="flex-1 px-5 pb-4">
                    {deptAgents.length === 0 && !isHiring ? (
                      <p className="text-sm text-muted-foreground/70 italic pt-1">
                        {t.dashboard.noAgents}
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2 pt-1">
                        {deptAgents.map((agent, agentIdx) => {
                          const entry = statusMap[agent.id];
                          const status = entry?.status ?? "idle";
                          const snippet = entry?.snippet ?? "";
                          const isEditing = editingAgentId === agent.id;
                          return (
                            <li key={agent.id} className="rounded-lg hover:bg-muted/60 transition-colors">
                              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AGENT_COLORS[agentIdx % AGENT_COLORS.length]}`}>
                                    {agent.name.slice(0, 2).toUpperCase()}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-medium truncate">{agent.name}</p>
                                      <StatusBadge status={status} lang={lang} />
                                    </div>
                                    {snippet && (
                                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                        {status === "working" ? snippet : `↩ ${snippet}`}…
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    title={t.dashboard.editRole}
                                    onClick={() => isEditing ? setEditingAgentId(null) : startEditAgent(agent)}
                                    className={`p-1 rounded transition-colors ${isEditing ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"}`}
                                  >
                                    <PencilIcon className="size-3" />
                                  </button>
                                  <button
                                    title={t.dashboard.chatWith(agent.name)}
                                    onClick={() => router.push(`/workspace?agent=${agent.id}`)}
                                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                  >
                                    <MessageSquareIcon className="size-3.5" />
                                    {t.dashboard.chat}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(t.dashboard.deleteAgentConfirm(agent.name))) deleteAgent(agent.id);
                                    }}
                                    className="p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title={t.dashboard.deleteDept}
                                  >
                                    <TrashIcon className="size-3" />
                                  </button>
                                </div>
                              </div>
                              {/* Inline system prompt editor */}
                              {isEditing && (
                                <div className="px-2 pb-2 pt-1">
                                  <Textarea
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    rows={3}
                                    className="text-xs resize-none"
                                    placeholder={t.dashboard.editRolePlaceholder}
                                    autoFocus
                                  />
                                  <div className="flex gap-1.5 mt-1.5">
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={saveEditAgent}
                                      disabled={editSaving}
                                    >
                                      {editSaving ? <LoaderIcon className="size-3 animate-spin" /> : <CheckIcon className="size-3" />}
                                      {t.dashboard.save}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => setEditingAgentId(null)}
                                    >
                                      <XIcon className="size-3" />
                                      {t.dashboard.cancel}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Inline hire form */}
                    {isHiring && (
                      <form
                        onSubmit={handleHireAgent}
                        className="flex flex-col gap-3 border-t mt-3 pt-3"
                      >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <SparklesIcon className="size-3" />
                          {t.dashboard.newEmployee}
                        </p>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`agent-name-${dept.id}`} className="text-xs">
                            {t.dashboard.nameLabel}
                          </Label>
                          <Input
                            id={`agent-name-${dept.id}`}
                            placeholder="e.g. Jordan"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`agent-prompt-${dept.id}`} className="text-xs">
                            {t.dashboard.roleLabel}
                          </Label>
                          <Textarea
                            id={`agent-prompt-${dept.id}`}
                            placeholder={t.dashboard.rolePlaceholder(dept.name)}
                            rows={3}
                            value={agentPrompt}
                            onChange={(e) => setAgentPrompt(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                            {saving ? <LoaderIcon className="size-3.5 animate-spin" /> : t.dashboard.hire}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setHiringInDept(null)}>
                            {t.dashboard.cancel}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* CTA footer */}
                  {!isHiring && (
                    <div className="border-t px-4 py-3">
                      <button
                        onClick={() => openHireForm(dept.id)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-1"
                      >
                        <PlusIcon className="size-4" />
                        {t.dashboard.hireEmployee}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
