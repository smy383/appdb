"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CategoryCard from "@/components/categories/CategoryCard";

interface TopApp {
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
  rank: number;
  averageRating: number;
  ratingCount: number;
}

interface CategoryData {
  genre: string;
  appCount: number;
  averageRating: number;
  topApps: TopApp[];
}

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await fetch("/api/category-insights");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch category insights:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-gray-400">{t("subtitle")}</p>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-gray-900 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-gray-800" />
                <div className="h-5 w-16 rounded bg-gray-800" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-800" />
                    <div className="h-4 w-32 rounded bg-gray-800" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          {t("noData")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.genre}
              genre={cat.genre}
              appCount={cat.appCount}
              averageRating={cat.averageRating}
              topApps={cat.topApps}
            />
          ))}
        </div>
      )}
    </div>
  );
}
