"use client";

import { useState, useEffect } from "react";
import {
  KeyIcon, XIcon, ExternalLinkIcon, ShieldIcon,
  EyeIcon, EyeOffIcon, ChevronDownIcon, ChevronUpIcon,
  CheckCircleIcon, AlertCircleIcon, HelpCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/lib/useApiKey";
import { useT } from "@/lib/i18n/context";

const STEPS_EN = [
  {
    num: 1,
    title: "Create a free Anthropic account",
    body: "Click the button below to open the Anthropic Console. Sign up with your email — it's free.",
    action: (
      <a
        href="https://console.anthropic.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Open Anthropic Console
        <ExternalLinkIcon className="size-3" />
      </a>
    ),
  },
  {
    num: 2,
    title: "Add billing credits (~$5 minimum)",
    body: null,
    warning:
      "Anthropic requires a small prepaid credit balance before you can use the API — even for pay-as-you-go. $5 lasts a very long time for normal use.",
    warningLink: {
      href: "https://console.anthropic.com/settings/billing",
      label: "Go to Anthropic Billing →",
    },
  },
  {
    num: 3,
    title: 'Click "API Keys" → "Create Key"',
    body: 'In the left sidebar, click "API Keys". Click "Create Key", give it any name, then click "Create".',
    gifPlaceholder: true,
  },
  {
    num: 4,
    title: "Copy the key and paste it below",
    body: 'Your key starts with "sk-ant-". Copy it and paste it in the field at the bottom of this window.',
  },
];

const STEPS_KO = [
  {
    num: 1,
    title: "Anthropic 무료 계정 만들기",
    body: "아래 버튼을 눌러 Anthropic Console을 여세요. 이메일로 무료 가입할 수 있습니다.",
    action: (
      <a
        href="https://console.anthropic.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Anthropic Console 열기
        <ExternalLinkIcon className="size-3" />
      </a>
    ),
  },
  {
    num: 2,
    title: "결제 크레딧 충전 (최소 약 $5)",
    body: null,
    warning:
      "Anthropic API를 사용하려면 소액의 선불 크레딧이 필요합니다. $5면 일반 사용에 매우 오래 쓸 수 있어요.",
    warningLink: {
      href: "https://console.anthropic.com/settings/billing",
      label: "Anthropic 결제 페이지로 →",
    },
  },
  {
    num: 3,
    title: '"API Keys" → "Create Key" 클릭',
    body: '왼쪽 메뉴에서 "API Keys"를 클릭하세요. "Create Key"를 누르고 이름을 입력한 뒤 "Create"를 클릭합니다.',
    gifPlaceholder: true,
  },
  {
    num: 4,
    title: "키를 복사해 아래에 붙여넣기",
    body: '"sk-ant-"로 시작하는 키를 복사해서 이 창 아래쪽 칸에 붙여넣으세요.',
  },
];

export default function ConnectionModal() {
  const { apiKey, setApiKey } = useApiKey();
  const { t, lang } = useT();

  const [open, setOpen] = useState(false);
  const [interceptMessage, setInterceptMessage] = useState("");

  // Accordion toggle
  const [guideOpen, setGuideOpen] = useState(false);

  // Form state
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);

  function openModal(msg = "") {
    setKeyValue(apiKey);
    setShowKey(false);
    setGuideOpen(false);
    setInterceptMessage(msg);
    setOpen(true);
  }

  useEffect(() => {
    function handleEvent(e: Event) {
      const detail = (e as CustomEvent).detail;
      openModal(detail?.interceptMessage ?? "");
    }
    window.addEventListener("open-api-key-modal", handleEvent);
    return () => window.removeEventListener("open-api-key-modal", handleEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  function handleSave() {
    setApiKey(keyValue.trim());
    setOpen(false);
    setInterceptMessage("");
    window.dispatchEvent(new CustomEvent("api-key-saved"));
  }

  function handleDisconnect() {
    setApiKey("");
    setOpen(false);
    setInterceptMessage("");
  }

  function handleClose() {
    setOpen(false);
    setInterceptMessage("");
  }

  const isConnected = !!apiKey;
  const keyValid = keyValue.trim().startsWith("sk-ant-");
  const canSave = keyValid;

  const steps = lang === "ko" ? STEPS_KO : STEPS_EN;

  return (
    <>
      {/* ── Header trigger button ── */}
      <button
        onClick={() => openModal()}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
          isConnected
            ? "hover:bg-muted"
            : "hover:bg-amber-50 dark:hover:bg-amber-950/30"
        }`}
      >
        {isConnected ? (
          <>
            <CheckCircleIcon className="size-4 text-emerald-500 shrink-0" />
            <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium text-xs">
              {t.apiKey.connected}
            </span>
          </>
        ) : (
          <>
            <span className="relative flex size-4 shrink-0 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
              <KeyIcon className="relative size-3.5 text-amber-600 dark:text-amber-400" />
            </span>
            <span className="hidden sm:inline text-amber-700 dark:text-amber-400 font-semibold text-xs">
              {lang === "ko" ? "🔑 API 키 연결" : "🔑 Connect API Key"}
            </span>
          </>
        )}
      </button>

      {/* ── Modal ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/10 shadow-2xl flex flex-col max-h-[85vh]">

            {/* ── Zone 1: Sticky header ── */}

            {/* Intercept banner */}
            {interceptMessage && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-5 py-3 rounded-t-2xl shrink-0">
                <AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-snug">
                  {interceptMessage}
                </p>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <KeyIcon className="size-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base leading-tight">
                    {lang === "ko" ? "API 키 연결하기" : "Connect Your API Key"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "ko"
                      ? "아래에 키를 붙여넣으면 바로 시작할 수 있어요"
                      : "Paste your key below to get started instantly"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* ── Zone 2: Scrollable middle (accordion) ── */}
            <div className="flex-1 overflow-y-auto px-6 min-h-0">

              {/* Guide accordion */}
              <div className="mb-4">
                <button
                  onClick={() => setGuideOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl border bg-muted/40 hover:bg-muted/70 transition-colors px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircleIcon className="size-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">
                      {lang === "ko"
                        ? "API 키 발급 방법 보기 (4단계)"
                        : "How to get an API key — 4 steps"}
                    </span>
                  </div>
                  {guideOpen
                    ? <ChevronUpIcon className="size-4 text-muted-foreground shrink-0" />
                    : <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />}
                </button>

                {/* Accordion content */}
                {guideOpen && (
                  <div className="mt-3 flex flex-col gap-4 pl-1">
                    {steps.map((step, i) => (
                      <div key={step.num} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {step.num}
                          </div>
                          {i < steps.length - 1 && (
                            <div
                              className="w-px flex-1 bg-border mt-1.5"
                              style={{ minHeight: 16 }}
                            />
                          )}
                        </div>

                        <div className="pb-4 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight mb-1.5">
                            {step.title}
                          </p>
                          {step.body && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {step.body}
                            </p>
                          )}
                          {"action" in step && step.action && (
                            <div className="mt-1">{step.action}</div>
                          )}
                          {"warning" in step && step.warning && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-3 py-2.5 mt-1">
                              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                ⚠️ {step.warning}
                              </p>
                              {"warningLink" in step && step.warningLink && (
                                <a
                                  href={step.warningLink.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline mt-1.5"
                                >
                                  {step.warningLink.label}
                                  <ExternalLinkIcon className="size-3" />
                                </a>
                              )}
                            </div>
                          )}
                          {"gifPlaceholder" in step && step.gifPlaceholder && (
                            <div className="mt-2 rounded-lg border-2 border-dashed border-border bg-muted/40 h-20 flex items-center justify-center">
                              <p className="text-xs text-muted-foreground/60 italic">
                                {lang === "ko"
                                  ? "[GIF: API 키 생성하기]"
                                  : "[GIF: Creating an API key]"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Zone 3: Pinned footer — always visible ── */}
            <div className="shrink-0 border-t bg-card px-6 pt-4 pb-5 rounded-b-2xl flex flex-col gap-3">

              {/* Key input */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">
                  {lang === "ko" ? "API 키 붙여넣기" : "Paste your API key"}
                </Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="sk-ant-api03-..."
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    className={`font-mono text-sm pr-10 ${
                      keyValue && !keyValid
                        ? "border-rose-400 focus-visible:ring-rose-400/30"
                        : keyValid
                        ? "border-emerald-400 focus-visible:ring-emerald-400/30"
                        : ""
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey
                      ? <EyeOffIcon className="size-4" />
                      : <EyeIcon className="size-4" />}
                  </button>
                </div>
                {keyValue && !keyValid && (
                  <p className="text-xs text-rose-500">
                    {lang === "ko"
                      ? '키는 "sk-ant-"로 시작해야 합니다'
                      : 'Key must start with "sk-ant-"'}
                  </p>
                )}
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <ShieldIcon className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "ko"
                    ? "🔒 이 브라우저에만 저장됩니다. 서버나 데이터베이스에 저장되지 않습니다."
                    : "🔒 Saved only in this browser. Never sent to our servers or any database."}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2">
                {isConnected ? (
                  <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                    {t.apiKey.disconnect}
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    {t.apiKey.cancel}
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!canSave}>
                    {interceptMessage
                      ? lang === "ko" ? "저장 후 계속하기" : "Save & Continue"
                      : t.apiKey.connect}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
