import type { Department, Agent } from "@/lib/types";

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Marketing" },
  { id: "dept-2", name: "HR" },
  { id: "dept-3", name: "Development" },
];

export const INITIAL_AGENTS: Agent[] = [
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
