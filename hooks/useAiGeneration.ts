import { useState } from "react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

interface UseAiGenerationProps {
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

interface UseAiGenerationResult {
  status: "idle" | "processing" | "done" | "error";
  resultUrl: string | null;
  errorMsg: string;
  generate: (prompt: string, style: string) => Promise<void>;
  reset: () => void;
}

export function useAiGeneration({ onCreditUsed, onUpgradeNeeded }: UseAiGenerationProps): UseAiGenerationResult {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const pollResult = async (id: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 4000));
      try {
        const res = await fetch(`/api/tools/ai-generate?jobId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setResultUrl(data.imageUrl);
            consumeCredit();
            onCreditUsed();
            setStatus("done");
            return;
          }
          if (data.status === "error") throw new Error(data.error || "Generation failed");
        }
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : "Generation failed");
        setStatus("error");
        return;
      }
    }
    setErrorMsg("Generation timed out. Please try again.");
    setStatus("error");
  };

  const generate = async (prompt: string, style: string) => {
    if (!hasCreditsRemaining()) {
      onUpgradeNeeded();
      return;
    }
    setStatus("processing");
    setResultUrl(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/tools/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${prompt}, ${style}`, style }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      if (data.imageUrl) {
        setResultUrl(data.imageUrl);
        consumeCredit();
        onCreditUsed();
        setStatus("done");
      } else if (data.jobId) {
        pollResult(data.jobId);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Generation failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResultUrl(null);
    setErrorMsg("");
  };

  return { status, resultUrl, errorMsg, generate, reset };
}
