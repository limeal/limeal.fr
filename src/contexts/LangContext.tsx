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

const LANG_EVENT = "lang-change";

// Choice of this tab, for browsers refusing storage
let chosen: string | null = null;

const readLang = () => {
  try {
    return chosen ?? localStorage.getItem("lang") ?? "en";
  } catch {
    return chosen ?? "en";
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(LANG_EVENT, onChange);
  return () => window.removeEventListener(LANG_EVENT, onChange);
};

// Calls `listener` with each language picked from now on
export const onLangChange = (listener: (lang: string) => void) => {
  const handler = (e: Event) => listener((e as CustomEvent<string>).detail);
  window.addEventListener(LANG_EVENT, handler);
  return () => window.removeEventListener(LANG_EVENT, handler);
};

export const LangContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // The server renders "en", and so does hydration; the saved choice is
  // applied right after (under the splash screen)
  const lang = React.useSyncExternalStore(subscribe, readLang, () => "en");

  const updateLang = useCallback((lang: string) => {
    chosen = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {}
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
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

