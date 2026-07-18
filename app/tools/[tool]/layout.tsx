import { Metadata } from "next";
import { TOOLS, APP_NAME } from "@/lib/constants";
import { SEO_DATA } from "@/lib/seo-data";

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.tool;
  const tool = TOOLS.find(t => t.slug === slug);
  
  if (!tool) {
    return {
      title: `Tool Not Found | ${APP_NAME}`,
    };
  }

  return {
    title: `${tool.name} Online Free — ${APP_NAME}`,
    description: tool.description,
    keywords: tool.keywords.join(", "),
    alternates: {
      canonical: `https://toolnode.ai/tools/${slug}`
    },
    openGraph: {
      title: `${tool.name} Online Free — ${APP_NAME}`,
      description: tool.description,
    }
  };
}

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tool: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.tool;
  const tool = TOOLS.find(t => t.slug === slug);
  const seoData = SEO_DATA[slug];

  // Generate FAQ Schema
  const faqSchema = seoData?.faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seoData.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Generate Software Application Schema
  const softwareSchema = tool ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "BrowserApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": tool.description,
    "url": `https://toolnode.ai/tools/${slug}`
  } : null;

  return (
    <>
      {softwareSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {children}
    </>
  );
}
