"use client";

import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { XIcon, CpuIcon, MonitorIcon, DownloadIcon, CloudIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, LoaderIcon } from "lucide-react";
import { detectGpu, type VramTier, type DetectResult } from "@/lib/vramDetect";

type Step = "detecting" | "result" | "questionnaire";

const TIER_CONFIG: Record<VramTier, {
  icon: React.ReactNode;
  color: string;
  badge: string;
  title: { en: string; ko: string };
  desc: { en: string; ko: string };
  canDownload: boolean;
}> = {
  high: {
    icon: <CheckCircleIcon className="size-7 text-emerald-500" />,
    color: "bg-emerald-50 ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    title: { en: "Your PC is ready! ✅", ko: "PC 사양이 충분합니다! ✅" },
    desc: {
      en: "Your GPU has enough VRAM to run local AI models smoothly.",
      ko: "GPU의 VRAM이 충분해 로컬 AI 모델을 원활하게 실행할 수 있습니다.",
    },
    canDownload: true,
  },
  mid: {
    icon: <AlertTriangleIcon className="size-7 text-amber-500" />,
    color: "bg-amber-50 ring-amber-200",
    badge: "bg-amber-100 text-amber-700",
    title: { en: "Your PC can run basic models ⚠️", ko: "기본 모델은 실행 가능합니다 ⚠️" },
    desc: {
      en: "Your GPU has limited VRAM. Smaller models will work, but may be slower. Consider upgrading to Cloud for best results.",
      ko: "VRAM이 제한적입니다. 소형 모델은 동작하지만 속도가 느릴 수 있습니다. 더 나은 성능을 원하신다면 클라우드 플랜을 추천합니다.",
    },
    canDownload: true,
  },
  low: {
    icon: <XCircleIcon className="size-7 text-rose-500" />,
    color: "bg-rose-50 ring-rose-200",
    badge: "bg-rose-100 text-rose-700",
    title: { en: "Your PC is not compatible ❌", ko: "PC 사양이 부족합니다 ❌" },
    desc: {
      en: "Your GPU doesn't have enough VRAM to run local AI models. We recommend the Cloud Plan — it works on any device with no download needed.",
      ko: "GPU의 VRAM이 부족해 로컬 AI 모델을 실행할 수 없습니다. 어떤 기기에서도 사용 가능한 클라우드 플랜을 추천합니다.",
    },
    canDownload: false,
  },
  unknown: {
    icon: <CpuIcon className="size-7 text-slate-400" />,
    color: "bg-slate-50 ring-slate-200",
    badge: "bg-slate-100 text-slate-600",
    title: { en: "We couldn't detect your GPU", ko: "GPU를 자동으로 감지하지 못했습니다" },
    desc: {
      en: "Please answer a few quick questions so we can recommend the right option for you.",
      ko: "몇 가지 질문에 답해주시면 맞는 옵션을 추천해 드립니다.",
    },
    canDownload: false, // resolved via questionnaire
  },
};

const QUESTIONS = [
  {
    id: "pc_type",
    en: "What type of computer do you have?",
    ko: "어떤 종류의 컴퓨터를 사용하고 있나요?",
    options: [
      { value: "gaming", en: "🎮  Gaming PC (desktop with dedicated GPU)", ko: "🎮  게이밍 PC (전용 GPU 장착)" },
      { value: "mac_pro", en: "🍎  MacBook Pro / Mac with Apple Silicon (M1 Pro/Max or newer)", ko: "🍎  맥북 프로 / 애플 실리콘 Mac (M1 Pro/Max 이상)" },
      { value: "mac_base", en: "🍎  MacBook Air / Mac base model", ko: "🍎  맥북 에어 / 기본형 Mac" },
      { value: "laptop", en: "💼  Standard laptop or office PC", ko: "💼  일반 노트북 또는 사무용 PC" },
    ],
  },
];

function tierFromAnswer(answer: string): VramTier {
  if (answer === "gaming") return "mid";    // we don't know exact VRAM, be safe
  if (answer === "mac_pro") return "high";
  if (answer === "mac_base") return "mid";
  return "low"; // laptop / office PC
}

