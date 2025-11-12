// src/app/page.jsx
"use client";
import { useState } from "react";

type ApiResponse = {
  query?: string;
  results?: {
    companies: Array<{
      name: string;
      description: string;
      website: string;
      location?: string | null;
      isPublic?: boolean | null;
      batch?: string | null;
    }>;
  };
  error?: string;
};

export default function Home() {
  const [query, setQuery] = useState("top 5 developer tool companies");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/investor_scout?query=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!res.ok) {
        setData({ error: json.error || `HTTP error! status: ${res.status}` });
        return;
      }
      setData(json);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData({ error: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Y Combinator Company Scout</h1>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Describe what companies you're looking for. For example: "top 5 developer tool companies" or "best fintech startups to invest in"
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g., top 5 developer tool companies"
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      {data && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
