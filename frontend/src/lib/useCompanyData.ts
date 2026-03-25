"use client";

import { useState, useEffect, useCallback } from "react";
import type { Department, Agent } from "./types";

type RawAgent = {
  id: string;
  name: string;
  system_prompt: string;
  department_id: string;
};

function mapAgent(r: RawAgent): Agent {
  return { id: r.id, name: r.name, systemPrompt: r.system_prompt, departmentId: r.department_id };
}

export function useCompanyData() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, aRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/agents"),
      ]);
      if (!dRes.ok || !aRes.ok) throw new Error("Failed to load data");
      const [depts, rawAgents]: [Department[], RawAgent[]] = await Promise.all([
        dRes.json(),
        aRes.json(),
      ]);
      setDepartments(depts);
      setAgents(rawAgents.map(mapAgent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addDepartment(name: string): Promise<Department | null> {
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const dept: Department = await res.json();
    setDepartments((prev) => [...prev, dept]);
    return dept;
  }

  async function deleteDepartment(id: string) {
    await fetch(`/api/departments/${id}`, { method: "DELETE" });
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setAgents((prev) => prev.filter((a) => a.departmentId !== id));
  }

  async function addAgent(
    name: string,
    systemPrompt: string,
    departmentId: string
  ): Promise<Agent | null> {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, system_prompt: systemPrompt, department_id: departmentId }),
    });
    if (!res.ok) return null;
    const raw: RawAgent = await res.json();
    const agent = mapAgent(raw);
    setAgents((prev) => [...prev, agent]);
    return agent;
  }

  async function updateAgent(
    id: string,
    updates: { name?: string; systemPrompt?: string }
  ): Promise<boolean> {
    const body: Record<string, string> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.systemPrompt !== undefined) body.system_prompt = updates.systemPrompt;
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return false;
    const raw: RawAgent = await res.json();
    const agent = mapAgent(raw);
    setAgents((prev) => prev.map((a) => (a.id === id ? agent : a)));
    return true;
  }

  async function deleteAgent(id: string) {
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  return {
    departments, agents, loading, error,
    addDepartment, deleteDepartment, addAgent, updateAgent, deleteAgent, reload: load,
  };
}
