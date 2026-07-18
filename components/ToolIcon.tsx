// Central Lucide icon mapping for all tool slugs — no emojis
import {
  FileText, Scissors, Archive, PenLine, Image, Images, RotateCcw, Trash2,
  Droplets, Lock, Hash, Eraser, ZoomIn, Wand2, ScanText, Move, Minimize2,
  Crop, Shuffle, Video, Film, Music, Mic, BarChart2, Palette, Paintbrush,
  RefreshCw, Lightbulb, Globe, Building2, HelpCircle,
  BookOpen, Feather, Sparkles, CheckSquare, AlignLeft, Link2, Upload, Download,
  ChevronRight, ChevronDown, Search, Moon, Sun, Zap, Shield, Clock, Star,
  ArrowRight, Settings, Info, Check, X, Plus, Minus, LayoutGrid, Layers,
  FileImage, LogIn, User, Menu, Heart, Filter, Pencil, Camera, Play, Radio, Tv,
  Calculator, Bot, FileOutput, ArrowRightLeft, Briefcase, MessageCircle, Megaphone,
  type LucideIcon,
} from "lucide-react";

// Substitute for missing icons
const YoutubeIcon = Play;       // closest to Youtube logo
const InstagramIcon = Camera;   // closest to Instagram

export const ICON_MAP: Record<string, LucideIcon> = {
  // AI Writing
  "essay-writer":        FileText,
  "story-generator":     BookOpen,
  "poem-generator":      Feather,
  "content-improver":    Sparkles,
  "grammar-fixer":       CheckSquare,
  "summarizer":          AlignLeft,
  "sentence-rewriter":   RefreshCw,
  "instagram-caption":   InstagramIcon,
  "blog-ideas":          Lightbulb,
  "meta-description":    Globe,
  "business-name":       Building2,
  "youtube-script":      YoutubeIcon,
  "youtube-description": YoutubeIcon,
  "faq-generator":       HelpCircle,
  "excel-formula":       Calculator,
  "ai-humanizer":        Bot,
  "linkedin-post":       Briefcase,
  "twitter-post":        MessageCircle,
  "fb-headline":         Megaphone,
  // PDF
  "pdf-merge":           Link2,
  "pdf-split":           Scissors,
  "pdf-compress":        Archive,
  "pdf-sign":            PenLine,
  "image-to-pdf":        FileImage,
  "pdf-to-images":       Images,
  "pdf-rotate":          RotateCcw,
  "pdf-delete-pages":    Trash2,
  "pdf-watermark":       Droplets,
  "pdf-protect":         Lock,
  "pdf-page-numbers":    Hash,
  "pdf-rearrange":       LayoutGrid,
  // Image AI
  "remove-bg":           Eraser,
  "image-upscale":       ZoomIn,
  "ai-generate":         Wand2,
  "text-extract":        ScanText,
  "restore-photo":       Camera,
  "ai-colorize":         Palette,
  "remove-object":       Eraser,
  // Image Editing
  "image-resize":        Move,
  "image-compress":      Minimize2,
  "image-crop":          Crop,
  "image-convert":       Shuffle,
  "photo-effects":       Filter,
  "collage-maker":       LayoutGrid,
  "photo-to-sketch":     Pencil,
  "blur-background":     Layers,
  // Video & Audio
  "video-compress":      Video,
  "video-trim":          Film,
  "video-to-gif":        Film,
  "mp4-to-mp3":          Music,
  "audio-to-text":       Mic,
  "media-converter":     ArrowRightLeft,
  // PDF converter
  "pdf-to-text":         FileOutput,
  // Utilities
  "word-counter":        BarChart2,
  "color-picker":        Paintbrush,
};

// Category color palette — NO purple
export const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  writing: { bg: "var(--blue-soft)",   color: "var(--blue)"   },
  pdf:     { bg: "var(--red-soft)",    color: "var(--red)"    },
  image:   { bg: "var(--cyan-soft)",   color: "var(--cyan)"   },
  video:   { bg: "var(--orange-soft)", color: "var(--orange)" },
  utility: { bg: "var(--green-soft)",  color: "var(--green)"  },
};

// Re-export icons for use in other components
export {
  Search, Moon, Sun, Zap, Shield, Clock, Star, ChevronRight, ChevronDown,
  ArrowRight, Settings, Info, Check, X, Plus, Minus, Download, Upload,
  LogIn, User, Menu, Heart, Sparkles,
};