export default function VRAMCheckModal({
  lang = "en",
  onClose,
}: {
  lang?: "en" | "ko";
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("detecting");
  const [result, setResult] = useState<DetectResult | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    const detected = detectGpu();
    setResult(detected);
    setStep(detected.tier === "unknown" ? "questionnaire" : "result");
  }, []);

  function handleAnswer(value: string) {
    setAnswer(value);
    const tier = tierFromAnswer(value);
    setResult({ tier, gpuName: null, estimatedVram: null });
    setStep("result");
  }

  const tier = result?.tier ?? "unknown";
  const cfg = TIER_CONFIG[tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-card ring-1 ring-foreground/10 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2.5">
            <MonitorIcon className="size-5 text-primary" />
            <h2 className="font-semibold">
              {lang === "ko" ? "PC 호환성 체크" : "PC Compatibility Check"}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">

          {/* Detecting */}
          {step === "detecting" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <LoaderIcon className="size-10 text-primary animate-spin" />
              <p className="font-medium">
                {lang === "ko" ? "GPU를 감지하는 중…" : "Detecting your GPU…"}
              </p>
            </div>
          )}

          {/* Questionnaire */}
          {step === "questionnaire" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium">
                {lang === "ko" ? QUESTIONS[0].ko : QUESTIONS[0].en}
              </p>
              <ul className="flex flex-col gap-2">
                {QUESTIONS[0].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full text-left rounded-xl border px-4 py-3 text-sm hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {lang === "ko" ? opt.ko : opt.en}
                  </button>
                ))}
              </ul>
            </div>
          )}

          {/* Result */}
          {step === "result" && result && (
            <div className="flex flex-col gap-5">
              {/* Status card */}
              <div className={`rounded-xl ring-1 px-5 py-4 flex items-start gap-4 ${cfg.color}`}>
                <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{cfg.title[lang]}</p>
                  <p className="text-sm text-muted-foreground mt-1">{cfg.desc[lang]}</p>
                </div>
              </div>

              {/* GPU info */}
              {(result.gpuName || result.estimatedVram) && (
                <div className="rounded-xl bg-muted/60 px-4 py-3 flex items-center gap-3 text-sm">
                  <CpuIcon className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    {result.gpuName && <p className="font-medium">{result.gpuName}</p>}
                    {result.estimatedVram && (
                      <p className="text-xs text-muted-foreground">
                        {lang === "ko" ? "추정 VRAM:" : "Estimated VRAM:"} {result.estimatedVram}
                      </p>
                    )}
                  </div>
                  <span className={`ml-auto text-xs font-medium rounded-full px-2 py-0.5 ${cfg.badge}`}>
                    {tier === "high" ? (lang === "ko" ? "고사양" : "High-end") :
                     tier === "mid"  ? (lang === "ko" ? "중간"   : "Mid-range") :
                                       (lang === "ko" ? "저사양" : "Low-end")}
                  </span>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                {cfg.canDownload ? (
                  <>
                    {/* Real file URL goes here once the .exe is hosted */}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className={buttonVariants({ size: "lg", className: "w-full gap-2 justify-center" })}
                    >
                      <DownloadIcon className="size-4" />
                      {lang === "ko" ? "AI Worker Helper 다운로드 (.exe)" : "Download AI Worker Helper (.exe)"}
                    </a>
                    <p className="text-xs text-muted-foreground text-center">
                      {lang === "ko"
                        ? "Windows 10/11 · 약 2 GB · 설치 시간 약 5분"
                        : "Windows 10/11 · ~2 GB · ~5 min install"}
                    </p>
                  </>
                ) : (
                  <a
                    href="/signup"
                    className={buttonVariants({ size: "lg", className: "w-full gap-2 justify-center" })}
                  >
                    <CloudIcon className="size-4" />
                    {lang === "ko" ? "클라우드 플랜 시작하기 (무료 체험)" : "Start Cloud Plan (free trial)"}
                  </a>
                )}

                {/* Secondary: always show the other option */}
                {cfg.canDownload ? (
                  <a
                    href="/signup"
                    className={buttonVariants({ variant: "outline", className: "w-full gap-2 justify-center" })}
                  >
                    <CloudIcon className="size-4" />
                    {lang === "ko" ? "클라우드 플랜 보기" : "View Cloud Plan instead"}
                  </a>
                ) : (
                  <button
                    onClick={() => setStep("questionnaire")}
                    className="text-xs text-muted-foreground hover:text-foreground text-center hover:underline"
                  >
                    {lang === "ko" ? "다시 확인하기" : "Re-check manually"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
