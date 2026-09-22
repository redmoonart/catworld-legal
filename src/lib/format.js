export function fmt(n) {
  return Number(n).toLocaleString("fr-DZ").replace(/ /g, " ");
}

export function money(n, currency) {
  return `${fmt(n)} ${currency}`;
}
