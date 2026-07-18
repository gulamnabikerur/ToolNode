import { redis } from "@/lib/redis";
import { TOOLS } from "@/lib/constants";

export const revalidate = 0; // Disable caching for the admin page

export default async function AdminAnalyticsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  
  // Very simple protection — in production, use a real auth layer or strict env matching
  if (token !== "admin123") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>403 Forbidden</h1>
        <p>You must provide the correct ?token parameter to view analytics.</p>
      </div>
    );
  }

  let totalHits = 0;
  let topTools: { slug: string; hits: number; name: string }[] = [];

  if (redis) {
    totalHits = (await redis.get<number>("analytics:total_hits")) || 0;
    
    // Get top 20 tools by score (ZREVRANGE with scores)
    const rawRankings = await redis.zrange<string[]>("analytics:tool_hits", 0, 19, {
      rev: true,
      withScores: true,
    });

    // Parse Upstash's flat array [member1, score1, member2, score2]
    for (let i = 0; i < rawRankings.length; i += 2) {
      const slug = rawRankings[i] as string;
      const hits = Number(rawRankings[i + 1]);
      const toolDef = TOOLS.find(t => t.slug === slug);
      topTools.push({ slug, hits, name: toolDef?.name || slug });
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>📊 Analytics Dashboard</h1>
        <div style={{ background: "var(--blue)", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600 }}>
          Total Global Hits: {totalHits.toLocaleString()}
        </div>
      </div>

      {!redis && (
        <div className="status-box status-box-error" style={{ marginBottom: 24 }}>
          <strong>Redis Not Configured:</strong> You must set UPSTASH_REDIS_REST_URL and TOKEN in your environment to view live analytics.
        </div>
      )}

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 20 }}>Top Performing Tools</h2>
        
        {topTools.length === 0 ? (
          <p style={{ color: "var(--text-2)" }}>No analytics data available yet. Open some tools to generate traffic!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topTools.map((tool, index) => {
              const maxHits = topTools[0].hits;
              const percentage = Math.max(2, (tool.hits / maxHits) * 100);
              return (
                <div key={tool.slug} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 30, color: "var(--text-3)", fontWeight: 600 }}>#{index + 1}</div>
                  <div style={{ width: 200, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tool.name}
                  </div>
                  <div style={{ flex: 1, height: 24, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percentage}%`, background: "var(--blue)", borderRadius: 4, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontWeight: 600 }}>{tool.hits}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
