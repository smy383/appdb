export interface Category {
  id: string;
  nameEn: string;
  nameKo: string;
}

export const CATEGORIES: Category[] = [
  { id: "6014", nameEn: "Games", nameKo: "게임" },
  { id: "6000", nameEn: "Business", nameKo: "비즈니스" },
  { id: "6017", nameEn: "Education", nameKo: "교육" },
  { id: "6016", nameEn: "Entertainment", nameKo: "엔터테인먼트" },
  { id: "6015", nameEn: "Finance", nameKo: "금융" },
  { id: "6023", nameEn: "Food & Drink", nameKo: "음식 및 음료" },
  { id: "6013", nameEn: "Health & Fitness", nameKo: "건강 및 피트니스" },
  { id: "6012", nameEn: "Lifestyle", nameKo: "라이프스타일" },
  { id: "6020", nameEn: "Medical", nameKo: "의료" },
  { id: "6011", nameEn: "Music", nameKo: "음악" },
  { id: "6009", nameEn: "News", nameKo: "뉴스" },
  { id: "6008", nameEn: "Photo & Video", nameKo: "사진 및 비디오" },
  { id: "6007", nameEn: "Productivity", nameKo: "생산성" },
  { id: "6024", nameEn: "Shopping", nameKo: "쇼핑" },
  { id: "6005", nameEn: "Social Networking", nameKo: "소셜 네트워킹" },
  { id: "6004", nameEn: "Sports", nameKo: "스포츠" },
  { id: "6001", nameEn: "Travel", nameKo: "여행" },
  { id: "6002", nameEn: "Utilities", nameKo: "유틸리티" },
  { id: "6003", nameEn: "Weather", nameKo: "날씨" },
];

export function getCategoryName(
  id: string,
  locale: string
): string | undefined {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return undefined;
  return locale === "ko" ? cat.nameKo : cat.nameEn;
}
