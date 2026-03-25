export type AgentStatus = "idle" | "working" | "blocked";

export type AgentStatusEntry = {
  status: AgentStatus;
  snippet: string; // live or last-completed task snippet
};

export type AgentStatusMap = Record<string, AgentStatusEntry>;
