"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/context";
import { AgentStatusProvider } from "@/lib/agentStatus/context";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AgentStatusProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </AgentStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
