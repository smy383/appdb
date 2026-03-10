"use client";

import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/apple/categories";

interface CategoryFilterProps {
  selected: string;
  onChange: (genreId: string) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
    >
      <option value="">{t("allCategories")}</option>
      {CATEGORIES.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {locale === "ko" ? cat.nameKo : cat.nameEn}
        </option>
      ))}
    </select>
  );
}
