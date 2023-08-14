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
  const [lang, setLang] = React.useState<string>("en");

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

  React.useEffect(() => {
    const savedLang = localStorage.getItem("lang");

    if (savedLang) {
      setLang(savedLang);
    }
    
    return () => localStorage.setItem("lang", lang);
  }, []);

  return (
    <LangContext.Provider value={{ lang, updateLang, getTranslation }}>
      {children}
    </LangContext.Provider>
  );
};

