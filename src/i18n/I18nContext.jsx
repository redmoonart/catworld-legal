import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { STR, META } from "./strings";

const LANG_KEY = "kof_lang";
const I18nContext = createContext(null);

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && STR[saved]) return saved;
  } catch {
    /* localStorage unavailable */
  }
  return "ar";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  useEffect(() => {
    const meta = META[lang];
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* localStorage unavailable */
    }
  }, [lang]);

  const setLang = useCallback((l) => {
    if (STR[l]) setLangState(l);
  }, []);

  const t = useCallback(
    (key, vars) => {
      let s = STR[lang][key] ?? STR.ar[key] ?? key;
      if (vars && typeof s === "string") {
        Object.keys(vars).forEach((k) => {
          s = s.replace(`{${k}}`, vars[k]);
        });
      }
      return s;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, meta: META[lang] }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function Trans({ k, vars }) {
  const { t } = useI18n();
  return <span dangerouslySetInnerHTML={{ __html: t(k, vars) }} />;
}
