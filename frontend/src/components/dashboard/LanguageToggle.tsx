"use client";

import { GlobeIcon } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/context";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ko", label: "한국어" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useT();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
      <GlobeIcon className="size-3.5 text-muted-foreground ml-1.5 shrink-0" />
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            lang === code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
