"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";

// ── Static imports (SSR-safe) ─────────────────────────────────────
import PdfMergeTool      from "@/components/tools/PdfMergeTool";
import PdfSplitTool      from "@/components/tools/PdfSplitTool";
import PdfCompressTool   from "@/components/tools/PdfCompressTool";
import PdfSignTool       from "@/components/tools/PdfSignTool";
import PdfRotateTool     from "@/components/tools/PdfRotateTool";
import PdfDeletePagesTool from "@/components/tools/PdfDeletePagesTool";
import PdfWatermarkTool  from "@/components/tools/PdfWatermarkTool";
import ImageToPdfTool    from "@/components/tools/ImageToPdfTool";
import RemoveBgTool      from "@/components/tools/RemoveBgTool";
import ImageUpscaleTool  from "@/components/tools/ImageUpscaleTool";
import AiGenerateTool    from "@/components/tools/AiGenerateTool";
import TextExtractTool   from "@/components/tools/TextExtractTool";
import ImageResizeTool   from "@/components/tools/ImageResizeTool";
import ImageCompressTool from "@/components/tools/ImageCompressTool";
import ImageCropTool     from "@/components/tools/ImageCropTool";
import ImageConvertTool  from "@/components/tools/ImageConvertTool";
import PhotoEffectsTool  from "@/components/tools/PhotoEffectsTool";
import CollageMakerTool  from "@/components/tools/CollageMakerTool";
import PhotoToSketchTool from "@/components/tools/PhotoToSketchTool";
import RestorePhotoTool  from "@/components/tools/RestorePhotoTool";
import AiColorizeTool    from "@/components/tools/AiColorizeTool";
import RemoveObjectTool  from "@/components/tools/RemoveObjectTool";
import WordCounterTool   from "@/components/tools/WordCounterTool";
import ColorPickerTool   from "@/components/tools/ColorPickerTool";

// ── Dynamic imports (need browser APIs) ─────────────────────────
const loadingSkeleton = () => <div style={{ minHeight: "500px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border)" }}><span className="spinner" /></div>;

const PdfToImagesTool = dynamic(() => import("@/components/tools/PdfToImagesTool"), { ssr: false, loading: loadingSkeleton });
const AITextTool      = dynamic(() => import("@/components/tools/AITextTool"),      { ssr: false, loading: loadingSkeleton });
const PdfProtectTool  = dynamic(() => import("@/components/tools/PdfProtectTool"),  { ssr: false, loading: loadingSkeleton });
const PdfPageNumbers  = dynamic(() => import("@/components/tools/PdfPageNumbersTool"), { ssr: false, loading: loadingSkeleton });
const VideoProcessing = dynamic(() => import("@/components/tools/VideoProcessingTool"), { ssr: false, loading: loadingSkeleton });
const MediaConverterTool = dynamic(() => import("@/components/tools/MediaConverterTool"), { ssr: false, loading: loadingSkeleton });
const PdfConverterTool = dynamic(() => import("@/components/tools/PdfConverterTool"), { ssr: false, loading: loadingSkeleton });

// Re-check which lazy items exist ------------------------------------
const AI_WRITING_SLUGS = new Set([
  "essay-writer","story-generator","poem-generator","content-improver","grammar-fixer",
  "summarizer","sentence-rewriter","instagram-caption","blog-ideas","meta-description",
  "business-name","youtube-script","youtube-description","faq-generator",
  "excel-formula","ai-humanizer","linkedin-post","twitter-post","fb-headline"
]);

interface ToolRendererProps {
  slug: string;
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

export default function ToolRenderer({ slug, onCreditUsed, onUpgradeNeeded }: ToolRendererProps) {
  // Silent Analytics Tracking
  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug: slug }),
    }).catch(() => {}); // ignore errors, don't crash UI
  }, [slug]);

  if (AI_WRITING_SLUGS.has(slug)) return <AITextTool slug={slug} onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;

  switch (slug) {
    // PDF
    case "pdf-merge":        return <PdfMergeTool />;
    case "pdf-split":        return <PdfSplitTool />;
    case "pdf-compress":     return <PdfCompressTool />;
    case "pdf-sign":         return <PdfSignTool />;
    case "pdf-rotate":       return <PdfRotateTool />;
    case "pdf-delete-pages": return <PdfDeletePagesTool />;
    case "pdf-watermark":    return <PdfWatermarkTool />;
    case "image-to-pdf":     return <ImageToPdfTool />;
    case "pdf-to-images":    return <PdfToImagesTool />;
    case "pdf-protect":      return <PdfProtectTool />;
    case "pdf-page-numbers": return <PdfPageNumbers />;
    case "pdf-rearrange":    return <PdfMergeTool />; // reuse merge UI for rearrange
    case "pdf-to-text":      return <PdfConverterTool />;

    // Image AI
    case "remove-bg":     return <RemoveBgTool     onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "image-upscale": return <ImageUpscaleTool  onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "ai-generate":   return <AiGenerateTool    onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "text-extract":  return <TextExtractTool   onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "restore-photo": return <RestorePhotoTool  onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "ai-colorize":   return <AiColorizeTool    onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;
    case "remove-object": return <RemoveObjectTool  onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;

    // Image Editing
    case "image-resize":    return <ImageResizeTool />;
    case "image-compress":  return <ImageCompressTool />;
    case "image-crop":      return <ImageCropTool />;
    case "image-convert":   return <ImageConvertTool />;
    case "photo-effects":   return <PhotoEffectsTool />;
    case "collage-maker":   return <CollageMakerTool />;
    case "photo-to-sketch": return <PhotoToSketchTool />;

    // Video & Audio
    case "video-compress": return <VideoProcessing operation="compress" />;
    case "video-trim":     return <VideoProcessing operation="trim" />;
    case "video-to-gif":   return <VideoProcessing operation="to-gif" />;
    case "mp4-to-mp3":     return <VideoProcessing operation="mp4-to-mp3" />;
    case "media-converter":return <MediaConverterTool />;
    case "audio-to-text":  return <TextExtractTool onCreditUsed={onCreditUsed} onUpgradeNeeded={onUpgradeNeeded} />;

    // Utilities
    case "word-counter": return <WordCounterTool />;
    case "color-picker": return <ColorPickerTool />;

    default:
      return (
        <div className="status-box status-error">
          This tool UI is coming soon. Check back later.
        </div>
      );
  }
}
