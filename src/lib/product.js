export function pName(p, lang) {
  if (lang === "fr" && p.nameFr) return p.nameFr;
  if (lang === "en" && p.nameEn) return p.nameEn;
  return p.name;
}

export function pDesc(p, lang) {
  if (lang === "fr" && p.descFr) return p.descFr;
  if (lang === "en" && p.descEn) return p.descEn;
  return p.desc || "";
}

export function wName(w, lang) {
  return lang === "ar" ? w.name : w.latin || w.name;
}
