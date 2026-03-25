"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, MessageSquareIcon, BuildingIcon, SparklesIcon } from "lucide-react";
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
import { INITIAL_DEPARTMENTS, INITIAL_AGENTS } from "@/lib/mock-data";
import type { Department, Agent } from "@/lib/types";

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

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
  if (n.includes("market")) return "📣";
  if (n.includes("hr") || n.includes("human")) return "👥";
  if (n.includes("dev") || n.includes("eng")) return "💻";
  if (n.includes("finance") || n.includes("account")) return "💰";
  if (n.includes("sales")) return "🎯";
  if (n.includes("legal")) return "⚖️";
  if (n.includes("ops") || n.includes("operat")) return "⚙️";
  if (n.includes("design")) return "🎨";
  return "🏢";
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");

  const [hiringInDept, setHiringInDept] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");

  function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!deptName.trim()) return;
    setDepartments((prev) => [...prev, { id: `dept-${genId()}`, name: deptName.trim() }]);
    setDeptName("");
    setShowDeptForm(false);
  }

  function handleHireAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agentName.trim() || !agentPrompt.trim() || !hiringInDept) return;
    setAgents((prev) => [
      ...prev,
      {
        id: `agent-${genId()}`,
        name: agentName.trim(),
        departmentId: hiringInDept,
        systemPrompt: agentPrompt.trim(),
      },
    ]);
    setAgentName("");
    setAgentPrompt("");
    setHiringInDept(null);
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

  return (
    <div className="min-h-full bg-muted/30">
      {/* Page header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Company</h1>
              <p className="text-muted-foreground mt-1">
                {departments.length} department{departments.length !== 1 ? "s" : ""} &middot;{" "}
                {agents.length} AI employee{agents.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="outline"
              className="shadow-sm"
              onClick={() => { setShowDeptForm((v) => !v); setHiringInDept(null); }}
            >
              <BuildingIcon />
              New Department
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-6">
        {/* New Department form */}
        {showDeptForm && (
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle>New Department</CardTitle>
              <CardDescription>Add a new workspace to your company.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDepartment}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dept-name">Department name</Label>
                  <Input
                    id="dept-name"
                    placeholder="e.g. Finance, Legal, Design…"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button type="submit">Create Department</Button>
                <Button type="button" variant="ghost" onClick={() => setShowDeptForm(false)}>
                  Cancel
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
              <p className="font-semibold text-foreground">No departments yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Create your first department to start hiring AI employees.
              </p>
            </div>
            <Button onClick={() => setShowDeptForm(true)}>
              <BuildingIcon />
              Create a Department
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
                        {deptAgents.length} employee{deptAgents.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Agent list */}
                  <div className="flex-1 px-5 pb-4">
                    {deptAgents.length === 0 && !isHiring ? (
                      <p className="text-sm text-muted-foreground/70 italic pt-1">
                        No agents yet.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2 pt-1">
                        {deptAgents.map((agent, agentIdx) => (
                          <li
                            key={agent.id}
                            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AGENT_COLORS[agentIdx % AGENT_COLORS.length]}`}>
                                {agent.name.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{agent.name}</p>
                              </div>
                            </div>
                            <button
                              title={`Chat with ${agent.name}`}
                              onClick={() => router.push(`/workspace?agent=${agent.id}`)}
                              className="flex shrink-0 items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <MessageSquareIcon className="size-3.5" />
                              Chat
                            </button>
                          </li>
                        ))}
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
                          New AI Employee
                        </p>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`agent-name-${dept.id}`} className="text-xs">Name</Label>
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
                            Role description
                          </Label>
                          <Textarea
                            id={`agent-prompt-${dept.id}`}
                            placeholder={`You are Jordan, a specialist in ${dept.name.toLowerCase()}. You help with…`}
                            rows={3}
                            value={agentPrompt}
                            onChange={(e) => setAgentPrompt(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex-1">Hire</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setHiringInDept(null)}>Cancel</Button>
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
                        Hire AI Employee
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
