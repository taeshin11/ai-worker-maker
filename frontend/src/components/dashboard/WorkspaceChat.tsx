"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  SendHorizonalIcon,
  BotIcon,
  UserIcon,
  KeyIcon,
  MenuIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiKey } from "@/lib/useApiKey";
import { useCompanyData } from "@/lib/useCompanyData";
import type { Agent } from "@/lib/types";
import { useT } from "@/lib/i18n/context";
import { useAgentStatus } from "@/lib/agentStatus/context";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { parseErrorCode, friendlyMessage } from "@/lib/friendlyError";

type Message = {
  role: "user" | "assistant";
  content: string;
};

import type { Department } from "@/lib/types";

function AgentList({
  groupedAgents,
  selectedAgentId,
  onSelect,
  statusMap,
  lang,
  getDeptName,
}: {
  groupedAgents: { dept: Department; agents: Agent[] }[];
  selectedAgentId: string;
  onSelect: (id: string) => void;
  statusMap: import("@/lib/agentStatus/types").AgentStatusMap;
  lang: "en" | "ko";
  getDeptName: (id: string) => string;
}) {
  return (
    <ul className="flex-1 overflow-y-auto py-2">
      {groupedAgents.map(({ dept, agents: deptAgents }) => (
        <li key={dept.id}>
          <p className="px-4 py-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {dept.name}
          </p>
          {deptAgents.map((agent) => {
            const entry = statusMap[agent.id];
            const status = entry?.status ?? "idle";
            return (
              <button
                key={agent.id}
                onClick={() => onSelect(agent.id)}
                className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                  selectedAgentId === agent.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selectedAgentId === agent.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {agent.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getDeptName(agent.departmentId)}
                  </p>
                </div>
                <StatusBadge status={status} lang={lang} showLabel={false} />
              </button>
            );
          })}
        </li>
      ))}
    </ul>
  );
}

