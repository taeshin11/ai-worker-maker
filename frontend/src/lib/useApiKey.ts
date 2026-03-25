"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "anthropic_api_key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    setApiKeyState(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  function setApiKey(key: string) {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(key);
  }

  return { apiKey, setApiKey };
}
