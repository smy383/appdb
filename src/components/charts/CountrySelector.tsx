"use client";

import { useLocale } from "next-intl";
import { COUNTRIES } from "@/lib/constants";

interface CountrySelectorProps {
  selected: string;
  onChange: (country: string) => void;
}

export default function CountrySelector({
  selected,
  onChange,
}: CountrySelectorProps) {
  const locale = useLocale();

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
    >
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {locale === "ko" ? country.nameKo : country.name}
        </option>
      ))}
    </select>
  );
}