export default function WorkspaceChat() {
  const searchParams = useSearchParams();
  const { apiKey } = useApiKey();
  const { t, lang } = useT();
  const { statusMap, setAgentStatus } = useAgentStatus();
  const { departments, agents } = useCompanyData();

  const isReady = !!apiKey;

  const initialAgentId = searchParams.get("agent") ?? "";
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingMessageRef = useRef<string>("");

  const selectedAgent: Agent | null =
    agents.find((a) => a.id === selectedAgentId) ?? null;

  const groupedAgents = departments.map((dept) => ({
    dept,
    agents: agents.filter((a) => a.departmentId === dept.id),
  }));

  function deptName(deptId: string) {
    return departments.find((d) => d.id === deptId)?.name ?? "";
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-send pending message after API key is saved via modal
  useEffect(() => {
    function onKeySaved() {
      const pending = pendingMessageRef.current;
      if (pending && selectedAgent) {
        pendingMessageRef.current = "";
        // Restore input briefly so user sees it, then submit
        setInput(pending);
        setTimeout(() => {
          const form = document.getElementById("workspace-chat-form");
          form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }, 50);
      }
    }
    window.addEventListener("api-key-saved", onKeySaved);
    return () => window.removeEventListener("api-key-saved", onKeySaved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]);

  // Close drawer when clicking backdrop or after selecting on mobile
  function handleSelectAgent(id: string) {
    setSelectedAgentId(id);
    setMessages([]);
    setDrawerOpen(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading) return;

    // Intercept: if BYOK key is missing, open the modal and preserve the message
    if (!apiKey) {
      pendingMessageRef.current = input.trim();
      window.dispatchEvent(new CustomEvent("open-api-key-modal", {
        detail: {
          interceptMessage: lang === "ko"
            ? `${selectedAgent.name}와(과) 대화하려면 Anthropic API 키가 필요합니다. 아래에서 설정해 주세요.`
            : `To chat with ${selectedAgent.name}, an Anthropic API key is required. Set it up below.`,
        },
      }));
      return;
    }

    const userMsg: Message = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    setAgentStatus(selectedAgent.id, "working", "");

    const agentId = selectedAgent.id;
    const agentName = selectedAgent.name;

    try {
      {
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
          const body = await res.text();
          const code = parseErrorCode(body);
          const friendly = friendlyMessage(code, t);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: `⚠️ ${friendly}` },
          ]);
          setAgentStatus(agentId, "idle");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAgentStatus(agentId, "working", text.slice(0, 60));
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: text },
          ]);
        }

        // Check for error sentinel in stream
        const streamError = parseErrorCode(text);
        if (streamError) {
          const friendly = friendlyMessage(streamError, t);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: `⚠️ ${friendly}` },
          ]);
          setAgentStatus(agentId, "idle");
          return;
        }

        setAgentStatus(agentId, "idle", text.slice(0, 60));
        toast.success(
          lang === "ko" ? `${agentName}이(가) 작업을 완료했습니다.` : `${agentName} finished a task.`,
          { duration: 4000 }
        );
      }
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      const code = parseErrorCode(errStr);
      const friendly = friendlyMessage(code, t);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `⚠️ ${friendly}` },
      ]);
      setAgentStatus(agentId, "idle");
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

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 shrink-0 border-r flex-col">
        <div className="px-4 py-3 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.workspace.agents}
          </p>
        </div>
        <AgentList
          groupedAgents={groupedAgents}
          selectedAgentId={selectedAgentId}
          onSelect={handleSelectAgent}
          statusMap={statusMap}
          lang={lang}
          getDeptName={deptName}
        />
      </aside>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Slide-in panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <p className="font-semibold text-sm">{t.workspace.chooseAgent}</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <AgentList
              groupedAgents={groupedAgents}
              selectedAgentId={selectedAgentId}
              onSelect={handleSelectAgent}
              statusMap={statusMap}
              lang={lang}
              getDeptName={deptName}
            />
          </aside>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Chat header */}
        <div className="border-b px-4 py-3 flex items-center gap-3 min-h-[53px]">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open agent list"
          >
            <MenuIcon className="size-4" />
          </button>

          {selectedAgent ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {selectedAgent.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{selectedAgent.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {deptName(selectedAgent.departmentId)}
                </p>
              </div>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground md:cursor-default md:pointer-events-none"
              onClick={() => setDrawerOpen(true)}
            >
              <BotIcon className="size-4 shrink-0" />
              <span>{t.workspace.tapToChoose}</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {!selectedAgent && (
            <div className="flex flex-1 flex-col items-center justify-center h-full gap-3 text-center px-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                🤖
              </span>
              <p className="font-medium">{t.workspace.noAgentTitle}</p>
              <p className="text-muted-foreground text-sm">
                {t.workspace.tapMenuPrefix}{t.workspace.tapMenuPrefix ? " " : ""}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <MenuIcon className="size-3.5" /> {t.workspace.tapMenuLabel}
                </button>{" "}
                {t.workspace.tapMenuSuffix}
              </p>
            </div>
          )}
          {selectedAgent && messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center h-full gap-2 text-center px-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {selectedAgent.name.slice(0, 2).toUpperCase()}
              </span>
              <p className="font-medium">{selectedAgent.name}</p>
              <p className="text-muted-foreground text-sm">
                {deptName(selectedAgent.departmentId)} · {t.workspace.readyToHelp}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5 text-xs font-bold text-muted-foreground">
                  {selectedAgent?.name.slice(0, 2).toUpperCase() ?? "AI"}
                </span>
              )}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content || (
                  <span className="italic text-muted-foreground">
                    {selectedAgent?.name} {t.workspace.thinking}
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
        {!isReady && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-api-key-modal"))}
            className="flex w-full items-center gap-2 border-t bg-amber-50 px-4 py-2.5 text-xs text-amber-700 hover:bg-amber-100 transition-colors text-left"
          >
            <KeyIcon className="size-3.5 shrink-0" />
            {t.workspace.apiKeyBanner}
          </button>
        )}

        {/* Input */}
        <div className="border-t px-4 py-3 bg-background">
          <form id="workspace-chat-form" onSubmit={handleSend} className="flex gap-2 items-end">
            <Textarea
              placeholder={
                !selectedAgent
                  ? t.workspace.placeholderNoAgent
                  : !isReady
                  ? t.workspace.placeholderNoKey
                  : t.workspace.messagePlaceholder(selectedAgent.name)
              }
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedAgent || loading || !isReady}
              className="resize-none min-h-[48px] max-h-36 text-base md:text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0"
              disabled={!selectedAgent || !input.trim() || loading || !isReady}
            >
              <SendHorizonalIcon className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-1.5 hidden sm:block">
            {t.workspace.enterToSend}
          </p>
        </div>
      </div>
    </div>
  );
}
