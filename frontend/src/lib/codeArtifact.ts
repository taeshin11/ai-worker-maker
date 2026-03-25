export type CodeArtifact = {
  id: string;
  language: string;
  code: string;
  label: string;
};

const PREVIEWABLE = new Set([
  "html", "htm", "css", "javascript", "js", "jsx", "tsx", "svg",
]);

export function isPreviewable(lang: string): boolean {
  return PREVIEWABLE.has(lang.toLowerCase());
}

/** Extract all fenced code blocks from markdown text. */
export function extractArtifacts(markdown: string): CodeArtifact[] {
  const re = /```(\w+)\n([\s\S]*?)```/g;
  const artifacts: CodeArtifact[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = re.exec(markdown)) !== null) {
    const lang = match[1].toLowerCase();
    artifacts.push({
      id: `art-${idx}`,
      language: lang,
      code: match[2].trimEnd(),
      label: `${lang}${idx > 0 ? ` (${idx + 1})` : ""}`,
    });
    idx++;
  }
  return artifacts;
}

/** Build a sandboxed srcdoc HTML string for a given artifact. */
export function buildSrcdoc(artifact: CodeArtifact): string {
  const { language, code } = artifact;

  // Plain HTML — use directly
  if (language === "html" || language === "htm") {
    // If it already has <html> or <body>, use as-is
    if (code.includes("<html") || code.includes("<body") || code.includes("<!DOCTYPE")) {
      return code;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;margin:16px;}</style></head><body>${code}</body></html>`;
  }

  // CSS-only
  if (language === "css") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${code}</style></head><body><div class="preview" style="font-family:system-ui,sans-serif;margin:16px;"><h2>CSS Preview</h2><p>Your styles are applied to this page.</p><button>Sample Button</button><ul><li>Item A</li><li>Item B</li></ul></div></body></html>`;
  }

  // SVG
  if (language === "svg") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:16px;display:flex;justify-content:center;align-items:center;min-height:80vh;}</style></head><body>${code}</body></html>`;
  }

  // JavaScript — wrap in HTML with script tag
  if (language === "javascript" || language === "js") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:16px;}#output{white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;}</style></head><body><div id="root"></div><div id="output"></div><script>
// Capture console.log output
(function(){var out=document.getElementById('output');var _log=console.log;console.log=function(){_log.apply(console,arguments);out.textContent+=[].map.call(arguments,function(a){return typeof a==='object'?JSON.stringify(a,null,2):String(a)}).join(' ')+'\\n';}})();
${code}
</script></body></html>`;
  }

  // JSX/TSX — use Babel standalone + React UMD
  if (language === "jsx" || language === "tsx") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>body{font-family:system-ui,sans-serif;margin:16px;}#error{color:red;white-space:pre-wrap;}</style>
</head><body><div id="root"></div><div id="error"></div>
<script type="text/babel" data-type="module">
try {
${code}

// Auto-render if there's a default export or App component
const _Component = typeof App !== 'undefined' ? App : typeof Default !== 'undefined' ? Default : null;
if (_Component) {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(_Component));
}
} catch(e) { document.getElementById('error').textContent = e.message; }
</script></body></html>`;
  }

  // Fallback: show code as formatted text
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:monospace;margin:16px;white-space:pre-wrap;background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;}</style></head><body>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`;
}

/** Trigger a browser download for a code artifact. */
export function downloadArtifact(artifact: CodeArtifact) {
  const ext: Record<string, string> = {
    html: "html", htm: "html", css: "css", javascript: "js", js: "js",
    jsx: "jsx", tsx: "tsx", svg: "svg", python: "py", typescript: "ts",
  };
  const filename = `code.${ext[artifact.language] ?? "txt"}`;
  const blob = new Blob([artifact.code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
