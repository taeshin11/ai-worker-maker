/**
 * After team approval, auto-send first tasks to each created agent.
 * Runs in the background — fire and forget.
 * Updates agent status in localStorage so dashboard shows "working".
 */

type CreatedAgent = {
  id: string;
  name: string;
  systemPrompt: string;
};

const STATUS_KEY = "agent_status_map";

function setStatusInStorage(agentId: string, status: "idle" | "working", snippet: string) {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[agentId] = { status, snippet };
    localStorage.setItem(STATUS_KEY, JSON.stringify(map));
    // Notify other tabs/components
    window.dispatchEvent(new StorageEvent("storage", { key: STATUS_KEY }));
  } catch {}
}

function saveChatHistory(agentId: string, messages: { role: string; content: string }[]) {
  try {
    localStorage.setItem(`chat_${agentId}`, JSON.stringify(messages.slice(-100)));
  } catch {}
}

async function kickoffSingleAgent(
  agent: CreatedAgent,
  kickoffMessage: string,
  apiKey: string,
) {
  const userMsg = { role: "user" as const, content: kickoffMessage };

  // Save user message and empty assistant placeholder
  saveChatHistory(agent.id, [userMsg]);
  setStatusInStorage(agent.id, "working", "");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: kickoffMessage }],
        systemPrompt: agent.systemPrompt,
        apiKey,
      }),
    });

    if (!res.ok || !res.body) {
      setStatusInStorage(agent.id, "idle", "");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      // Update status snippet periodically
      setStatusInStorage(agent.id, "working", text.slice(0, 60));
    }

    // Check for error
    if (text.includes("__ERROR__:")) {
      setStatusInStorage(agent.id, "idle", "");
      return;
    }

    // Save complete conversation
    saveChatHistory(agent.id, [
      userMsg,
      { role: "assistant", content: text },
    ]);
    setStatusInStorage(agent.id, "idle", text.slice(0, 60));
  } catch {
    setStatusInStorage(agent.id, "idle", "");
  }
}

export function kickoffAgents(
  agents: CreatedAgent[],
  firstTasks: string[],
  apiKey: string,
  lang: "ko" | "en",
) {
  if (!apiKey || agents.length === 0) return;

  const taskList = firstTasks.length > 0
    ? firstTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "";

  // Stagger requests to avoid rate limits (300ms apart)
  agents.forEach((agent, idx) => {
    const kickoffMessage = lang === "ko"
      ? `업무를 시작해 주세요. 자기소개와 함께 첫 번째 작업 계획을 알려주세요.${taskList ? `\n\n회사의 우선 과제:\n${taskList}` : ""}`
      : `Please start working. Introduce yourself and share your first action plan.${taskList ? `\n\nCompany priorities:\n${taskList}` : ""}`;

    setTimeout(() => {
      kickoffSingleAgent(agent, kickoffMessage, apiKey);
    }, idx * 300);
  });
}
