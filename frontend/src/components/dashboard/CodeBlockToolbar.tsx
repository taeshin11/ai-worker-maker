"use client";

import { useState } from "react";
import {
  PlayIcon,
  DownloadIcon,
  GitBranchIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CodeArtifact } from "@/lib/codeArtifact";
import { isPreviewable, downloadArtifact } from "@/lib/codeArtifact";
import { useT } from "@/lib/i18n/context";

export default function CodeBlockToolbar({
  artifact,
  onPreview,
}: {
  artifact: CodeArtifact;
  onPreview: (artifact: CodeArtifact) => void;
}) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(artifact.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleGithub() {
    toast.info(t.workspace.githubComingSoon);
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {isPreviewable(artifact.language) && (
        <button
          onClick={() => onPreview(artifact)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PlayIcon className="size-3" />
          {t.workspace.preview}
        </button>
      )}
      <button
        onClick={() => downloadArtifact(artifact)}
        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <DownloadIcon className="size-3" />
        {t.workspace.downloadFile}
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
        {copied ? t.workspace.codeCopied : t.workspace.copyCode}
      </button>
      <button
        onClick={handleGithub}
        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors opacity-60"
        title={t.workspace.githubComingSoon}
      >
        <GitBranchIcon className="size-3" />
        {t.workspace.saveToGithub}
      </button>
    </div>
  );
}
