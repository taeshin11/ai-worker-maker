"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export default function NotFound() {
  const { lang } = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-6xl">404</span>
      <h1 className="text-xl font-semibold">
        {lang === "ko" ? "페이지를 찾을 수 없습니다" : "Page not found"}
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        {lang === "ko"
          ? "요청하신 페이지가 존재하지 않거나 이동되었습니다."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {lang === "ko" ? "대시보드로 돌아가기" : "Back to Dashboard"}
      </Link>
    </div>
  );
}
