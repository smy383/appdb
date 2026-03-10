import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-sm text-gray-500">{t("disclaimer")}</p>
        <p className="mt-1 text-sm text-gray-600">{t("builtWith")}</p>
      </div>
    </footer>
  );
}
