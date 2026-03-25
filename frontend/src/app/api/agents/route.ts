import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, system_prompt, department_id, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, system_prompt, department_id } = await req.json();
  if (!name?.trim() || !department_id) {
    return NextResponse.json({ error: "name and department_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("agents")
    .insert({ name: name.trim(), system_prompt: system_prompt?.trim() ?? "", department_id })
    .select("id, name, system_prompt, department_id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
