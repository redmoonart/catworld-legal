export function detectWebGL() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isLowEndOrMobile() {
  if (typeof window === "undefined") return false;
  const narrow = window.innerWidth < 768;
  const fewCores = typeof navigator !== "undefined" && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
  const lowMemory = typeof navigator !== "undefined" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4;
  return narrow || fewCores || lowMemory;
}

/** "off" = no WebGL scene at all (2D hero art only) · "lite" = fewer shapes, capped dpr · "full" = complete scene */
export function getHeroSceneTier() {
  if (prefersReducedMotion()) return "off";
  if (!detectWebGL()) return "off";
  if (isLowEndOrMobile()) return "lite";
  return "full";
}

/** true only for devices with an accurate pointer (mouse/trackpad) — excludes touchscreens */
export function hasFinePointer() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(pointer: fine)").matches;
}

/** narrow viewport — used to scale down parallax/scroll-story movement amplitude on phones */
export function isNarrowViewport() {
  return typeof window !== "undefined" && window.innerWidth < 760;
}
