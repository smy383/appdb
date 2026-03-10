"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-sm">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("ko")}
        className={`px-3 py-1.5 transition-colors ${
          locale === "ko"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        KO
      </button>
    </div>
  );
}
