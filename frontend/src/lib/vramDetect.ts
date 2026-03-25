export type VramTier = "high" | "mid" | "low" | "unknown";

export type DetectResult = {
  tier: VramTier;
  gpuName: string | null;
  estimatedVram: string | null; // e.g. "~12 GB"
};

type GpuRule = { pattern: RegExp; tier: VramTier; vram: string };

const GPU_RULES: GpuRule[] = [
  // NVIDIA high-end
  { pattern: /RTX\s*(4090|4080|3090|3080)/i,          tier: "high", vram: "~16–24 GB" },
  { pattern: /RTX\s*(4070|4060\s*Ti|3070|3080\s*Ti)/i, tier: "high", vram: "~10–12 GB" },
  { pattern: /RTX\s*(4060|3060|2080|2070)/i,            tier: "high", vram: "~8 GB" },
  { pattern: /GTX\s*(1080|1070)/i,                      tier: "high", vram: "~8 GB" },
  // NVIDIA mid-range
  { pattern: /RTX\s*(2060|1660)/i,                      tier: "mid",  vram: "~6 GB" },
  { pattern: /GTX\s*(1060)/i,                           tier: "mid",  vram: "~6 GB" },
  // NVIDIA low-end
  { pattern: /GTX\s*(1050|960|950|940|750)/i,           tier: "low",  vram: "~2–4 GB" },
  // AMD high-end
  { pattern: /RX\s*(7900|6900|6800|6700\s*XT|7800)/i,  tier: "high", vram: "~12–16 GB" },
  { pattern: /RX\s*(7600|6600|6700\b)/i,               tier: "high", vram: "~8 GB" },
  // AMD mid-range
  { pattern: /RX\s*(580|570|480)/i,                     tier: "mid",  vram: "~4–8 GB" },
  // AMD low-end
  { pattern: /RX\s*(560|550|540)/i,                     tier: "low",  vram: "~2–4 GB" },
  // Apple Silicon (unified memory — treat as high for M1 Pro/Max/M2+/M3)
  { pattern: /Apple M[2-9]|M[1-9]\s*(Pro|Max|Ultra)/i, tier: "high", vram: "≥16 GB unified" },
  { pattern: /Apple M1\b/i,                             tier: "high", vram: "8–16 GB unified" },
  // Intel integrated — too weak
  { pattern: /Intel.*UHD|Intel.*HD\s*Graphics|Intel.*Iris/i, tier: "low", vram: "shared (~1–2 GB)" },
];

export function detectGpu(): DetectResult {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) return { tier: "unknown", gpuName: null, estimatedVram: null };

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return { tier: "unknown", gpuName: null, estimatedVram: null };

    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    const gpuName = renderer.replace(/\/PCIe\/SSE2$/, "").trim();

    for (const rule of GPU_RULES) {
      if (rule.pattern.test(gpuName)) {
        return { tier: rule.tier, gpuName, estimatedVram: rule.vram };
      }
    }

    // Detected a GPU but no matching rule — treat as unknown/mid
    return { tier: "unknown", gpuName, estimatedVram: null };
  } catch {
    return { tier: "unknown", gpuName: null, estimatedVram: null };
  }
}
