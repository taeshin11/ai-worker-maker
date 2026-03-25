import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PM_SYSTEM_PROMPT } from "@/lib/charter";
import { createClient } from "@/lib/supabase/server";

function classifyError(err: unknown): { status: number; code: string } {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 529 || err.message?.includes("overloaded"))
      return { status: 529, code: "overloaded" };
    if (err.status === 429) return { status: 429, code: "rate_limit" };
    if (err.status === 401) return { status: 401, code: "invalid_key" };
    return { status: err.status ?? 500, code: "api_error" };
  }
  return { status: 500, code: "unknown" };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ code: "unauthorized" }, { status: 401 });

  const { messages, apiKey } = await req.json();

  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    return Response.json({ code: "no_key" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: resolvedKey });

  try {
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
          const { code } = classifyError(err);
          controller.enqueue(
            new TextEncoder().encode(`\n\n__ERROR__:${code}`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const { status, code } = classifyError(err);
    return Response.json({ code }, { status });
  }
}
