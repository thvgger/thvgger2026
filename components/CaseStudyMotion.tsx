"use client";

import { useEffect, useRef, type ReactNode } from "react";

const ease = "cubic-bezier(.22, .61, .36, 1)";
const textSelector = "h1, h2, .project-summary, .identity-intro-copy p, .identity-chapter-heading p";
const labelSelector = ".project-kind, .project-facts dt, .identity-contents > span";
const mediaSelector = ".project-cover, .gallery-image, .identity-family, .identity-display, .identity-board, .identity-colour-treatment, .identity-poster-board, .identity-placement-board, .identity-clear-board, .storefront-logo-board, .storefront-mobile-board, .storefront-collection-crop, .storefront-screen > img";
type TextBlock = { element: HTMLElement; nodes: ChildNode[]; text: string; lines: HTMLElement[] };

function accessibleText(text: string) {
  const span = document.createElement("span");
  span.className = "case-accessible-text";
  span.textContent = text;
  return span;
}

function splitLines(block: TextBlock) {
  const words = (block.text.match(/\S+\s*/g) ?? []).map(text => {
    const span = document.createElement("span");
    span.textContent = text.trimEnd();
    return span;
  });
  const measurement = document.createDocumentFragment();
  words.forEach((word, index) => { measurement.append(word); if (index < words.length - 1) measurement.append(" "); });
  block.element.replaceChildren(measurement);
  // Measure the browser's actual line breaks at the current font and responsive width.
  const positions = words.map(word => word.getBoundingClientRect().top);
  const groups: string[][] = [];
  let top = -Infinity;
  words.forEach((word, index) => {
    if (Math.abs(positions[index] - top) > 2) { groups.push([]); top = positions[index]; }
    groups[groups.length - 1].push(word.textContent ?? "");
  });
  const fragment = document.createDocumentFragment();
  fragment.append(accessibleText(block.text));
  block.lines = groups.map(words => {
    const mask = document.createElement("span");
    mask.className = "case-line-window";
    mask.setAttribute("aria-hidden", "true");
    const line = document.createElement("span");
    line.className = "case-line";
    line.textContent = words.join(" ");
    mask.append(line);
    fragment.append(mask);
    return line;
  });
  block.element.replaceChildren(fragment);
}

