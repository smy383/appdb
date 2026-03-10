interface Param {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params: Param[];
  curl: string;
  exampleResponse: string;
}

export function getEndpoints(baseUrl: string): Endpoint[] {
  return [
    {
      method: "GET",
      path: "/api/charts",
      description:
        "Fetch the top chart for a given country and chart type. Returns up to 200 apps.",
      params: [
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us"). e.g. us, kr, jp, gb',
        },
        {
          name: "chartType",
          type: "string",
          required: false,
          desc: '"top-free" or "top-paid" (default: "top-free")',
        },
      ],
      curl: `curl "${baseUrl}/api/charts?country=us&chartType=top-free"`,
      exampleResponse: JSON.stringify(
        {
          apps: [
            {
              id: "6446901002",
              name: "Threads",
              artistName: "Instagram, Inc.",
              artworkUrl: "https://...",
              rank: 1,
              rankChange: 0,
            },
          ],
          updated: "2026-03-10T12:00:00Z",
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/app/{id}",
      description:
        "Look up detailed information about a specific app by its App Store ID.",
      params: [
        {
          name: "id",
          type: "string",
          required: true,
          desc: "App Store ID (path parameter)",
        },
      ],
      curl: `curl "${baseUrl}/api/app/6446901002"`,
      exampleResponse: JSON.stringify(
        {
          id: "6446901002",
          name: "Threads",
          artistName: "Instagram, Inc.",
          primaryGenreName: "Social Networking",
          averageRating: 4.5,
          ratingCount: 120000,
          price: 0,
          currentVersion: "300.0",
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/search",
      description: "Search for apps by keyword.",
      params: [
        {
          name: "q",
          type: "string",
          required: true,
          desc: "Search query term",
        },
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us")',
        },
        {
          name: "limit",
          type: "number",
          required: false,
          desc: "Max results to return (default: 25)",
        },
      ],
      curl: `curl "${baseUrl}/api/search?q=instagram&country=us"`,
      exampleResponse: JSON.stringify(
        {
          results: [
            {
              id: "389801252",
              name: "Instagram",
              artistName: "Instagram, Inc.",
              averageRating: 4.7,
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/history/{id}",
      description:
        "Get the ranking history for an app over a specified number of days.",
      params: [
        {
          name: "id",
          type: "string",
          required: true,
          desc: "App Store ID (path parameter)",
        },
        {
          name: "days",
          type: "number",
          required: false,
          desc: "Number of days of history (default: 30)",
        },
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us")',
        },
        {
          name: "chartType",
          type: "string",
          required: false,
          desc: '"top-free" or "top-paid" (default: "top-free")',
        },
      ],
      curl: `curl "${baseUrl}/api/history/6446901002?days=30&country=us&chartType=top-free"`,
      exampleResponse: JSON.stringify(
        {
          history: [
            { date: "2026-03-01", rank: 3 },
            { date: "2026-03-02", rank: 2 },
            { date: "2026-03-03", rank: 1 },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/movers",
      description:
        "Get the biggest rank movers (up and down) for a given chart.",
      params: [
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us")',
        },
        {
          name: "chartType",
          type: "string",
          required: false,
          desc: '"top-free" or "top-paid" (default: "top-free")',
        },
      ],
      curl: `curl "${baseUrl}/api/movers?country=us&chartType=top-free"`,
      exampleResponse: JSON.stringify(
        {
          movers: [
            {
              id: "123456789",
              name: "Cool App",
              rankChange: 45,
              currentRank: 5,
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/new-entries",
      description: "Get apps that are new to the chart (first appearance).",
      params: [
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us")',
        },
        {
          name: "chartType",
          type: "string",
          required: false,
          desc: '"top-free" or "top-paid" (default: "top-free")',
        },
      ],
      curl: `curl "${baseUrl}/api/new-entries?country=us&chartType=top-free"`,
      exampleResponse: JSON.stringify(
        {
          entries: [
            {
              id: "987654321",
              name: "New App",
              rank: 42,
              artworkUrl: "https://...",
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/trends/{term}",
      description:
        "Get Google Trends data for a search term over the past 12 months.",
      params: [
        {
          name: "term",
          type: "string",
          required: true,
          desc: "Search term (path parameter)",
        },
      ],
      curl: `curl "${baseUrl}/api/trends/instagram"`,
      exampleResponse: JSON.stringify(
        {
          term: "instagram",
          data: [
            { date: "2025-03", value: 85 },
            { date: "2025-04", value: 90 },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/publishers",
      description:
        "Get the top publishers by number of apps on the chart.",
      params: [
        {
          name: "country",
          type: "string",
          required: false,
          desc: 'ISO country code (default: "us")',
        },
      ],
      curl: `curl "${baseUrl}/api/publishers?country=us"`,
      exampleResponse: JSON.stringify(
        {
          publishers: [
            {
              name: "Google LLC",
              appCount: 8,
              apps: [
                { id: "284815942", name: "Google", artwork_url: "https://..." },
              ],
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/developer",
      description: "Get all apps and chart info for a specific developer.",
      params: [
        {
          name: "name",
          type: "string",
          required: true,
          desc: "Developer name (query parameter)",
        },
      ],
      curl: `curl "${baseUrl}/api/developer?name=Google%20LLC"`,
      exampleResponse: JSON.stringify(
        {
          developer: "Google LLC",
          chartedApps: [
            { id: "284815942", name: "Google", rank: 5 },
          ],
          allApps: [
            {
              id: "284815942",
              name: "Google",
              artworkUrl: "https://...",
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/country-ranks/{id}",
      description:
        "Get the ranking of an app across multiple countries.",
      params: [
        {
          name: "id",
          type: "string",
          required: true,
          desc: "App Store ID (path parameter)",
        },
      ],
      curl: `curl "${baseUrl}/api/country-ranks/6446901002"`,
      exampleResponse: JSON.stringify(
        {
          ranks: [
            { country: "us", rank: 1, change: 0 },
            { country: "kr", rank: 3, change: -1 },
            { country: "jp", rank: 5, change: 2 },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/category-insights",
      description:
        "Get aggregated insights for all app categories including top apps per category.",
      params: [],
      curl: `curl "${baseUrl}/api/category-insights"`,
      exampleResponse: JSON.stringify(
        {
          categories: [
            {
              genre: "Games",
              appCount: 45,
              averageRating: 4.3,
              topApps: [
                { id: "123", name: "Top Game", rank: 1 },
              ],
            },
          ],
        },
        null,
        2
      ),
    },
  ];
}
