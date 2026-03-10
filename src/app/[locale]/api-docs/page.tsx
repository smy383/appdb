import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getEndpoints } from "./endpoints";

export const metadata: Metadata = {
  title: "Public API - AppDB",
  description:
    "Free API endpoints for App Store chart data, app details, search, ranking history, and more.",
  openGraph: {
    title: "Public API - AppDB",
    description: "Free API endpoints for App Store chart data and insights.",
  },
  twitter: {
    card: "summary",
    title: "Public API - AppDB",
    description: "Free API endpoints for App Store chart data and insights.",
  },
};

export default async function ApiDocsPage() {
  const t = await getTranslations("apiDocs");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://appdb.example.com";
  const endpoints = getEndpoints(baseUrl);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-lg text-gray-400">{t("subtitle")}</p>
        <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          {t("rateLimit")}
        </p>
      </div>

      {/* Base URL */}
      <div className="mb-8 rounded-xl bg-gray-900 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {t("baseUrl")}
        </h2>
        <code className="text-lg font-mono text-blue-400">{baseUrl}</code>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden"
          >
            {/* Endpoint header */}
            <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-4">
              <span className="rounded-md bg-green-600/20 px-2.5 py-1 text-xs font-bold uppercase text-green-400">
                {ep.method}
              </span>
              <code className="text-sm font-mono text-white">{ep.path}</code>
            </div>

            {/* Description */}
            <div className="px-5 py-4">
              <p className="text-sm text-gray-300">{ep.description}</p>

              {/* Parameters */}
              {ep.params.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {t("params")}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                          <th className="pb-2 pr-4 font-medium">Name</th>
                          <th className="pb-2 pr-4 font-medium">Type</th>
                          <th className="pb-2 pr-4 font-medium">Required</th>
                          <th className="pb-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {ep.params.map((p, j) => (
                          <tr key={j}>
                            <td className="py-2 pr-4">
                              <code className="text-xs text-blue-400">
                                {p.name}
                              </code>
                            </td>
                            <td className="py-2 pr-4 text-xs text-gray-400">
                              {p.type}
                            </td>
                            <td className="py-2 pr-4 text-xs text-gray-400">
                              {p.required ? "Yes" : "No"}
                            </td>
                            <td className="py-2 text-xs text-gray-400">
                              {p.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Example curl */}
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("example")} (curl)
                </h3>
                <div className="overflow-x-auto rounded-lg bg-gray-950 p-4">
                  <code className="whitespace-pre text-xs text-gray-300">
                    {ep.curl}
                  </code>
                </div>
              </div>

              {/* Example response */}
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t("response")}
                </h3>
                <div className="overflow-x-auto rounded-lg bg-gray-950 p-4">
                  <pre className="text-xs text-gray-300">
                    {ep.exampleResponse}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