export default function CaseStudyMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const article = root.current;
    if (!article) return;
    let disposed = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const main = document.getElementById("main");
    const animations = new Set<Animation>();
    const groups = new Map<HTMLElement, Set<Animation>>();
    const jobs = new Set<() => void>();
    const seen = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const blocks: TextBlock[] = [];
    const labels = new Map<HTMLElement, { nodes: ChildNode[]; characters: HTMLElement[] }>();
    type Artwork = { index: number; images: HTMLImageElement[]; overflow: string; ready: boolean; loading: boolean; wrappedImage?: HTMLImageElement };
    const media = new Map<HTMLElement, Artwork>();
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let previousWidth = article.getBoundingClientRect().width;
    let frame: number | undefined;

    function animate(owner: HTMLElement, element: HTMLElement, frames: Keyframe[], duration: number, delay = 0, easing = ease) {
      const animation = element.animate(frames, { duration, delay, easing, fill: "backwards" });
      animations.add(animation);
      const group = groups.get(owner) ?? new Set<Animation>();
      groups.set(owner, group);
      group.add(animation);
      void animation.finished.catch(() => {}).finally(() => {
        animations.delete(animation);
        group.delete(animation);
        if (groups.get(owner) === group && group.size === 0) groups.delete(owner);
      });
    }
    function settle() {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      groups.clear();
      [...jobs].forEach(finish => finish());
    }
    function scheduleReveal() {
      if (disposed || frame !== undefined) return;
      frame = requestAnimationFrame(() => { frame = undefined; reveal(); });
    }
    async function prepareArtwork(artwork: Artwork) {
      artwork.loading = true;
      await Promise.all(artwork.images.map(image => {
        if (image.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          const finish = () => {
            clearTimeout(timeout);
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
            jobs.delete(finish);
            resolve();
          };
          const timeout = setTimeout(finish, 2500);
          jobs.add(finish);
          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
        });
      }));
      artwork.loading = false;
      artwork.ready = artwork.images.every(image => image.complete);
      scheduleReveal();
    }
    function reveal() {
      if (disposed) return;
      const blocked = preference.matches || document.hidden || main?.getAttribute("aria-busy") === "true";
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 76;
      const bottom = window.innerHeight * 0.8;
      // Keep the remaining motion for the next time the visitor can see it.
      groups.forEach((group, element) => {
        const rect = element.getBoundingClientRect();
        const inView = rect.bottom > top && rect.top < window.innerHeight;
        group.forEach(animation => {
          if (blocked || !inView) {
            if (animation.playState === "running") animation.pause();
          } else if (animation.playState === "paused") animation.play();
        });
      });
      if (blocked) return;
      for (const element of visible) {
        if (seen.has(element)) continue;
        // A first-pixel intersection is too early. Require a useful portion of
        // the element inside the reading area, with a cap for tall artwork.
        const rect = element.getBoundingClientRect();
        const exposure = Math.min(rect.bottom, bottom) - Math.max(rect.top, top);
        const required = Math.min(rect.height * 0.4, Math.max(0, bottom - top) * 0.3);
        if (rect.width <= 0 || rect.height <= 0 || exposure < required || exposure <= 0) continue;
        const artwork = media.get(element);
        if (artwork && !artwork.ready) {
          if (!artwork.loading) void prepareArtwork(artwork);
          continue;
        }
        seen.add(element);
        const block = blocks.find(block => block.element === element);
        if (block) block.lines.forEach((line, index) => animate(element, line, [
          { transform: "translateY(115%)" }, { transform: "translateY(0)" },
        ], 900, 100 + index * 80));
        const label = labels.get(element);
        if (label) label.characters.forEach((character, index) => animate(element, character, [
          { transform: "translateY(0)" }, { transform: "translateY(-1.25em)" },
        ], 500, 100 + index * 20, "cubic-bezier(.625, .05, 0, 1)"));
        if (artwork) {
          const start = artwork.index % 2 === 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
          animate(element, element, [{ clipPath: start }, { clipPath: "inset(0% 0% 0% 0%)" }], 1400, 160);
          artwork.images.forEach(image => animate(element, image, [{ transform: "scale(1.2)" }, { transform: "scale(1)" }], 1400, 160));
        }
      }
    }

    void document.fonts.ready.then(() => {
      if (disposed) return;
      article.querySelectorAll<HTMLElement>(textSelector).forEach(element => {
        if (element.querySelector("a, button")) return;
        const block = { element, nodes: [...element.childNodes], text: element.textContent ?? "", lines: [] };
        blocks.push(block);
        splitLines(block);
      });
      article.querySelectorAll<HTMLElement>(labelSelector).forEach(element => {
        const text = element.textContent ?? "";
        const nodes = [...element.childNodes];
        const visual = document.createElement("span");
        visual.setAttribute("aria-hidden", "true");
        visual.className = "rolling-text case-label-roll";
        const characters: HTMLElement[] = [];
        Array.from(text).forEach(character => {
          if (/\s/.test(character)) { visual.append(character); return; }
          const span = document.createElement("span");
          span.className = "rolling-char";
          span.style.setProperty("--char-index", String(characters.length));
          span.textContent = character;
          characters.push(span);
          visual.append(span);
        });
        element.replaceChildren(accessibleText(text), visual);
        labels.set(element, { nodes, characters });
      });
      article.querySelectorAll<HTMLElement>(mediaSelector).forEach((source, index) => {
        let element = source;
        let wrappedImage: HTMLImageElement | undefined;
        if (source instanceof HTMLImageElement) {
          wrappedImage = source;
          element = document.createElement("div");
          source.before(element);
          element.append(source);
        }
        const overflow = element.style.overflow;
        element.style.overflow = "hidden";
        element.classList.add("case-media-mask");
        const images = [...element.querySelectorAll<HTMLImageElement>("img")];
        media.set(element, { index, images, ready: images.every(image => image.complete), loading: false, overflow, wrappedImage });
      });
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target as HTMLElement); else visible.delete(entry.target as HTMLElement); });
        scheduleReveal();
      }, { threshold: 0 });
      [...blocks.map(block => block.element), ...labels.keys(), ...media.keys()].forEach(element => observer?.observe(element));
      resizeObserver = new ResizeObserver(entries => {
        const width = entries[0].contentRect.width;
        if (Math.abs(width - previousWidth) < 1) return;
        previousWidth = width;
        settle();
        blocks.forEach(splitLines);
        scheduleReveal();
      });
      resizeObserver.observe(article);
    });
    const routeObserver = new MutationObserver(scheduleReveal);
    if (main) routeObserver.observe(main, { attributes: true, attributeFilter: ["aria-busy"] });
    const onPreference = () => { if (preference.matches) settle(); scheduleReveal(); };
    // Pause immediately when hidden; requestAnimationFrame itself stops in a
    // background tab, so waiting for its next callback would be too late.
    const onVisibility = () => {
      if (document.hidden) animations.forEach(animation => animation.pause());
      else scheduleReveal();
    };
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", scheduleReveal, { passive: true });
    window.addEventListener("resize", scheduleReveal);
    return () => {
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      settle();
      observer?.disconnect();
      resizeObserver?.disconnect();
      routeObserver.disconnect();
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", scheduleReveal);
      window.removeEventListener("resize", scheduleReveal);
      blocks.forEach(({ element, nodes }) => element.replaceChildren(...nodes));
      labels.forEach(({ nodes }, element) => element.replaceChildren(...nodes));
      media.forEach(({ overflow, wrappedImage }, element) => {
        element.style.overflow = overflow;
        element.classList.remove("case-media-mask");
        if (wrappedImage) element.replaceWith(wrappedImage);
      });
    };
  }, []);
  return <article ref={root} className="project-page page-shell">{children}</article>;
}
