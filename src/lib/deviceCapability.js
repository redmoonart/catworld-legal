/** narrow viewport — used to scale down parallax/scroll-story movement amplitude on phones */
export function isNarrowViewport() {
  return typeof window !== "undefined" && window.innerWidth < 760;
}
