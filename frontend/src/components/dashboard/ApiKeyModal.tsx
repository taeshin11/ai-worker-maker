"use client";

import { useState } from "react";
import { KeyIcon, XIcon, ExternalLinkIcon, CheckCircleIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKey } from "@/lib/useApiKey";

const STEPS = [
  {
    n: "1",
    title: "Go to Anthropic Console",
    desc: "Visit console.anthropic.com and sign in (or create a free account).",
  },
  {
    n: "2",
    title: "Open API Keys",
    desc: 'Click "API Keys" in the left menu, then click "Create Key".',
  },
  {
    n: "3",
    title: "Copy & paste below",
    desc: 'Give the key any name, click "Create", then copy and paste it here.',
  },
];

export default function ApiKeyModal() {
  const { apiKey, setApiKey } = useApiKey();
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

  return (
    <>
      <button
        onClick={handleOpen}
        title={apiKey ? "API key connected" : "Connect your Anthropic API key"}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        {apiKey ? (
          <>
            <CheckCircleIcon className="size-4 text-emerald-500" />
            <span className="hidden sm:inline text-emerald-600 font-medium text-xs">Connected</span>
          </>
        ) : (
          <>
            <KeyIcon className="size-4 text-amber-500" />
            <span className="hidden sm:inline text-amber-600 font-medium text-xs">Add API Key</span>
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
                  <h2 className="font-semibold text-base">Connect to Claude AI</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your agents need this to come to life
                  </p>
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
              <p className="text-sm font-medium mb-3">How to get your free API key:</p>
              <ol className="flex flex-col gap-3">
                {STEPS.map((step) => (
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
                Open Anthropic Console
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
              <p className="text-xs text-muted-foreground">
                Your key is stored <strong>only in your browser</strong> and is never sent to our servers. It goes directly to Anthropic.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/40 px-6 py-4">
              {apiKey ? (
                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  Disconnect
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!value.trim()}>
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
