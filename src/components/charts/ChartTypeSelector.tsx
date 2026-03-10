"use client";

import { useTranslations } from "next-intl";

interface ChartTypeSelectorProps {
  selected: string;
  onChange: (type: string) => void;
}

export default function ChartTypeSelector({
  selected,
  onChange,
}: ChartTypeSelectorProps) {
  const t = useTranslations("home");

  const types = [
    { value: "top-free", label: t("topFree") },
    { value: "top-paid", label: t("topPaid") },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
      {types.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            selected === type.value
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
