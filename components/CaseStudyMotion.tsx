"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

const ease = "cubic-bezier(.22, 1, .36, 1)";
const mediaSelector = ".project-cover, .gallery-image, .identity-family-main, .identity-board, .identity-colour-treatment, .identity-poster-board, .identity-placement-board, .identity-clear-board, .storefront-logo-board, .storefront-mobile-board, .storefront-screen > img";

export default function CaseStudyMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const article = root.current;
    if (!article) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const headings = [...article.querySelectorAll<HTMLElement>("h1, h2")];
    const originals = headings.map(heading => ({ heading, nodes: [...heading.childNodes], label: heading.getAttribute("aria-label") }));
    const seen = new Set<HTMLElement>();
    const visibleHeadings = new Set<HTMLElement>();
    const revealedMedia = new Set<HTMLElement>();
    const pendingMedia = new Set<HTMLElement>();
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.classList.add("case-study-clips");
    const defs = document.createElementNS(svgNS, "defs");
    svg.append(defs);
    const media = [...article.querySelectorAll<HTMLElement>(mediaSelector)].map((element, index) => {
      const clip = document.createElementNS(svgNS, "clipPath");
      clip.id = `case-curve-${id}-${index}`;
      clip.setAttribute("clipPathUnits", "objectBoundingBox");
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", "M0 0H1V1H0Z");
      clip.append(path);
      defs.append(clip);
      const previousClip = element.style.clipPath;
      return { element, path, previousClip, clipId: clip.id };
    });
    article.append(svg);

    for (const heading of headings) {
      const text = heading.textContent ?? "";
      heading.setAttribute("aria-label", text);
      const fragment = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(word => {
        if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const window = document.createElement("span");
        window.className = "case-word-window";
        window.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "case-word";
        inner.textContent = word;
        window.append(inner);
        fragment.append(window);
      });
      heading.replaceChildren(fragment);
    }

    const main = document.getElementById("main");
    function reveal() {
      if (preference.matches || document.hidden || main?.getAttribute("aria-busy") === "true") return;
      for (const heading of visibleHeadings) {
        if (seen.has(heading)) continue;
        seen.add(heading);
        heading.querySelectorAll<HTMLElement>(".case-word").forEach((word, index) => {
          const animation = word.animate([
            { transform: "translateY(110%)" },
            { transform: "translateY(0)" },
          ], { duration: 620, delay: Math.min(index * 45, 225), easing: ease });
          animations.add(animation);
          void animation.finished.catch(() => {}).finally(() => animations.delete(animation));
        });
      }
      for (const element of pendingMedia) {
        if (revealedMedia.has(element)) continue;
        revealedMedia.add(element);
        const animation = element.animate([
          { clipPath: "inset(6% 3%)", transform: "translateY(18px) scale(.985)" },
          { clipPath: "inset(0%)", transform: "translateY(0) scale(1)" },
        ], { duration: 780, easing: ease });
        animations.add(animation);
        void animation.finished.catch(() => {}).finally(() => animations.delete(animation));
      }
    }
    const headingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const heading = entry.target as HTMLElement;
        if (entry.isIntersecting) visibleHeadings.add(heading);
        else visibleHeadings.delete(heading);
      });
      reveal();
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    headings.forEach(heading => headingObserver.observe(heading));
    const routeObserver = new MutationObserver(reveal);
    if (main) routeObserver.observe(main, { attributes: true, attributeFilter: ["aria-busy"] });

    const visibleMedia = new Set<typeof media[number]>();
    const mediaByElement = new Map(media.map(item => [item.element, item]));
    const mediaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = mediaByElement.get(entry.target as HTMLElement);
        if (!item) return;
        if (entry.isIntersecting) { visibleMedia.add(item); pendingMedia.add(item.element); }
        else { visibleMedia.delete(item); pendingMedia.delete(item.element); item.element.style.clipPath = item.previousClip; }
      });
      reveal();
    }, { rootMargin: "80px" });
    media.forEach(item => mediaObserver.observe(item.element));
    let frame = 0;
    let lastScroll = window.scrollY;
    let lastTime = performance.now();
    let impulse = 0;
    let curve = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      impulse = curve = 0;
      media.forEach(item => { item.element.style.clipPath = item.previousClip; });
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
    function tick() {
      frame = 0;
      if (preference.matches || document.hidden) { reset(); return; }
      curve += (impulse - curve) * .18;
      impulse *= .84;
      // Curve just the artwork edges; layout and the complete resting image stay stable.
      const bend = Math.min(Math.abs(curve) * .045, .055);
      for (const item of visibleMedia) {
        item.path.setAttribute("d", curve >= 0
          ? `M0 0 Q.5 ${bend * 2} 1 0 L1 ${1 - bend} Q.5 ${1 + bend} 0 ${1 - bend} Z`
          : `M0 ${bend} Q.5 ${-bend} 1 ${bend} L1 1 Q.5 ${1 - bend * 2} 0 1 Z`);
        item.element.style.clipPath = `url("#${item.clipId}")`;
      }
      if (Math.abs(curve) > .002 || Math.abs(impulse) > .002) frame = requestAnimationFrame(tick);
      else {
        impulse = curve = 0;
        media.forEach(item => { item.element.style.clipPath = item.previousClip; });
      }
    }
    function scroll() {
      const now = performance.now();
      const delta = window.scrollY - lastScroll;
      impulse = Math.max(-1.2, Math.min(1.2, delta / Math.max(16, now - lastTime) / 2));
      lastScroll = window.scrollY;
      lastTime = now;
      if (!frame && !preference.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    const onPreference = () => { if (preference.matches) reset(); else reveal(); };
    const onVisibility = () => { if (document.hidden) reset(); else { lastScroll = window.scrollY; lastTime = performance.now(); reveal(); } };
    window.addEventListener("scroll", scroll, { passive: true });
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      reset();
      headingObserver.disconnect();
      mediaObserver.disconnect();
      routeObserver.disconnect();
      window.removeEventListener("scroll", scroll);
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      svg.remove();
      originals.forEach(({ heading, nodes, label }) => {
        heading.replaceChildren(...nodes);
        if (label == null) heading.removeAttribute("aria-label");
        else heading.setAttribute("aria-label", label);
      });
    };
  }, [id]);

  return <article ref={root} className="project-page page-shell">{children}</article>;
}
