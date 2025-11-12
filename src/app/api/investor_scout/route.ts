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

  let browser: any = null;
  let stagehand: Stagehand | null = null;

  try {
    browser = await kernel.browsers.create();

    stagehand = new Stagehand({
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
      instruction: `Based on this query: "${query}", find and extract EXACTLY 5 companies from Y Combinator that match ALL criteria in the query.

CRITICAL REQUIREMENTS:
- You MUST extract exactly 5 companies, no more, no less
- ALL companies MUST match the query criteria. If the query mentions a location (e.g., "Boston", "San Francisco", "New York"), ALL 5 companies MUST be from that location
- If the query mentions an industry or category, ALL 5 companies MUST be in that industry/category

FILTERING INSTRUCTIONS:
- Use the SEARCH BAR at the top of the page to search for location names, company names, or keywords from the query
- If the query mentions a location, use the "Region" filter in the sidebar to narrow down results (e.g., select "America / Canada" for US cities like Boston, San Francisco)
- Use other filters (Industry, Batch, etc.) as needed to match the query criteria
- After applying filters/search, verify the results match the query before extracting

EXTRACTION REQUIREMENTS:
- If you don't see 5 matching companies on the first page, scroll down or click "Load More" to see more results
- DO NOT include companies that don't match the query criteria, even if you need to search more thoroughly
- If there truly aren't 5 companies that match, return the ones that do match (but try very hard to find 5)

IMPORTANT: For each company, you MUST click into their individual company page to find their website URL. The website URL is typically not visible on the main companies list page.

For each of the 5 companies:
1. Click on the company name or company card to open their individual page
2. Extract the website URL from their company page (look for "Visit website", "Website" links, or displayed URLs)
3. Verify the company's location matches the query (if location is specified in query)
4. Go back to the companies list page (use browser back button or navigate back)
5. Repeat for the next company until you have exactly 5 companies that ALL match the query

Extract for each company:
- Company name
- A brief description of what they do
- Their website URL (MUST click into company page to find this - look for "Visit website" buttons, website links, or displayed URLs on the company's individual page)
- Their location (city, state, country, or "Remote" - if not available, leave null)
- Whether they are a public company (true/false - look for IPO status, public trading indicators, or "Public" labels. If not found, leave null)
- Their Y Combinator batch (e.g., "Summer 2024", "Winter 2023") if available (if not found, leave null)

VERY IMPORTANT: Before including a company in the results, verify it matches the query. If the query says "Boston companies", check that the company's location includes "Boston". Do NOT include companies that don't match the query criteria.

Remember: You must return exactly 5 companies in the results array, and ALL 5 must match the query criteria.`,
      schema: z.object({
        companies: z.array(z.object({
          name: z.string(),
          description: z.string(),
          website: z.string(),
          location: z.string().nullable().optional(),
          isPublic: z.boolean().nullable().optional(),
          batch: z.string().nullable().optional()
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
  } finally {
    // Clean up browser and stagehand instances to free up concurrent session limit
    try {
      if (stagehand) {
        await stagehand.close();
      }
      if (browser && browser.id) {
        await kernel.browsers.delete(browser.id);
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
}
