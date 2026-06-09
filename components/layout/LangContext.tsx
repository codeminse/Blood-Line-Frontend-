"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "bn";

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: "en",
  toggle: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "bn") setLang("bn");
  }, []);

  function toggle() {
    setLang((prev) => {
      const next = prev === "en" ? "bn" : "en";
      localStorage.setItem("lang", next);
      return next;
    });
  }

  return (
    <LangContext.Provider value={{ lang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
