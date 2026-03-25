"use client";

import { useState } from "react";
import { PlusIcon, UserIcon, BuildingIcon } from "lucide-react";
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
import type { Department, Agent } from "@/lib/types";

const INITIAL_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Marketing" },
  { id: "dept-2", name: "HR" },
  { id: "dept-3", name: "Development" },
];

const INITIAL_AGENTS: Agent[] = [
  {
    id: "agent-1",
    name: "Maya",
    departmentId: "dept-1",
    systemPrompt:
      "You are Maya, a creative marketing strategist. You craft compelling campaigns, write ad copy, and analyse market trends.",
  },
  {
    id: "agent-2",
    name: "Alex",
    departmentId: "dept-2",
    systemPrompt:
      "You are Alex, an empathetic HR specialist. You handle onboarding, policy questions, and employee well-being.",
  },
  {
    id: "agent-3",
    name: "Dev",
    departmentId: "dept-3",
    systemPrompt:
      "You are Dev, a senior software engineer. You write clean code, review PRs, and advise on architecture.",
  },
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CompanyDashboard() {
  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");

  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentDeptId, setAgentDeptId] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");

  function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!deptName.trim()) return;
    setDepartments((prev) => [
      ...prev,
      { id: `dept-${genId()}`, name: deptName.trim() },
    ]);
    setDeptName("");
    setShowDeptForm(false);
  }

  function handleHireAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agentName.trim() || !agentDeptId || !agentPrompt.trim()) return;
    setAgents((prev) => [
      ...prev,
      {
        id: `agent-${genId()}`,
        name: agentName.trim(),
        departmentId: agentDeptId,
        systemPrompt: agentPrompt.trim(),
      },
    ]);
    setAgentName("");
    setAgentDeptId("");
    setAgentPrompt("");
    setShowAgentForm(false);
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
            {departments.length} department{departments.length !== 1 ? "s" : ""}{" "}
            · {agents.length} AI employee{agents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeptForm((v) => !v);
              setShowAgentForm(false);
            }}
          >
            <BuildingIcon />
            New Department
          </Button>
          <Button
            onClick={() => {
              setShowAgentForm((v) => !v);
              setShowDeptForm(false);
            }}
            disabled={departments.length === 0}
          >
            <PlusIcon />
            Hire Agent
          </Button>
        </div>
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeptForm(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Hire Agent form */}
      {showAgentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Hire an AI Agent</CardTitle>
            <CardDescription>
              Define your new employee's name, department, and role.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleHireAgent}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agent-name">Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Jordan"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agent-dept">Department</Label>
                <select
                  id="agent-dept"
                  value={agentDeptId}
                  onChange={(e) => setAgentDeptId(e.target.value)}
                  required
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agent-prompt">Role / System Prompt</Label>
                <Textarea
                  id="agent-prompt"
                  placeholder="You are Jordan, a... Describe their personality and responsibilities."
                  rows={4}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit">Hire</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAgentForm(false)}
              >
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
            return (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle>{dept.name}</CardTitle>
                  <CardDescription>
                    {deptAgents.length} employee
                    {deptAgents.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deptAgents.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No agents hired yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {deptAgents.map((agent) => (
                        <li
                          key={agent.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                            <UserIcon className="size-3.5 text-muted-foreground" />
                          </span>
                          <span className="font-medium">{agent.name}</span>
                        </li>
                      ))}
                    </ul>
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
