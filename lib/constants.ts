export type ToolCategory = "writing" | "pdf" | "image" | "video" | "utility";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  creditCost: number;   // 0 = free, 1+ = AI credits
  badge?: "AI" | "FREE" | "NEW";
  isNew?: boolean;
  features: string[];
  keywords: string[];
  workflowNext?: string[];
}

export const TOOLS: Tool[] = [
  /* ══════════ WRITING (13) ══════════ */
  {
    slug: "essay-writer", name: "Essay Writer", category: "writing", creditCost: 1, badge: "AI",
    description: "AI-powered essay generator for academic, persuasive, and creative essays up to 700 words.",
    features: ["Structured format", "3 body paragraphs", "Introduction & conclusion", "Multiple essay types"],
    keywords: ["essay", "write essay", "academic writing", "persuasive essay", "argumentative"],
    workflowNext: ["grammar-fixer", "content-improver"],
  },
  {
    slug: "story-generator", name: "Story Generator", category: "writing", creditCost: 1, badge: "AI",
    description: "Create engaging short stories with compelling plots, vivid characters, and satisfying endings.",
    features: ["Engaging narrative", "Rich characters", "Multiple genres", "500+ words"],
    keywords: ["story", "short story", "creative writing", "fiction", "narrative", "plot"],
    workflowNext: ["content-improver", "summarizer"],
  },
  {
    slug: "poem-generator", name: "Poem Generator", category: "writing", creditCost: 1, badge: "AI",
    description: "Generate beautiful poems with rhymes, metaphors, alliteration, and vivid imagery.",
    features: ["Rhyming schemes", "Vivid imagery", "Multiple styles", "Customizable tone"],
    keywords: ["poem", "poetry", "rhyme", "verse", "sonnet", "haiku", "lyric"],
    workflowNext: ["content-improver"],
  },
  {
    slug: "content-improver", name: "Content Improver", category: "writing", creditCost: 1, badge: "AI",
    description: "Rewrite and enhance your content to be more engaging, clear, and professional.",
    features: ["Tone improvement", "Clarity boost", "Engagement increase", "Preserves meaning"],
    keywords: ["improve writing", "enhance content", "rewrite", "better text", "polish"],
    workflowNext: ["grammar-fixer", "meta-description"],
  },
  {
    slug: "grammar-fixer", name: "Grammar Fixer", category: "writing", creditCost: 1, badge: "AI",
    description: "Instantly fix grammar, spelling, punctuation, and style errors in your text.",
    features: ["Grammar correction", "Spell check", "Punctuation fix", "Style improvement"],
    keywords: ["grammar", "spell check", "fix grammar", "proofread", "correct text", "typos"],
    workflowNext: ["content-improver", "sentence-rewriter"],
  },
  {
    slug: "summarizer", name: "Text Summarizer", category: "writing", creditCost: 1, badge: "AI",
    description: "Condense long articles, documents, and text into concise, accurate summaries.",
    features: ["Key points extracted", "Adjustable length", "Bullet or paragraph", "Any text type"],
    keywords: ["summarize", "summary", "condense", "shorten", "tldr", "abstract", "digest"],
    workflowNext: ["meta-description", "faq-generator"],
  },
  {
    slug: "sentence-rewriter", name: "Sentence Rewriter", category: "writing", creditCost: 1, badge: "AI",
    description: "Rephrase sentences and paragraphs while preserving their original meaning.",
    features: ["Multiple variations", "Preserves meaning", "Tone adjustment", "Avoid plagiarism"],
    keywords: ["rewrite", "rephrase", "paraphrase", "reword", "synonym", "paraphrasing tool"],
    workflowNext: ["grammar-fixer", "content-improver"],
  },
  {
    slug: "instagram-caption", name: "Instagram Caption", category: "writing", creditCost: 1, badge: "AI",
    description: "Generate viral Instagram captions with relevant hashtags and emojis for any post.",
    features: ["3 caption variants", "Relevant hashtags", "Emoji-optimized", "Engagement-boosting"],
    keywords: ["instagram", "caption", "social media", "hashtags", "post", "ig", "insta"],
    workflowNext: ["meta-description"],
  },
  {
    slug: "blog-ideas", name: "Blog Post Ideas", category: "writing", creditCost: 1, badge: "AI",
    description: "Get 10 creative, SEO-friendly blog post ideas and titles for your niche or topic.",
    features: ["10 unique ideas", "SEO-optimized titles", "Topic descriptions", "Multiple niches"],
    keywords: ["blog ideas", "content ideas", "blog topics", "blog title", "post ideas"],
    workflowNext: ["essay-writer", "meta-description"],
  },
  {
    slug: "meta-description", name: "Meta Description", category: "writing", creditCost: 1, badge: "AI",
    description: "Generate SEO-optimized meta descriptions that boost click-through rates on Google.",
    features: ["SEO optimized", "155 char limit", "Keyword-rich", "CTR-boosting"],
    keywords: ["meta description", "seo", "search engine", "google", "snippet", "description tag"],
    workflowNext: ["blog-ideas"],
  },
  {
    slug: "business-name", name: "Business Name Generator", category: "writing", creditCost: 1, badge: "AI",
    description: "Generate unique, catchy business names with explanations and domain-friendliness notes.",
    features: ["10 unique names", "Meaning explained", "Domain-friendly", "Industry-specific"],
    keywords: ["business name", "company name", "startup name", "brand name", "naming"],
    workflowNext: ["meta-description", "faq-generator"],
  },
  {
    slug: "youtube-script", name: "YouTube Script", category: "writing", creditCost: 1, badge: "AI",
    description: "Write engaging YouTube video scripts with hook, body talking points, and call to action.",
    features: ["Full script structure", "Hook included", "CTA at end", "500+ words"],
    keywords: ["youtube script", "video script", "youtube", "script writer", "vlog script"],
    workflowNext: ["summarizer", "faq-generator"],
  },
  {
    slug: "youtube-description", name: "YouTube Description", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Generate SEO-optimized YouTube video descriptions with timestamps and hashtags.",
    features: ["SEO optimized", "Timestamps layout", "Hashtag generation", "Call to action"],
    keywords: ["youtube description", "video description", "youtube seo", "hashtags", "channel"],
    workflowNext: ["youtube-script", "meta-description"],
  },
  {
    slug: "faq-generator", name: "FAQ Generator", category: "writing", creditCost: 1, badge: "AI",
    description: "Generate comprehensive FAQ sections with 10 questions and detailed answers.",
    features: ["10 Q&A pairs", "Detailed answers", "SEO-friendly", "Copy-ready format"],
    keywords: ["faq", "frequently asked questions", "q&a", "questions answers", "help section"],
    workflowNext: ["meta-description", "summarizer"],
  },
  {
    slug: "excel-formula", name: "Excel Formula Generator", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Generate complex Excel and Google Sheets formulas from plain English descriptions.",
    features: ["Excel & Sheets", "Formula explanations", "Syntax highlighting", "Error prevention"],
    keywords: ["excel formula", "google sheets", "spreadsheet", "formula bot", "ai excel"],
    workflowNext: ["content-improver"],
  },
  {
    slug: "ai-humanizer", name: "AI Text Humanizer", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Rewrite AI-generated text to sound naturally human and bypass AI detectors.",
    features: ["Bypass detectors", "Natural flow", "Varying perplexity", "Preserves meaning"],
    keywords: ["humanize text", "bypass ai", "undetectable ai", "rewrite ai", "human sounding"],
    workflowNext: ["grammar-fixer", "content-improver"],
  },
  {
    slug: "linkedin-post", name: "LinkedIn Post Generator", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Create professional, engaging LinkedIn posts designed to go viral in your network.",
    features: ["Professional tone", "Engagement hooks", "Relevant hashtags", "Formatting included"],
    keywords: ["linkedin", "professional post", "networking", "b2b", "social media"],
    workflowNext: ["instagram-caption", "twitter-post"],
  },
  {
    slug: "twitter-post", name: "X (Twitter) Post", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Generate punchy, engaging tweets and Twitter threads optimized for virality.",
    features: ["280 character limit", "Thread generation", "Viral hooks", "Trending hashtags"],
    keywords: ["twitter", "x post", "tweet", "twitter thread", "viral tweet"],
    workflowNext: ["linkedin-post", "instagram-caption"],
  },
  {
    slug: "fb-headline", name: "Facebook Ad Headline", category: "writing", creditCost: 1, badge: "AI", isNew: true,
    description: "Write high-converting Facebook Ad headlines that stop the scroll and drive clicks.",
    features: ["Scroll-stopping", "High CTR", "A/B testing ideas", "Direct response"],
    keywords: ["facebook ad", "fb headline", "ad copy", "marketing", "copywriting"],
    workflowNext: ["meta-description", "business-name"],
  },

  /* ══════════ PDF (12) ══════════ */
  {
    slug: "pdf-merge", name: "Merge PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Combine multiple PDF files into one seamless document in seconds — unlimited files.",
    features: ["Drag & drop reorder", "Unlimited files", "Preserves quality", "Client-side privacy"],
    keywords: ["combine", "join", "merge", "unite", "concatenate", "multiple pdfs"],
    workflowNext: ["pdf-compress", "pdf-sign"],
  },
  {
    slug: "pdf-split", name: "Split PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Extract specific pages or split your PDF into separate files by page range.",
    features: ["Page range selection", "Split every N pages", "ZIP download", "Preview pages"],
    keywords: ["extract pages", "separate", "divide", "cut", "split", "extract"],
    workflowNext: ["pdf-compress", "pdf-merge"],
  },
  {
    slug: "pdf-compress", name: "Compress PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Reduce PDF file size by up to 80% while maintaining the best possible quality.",
    features: ["3 compression levels", "Up to 80% smaller", "Text quality preserved", "Instant result"],
    keywords: ["reduce size", "smaller", "shrink", "optimize", "compress", "file size"],
    workflowNext: ["pdf-sign", "text-extract"],
  },
  {
    slug: "pdf-sign", name: "Sign PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Add your drawn or typed signature, date stamp, and initials to any PDF document.",
    features: ["Draw or type signature", "Position anywhere", "Auto-date stamp", "Color picker"],
    keywords: ["signature", "sign", "e-sign", "digital signature", "esign", "approve"],
    workflowNext: ["pdf-compress", "pdf-protect"],
  },
  {
    slug: "image-to-pdf", name: "Image to PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Convert JPG, PNG, and other images into a perfectly formatted PDF instantly.",
    features: ["Multiple images → 1 PDF", "A4 / Letter / custom", "Auto-fit to page", "Batch conversion"],
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "photo to pdf", "convert image"],
    workflowNext: ["pdf-merge", "pdf-compress", "pdf-sign"],
  },
  {
    slug: "pdf-to-images", name: "PDF to Images", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Convert every page of your PDF into high-quality PNG images, downloaded as a ZIP.",
    features: ["Each page → PNG", "Up to 300 DPI", "ZIP download", "Preview first 4 pages"],
    keywords: ["pdf to image", "pdf to png", "pdf to jpg", "convert pdf to picture", "export pages"],
    workflowNext: ["image-upscale", "remove-bg", "text-extract"],
  },
  {
    slug: "pdf-rotate", name: "Rotate PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Rotate individual or all pages of your PDF to fix orientation — 90, 180, or 270°.",
    features: ["90/180/270° rotation", "Rotate all or selected", "Per-page control", "Instant"],
    keywords: ["rotate pdf", "turn pdf", "flip pdf", "orientation", "landscape to portrait"],
    workflowNext: ["pdf-compress", "pdf-sign"],
  },
  {
    slug: "pdf-delete-pages", name: "Delete PDF Pages", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Remove unwanted pages from your PDF document — delete or keep specific pages.",
    features: ["Delete any pages", "Keep listed pages mode", "Page range input", "Instant download"],
    keywords: ["delete pages", "remove pages", "pdf page delete", "cut pages from pdf"],
    workflowNext: ["pdf-compress", "pdf-merge"],
  },
  {
    slug: "pdf-watermark", name: "Add Watermark", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Add custom text watermarks to every page of your PDF with full style control.",
    features: ["Custom text", "Opacity control", "Diagonal or horizontal", "Color & size control"],
    keywords: ["watermark", "add watermark", "stamp pdf", "brand pdf", "copyright"],
    workflowNext: ["pdf-protect", "pdf-compress"],
  },
  {
    slug: "pdf-protect", name: "Protect PDF", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Add password protection to your PDF to keep it private and secure with encryption.",
    features: ["Set open password", "Restrict editing", "Restrict printing", "Strong encryption"],
    keywords: ["protect pdf", "password pdf", "encrypt pdf", "lock pdf", "secure pdf"],
    workflowNext: ["pdf-sign", "pdf-watermark"],
  },
  {
    slug: "pdf-page-numbers", name: "Add Page Numbers", category: "pdf", creditCost: 0, badge: "FREE",
    description: "Automatically insert page numbers to your PDF at any position in any font size.",
    features: ["Top or bottom", "Left/center/right", "Custom start number", "Font & size control"],
    keywords: ["page numbers", "number pages", "pagination", "add numbers to pdf"],
    workflowNext: ["pdf-sign", "pdf-protect"],
  },
  {
    slug: "pdf-to-text", name: "PDF to Text / CSV", category: "pdf", creditCost: 0, badge: "FREE", isNew: true,
    description: "Extract raw text and data from your PDF document for use in Word or Excel.",
    features: ["Text extraction", "CSV export", "Fast processing", "100% free"],
    keywords: ["pdf to text", "pdf to word", "pdf to excel", "extract data", "pdf to csv"],
    workflowNext: ["text-extract", "summarizer"],
  },

  /* ══════════ IMAGE — AI (7) ══════════ */
  {
    slug: "remove-bg", name: "Remove Background", category: "image", creditCost: 1, badge: "AI",
    description: "AI-powered background removal with pixel-perfect results and transparent PNG output.",
    features: ["RMBG 2.0 model", "Transparent PNG output", "JPG/PNG/WebP support", "Hair-level precision"],
    keywords: ["transparent background", "cutout", "remove background", "erase bg", "clear background", "product photo"],
    workflowNext: ["image-upscale", "image-resize", "image-compress"],
  },
  {
    slug: "image-upscale", name: "Upscale Image", category: "image", creditCost: 1, badge: "AI",
    description: "Enhance and upscale your images up to 4× with AI super-resolution technology.",
    features: ["4× AI upscaling", "Real-ESRGAN model", "Face enhancement", "Reduce artifacts"],
    keywords: ["upscale", "enhance", "increase resolution", "sharpen", "improve quality", "enlarge", "hd"],
    workflowNext: ["remove-bg", "image-compress"],
  },
  {
    slug: "ai-generate", name: "AI Image Generator", category: "image", creditCost: 1, badge: "AI", isNew: true,
    description: "Generate stunning images from text prompts using state-of-the-art FLUX AI model.",
    features: ["FLUX Schnell model", "Multiple art styles", "HD quality", "Commercial use"],
    keywords: ["generate image", "text to image", "ai art", "create image", "dall-e alternative", "stable diffusion"],
    workflowNext: ["remove-bg", "image-upscale", "image-to-pdf"],
  },
  {
    slug: "text-extract", name: "Extract Text (OCR)", category: "image", creditCost: 0, badge: "FREE",
    description: "Extract text from images and scanned PDFs completely offline using local WebAssembly OCR in 30+ languages.",
    features: ["100% Free & Local", "Zero server uploads", "30+ languages", "Copy & download"],
    keywords: ["ocr", "text recognition", "extract text", "scan", "read image text", "document text", "receipt"],
    workflowNext: ["summarizer", "grammar-fixer"],
  },
  {
    slug: "restore-photo", name: "Restore Old Photo", category: "image", creditCost: 1, badge: "AI", isNew: true,
    description: "Restore damaged, scratched, or old photographs to their original quality using AI.",
    features: ["GFPGAN model", "Remove scratches", "Enhance faces", "HD output"],
    keywords: ["restore photo", "old photo", "fix scratches", "photo repair", "vintage photo restore"],
    workflowNext: ["image-upscale", "ai-colorize"],
  },
  {
    slug: "ai-colorize", name: "Colorize Photo", category: "image", creditCost: 1, badge: "AI", isNew: true,
    description: "Automatically colorize black-and-white photos with realistic AI color restoration.",
    features: ["Realistic colors", "AI-powered", "Preserves details", "High resolution output"],
    keywords: ["colorize photo", "black white to color", "b&w colorize", "add color to photo"],
    workflowNext: ["restore-photo", "image-upscale"],
  },
  {
    slug: "remove-object", name: "Remove Object", category: "image", creditCost: 1, badge: "AI", isNew: true,
    description: "Remove unwanted objects, people, or text from photos using AI inpainting technology.",
    features: ["AI inpainting", "Draw mask over object", "Clean background fill", "Natural results"],
    keywords: ["remove object", "remove person", "erase object", "photo clean", "inpaint", "object removal"],
    workflowNext: ["remove-bg", "image-upscale"],
  },

  /* ══════════ IMAGE — EDITING (7) ══════════ */
  {
    slug: "image-resize", name: "Resize Image", category: "image", creditCost: 0, badge: "FREE",
    description: "Resize images to exact pixel dimensions or percentage while maintaining quality.",
    features: ["Exact px or %", "Lock aspect ratio", "Multiple formats", "Preset sizes"],
    keywords: ["resize image", "change image size", "scale image", "image dimensions", "reduce image size"],
    workflowNext: ["image-compress", "image-convert"],
  },
  {
    slug: "image-compress", name: "Compress Image", category: "image", creditCost: 0, badge: "FREE",
    description: "Reduce image file size by up to 80% with no visible quality loss using smart compression.",
    features: ["Quality slider", "80%+ size reduction", "Before/after size", "Multiple formats"],
    keywords: ["compress image", "reduce image size", "smaller image", "optimize image", "image size reducer"],
    workflowNext: ["image-resize", "image-convert"],
  },
  {
    slug: "image-crop", name: "Crop Image", category: "image", creditCost: 0, badge: "FREE",
    description: "Crop images with preset aspect ratios or custom dimensions using drag-to-crop.",
    features: ["Drag to crop", "Preset ratios (1:1, 16:9)", "Custom dimensions", "HD output"],
    keywords: ["crop image", "trim image", "cut image", "photo crop", "image cutter"],
    workflowNext: ["image-resize", "image-compress"],
  },
  {
    slug: "image-convert", name: "Convert Image Format", category: "image", creditCost: 0, badge: "FREE",
    description: "Convert between JPG, PNG, WebP, and HEIC image formats instantly — batch supported.",
    features: ["JPG/PNG/WebP/HEIC", "Batch conversion", "Quality control", "ZIP download"],
    keywords: ["convert image", "jpg to png", "png to jpg", "webp to jpg", "heic to jpg", "image format converter"],
    workflowNext: ["image-compress", "image-resize"],
  },
  {
    slug: "photo-effects", name: "Photo Filters", category: "image", creditCost: 0, badge: "FREE", isNew: true,
    description: "Apply artistic filters including vintage, black & white, vivid, matte, and more.",
    features: ["10+ filter presets", "Brightness/contrast", "Saturation control", "Instant preview"],
    keywords: ["photo filter", "image filter", "vintage filter", "photo effects", "edit photo", "lut"],
    workflowNext: ["image-compress", "image-resize"],
  },
  {
    slug: "collage-maker", name: "Collage Maker", category: "image", creditCost: 0, badge: "FREE", isNew: true,
    description: "Create beautiful photo collages with multiple layout templates in one click.",
    features: ["6 layout templates", "Up to 9 photos", "Custom spacing", "HD JPG output"],
    keywords: ["collage", "photo collage", "combine photos", "collage maker", "photo grid"],
    workflowNext: ["image-compress", "image-resize"],
  },
  {
    slug: "photo-to-sketch", name: "Photo to Sketch", category: "image", creditCost: 0, badge: "FREE", isNew: true,
    description: "Convert any photo into a realistic pencil sketch or artistic drawing instantly.",
    features: ["Pencil sketch effect", "Adjustable intensity", "Color or B&W output", "Instant download"],
    keywords: ["photo to sketch", "pencil drawing", "sketch effect", "cartoon photo", "drawing filter"],
    workflowNext: ["image-compress", "photo-effects"],
  },

  /* ══════════ VIDEO & AUDIO (5) ══════════ */
  {
    slug: "video-compress", name: "Compress Video", category: "video", creditCost: 0, badge: "FREE", isNew: true,
    description: "Reduce video file size by up to 90% while preserving visual quality using FFmpeg WASM.",
    features: ["H.264 compression", "Up to 90% smaller", "MP4/MOV/WEBM", "Browser-based"],
    keywords: ["compress video", "reduce video size", "smaller video", "video compressor", "video file size"],
    workflowNext: ["video-trim", "mp4-to-mp3"],
  },
  {
    slug: "video-trim", name: "Trim Video", category: "video", creditCost: 0, badge: "FREE", isNew: true,
    description: "Cut and trim your video to exact start and end points with no quality loss.",
    features: ["Start/end time input", "Precise trimming", "No quality loss", "Fast processing"],
    keywords: ["trim video", "cut video", "clip video", "video cutter", "shorten video"],
    workflowNext: ["video-compress", "mp4-to-mp3"],
  },
  {
    slug: "video-to-gif", name: "Video to GIF", category: "video", creditCost: 0, badge: "FREE", isNew: true,
    description: "Convert any video clip to a looping animated GIF, perfect for social sharing.",
    features: ["Adjustable FPS", "Resize output", "Loop control", "Optimized file size"],
    keywords: ["video to gif", "convert to gif", "animated gif", "gif maker", "mp4 to gif"],
    workflowNext: ["video-compress"],
  },
  {
    slug: "mp4-to-mp3", name: "Extract Audio", category: "video", creditCost: 0, badge: "FREE", isNew: true,
    description: "Extract the audio track from any video file as a high-quality MP3 in seconds.",
    features: ["MP4/MOV/WEBM input", "192kbps MP3 output", "Fast extraction", "No quality loss"],
    keywords: ["mp4 to mp3", "extract audio", "video to audio", "audio extractor", "convert audio"],
    workflowNext: ["audio-to-text"],
  },
  {
    slug: "audio-to-text", name: "Audio to Text", category: "video", creditCost: 1, badge: "AI", isNew: true,
    description: "Transcribe any audio or video file to accurate text using OpenAI Whisper AI.",
    features: ["Whisper AI model", "100+ languages", "Timestamps option", "Copy & download"],
    keywords: ["transcribe", "audio to text", "speech to text", "transcription", "voice to text", "subtitle"],
    workflowNext: ["summarizer", "grammar-fixer"],
  },
  {
    slug: "media-converter", name: "Universal Media Converter", category: "video", creditCost: 0, badge: "FREE", isNew: true,
    description: "Convert video and audio files to any format (MP4, MP3, WAV, AVI) entirely in your browser.",
    features: ["Video & Audio", "No file limits", "Local conversion", "Multiple formats"],
    keywords: ["video converter", "audio converter", "mp4 to avi", "wav to mp3", "format converter"],
    workflowNext: ["video-compress", "mp4-to-mp3"],
  },

  /* ══════════ UTILITIES (2) ══════════ */
  {
    slug: "word-counter", name: "Word Counter", category: "utility", creditCost: 0, badge: "FREE",
    description: "Count words, characters, sentences, and estimate reading time in real time.",
    features: ["Live word count", "Character count", "Reading time estimate", "Keyword density"],
    keywords: ["word count", "character count", "word counter", "text statistics", "word frequency"],
    workflowNext: ["grammar-fixer", "summarizer"],
  },
  {
    slug: "color-picker", name: "Color Picker", category: "utility", creditCost: 0, badge: "FREE", isNew: true,
    description: "Pick colors from any image and get HEX, RGB, and HSL values instantly.",
    features: ["Pick from image", "HEX / RGB / HSL", "Copy color codes", "Color palette export"],
    keywords: ["color picker", "eyedropper", "hex color", "rgb color", "color from image", "palette"],
    workflowNext: ["ai-generate", "image-convert"],
  },
];

// ── CATEGORIES ──────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "all",     label: "All Tools",     count: TOOLS.length },
  { id: "writing", label: "AI Writing",    count: TOOLS.filter(t => t.category === "writing").length },
  { id: "pdf",     label: "PDF",           count: TOOLS.filter(t => t.category === "pdf").length },
  { id: "image",   label: "Image & AI",    count: TOOLS.filter(t => t.category === "image").length },
  { id: "video",   label: "Video & Audio", count: TOOLS.filter(t => t.category === "video").length },
  { id: "utility", label: "Utilities",     count: TOOLS.filter(t => t.category === "utility").length },
];

// ── AI FINDER SUGGESTIONS ────────────────────────────────────────
export const AI_FINDER_SUGGESTIONS = [
  "make my PDF smaller",
  "remove image background",
  "write an essay about AI",
  "extract text from a photo",
  "colorize old black and white photo",
  "create Instagram captions",
  "trim a video clip",
  "restore damaged old photo",
];

// ── CONSTANTS ────────────────────────────────────────────────────
export const DAILY_AI_CREDIT_LIMIT = 5;
export const APP_NAME = "ToolNode";
export const APP_TAGLINE = `${TOOLS.length} Free AI-Powered Tools — No Sign Up Required`;
