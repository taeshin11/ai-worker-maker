"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon, MaximizeIcon, MinimizeIcon } from "lucide-react";
import type { CodeArtifact } from "@/lib/codeArtifact";
import { buildSrcdoc } from "@/lib/codeArtifact";
import { useT } from "@/lib/i18n/context";

export default function CodePreviewPanel({
  artifact,
  onClose,
}: {
  artifact: CodeArtifact;
  onClose: () => void;
}) {
  const { t } = useT();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [expanded, setExpanded] = useState(false);

  const srcdoc = buildSrcdoc(artifact);

  // Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (expanded) setExpanded(false);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, expanded]);

  // On mobile, always show as fullscreen overlay
  // On desktop, show as inline panel (or fullscreen if expanded)
  const panelClass = expanded
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : "fixed inset-0 z-50 md:relative md:inset-auto md:z-auto flex flex-col bg-background border-l md:w-[45%] md:max-w-xl";

  return (
    <div className={panelClass}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {artifact.language.toUpperCase()}
          </span>
          <span className="text-sm font-medium truncate">
            {t.workspace.codePreview}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? (
              <MinimizeIcon className="size-3.5" />
            ) : (
              <MaximizeIcon className="size-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={t.workspace.closePreview}
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 min-h-0 bg-white">
        <iframe
          ref={iframeRef}
          srcDoc={srcdoc}
          sandbox="allow-scripts"
          title="Code Preview"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
