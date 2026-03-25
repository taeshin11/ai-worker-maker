"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { AgentStatus, AgentStatusMap, AgentStatusEntry } from "./types";

const STORAGE_KEY = "agent_status_map";

type AgentStatusCtx = {
  statusMap: AgentStatusMap;
  setAgentStatus: (id: string, status: AgentStatus, snippet?: string) => void;
};

const AgentStatusContext = createContext<AgentStatusCtx>({
  statusMap: {},
  setAgentStatus: () => {},
});

export function AgentStatusProvider({ children }: { children: React.ReactNode }) {
  const [statusMap, setStatusMap] = useState<AgentStatusMap>({});

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setStatusMap(JSON.parse(stored));
    } catch {}
  }, []);

  // Poll localStorage for background kickoff updates (same-tab writes don't fire storage events)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setStatusMap((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(parsed);
            return prevStr !== nextStr ? parsed : prev;
          });
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function setAgentStatus(id: string, status: AgentStatus, snippet?: string) {
    setStatusMap((prev) => {
      const current: AgentStatusEntry = prev[id] ?? { status: "idle", snippet: "" };
      const next: AgentStatusMap = {
        ...prev,
        [id]: {
          status,
          snippet: snippet !== undefined ? snippet : current.snippet,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <AgentStatusContext.Provider value={{ statusMap, setAgentStatus }}>
      {children}
    </AgentStatusContext.Provider>
  );
}

export function useAgentStatus() {
  return useContext(AgentStatusContext);
}
