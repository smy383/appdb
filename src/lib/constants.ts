export const COUNTRIES = [
  { code: "us", name: "United States", nameKo: "미국", flag: "🇺🇸" },
  { code: "kr", name: "South Korea", nameKo: "한국", flag: "🇰🇷" },
  { code: "jp", name: "Japan", nameKo: "일본", flag: "🇯🇵" },
  { code: "gb", name: "United Kingdom", nameKo: "영국", flag: "🇬🇧" },
] as const;

export const CHART_TYPES = [
  { value: "top-free", labelEn: "Top Free", labelKo: "무료 인기" },
  { value: "top-paid", labelEn: "Top Paid", labelKo: "유료 인기" },
] as const;

export const DEFAULT_COUNTRY = "us";
export const DEFAULT_CHART_TYPE = "top-free";
export const CHART_LIMIT = 100;
