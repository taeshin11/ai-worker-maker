"use client";

import { useState, useEffect } from "react";
import {
  KeyIcon, XIcon, ExternalLinkIcon, ShieldIcon,
  EyeIcon, EyeOffIcon, ChevronDownIcon, ChevronUpIcon,
  WifiIcon, WifiOffIcon, LoaderIcon, CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/lib/useApiKey";
import { useTier } from "@/lib/useTier";
import { pingOllama } from "@/lib/localChat";
import { useT } from "@/lib/i18n/context";

type PingState = "idle" | "checking" | "ok" | "fail";

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
    warningLink: { href: "https://console.anthropic.com/settings/billing", label: "Go to Anthropic Billing →" },
  },
  {
    num: 3,
    title: 'Click "API Keys" → "Create Key"',
    body: 'In the left sidebar, click "API Keys". Click "Create Key", give it any name, then click "Create".',
    gifPlaceholder: true,
  },
  {
    num: 4,
    title: 'Copy the key and paste it below',
    body: 'Your key starts with "sk-ant-". Copy it and paste it in the field below.',
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
    warningLink: { href: "https://console.anthropic.com/settings/billing", label: "Anthropic 결제 페이지로 →" },
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
    body: '"sk-ant-"로 시작하는 키를 복사해서 아래 칸에 붙여넣으세요.',
  },
];

export default function ConnectionModal() {
  const { apiKey, setApiKey } = useApiKey();
  const { tier, setTier, localEndpoint, setLocalEndpoint, localModel, setLocalModel } = useTier();
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);

  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showLocal, setShowLocal] = useState(false);
  const [endpointValue, setEndpointValue] = useState(localEndpoint);
  const [modelValue, setModelValue] = useState(localModel);
  const [ping, setPing] = useState<PingState>("idle");

  function handleOpen() {
    setKeyValue(apiKey);
    setEndpointValue(localEndpoint);
    setModelValue(localModel);
    setShowKey(false);
    setShowLocal(tier === "local");
    setPing("idle");
    setOpen(true);
  }

  useEffect(() => {
    window.addEventListener("open-api-key-modal", handleOpen);
    return () => window.removeEventListener("open-api-key-modal", handleOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, apiKey, localEndpoint, localModel]);

  async function handlePing() {
    setPing("checking");
    const ok = await pingOllama(endpointValue);
    setPing(ok ? "ok" : "fail");
  }

  function handleSave() {
    if (showLocal && endpointValue.trim()) {
      setTier("local");
      setLocalEndpoint(endpointValue.trim());
      setLocalModel(modelValue.trim());
    } else {
      setTier("byok");
      setApiKey(keyValue.trim());
    }
    setOpen(false);
  }

  function handleDisconnect() {
    setApiKey("");
    setTier("byok");
    setOpen(false);
  }

  const isConnected = (tier === "byok" && !!apiKey) || tier === "local";
  const keyValid = keyValue.trim().startsWith("sk-ant-");
  const canSave = showLocal
    ? endpointValue.trim().length > 0
    : keyValid;

  const steps = lang === "ko" ? STEPS_KO : STEPS_EN;

  return (
    <>
      {/* Header trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        {isConnected ? (
          <>
            <CheckCircleIcon className="size-4 text-emerald-500" />
            <span className="hidden sm:inline text-emerald-600 font-medium text-xs">
              {tier === "local"
                ? (lang === "ko" ? "로컬 AI" : "Local AI")
                : t.apiKey.connected}
            </span>
          </>
        ) : (
          <>
            <KeyIcon className="size-4 text-amber-500" />
            <span className="hidden sm:inline text-amber-600 font-medium text-xs">
              {t.apiKey.addKey}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/10 shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyIcon className="size-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base leading-tight">
                    {lang === "ko" ? "API 키 연결하기" : "Connect Your API Key"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "ko"
                      ? "아래 단계를 따라 5분 안에 완료할 수 있어요"
                      : "Follow the steps below — takes about 5 minutes"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 pb-2">

              {/* Step-by-step guide */}
              <div className="flex flex-col gap-4">
                {steps.map((step, i) => (
                  <div key={step.num} className="flex gap-3">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {step.num}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1.5 mb-0" style={{ minHeight: 16 }} />
                      )}
                    </div>

                    {/* Step content */}
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
                        <div className="mt-2 rounded-lg border-2 border-dashed border-border bg-muted/40 h-24 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground/60 italic">
                            {lang === "ko" ? "[GIF: API 키 생성하기]" : "[GIF: Creating an API key]"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Key input */}
              <div className="flex flex-col gap-2 mt-1 pb-4">
                <Label className="text-xs font-semibold">
                  {lang === "ko" ? "여기에 붙여넣기" : "Paste your key here"}
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

                {/* Security note */}
                <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 mt-1">
                  <ShieldIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ko"
                      ? "🔒 API 키는 이 브라우저에만 저장됩니다. 우리 서버로 전송되거나 데이터베이스에 저장되지 않습니다."
                      : "🔒 Your key is saved only in this browser's local storage. It is never sent to our servers or stored in any database."}
                  </p>
                </div>
              </div>

              {/* Advanced: Local AI toggle */}
              <div className="border-t pt-3 pb-4">
                <button
                  onClick={() => { setShowLocal((v) => !v); setPing("idle"); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {showLocal
                    ? <ChevronUpIcon className="size-3.5" />
                    : <ChevronDownIcon className="size-3.5" />}
                  {lang === "ko" ? "고급: 로컬 AI 사용 (Ollama)" : "Advanced: Use Local AI (Ollama)"}
                </button>

                {showLocal && (
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">{lang === "ko" ? "Ollama 주소" : "Ollama endpoint"}</Label>
                      <Input
                        value={endpointValue}
                        onChange={(e) => { setEndpointValue(e.target.value); setPing("idle"); }}
                        placeholder="http://localhost:11434"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">{lang === "ko" ? "모델 이름" : "Model name"}</Label>
                      <Input
                        value={modelValue}
                        onChange={(e) => setModelValue(e.target.value)}
                        placeholder="llama3.2"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePing}
                        disabled={ping === "checking"}
                        className="gap-1.5"
                      >
                        {ping === "checking"
                          ? <LoaderIcon className="size-3.5 animate-spin" />
                          : <WifiIcon className="size-3.5" />}
                        {lang === "ko" ? "연결 테스트" : "Test connection"}
                      </Button>
                      {ping === "ok" && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <WifiIcon className="size-3.5" />
                          {lang === "ko" ? "연결됨" : "Connected"}
                        </span>
                      )}
                      {ping === "fail" && (
                        <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <WifiOffIcon className="size-3.5" />
                          {lang === "ko" ? "연결 실패" : "Not reachable"}
                        </span>
                      )}
                    </div>
                    <a
                      href="/download"
                      target="_blank"
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {lang === "ko" ? "AI Worker Helper 다운로드 →" : "Download AI Worker Helper →"}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/40 px-6 py-4 shrink-0 rounded-b-2xl">
              {isConnected ? (
                <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                  {t.apiKey.disconnect}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {t.apiKey.cancel}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!canSave}>
                  {t.apiKey.connect}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
