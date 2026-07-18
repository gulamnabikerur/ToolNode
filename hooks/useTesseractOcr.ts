import { useState } from "react";
import Tesseract from "tesseract.js";

interface UseTesseractOcrResult {
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  progressStatus: string;
  extractedText: string;
  setExtractedText: (val: string) => void;
  errorMsg: string;
  extractText: (file: File, language: string) => Promise<void>;
  reset: () => void;
}

export function useTesseractOcr(): UseTesseractOcrResult {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const extractText = async (file: File, language: string) => {
    setStatus("processing");
    setErrorMsg("");
    setProgress(0);
    setProgressStatus("Initializing local AI engine...");

    try {
      const result = await Tesseract.recognize(file, language, {
        logger: (m) => {
          setProgressStatus(m.status);
          if (m.progress) setProgress(Math.round(m.progress * 100));
        },
      });

      setExtractedText(result.data.text || "");
      setStatus("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Extraction failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setExtractedText("");
    setErrorMsg("");
    setProgress(0);
    setProgressStatus("");
  };

  return { status, progress, progressStatus, extractedText, setExtractedText, errorMsg, extractText, reset };
}
