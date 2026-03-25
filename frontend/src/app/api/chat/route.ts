import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt, apiKey } = await req.json();

  // BYOK only: user supplies their own Anthropic API key.
  // Server-side ANTHROPIC_API_KEY is used as a fallback for demos/testing only.
  const resolvedKey: string | undefined = process.env.ANTHROPIC_API_KEY ?? apiKey;
  if (!resolvedKey) {
    return new Response("No API key provided. Add your Anthropic API key via the connection settings.", { status: 400 });
  }

  const client = new Anthropic({ apiKey: resolvedKey });

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(new TextEncoder().encode(`\n\n[Error: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
