import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Publishers - AppDB",
  description:
    "Discover the most successful App Store publishers. See which developers have the most apps on the charts.",
  openGraph: {
    title: "Top Publishers - AppDB",
    description:
      "Discover the most successful App Store publishers. See which developers have the most apps on the charts.",
  },
  twitter: {
    card: "summary",
    title: "Top Publishers - AppDB",
    description:
      "Discover the most successful App Store publishers.",
  },
};

export default function PublishersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
