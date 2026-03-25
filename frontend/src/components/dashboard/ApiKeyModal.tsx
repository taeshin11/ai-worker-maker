"use client";

import { useState } from "react";
import { KeyIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/lib/useApiKey";

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
        title={apiKey ? "API key set" : "Set Anthropic API key"}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <KeyIcon className={`size-4 ${apiKey ? "text-green-500" : "text-muted-foreground"}`} />
        <span className="hidden sm:inline">{apiKey ? "API key set" : "Add API key"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-base">Anthropic API Key</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your key is stored locally in this browser only.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="api-key-input">API Key</Label>
                <Input
                  id="api-key-input"
                  type="password"
                  placeholder="sk-ant-..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key at{" "}
                <span className="font-mono text-foreground">
                  console.anthropic.com → API Keys
                </span>
              </p>
            </div>
            <div className="flex items-center justify-between border-t bg-muted/50 rounded-b-xl px-5 py-3">
              {apiKey ? (
                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  Remove key
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!value.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
