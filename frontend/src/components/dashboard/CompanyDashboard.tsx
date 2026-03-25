"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, UserIcon, BuildingIcon, MessageSquareIcon } from "lucide-react";
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

export default function CompanyDashboard() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");

  // Which dept's "Add Agent" form is open
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
    <div className="flex flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Your Company</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {departments.length} department{departments.length !== 1 ? "s" : ""} ·{" "}
            {agents.length} AI employee{agents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => { setShowDeptForm((v) => !v); setHiringInDept(null); }}
        >
          <BuildingIcon />
          New Department
        </Button>
      </div>

      {/* New Department form */}
      {showDeptForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Department</CardTitle>
            <CardDescription>Add a new department to your company.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddDepartment}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dept-name">Department name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g. Finance"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="ghost" onClick={() => setShowDeptForm(false)}>
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Department grid */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <BuildingIcon className="size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No departments yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const deptAgents = agentsInDept(dept.id);
            const isHiring = hiringInDept === dept.id;

            return (
              <Card key={dept.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{dept.name}</CardTitle>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={`Add agent to ${dept.name}`}
                      onClick={() => isHiring ? setHiringInDept(null) : openHireForm(dept.id)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  <CardDescription>
                    {deptAgents.length} employee{deptAgents.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 flex-1">
                  {/* Agent list */}
                  {deptAgents.length === 0 && !isHiring ? (
                    <p className="text-sm text-muted-foreground italic">
                      No agents yet. Press + to hire one.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {deptAgents.map((agent) => (
                        <li
                          key={agent.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                              <UserIcon className="size-3.5 text-muted-foreground" />
                            </span>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title={`Chat with ${agent.name}`}
                            onClick={() => router.push(`/workspace?agent=${agent.id}`)}
                          >
                            <MessageSquareIcon />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Inline hire form */}
                  {isHiring && (
                    <form
                      onSubmit={handleHireAgent}
                      className="flex flex-col gap-3 border-t pt-3 mt-1"
                    >
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        New Agent
                      </p>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`agent-name-${dept.id}`} className="text-xs">
                          Name
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
                          Role / System Prompt
                        </Label>
                        <Textarea
                          id={`agent-prompt-${dept.id}`}
                          placeholder={`You are Jordan, a ${dept.name.toLowerCase()} specialist...`}
                          rows={3}
                          value={agentPrompt}
                          onChange={(e) => setAgentPrompt(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Hire</Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setHiringInDept(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
