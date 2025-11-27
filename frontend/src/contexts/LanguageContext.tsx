import { createContext, useContext, useState, type ReactNode } from "react";
import { getCookie, setCookie } from "../lib/cookies";
import type { Language, LanguageContextType } from "../types";
import { translationsMap } from "../translations";

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export default function LanguageContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language preference from cookies, default to 'en' if not set
    const stored = getCookie("language") as Language;
    return stored || "en";
  });

  function changeLanguage(lang: Language) {
    setLanguage(lang);
    // Store language preference in cookies (expires in 365 days)
    setCookie("language", lang, 365);
  }

  const t = (key: string): string => {
    return translationsMap[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguage must be used within a LanguageContextProvider"
    );
  }
  return context;
}
