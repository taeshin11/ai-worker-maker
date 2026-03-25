import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PM_SYSTEM_PROMPT } from "@/lib/charter";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages, apiKey } = await req.json();

  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    return new Response("No API key available. Add your key via the connection settings.", { status: 400 });
  }

  const client = new Anthropic({ apiKey: resolvedKey });

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: PM_SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(new TextEncoder().encode(`\nMESSAGE:[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
