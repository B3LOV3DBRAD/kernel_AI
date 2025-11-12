# Angel Investor Agent with Kernel

An AI-powered browser agent that helps you find Y Combinator companies based on natural language queries.

--- 
## What is Kernel

Kernel is a developer platform creating browser-based infrastructure to power AI agents and web automation through Browser-as-a-service

- Creates isolated borwser intsances
- Focus on speed and reliability (browser instances boot in ~100ms)
- Platform offers persistant browsers (can reuse and maintain session state)
- Serverless browsers 
- Allows agents to have web access in real time
---

## How It Works

1. A user enters a natural language query describing the companies you want to find (ex. 5 top consumer goods companies)
2. Then the browser agent navigates to `ycombinator.com/companies` 
3. AI (gpt-4o model) interprets the query and uses search/filters to find matching companies
4. Returns the top 5 most relevant companies with structured data

### Example Interaction

**Query:** "Top consumer goods companies"

**Results:**

```json
{
  "query": "Top consumer goods companies",
  "results": {
    "companies": [
      {
        "name": "DoorDash",
        "description": "Restaurant delivery.",
        "website": "",
        "location": "San Francisco, CA, USA",
        "isPublic": true,
        "batch": "SUMMER 2013"
      },
      {
        "name": "Airbnb",
        "description": "Book accommodations around the world.",
        "website": "",
        "location": "San Francisco, CA, USA",
        "isPublic": true,
        "batch": "WINTER 2009"
      },
      {
        "name": "Instacart",
        "description": "Marketplace for grocery delivery and pickup",
        "website": "",
        "location": "San Francisco, CA, USA",
        "isPublic": true,
        "batch": "SUMMER 2012"
      },
      {
        "name": "Matterport",
        "description": "Turn physical objects and environments into 3D models in seconds.",
        "website": "",
        "location": "Sunnyvale, CA, USA",
        "isPublic": true,
        "batch": "WINTER 2012"
      },
      {
        "name": "Bellabeat",
        "description": "Tech-powered women's wellness.",
        "website": "",
        "location": "San Francisco, CA, USA",
        "isPublic": false,
        "batch": "WINTER 2014"
      }
    ]
  }
}
```

---
## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Kernel API key
- OpenAI API key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory:
   ```
   KERNEL_API_KEY=your_kernel_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Architecture

- **Next.js 15** - Provides the React frontend where users enter queries and the API route (`/api/investor_scout`) that handles the browser automation logic
- **Kernel SDK** - Creates isolated browser instances in the API route, providing the foundation for web automation
- **Stagehand** - Connects to Kernel's browser instance and uses GPT-4o to intelligently navigate Y Combinator's website, interpret user queries, and extract company data
- **OpenAI GPT-4o** - Powers Stagehand's natural language understanding, allowing it to interpret queries like "top 5 consumer goods companies" and extract structured data from web pages
- **Zod** - Validates the extracted company data structure in the API route, ensuring each company has the required fields (name, description, website, location, isPublic, batch) before returning results

---

## API Endpoint

The API can also be called directly: `GET /api/investor_scout?query=your%20search%20query`

