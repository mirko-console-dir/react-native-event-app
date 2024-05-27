import React, { createContext, useState, useContext, ReactNode } from "react";

const translations: Record<string, Record<string, string>> = {
  en: require('./translations/en.json'),
  it: require('./translations/it.json'),
  jp: require('./translations/jp.json'),
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState("en");

  const translate = (key: string): string => {
    const keys = key.split('.');
    let translation: Record<string, string> | string = translations[language];
    for (const k of keys) {
      if (!translation || typeof translation !== 'object') {
        return key; // Key not found
      }
      translation = translation[k];
    }
    return String(translation) || key; // Return key if translation not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage,translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
