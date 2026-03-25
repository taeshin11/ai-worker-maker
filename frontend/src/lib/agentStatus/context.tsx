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
