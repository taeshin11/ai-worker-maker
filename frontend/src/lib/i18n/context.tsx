"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { ko } from "./ko";
import type { Dict } from "./en";

export type Lang = "en" | "ko";

const STORAGE_KEY = "lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored === "en" || stored === "ko") return stored;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith("ko") ? "ko" : "en";
}

const dicts: Record<Lang, Dict> = { en, ko };

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const LangContext = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: en });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: dicts[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Shorthand: const { t } = useT() */
export function useT() {
  return useContext(LangContext);
}
