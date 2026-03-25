// Client-side streaming for Ollama (local tier).
// Called directly from the browser — bypasses our server entirely.

type Message = { role: "user" | "assistant"; content: string };

type OllamaChunk = {
  message?: { role: string; content: string };
  done: boolean;
  error?: string;
};

export async function streamLocalChat({
  endpoint,
  model,
  messages,
  systemPrompt,
  onChunk,
}: {
  endpoint: string;
  model: string;
  messages: Message[];
  systemPrompt: string;
  onChunk: (text: string) => void;
}): Promise<void> {
  const systemMsg = systemPrompt
    ? [{ role: "system", content: systemPrompt }]
    : [];

  const res = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [...systemMsg, ...messages],
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || `Ollama error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const chunk: OllamaChunk = JSON.parse(line);
        if (chunk.error) throw new Error(chunk.error);
        if (chunk.message?.content) onChunk(chunk.message.content);
      } catch {
        // skip malformed line
      }
    }
  }
}

export async function pingOllama(endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
