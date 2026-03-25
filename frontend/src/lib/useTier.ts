"use client";

import { useState, useEffect } from "react";

export type Tier = "byok" | "local";

const STORAGE_KEY = "connection_tier";
const LOCAL_ENDPOINT_KEY = "local_ollama_endpoint";
const LOCAL_MODEL_KEY = "local_ollama_model";

export const DEFAULT_LOCAL_ENDPOINT = "http://localhost:11434";
export const DEFAULT_LOCAL_MODEL = "llama3.2";

export function useTier() {
  const [tier, setTierState] = useState<Tier>("byok");
  const [localEndpoint, setLocalEndpointState] = useState(DEFAULT_LOCAL_ENDPOINT);
  const [localModel, setLocalModelState] = useState(DEFAULT_LOCAL_MODEL);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "byok" || stored === "local") setTierState(stored);
    const ep = localStorage.getItem(LOCAL_ENDPOINT_KEY);
    if (ep) setLocalEndpointState(ep);
    const model = localStorage.getItem(LOCAL_MODEL_KEY);
    if (model) setLocalModelState(model);
  }, []);

  function setTier(t: Tier) {
    localStorage.setItem(STORAGE_KEY, t);
    setTierState(t);
  }
  function setLocalEndpoint(ep: string) {
    localStorage.setItem(LOCAL_ENDPOINT_KEY, ep);
    setLocalEndpointState(ep);
  }
  function setLocalModel(m: string) {
    localStorage.setItem(LOCAL_MODEL_KEY, m);
    setLocalModelState(m);
  }

  return { tier, setTier, localEndpoint, setLocalEndpoint, localModel, setLocalModel };
}
