import { google } from "googleapis";

const customSearch = google.customsearch("v1");

export interface SearchResult {
  title: string | null | undefined;
  url: string | null | undefined;
  snippet: string | null | undefined;
}

export async function fetchSearchResults(query: string, numResults: number = 5): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx || apiKey === "" || cx === "") {
    console.warn("Google Custom Search API Key or CX is missing. Returning empty mock data.");
    return [];
  }

  try {
    const res = await customSearch.cse.list({
      q: query,
      cx: cx,
      auth: apiKey,
      num: numResults,
      cr: "countryKR",
      gl: "kr",
      hl: "ko"
    });

    const items = res.data.items || [];
    
    return items.map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}
