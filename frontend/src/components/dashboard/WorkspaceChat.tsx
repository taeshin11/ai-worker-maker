"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SendHorizonalIcon, BotIcon, UserIcon, KeyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiKey } from "@/lib/useApiKey";
import { INITIAL_AGENTS, INITIAL_DEPARTMENTS } from "@/lib/mock-data";
import type { Agent } from "@/lib/types";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function deptName(deptId: string) {
  return INITIAL_DEPARTMENTS.find((d) => d.id === deptId)?.name ?? "";
}

export default function WorkspaceChat() {
  const searchParams = useSearchParams();
  const { apiKey } = useApiKey();

  const initialAgentId = searchParams.get("agent") ?? "";
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedAgent: Agent | null =
    INITIAL_AGENTS.find((a) => a.id === selectedAgentId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSelectAgent(id: string) {
    setSelectedAgentId(id);
    setMessages([]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading || !apiKey) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: selectedAgent.systemPrompt,
          apiKey,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.text();
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `Error: ${err}` },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: text },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  const groupedAgents = INITIAL_DEPARTMENTS.map((dept) => ({
    dept,
    agents: INITIAL_AGENTS.filter((a) => a.departmentId === dept.id),
  }));

  return (
    <div className="flex h-[calc(100vh-53px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Agents
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {groupedAgents.map(({ dept, agents }) => (
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
          ))}
        </ul>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
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
          {selectedAgent && messages.length === 0 && (
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
                className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content || (
                  <span className="italic text-muted-foreground">
                    {selectedAgent?.name} is thinking…
                  </span>
                )}
              </div>
              {msg.role === "user" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <UserIcon className="size-3.5 text-muted-foreground" />
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* API key warning */}
        {!apiKey && (
          <div className="flex items-center gap-2 border-t bg-muted/50 px-6 py-2 text-sm text-muted-foreground">
            <KeyIcon className="size-3.5 shrink-0" />
            Add your Anthropic API key (top-right) to start chatting with real Claude agents.
          </div>
        )}

        {/* Input */}
        <div className="border-t px-6 py-4">
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <Textarea
              placeholder={
                !selectedAgent
                  ? "Select an agent first"
                  : !apiKey
                  ? "Add your API key to chat…"
                  : `Message ${selectedAgent.name}… (Enter to send)`
              }
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedAgent || loading || !apiKey}
              className="resize-none min-h-[40px] max-h-40"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!selectedAgent || !input.trim() || loading || !apiKey}
            >
              <SendHorizonalIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
