export type Charter = {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  targetAudience: string;
  keyFeatures: string[];
  tone: string;
};

export type TeamProposal = {
  departments: Array<{ name: string; rationale: string }>;
  agents: Array<{ name: string; departmentName: string; systemPrompt: string }>;
  firstTasks: string[];
};

export type PMPhase = "exploring" | "refining" | "proposing" | "approved";

export const EMPTY_CHARTER: Charter = {
  title: "",
  tagline: "",
  problem: "",
  solution: "",
  targetAudience: "",
  keyFeatures: [],
  tone: "Professional",
};

/**
 * Parses the PM's structured streaming response.
 * Format:
 *   CHARTER:{...json...}
 *   PHASE:exploring
 *   TEAM:{...json...}   <- optional
 *   MESSAGE:conversational text...
 */
export function parsePMResponse(raw: string): {
  charter: Partial<Charter>;
  phase: PMPhase;
  team: TeamProposal | null;
  message: string;
} {
  const out = {
    charter: {} as Partial<Charter>,
    phase: "exploring" as PMPhase,
    team: null as TeamProposal | null,
    message: "",
  };

  const charterMatch = raw.match(/^CHARTER:(.+)$/m);
  if (charterMatch) {
    try { out.charter = JSON.parse(charterMatch[1]); } catch {}
  }

  const phaseMatch = raw.match(/^PHASE:(\w+)$/m);
  if (phaseMatch) out.phase = phaseMatch[1] as PMPhase;

  const teamMatch = raw.match(/^TEAM:(.+)$/m);
  if (teamMatch) {
    try { out.team = JSON.parse(teamMatch[1]); } catch {}
  }

  const msgMarker = "\nMESSAGE:";
  const msgIdx = raw.indexOf(msgMarker);
  if (msgIdx !== -1) {
    out.message = raw.slice(msgIdx + msgMarker.length).trim();
  } else if (raw.startsWith("MESSAGE:")) {
    out.message = raw.slice("MESSAGE:".length).trim();
  } else {
    out.message = raw.trim();
  }

  return out;
}

export const PM_SYSTEM_PROMPT = `You are the Chief PM and Co-founder AI for "AI Worker Maker". Your job is to guide the user in defining their company vision through a warm, collaborative conversation.

CRITICAL: Every single response MUST follow this EXACT format — no exceptions:
CHARTER:{"title":"...","tagline":"...","problem":"...","solution":"...","targetAudience":"...","keyFeatures":["..."],"tone":"Professional"}
PHASE:exploring
MESSAGE:Your conversational text here. 2–4 sentences max. Be warm and encouraging.

Rules:
1. CHARTER: Always output a full valid JSON object. Use empty strings for unknown fields. Update ALL fields every turn based on the full conversation so far.
2. PHASE: Must be exactly one of: exploring | refining | proposing | approved
   - "exploring": just started, gathering basic idea
   - "refining": have title/problem/solution, iterating on details
   - "proposing": charter is solid, ready to show team structure — add a TEAM line (see below)
   - "approved": user confirmed the team (you'll be told when this happens)
3. MESSAGE: Friendly co-founder voice. Ask one focused question at a time. Never use bullet points.
4. When PHASE is "proposing", add this line between PHASE and MESSAGE:
TEAM:{"departments":[{"name":"...","rationale":"..."}],"agents":[{"name":"...","departmentName":"...","systemPrompt":"You are [name], a specialist in [role]. You help the team by..."}],"firstTasks":["...","...","..."]}
5. Propose 2–4 departments and 1–2 agents per department.
6. Keep keyFeatures to 3–5 items max.
7. Never break out of this format. Never add text before CHARTER:.`;
