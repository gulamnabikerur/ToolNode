import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "./rate-limit";

type HandlerFn<T = any> = (req: NextRequest, data: T) => Promise<NextResponse>;

export function createApiHandler<T>(options: {
  schema?: z.ZodType<T>;
  handler: HandlerFn<T>;
}) {
  return async (req: NextRequest) => {
    try {
      // 1. Rate Limiting
      const rateLimit = await checkRateLimit(req);
      if (!rateLimit.success) {
        return NextResponse.json({ error: rateLimit.error }, { status: 429 });
      }

      // 2. Validation
      let validatedData: any = undefined;

      if (options.schema) {
        if (req.method === "POST" || req.method === "PUT") {
          let body;
          try {
            body = await req.json();
          } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
          }

          const parsed = options.schema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              { error: "Validation Error", details: parsed.error.format() },
              { status: 400 }
            );
          }
          validatedData = parsed.data;
        } else if (req.method === "GET" || req.method === "DELETE") {
          const url = new URL(req.url);
          const query = Object.fromEntries(url.searchParams.entries());
          const parsed = options.schema.safeParse(query);
          if (!parsed.success) {
             return NextResponse.json(
              { error: "Validation Error", details: parsed.error.format() },
              { status: 400 }
            );
          }
          validatedData = parsed.data;
        }
      }

      // 3. Execution
      return await options.handler(req, validatedData);
    } catch (e: any) {
      console.error("[API_ERROR]", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
