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
  Trash2Icon,
} from "lucide-react";
import Markdown from "react-markdown";
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
import type { CodeArtifact } from "@/lib/codeArtifact";
import { extractArtifacts } from "@/lib/codeArtifact";
import CodeBlockToolbar from "./CodeBlockToolbar";
import CodePreviewPanel from "./CodePreviewPanel";

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

/** Renders markdown with code block toolbars (Preview/Download/Copy/GitHub). */
function MarkdownWithArtifacts({
  content,
  onPreview,
}: {
  content: string;
  onPreview: (artifact: CodeArtifact) => void;
}) {
  const artifacts = extractArtifacts(content);
  let artifactIdx = 0;

  return (
    <Markdown
      components={{
        pre({ children, ...props }) {
          // Match this pre to the next artifact by index
          const artifact = artifacts[artifactIdx];
          if (artifact) artifactIdx++;

          return (
            <div className="my-2">
              <pre {...props} className="rounded-lg bg-[#1e1e1e] text-[#d4d4d4] p-3 overflow-x-auto text-xs leading-relaxed">
                {children}
              </pre>
              {artifact && (
                <div className="mt-1.5">
                  <CodeBlockToolbar artifact={artifact} onPreview={onPreview} />
                </div>
              )}
            </div>
          );
        },
      }}
    >
      {content}
    </Markdown>
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
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined" || !initialAgentId) return [];
    try {
      const saved = localStorage.getItem(`chat_${initialAgentId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewArtifact, setPreviewArtifact] = useState<CodeArtifact | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingMessageRef = useRef<string>("");

  // Persist chat history to localStorage
  useEffect(() => {
    if (!selectedAgentId || messages.length === 0) return;
    try {
      localStorage.setItem(`chat_${selectedAgentId}`, JSON.stringify(messages.slice(-100)));
    } catch { /* quota exceeded — ignore */ }
  }, [messages, selectedAgentId]);

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

  // Escape key closes mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Close drawer when clicking backdrop or after selecting on mobile
  function handleSelectAgent(id: string) {
    setSelectedAgentId(id);
    // Load saved chat history for this agent
    try {
      const saved = localStorage.getItem(`chat_${id}`);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch { setMessages([]); }
    setDrawerOpen(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading) return;

    // Read key fresh from localStorage to avoid stale closure after modal save
    const currentKey = apiKey || localStorage.getItem("anthropic_api_key") || "";

    // Intercept: if BYOK key is missing, open the modal and preserve the message
    if (!currentKey) {
      pendingMessageRef.current = input.trim();
      window.dispatchEvent(new CustomEvent("open-api-key-modal", {
        detail: {
          interceptMessage: t.workspace.interceptNoKey(selectedAgent.name),
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
            apiKey: currentKey,
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
        toast.success(t.workspace.taskDone(agentName), { duration: 4000 });
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
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {selectedAgent.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{selectedAgent.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {deptName(selectedAgent.departmentId)}
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    try { localStorage.removeItem(`chat_${selectedAgentId}`); } catch {}
                  }}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title={t.workspace.clearChat}
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              )}
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
            <div className="flex flex-1 flex-col items-center justify-center h-full gap-3 text-center px-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {selectedAgent.name.slice(0, 2).toUpperCase()}
              </span>
              <p className="font-medium">{selectedAgent.name}</p>
              <p className="text-muted-foreground text-sm">
                {deptName(selectedAgent.departmentId)} · {t.workspace.readyToHelp}
              </p>
              {selectedAgent.systemPrompt && (
                <p className="text-xs text-muted-foreground/70 max-w-sm leading-relaxed mt-1 italic">
                  &ldquo;{selectedAgent.systemPrompt.length > 150
                    ? selectedAgent.systemPrompt.slice(0, 150) + "…"
                    : selectedAgent.systemPrompt}&rdquo;
                </p>
              )}
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
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
                    : "bg-muted text-foreground rounded-bl-sm prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                }`}
              >
                {msg.content ? (
                  msg.role === "assistant" ? (
                    <MarkdownWithArtifacts
                      content={msg.content}
                      onPreview={setPreviewArtifact}
                    />
                  ) : (
                    msg.content
                  )
                ) : (
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
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
              }}
              onKeyDown={handleKeyDown}
              disabled={!selectedAgent || loading || !isReady}
              className="resize-none min-h-[44px] max-h-36 text-base md:text-sm"
              style={{ overflow: "hidden" }}
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

      {/* ── Code Preview Panel (mobile: fullscreen overlay, desktop: inline right pane) ── */}
      {previewArtifact && (
        <CodePreviewPanel
          artifact={previewArtifact}
          onClose={() => setPreviewArtifact(null)}
        />
      )}
    </div>
  );
}
