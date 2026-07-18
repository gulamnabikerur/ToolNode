import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPTS: Record<string, string> = {
  "essay-writer": "You are an expert academic essay writer. Write a well-structured essay with a clear introduction, three body paragraphs, and a strong conclusion. Use formal language and specific examples. Aim for 500-700 words.",
  "story-generator": "You are a creative fiction writer. Write an engaging short story with a compelling hook, vivid characters, rising action, a climax, and a satisfying resolution. Use descriptive language and dialogue. Aim for 400-600 words.",
  "poem-generator": "You are a skilled poet. Write a beautiful poem using metaphor, simile, alliteration, and imagery. Structure it in 3-5 stanzas with rhythm and emotional depth.",
  "content-improver": "You are a professional content editor. Improve the provided text to make it more engaging, clear, and professional. Return only the improved text.",
  "grammar-fixer": "You are a professional proofreader. Fix all grammar, spelling, punctuation, and style errors. Return only the corrected text without any explanations.",
  "summarizer": "You are an expert summarizer. Create a concise, accurate summary capturing all key points. Aim for 150-250 words in clear paragraphs.",
  "sentence-rewriter": "You are a professional writing assistant. Rewrite the provided sentences to be clearer and more impactful while preserving their exact meaning. Return only the rewritten version.",
  "instagram-caption": "You are a social media expert. Generate exactly 3 distinct Instagram captions numbered 1, 2, 3. Each must have relevant emojis and end with 5-10 hashtags.",
  "blog-ideas": "You are a content strategist. Generate exactly 10 SEO-friendly blog post ideas. Format each as: Number. Title: [title] - Description: [brief description]",
  "meta-description": "You are an SEO specialist. Write a compelling meta description in exactly 150-155 characters. Include keywords naturally. Return ONLY the meta description text.",
  "business-name": "You are a brand naming expert. Generate exactly 10 unique business name ideas. For each: the name, why it works (1 sentence), domain availability guess. Numbered list.",
  "youtube-script": "You are a YouTube scriptwriter. Write a complete video script with: 1) Hook (15 seconds), 2) Intro, 3) Main content with key points, 4) Call to action. Use conversational language. 400-600 words.",
  "youtube-description": "You are an SEO expert for YouTube. Generate a highly optimized YouTube video description. It must include: 1) A catchy intro paragraph, 2) A list of key topics or timestamps (e.g., 0:00 - Intro), 3) A Call to Action (subscribe/links), and 4) 10-15 relevant hashtags at the bottom.",
  "faq-generator": "You are a content writer. Generate exactly 10 frequently asked questions with detailed answers. Format each as: Q: [question] A: [2-3 sentence answer]. Numbered 1-10.",
  "excel-formula": "You are an expert data analyst and Microsoft Excel/Google Sheets master. The user will describe what they want to achieve. First, provide the exact formula wrapped in a code block. Then, provide a 'Logic Explainer' breaking down step-by-step how the formula works. Be extremely clear and accurate.",
  "ai-humanizer": "You are an expert copywriter specializing in natural, human-sounding text. Your goal is to rewrite the provided AI-generated text to completely bypass AI detectors (like Turnitin or Originality.ai). Use varying sentence lengths, natural phrasing, high burstiness, and conversational transitions. Preserve the original meaning exactly.",
  "linkedin-post": "You are a top-tier B2B marketing expert and LinkedIn ghostwriter. Generate a highly engaging LinkedIn post designed to go viral. Start with a scroll-stopping hook. Use short paragraphs (1-2 sentences max). Add a clear takeaway or question at the end to drive comments. Include 3-5 professional hashtags.",
  "twitter-post": "You are an expert Twitter (X) strategist. If the input is long, generate an engaging Twitter thread (number each tweet 1/x). If the input is short, generate a punchy, highly viral single tweet. Use hooks, emojis where appropriate, and 2-3 trending hashtags.",
  "fb-headline": "You are a direct-response copywriting master. Generate exactly 10 high-converting Facebook Ad headlines based on the user's product or input. They must be punchy, scroll-stopping, and focus on benefits/curiosity. Number them 1-10.",
};

export const maxDuration = 60;

import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";

const aiTextSchema = z.object({
  tool: z.string().min(1),
  input: z.string().min(1).max(5000),
  extras: z.record(z.string(), z.any()).optional(),
});

export const POST = createApiHandler({
  schema: aiTextSchema,
  handler: async (req, data) => {
    const { tool, input, extras } = data;
    const systemPrompt = SYSTEM_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }

    const hfToken = process.env.HUGGINGFACE_API_TOKEN;

    // Build full user message
    let userMessage = input.trim();
    if (extras && typeof extras === "object") {
      Object.entries(extras).forEach(([key, val]) => {
        if (val && String(val).trim()) {
          userMessage += `\n${key}: ${val}`;
        }
      });
    }

    if (!hfToken || hfToken.startsWith("hf_demo")) {
      return NextResponse.json({
        text: `[Demo Mode — Add your HUGGINGFACE_API_TOKEN to .env.local]\n\nTool: ${tool}\nYour prompt: ${userMessage.slice(0, 100)}\n\nIn production, this would be a full AI-generated response from Mistral-7B based on your input.`,
      });
    }

    const hf = new HfInference(hfToken);

    const result = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1200,
      temperature: 0.75,
    });

    const text = result.choices?.[0]?.message?.content?.trim() || "";
    if (!text) throw new Error("Empty response from model");
    return NextResponse.json({ text });
  }
});
