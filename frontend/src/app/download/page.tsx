"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BotIcon,
  CloudIcon,
  MonitorIcon,
  CheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import VRAMCheckModal from "@/components/download/VRAMCheckModal";
import { useT } from "@/lib/i18n/context";

const CLOUD_FEATURES = [
  { en: "No download or hardware required",        ko: "다운로드·하드웨어 불필요" },
  { en: "Powered by Claude (latest Anthropic AI)", ko: "최신 Anthropic Claude AI 기반" },
  { en: "Works on any device — mobile too",         ko: "모바일 포함 모든 기기 사용 가능" },
  { en: "Always up-to-date, zero maintenance",      ko: "자동 업데이트, 유지보수 불필요" },
];

const LOCAL_FEATURES = [
  { en: "100% free — no subscription",            ko: "완전 무료, 구독 불필요" },
  { en: "Runs fully offline on your PC",           ko: "완전 오프라인으로 PC에서 실행" },
  { en: "Your data never leaves your computer",    ko: "데이터가 외부로 전송되지 않음" },
  { en: "Requires a capable GPU (≥6 GB VRAM)",    ko: "GPU 필요 (VRAM 6 GB 이상 권장)" },
];

export default function DownloadPage() {
  const { t, lang } = useT();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Nav */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <BotIcon className="size-4" />
            </div>
            <span className="font-bold text-sm">{t.brand}</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">{t.auth.signIn}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
          <SparklesIcon className="size-3.5" />
          {lang === "ko" ? "플랜을 선택하세요" : "Choose your plan"}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {lang === "ko"
            ? "어떻게 시작하시겠어요?"
            : "How would you like to get started?"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {lang === "ko"
            ? "클라우드 플랜은 모든 기기에서 바로 사용할 수 있습니다. 로컬 플랜은 강력한 GPU가 있는 PC에서 완전 무료로 실행됩니다."
            : "Cloud works instantly on any device. Local runs free on your own PC if you have a capable GPU."}
        </p>
      </section>

      {/* Tier cards */}
      <section className="mx-auto max-w-5xl px-6 pb-20 grid sm:grid-cols-2 gap-6">

        {/* Tier 1 — Cloud */}
        <div className="rounded-2xl bg-card ring-2 ring-primary shadow-md flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
              {lang === "ko" ? "추천" : "Recommended"}
            </span>
          </div>
          <div className="p-8 flex-1">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <CloudIcon className="size-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {lang === "ko" ? "클라우드 플랜" : "Cloud Plan"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {lang === "ko" ? "Premium · 구독제" : "Premium · Subscription"}
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {CLOUD_FEATURES.map((f) => (
                <li key={f.en} className="flex items-start gap-2.5 text-sm">
                  <CheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
                  {lang === "ko" ? f.ko : f.en}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-8 pb-8">
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg", className: "w-full gap-2 justify-center" })}
            >
              <ZapIcon className="size-4" />
              {lang === "ko" ? "무료로 시작하기" : "Start for free"}
            </Link>
          </div>
        </div>

        {/* Tier 2 — Local */}
        <div className="rounded-2xl bg-card ring-1 ring-foreground/10 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 flex-1">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted mb-5">
              <MonitorIcon className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {lang === "ko" ? "로컬 플랜" : "Local Plan"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {lang === "ko" ? "무료 · 1-클릭 설치" : "Free · 1-click install"}
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {LOCAL_FEATURES.map((f) => (
                <li key={f.en} className="flex items-start gap-2.5 text-sm">
                  <ShieldCheckIcon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  {lang === "ko" ? f.ko : f.en}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-8 pb-8 flex flex-col gap-3">
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowModal(true)}
            >
              <MonitorIcon className="size-4" />
              {lang === "ko" ? "내 PC 호환성 확인하기" : "Check my PC compatibility"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {lang === "ko"
                ? "다운로드 전 자동으로 GPU를 체크합니다"
                : "We'll automatically check your GPU before downloading"}
            </p>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <VRAMCheckModal lang={lang} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
