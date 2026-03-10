"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import SearchBar from "@/components/search/SearchBar";

export default function Header() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
            A
          </div>
          <div>
            <span className="text-xl font-bold text-white">
              {t("appName")}
            </span>
            <span className="ml-2 hidden text-sm text-gray-400 sm:inline">
              {t("tagline")}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className="text-sm text-gray-300 transition-colors hover:text-white"
            >
              {t("charts")}
            </Link>
            <Link
              href="/categories"
              className="text-sm text-gray-300 transition-colors hover:text-white"
            >
              {t("categoriesNav")}
            </Link>
            <Link
              href="/publishers"
              className="text-sm text-gray-300 transition-colors hover:text-white"
            >
              {t("publishersNav")}
            </Link>
          </nav>
          <SearchBar />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
