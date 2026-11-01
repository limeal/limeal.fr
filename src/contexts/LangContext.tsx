"use client";

import React, { useCallback } from "react";
import langs from './lang.json'

interface Translation {
  id: string;
  fr: string;
  en: string;
  es: string;
  kr: string;
}

export const LangContext = React.createContext({
  langs: [] as Array<string>,
  lang: "en" as string,
  updateLang: (lang: string) => {},
  getTranslation: (key: string) => "" as string,
});

export const useLangContext = () => React.useContext(LangContext);

export const LangContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Saved choice, read once. The server renders "en"; nothing it renders depends
  // on the language (only the splash screen), so the client can differ.
  const [lang, setLang] = React.useState<string>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return localStorage.getItem("lang") || "en";
    } catch {
      return "en";
    }
  });

  const updateLang = useCallback((lang: string) => {
    setLang(lang);
    localStorage.setItem("lang", lang);
  }, []);

  const getTranslation = useCallback((key: string) => {
    const text = langs.find((lang) => lang.id === key);

    if (text) {
        return text[lang as keyof Translation] || text['en'];
    }

    return '';
  }, [lang]);


  return (
    <LangContext.Provider value={{ langs: [
      'en',
      'fr',
      'es',
      'kr'
    ], lang, updateLang, getTranslation }}>
      {children}
    </LangContext.Provider>
  );
};

