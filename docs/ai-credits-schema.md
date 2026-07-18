# AI Credits System: Database Schema & API Logic (Stripe Prep)

## Overview
To transition from the current demo/in-memory system to a production-ready SaaS with usage-based billing, we will implement an "AI Credits" system. 

## 1. Database Schema (Prisma/Drizzle representation)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  stripeId      String?   @unique // Stripe Customer ID
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Subscription Details
  plan          PlanTier  @default(FREE)
  subscriptionId String?  // Stripe Subscription ID
  periodEnd     DateTime? // When the current billing cycle ends

  // Credits
  creditsBalance Int      @default(10) // Free users get 10 starting credits
  lifetimeUsage  Int      @default(0)

  // Relations
  transactions  CreditTransaction[]
}

enum PlanTier {
  FREE
  PRO
  ENTERPRISE
}

model CreditTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int      // Negative for usage (e.g., -1 for AI generate), Positive for top-ups
  type        TxType
  description String?  // e.g., "Used AI Image Generation", "Monthly Pro Allocation"
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

enum TxType {
  USAGE
  TOP_UP
  SUBSCRIPTION_RENEWAL
  REFUND
}
```

## 2. API Logic & Middleware Strategy

### A. The Billing Cycle (Cron Job / Webhook)
- **Stripe Webhooks (`/api/webhooks/stripe`):** 
  - `invoice.payment_succeeded`: Top up the user's `creditsBalance` based on their plan (e.g., +500 credits for PRO). Update `periodEnd`.
  - `customer.subscription.deleted`: Downgrade user to `FREE`, potentially zero out premium credits, or let them keep existing.

### B. Daily Free Credits
- Use a Vercel Cron Job (running at 00:00 UTC) to reset or top up `FREE` tier users back to 10 credits if their balance is below 10.
- Alternatively, check `lastFreeCreditUpdate` dynamically during the user session to avoid heavy cron jobs.

### C. API Handler Integration
We will update our centralized `lib/api-handler.ts` to include credit checking:

```typescript
// Proposed addition to api-handler.ts
import { getUserCredits, deductCredits } from "@/lib/db/credits";

export function createApiHandler(options: { schema?: ZodSchema, creditCost?: number, handler: ... }) {
  return async (req: NextRequest) => {
     // ... Rate Limiting ...

     // ... Authentication Check (Clerk / NextAuth) ...
     const userId = getAuth(req);

     // ... Credit Check ...
     if (options.creditCost && options.creditCost > 0) {
        const balance = await getUserCredits(userId);
        if (balance < options.creditCost) {
            return NextResponse.json({ error: "Insufficient credits", upgradeNeeded: true }, { status: 402 });
        }
     }

     // ... Execute Handler ...
     const response = await options.handler(req, data);

     // ... Deduct Credits (Async, post-response if possible, or blocking if required) ...
     if (response.ok && options.creditCost) {
        await deductCredits(userId, options.creditCost, `Used ${req.url}`);
     }

     return response;
  }
}
```

## 3. Stripe Integration Next Steps
1. Install `@stripe/stripe-js` and `stripe`.
2. Create Stripe Products:
   - "Pro Monthly" (Recurring Subscription)
   - "Credit Pack - 100" (One-time payment)
3. Build a checkout session endpoint (`/api/checkout/session`).
4. Build the Stripe Webhook handler to listen for payment success and assign credits securely.
