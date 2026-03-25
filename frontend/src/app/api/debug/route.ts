import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/^(https?:\/\/[^.]+).*/, "$1…")
      : "MISSING",
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
    DEMO_EMAIL: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "MISSING",
    DEMO_PASSWORD: process.env.NEXT_PUBLIC_DEMO_PASSWORD ? "SET" : "MISSING",
  });
}
