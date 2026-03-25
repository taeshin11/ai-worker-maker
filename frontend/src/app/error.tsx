"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">500</span>
      <h1 className="text-xl font-semibold">
        {lang === "ko" ? "문제가 발생했습니다" : "Something went wrong"}
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        {lang === "ko"
          ? "예상치 못한 오류가 발생했습니다. 다시 시도해 주세요."
          : "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline">
        {lang === "ko" ? "다시 시도" : "Try again"}
      </Button>
    </div>
  );
}
