import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category Insights - AppDB",
  description:
    "Explore App Store categories and discover top performing apps in each category. Data-driven insights for developers.",
  openGraph: {
    title: "Category Insights - AppDB",
    description:
      "Explore App Store categories and discover top performing apps in each category.",
  },
  twitter: {
    card: "summary",
    title: "Category Insights - AppDB",
    description:
      "Explore App Store categories and discover top performing apps in each category.",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
