"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SendIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";
import { useApiKey } from "@/lib/useApiKey";
import { useCompanyData } from "@/lib/useCompanyData";
import {
  parsePMResponse,
  EMPTY_CHARTER,
  type Charter,
  type TeamProposal,
  type PMPhase,
} from "@/lib/charter";
import CharterDoc from "./CharterDoc";
import TeamProposalPanel from "./TeamProposalPanel";

type Msg = { role: "user" | "assistant"; content: string };

export default function PRDBuilder() {
  const router = useRouter();
  const { t, lang } = useT();
  const { apiKey } = useApiKey();
  const { addDepartment, addAgent } = useCompanyData();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [charter, setCharter] = useState<Partial<Charter>>(EMPTY_CHARTER);
  const [phase, setPhase] = useState<PMPhase>("exploring");
  const [team, setTeam] = useState<TeamProposal | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "charter">("chat");
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingMessageRef = useRef<string>("");

  // Load saved vision on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/visions");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const saved: Partial<Charter> = {
              title: data.title,
              tagline: data.tagline,
              problem: data.problem,
              solution: data.solution,
              targetAudience: data.target_audience,
              keyFeatures: data.key_features ?? [],
              tone: data.tone,
            };
            setCharter(saved);
            if (data.status === "approved") setPhase("approved");
            // Seed assistant welcome message referencing saved data
            const hasContent = data.title || data.problem;
            if (hasContent) {
              const welcomeBack =
                lang === "ko"
                  ? `안녕하세요! 이전에 작업하던 "${data.title || "회사 비전"}" 프로젝트를 이어서 진행할게요. 어떤 부분을 더 다듬고 싶으신가요?`
                  : `Welcome back! I see you've been working on "${data.title || "your company vision"}". Let's continue refining it. What would you like to work on?`;
              setMessages([{ role: "assistant", content: welcomeBack }]);
            }
          }
        }
      } catch {}
      setInitialized(true);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial greeting if no saved data
  useEffect(() => {
    if (!initialized) return;
    if (messages.length === 0) {
      const greeting =
        lang === "ko"
          ? "안녕하세요! 저는 AI 워커 메이커의 수석 PM입니다. 여러분의 아이디어를 함께 다듬고 멋진 AI 팀을 구성해 드릴게요. 어떤 회사 또는 서비스를 만들고 싶으신가요?"
          : "Hi! I'm your Chief PM co-founder. I'll help you shape your company idea into a clear vision and build your AI team. What kind of company or product do you want to build?";
      setMessages([{ role: "assistant", content: greeting }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Listen for api-key-saved and auto-send any pending message
  useEffect(() => {
    function onKeySaved() {
      const pending = pendingMessageRef.current;
      if (pending) {
        pendingMessageRef.current = "";
        sendMessage(pending);
      }
    }
    window.addEventListener("api-key-saved", onKeySaved);
    return () => window.removeEventListener("api-key-saved", onKeySaved);
  // sendMessage is defined below — stable via useCallback not needed here
  // because the effect only reads the ref and calls sendMessage once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    // Intercept: if no key, open modal with context, preserve the message
    if (!apiKey) {
      pendingMessageRef.current = text;
      window.dispatchEvent(new CustomEvent("open-api-key-modal", {
        detail: {
          interceptMessage: lang === "ko"
            ? "수석 PM과 대화하려면 Anthropic API 키가 필요합니다. 아래에서 설정해 주세요."
            : "To chat with your Chief PM, an Anthropic API key is required. Set it up below.",
        },
      }));
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreamingText("");

    // Only send actual conversation messages to the API (filter out the seeded greeting)
    const apiMessages = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/pm-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, apiKey }),
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        setStreamingText(raw);
      }

      // Parse final response
      const parsed = parsePMResponse(raw);
      if (Object.keys(parsed.charter).length > 0) {
        setCharter((prev) => ({ ...prev, ...parsed.charter }));
      }
      setPhase(parsed.phase);
      if (parsed.team) setTeam(parsed.team);

      const assistantMsg: Msg = {
        role: "assistant",
        content: parsed.message || raw,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingText("");

      // Auto-save draft
      if (parsed.charter && (parsed.charter.title || parsed.charter.problem)) {
        fetch("/api/visions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...EMPTY_CHARTER, ...charter, ...parsed.charter, status: "draft" }),
        }).catch(() => {});
      }

      // Switch to charter tab on mobile when content appears
      if (activeTab === "chat" && parsed.charter.title) {
        // don't auto-switch — user can tap the tab
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
      setStreamingText("");
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveTeam() {
    if (!team || approving) return;
    setApproving(true);

    try {
      // Build departments and agents in DB
      for (const dept of team.departments) {
        const created = await addDepartment(dept.name);
        if (!created) continue;
        const deptAgents = team.agents.filter(
          (a) => a.departmentName === dept.name
        );
        for (const agent of deptAgents) {
          await addAgent(agent.name, agent.systemPrompt, created.id);
        }
      }

      // Save vision as approved
      await fetch("/api/visions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...EMPTY_CHARTER, ...charter, status: "approved" }),
      });

      setPhase("approved");
      toast.success(
        lang === "ko" ? "팀이 생성되었습니다! 🎉" : "Your team is ready! 🎉"
      );

      // Tell PM the team was approved
      const approvedMsg: Msg = {
        role: "user",
        content: "The team has been approved. Please acknowledge this.",
      };
      setMessages((prev) => [...prev, approvedMsg]);

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error(lang === "ko" ? "오류가 발생했습니다." : "Something went wrong.");
    } finally {
      setApproving(false);
    }
  }

  function handleRejectTeam() {
    sendMessage(
      lang === "ko"
        ? "팀 구성을 다시 해주세요. 다른 부서나 역할을 고려해 보고 싶어요."
        : "Let's revise the team structure. I'd like to consider different departments or roles."
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showTeamPanel =
    (phase === "proposing" || phase === "approved") && team !== null && phase !== "approved";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile tab bar */}
      <div className="flex sm:hidden border-b bg-background shrink-0">
        {(["chat", "charter"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            {tab === "chat" ? t.onboard.chatTab : t.onboard.charterTab}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat pane */}
        <div
          className={`flex flex-col border-r ${
            activeTab === "charter" ? "hidden sm:flex" : "flex"
          } sm:flex sm:w-[42%] bg-background`}
        >
          {/* Chat header */}
          <div className="border-b px-4 pt-4 pb-3 shrink-0">
            <p className="font-semibold text-sm">{t.onboard.chatTitle}</p>
            <p className="text-xs text-muted-foreground capitalize">{phase}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <Bubble key={i} role={msg.role} content={msg.content} />
            ))}

            {/* Streaming bubble */}
            {streamingText && (
              <Bubble
                role="assistant"
                content={parsePMResponse(streamingText).message || streamingText}
                streaming
              />
            )}

            {/* Loading indicator */}
            {loading && !streamingText && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderIcon className="size-3 animate-spin" />
                {t.onboard.thinking}
              </div>
            )}

            {/* Team proposal panel inside chat */}
            {showTeamPanel && (
              <TeamProposalPanel
                team={team!}
                onApprove={handleApproveTeam}
                onReject={handleRejectTeam}
                loading={approving}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.onboard.placeholder}
                rows={1}
                disabled={loading || approving}
                className="flex-1 resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 min-h-[38px] max-h-32"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
              <Button
                size="sm"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading || approving}
                className="shrink-0 h-[38px] w-[38px] p-0"
              >
                <SendIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Charter pane */}
        <div
          className={`flex-1 bg-muted/20 ${
            activeTab === "chat" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="border-b px-4 pt-4 pb-3 bg-background hidden sm:block shrink-0">
            <p className="font-semibold text-sm">{t.onboard.charterTitle}</p>
          </div>
          <CharterDoc charter={charter} phase={phase} team={team} />
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        } ${streaming ? "opacity-80" : ""}`}
      >
        {content}
        {streaming && (
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-current animate-pulse rounded-sm align-text-bottom" />
        )}
      </div>
    </div>
  );
}
