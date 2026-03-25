"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonalIcon, BotIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Agent, Department } from "@/lib/types";

// --- Mock data (mirrors CompanyDashboard) ---
const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Marketing" },
  { id: "dept-2", name: "HR" },
  { id: "dept-3", name: "Development" },
];

const MOCK_AGENTS: Agent[] = [
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

type Message = {
  role: "user" | "assistant";
  content: string;
};

function deptName(deptId: string) {
  return MOCK_DEPARTMENTS.find((d) => d.id === deptId)?.name ?? "";
}

// Placeholder until backend is wired up
async function mockAgentReply(agent: Agent, messages: Message[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 800));
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return `Hi, I'm **${agent.name}** from ${deptName(agent.departmentId)}. You said: "${lastUser?.content}". The backend isn't connected yet — once it is, I'll give you real answers!`;
}

export default function WorkspaceChat() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedAgent = MOCK_AGENTS.find((a) => a.id === selectedAgentId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSelectAgent(id: string) {
    setSelectedAgentId(id);
    setMessages([]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const reply = await mockAgentReply(selectedAgent, next);
    setMessages([...next, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="flex h-[calc(100vh-53px)]">
      {/* Sidebar — agent list */}
      <aside className="w-56 shrink-0 border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Agents
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {MOCK_DEPARTMENTS.map((dept) => {
            const agents = MOCK_AGENTS.filter((a) => a.departmentId === dept.id);
            return (
              <li key={dept.id}>
                <p className="px-4 py-1.5 text-xs text-muted-foreground font-medium">
                  {dept.name}
                </p>
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.id)}
                    className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted ${
                      selectedAgentId === agent.id
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <BotIcon className="size-3.5 shrink-0" />
                    {agent.name}
                  </button>
                ))}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="border-b px-6 py-3 flex items-center gap-2 min-h-[53px]">
          {selectedAgent ? (
            <>
              <BotIcon className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">{selectedAgent.name}</span>
              <span className="text-xs text-muted-foreground">
                · {deptName(selectedAgent.departmentId)}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select an agent to start a conversation
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {!selectedAgent && (
            <div className="flex flex-1 items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">
                Choose an agent from the sidebar.
              </p>
            </div>
          )}
          {selectedAgent && messages.length === 0 && !loading && (
            <div className="flex flex-1 items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">
                Start a conversation with {selectedAgent.name}.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <BotIcon className="size-3.5 text-muted-foreground" />
                </span>
              )}
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <UserIcon className="size-3.5 text-muted-foreground" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                <BotIcon className="size-3.5 text-muted-foreground" />
              </span>
              <div className="bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground italic">
                {selectedAgent?.name} is thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t px-6 py-4">
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <Textarea
              placeholder={
                selectedAgent
                  ? `Message ${selectedAgent.name}… (Enter to send)`
                  : "Select an agent first"
              }
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedAgent || loading}
              className="resize-none min-h-[40px] max-h-40"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!selectedAgent || !input.trim() || loading}
            >
              <SendHorizonalIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
