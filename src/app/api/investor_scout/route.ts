import { kernel } from "@/lib/kernel";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Missing query parameter (?query=...)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const browser = await kernel.browsers.create();

    const stagehand = new Stagehand({
      env: 'LOCAL',
      verbose: 1,
      domSettleTimeoutMs: 30_000,
      modelName: 'gpt-4o',
      modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY
      },
      localBrowserLaunchOptions: {
        cdpUrl: browser.cdp_ws_url
      }
    });

    await stagehand.init();

    const page = stagehand.page;

    await page.goto("https://www.ycombinator.com/companies");
    
    // Wait for page to load
    await page.waitForTimeout(2000);

    const output = await page.extract({
      instruction: `Based on this query: "${query}", find and extract the top 5 most relevant companies from Y Combinator. Use the search and filter options on the page if needed to find companies that match the query. 

For each company, extract:
- Company name
- A brief description of what they do
- Their website URL (look for links, "Visit website" buttons, or URLs displayed on the company card/listings - if you can't find it, leave it empty)
- Their location (city, state, country, or "Remote" - if not available, leave empty)
- Whether they are a public company (true/false - look for IPO status, public trading indicators, or "Public" labels)
- Their Y Combinator batch (e.g., "Summer 2024", "Winter 2023") if available

Make sure to look for clickable links or displayed URLs for the website field, and check for location information and public company status indicators.`,
      schema: z.object({
        companies: z.array(z.object({
          name: z.string(),
          description: z.string(),
          website: z.string(),
          location: z.string().optional(),
          isPublic: z.boolean().optional(),
          batch: z.string().optional()
        }))
      })
    });

    return new Response(JSON.stringify({ query, results: output }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Kernel API error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Something went wrong with Kernel request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
