"use client";

import { useState, useEffect } from "react";
import { KeyIcon, XIcon, ExternalLinkIcon, CheckCircleIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKey } from "@/lib/useApiKey";
import { useT } from "@/lib/i18n/context";

export default function ApiKeyModal() {
  const { apiKey, setApiKey } = useApiKey();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleOpen() {
    setValue(apiKey);
    setOpen(true);
  }

  function handleSave() {
    setApiKey(value.trim());
    setOpen(false);
  }

  function handleRemove() {
    setApiKey("");
    setValue("");
    setOpen(false);
  }

  useEffect(() => {
    window.addEventListener("open-api-key-modal", handleOpen);
    return () => window.removeEventListener("open-api-key-modal", handleOpen);
  }, [apiKey]);

  const steps = [
    { n: "1", title: t.apiKey.step1Title, desc: t.apiKey.step1Desc },
    { n: "2", title: t.apiKey.step2Title, desc: t.apiKey.step2Desc },
    { n: "3", title: t.apiKey.step3Title, desc: t.apiKey.step3Desc },
  ];

  return (
    <>
      <button
        onClick={handleOpen}
        title={apiKey ? t.apiKey.connected : t.apiKey.addKey}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        {apiKey ? (
          <>
            <CheckCircleIcon className="size-4 text-emerald-500" />
            <span className="hidden sm:inline text-emerald-600 font-medium text-xs">
              {t.apiKey.connected}
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
          <div className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <KeyIcon className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">{t.apiKey.modalTitle}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.apiKey.modalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 pb-4">
              <p className="text-sm font-medium mb-3">{t.apiKey.howTo}</p>
              <ol className="flex flex-col gap-3">
                {steps.map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-primary font-medium hover:underline"
              >
                {t.apiKey.openConsole}
                <ExternalLinkIcon className="size-3" />
              </a>
            </div>

            {/* Input */}
            <div className="px-6 pb-4">
              <Input
                type="password"
                placeholder="sk-ant-api03-..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                className="font-mono text-sm"
              />
            </div>

            {/* Privacy note */}
            <div className="mx-6 mb-4 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
              <ShieldIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{t.apiKey.privacy}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/40 px-6 py-4">
              {apiKey ? (
                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  {t.apiKey.disconnect}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {t.apiKey.cancel}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!value.trim()}>
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
