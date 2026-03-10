import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Apps - AppDB",
  description:
    "Compare two App Store apps side by side. Analyze ratings, pricing, size, and search trends to make data-driven decisions.",
  openGraph: {
    title: "Compare Apps - AppDB",
    description:
      "Compare two App Store apps side by side. Analyze ratings, pricing, size, and search trends.",
  },
  twitter: {
    card: "summary",
    title: "Compare Apps - AppDB",
    description:
      "Compare two App Store apps side by side. Analyze ratings, pricing, size, and search trends.",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
