"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

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
  // Measure the original text flow. Wrapping each word in a span changes
  // kerning and the browser's `text-wrap: pretty` decisions.
  const text = document.createTextNode(block.text);
  block.element.replaceChildren(text);
  const range = document.createRange();
  const groups: { start: number; end: number }[] = [];
  let top = -Infinity;
  for (const word of block.text.matchAll(/\S+/g)) {
    range.setStart(text, word.index);
    range.setEnd(text, word.index + word[0].length);
    const position = range.getBoundingClientRect().top;
    if (Math.abs(position - top) > 2) {
      groups.push({ start: word.index, end: word.index + word[0].length });
      top = position;
    } else {
      groups[groups.length - 1].end = word.index + word[0].length;
    }
  }
  const fragment = document.createDocumentFragment();
  fragment.append(accessibleText(block.text));
  block.lines = groups.map(({ start, end }) => {
    const mask = document.createElement("span");
    mask.className = "case-line-window";
    mask.setAttribute("aria-hidden", "true");
    const line = document.createElement("span");
    line.className = "case-line";
    line.textContent = block.text.slice(start, end);
    mask.append(line);
    fragment.append(mask);
    return line;
  });
  block.element.replaceChildren(fragment);
}

export default function CaseStudyMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
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
    const pendingText = new Map<HTMLElement, string>();
    let textReady = false;
    type Artwork = { index: number; images: HTMLImageElement[]; overflow: string; clipPath: string; armed: boolean; ready: boolean; loading: boolean; wrappedImage?: HTMLImageElement };
    const media = new Map<HTMLElement, Artwork>();
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
    function releaseText(element: HTMLElement) {
      const opacity = pendingText.get(element);
      if (opacity === undefined) return;
      element.style.opacity = opacity;
      pendingText.delete(element);
    }
    function settle() {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      groups.clear();
      pendingText.forEach((_, element) => {
        releaseText(element);
        seen.add(element);
      });
      media.forEach((artwork, element) => {
        if (!artwork.armed) return;
        element.style.clipPath = artwork.clipPath;
        artwork.armed = false;
        seen.add(element);
      });
      [...jobs].forEach(finish => finish());
    }
    function scheduleReveal() {
      if (disposed || frame !== undefined) return;
      frame = requestAnimationFrame(() => { frame = undefined; reveal(); });
    }
    async function prepareArtwork(element: HTMLElement, artwork: Artwork) {
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
      // A slow or stalled image should load normally after the deadline,
      // rather than staying masked or starting a late, surprising wipe.
      if (!disposed && !artwork.ready) {
        element.style.clipPath = artwork.clipPath;
        artwork.armed = false;
        seen.add(element);
      }
      scheduleReveal();
    }
    function reveal() {
      if (disposed) return;
      const blocked = preference.matches || document.hidden || main?.getAttribute("aria-busy") === "true";
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 76;
      const bottom = window.innerHeight * 0.8;
      // Preserve unfinished artwork motion; interrupted text settles below.
      groups.forEach((group, element) => {
        const rect = element.getBoundingClientRect();
        const inView = rect.bottom > top && rect.top < window.innerHeight;
        group.forEach(animation => {
          // Text must never wait half-clipped when someone scrolls away.
          // Cancelling restores its visible default; artwork can resume later.
          if (!inView && !media.has(element)) {
            animation.cancel();
          } else if (blocked || !inView) {
            if (animation.playState === "running") animation.pause();
          } else if (animation.playState === "paused") animation.play();
        });
      });
      if (blocked) return;
      // If fonts are still loading, let newly visible copy appear normally.
      // It must never disappear again when line measurement becomes ready.
      if (!textReady) pendingText.forEach((_, element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > top) {
          releaseText(element);
          seen.add(element);
        }
      });
      // A fully clipped image can have an empty IntersectionObserver result.
      // Check its layout box directly so its own mask cannot block the trigger.
      for (const element of [...visible, ...media.keys()]) {
        if (seen.has(element)) continue;
        // A first-pixel intersection is too early. Require a useful portion of
        // the element inside the reading area, with a cap for tall artwork.
        const rect = element.getBoundingClientRect();
        const exposure = Math.min(rect.bottom, bottom) - Math.max(rect.top, top);
        const required = Math.min(rect.height * 0.4, Math.max(0, bottom - top) * 0.3);
        if (rect.width <= 0 || rect.height <= 0 || exposure < required || exposure <= 0) continue;
        const artwork = media.get(element);
        if (artwork && !artwork.ready) {
          if (!artwork.loading) void prepareArtwork(element, artwork);
          continue;
        }
        seen.add(element);
        // Restore visibility and install the backwards-filled entrance in one
        // task, so a fully visible text frame cannot precede the animation.
        releaseText(element);
        const block = blocks.find(block => block.element === element);
        if (block) block.lines.forEach((line, index) => animate(element, line, [
          { transform: "translateY(115%)" }, { transform: "translateY(0)" },
        ], 900, 100 + index * 80));
        const label = labels.get(element);
        if (label) label.characters.forEach((character, index) => animate(element, character, [
          { transform: "translateY(1.25em)" }, { transform: "translateY(0)" },
        ], 500, 100 + index * 20, "cubic-bezier(.625, .05, 0, 1)"));
        if (artwork) {
          const start = artwork.index % 2 === 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
          // Hand the pre-applied mask to WAAPI in the same frame. There is
          // never an unmasked frame between loading and the reveal delay.
          element.style.clipPath = artwork.clipPath;
          artwork.armed = false;
          animate(element, element, [{ clipPath: start }, { clipPath: "inset(0% 0% 0% 0%)" }], 1400, 160);
          artwork.images.forEach(image => animate(element, image, [{ transform: "scale(1.2)" }, { transform: "scale(1)" }], 1400, 160));
        }
      }
    }

    // Prepare text before paint too. Visible copy never restarts an entrance;
    // offscreen copy stays hidden through measurement and the trigger delay.
    article.querySelectorAll<HTMLElement>(`${textSelector}, ${labelSelector}`).forEach(element => {
      if (element.children.length > 0) return;
      const rect = element.getBoundingClientRect();
      if (!preference.matches && (rect.top >= window.innerHeight || main?.getAttribute("aria-busy") === "true")) {
        pendingText.set(element, element.style.opacity);
        element.style.opacity = "0";
      } else seen.add(element);
    });

    // Prepare artwork before paint, independently of font loading. Only hide
    // offscreen artwork (or artwork behind the navigation curtain); anything
    // already visible stays settled instead of disappearing after hydration.
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
      const clipPath = element.style.clipPath;
      element.style.overflow = "hidden";
      element.classList.add("case-media-mask");
      const images = [...element.querySelectorAll<HTMLImageElement>("img")];
      const rect = element.getBoundingClientRect();
      const armed = !preference.matches && (rect.top >= window.innerHeight || main?.getAttribute("aria-busy") === "true");
      if (armed) element.style.clipPath = index % 2 === 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
      else seen.add(element);
      media.set(element, { index, images, ready: images.every(image => image.complete), loading: false, overflow, clipPath, armed, wrappedImage });
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target as HTMLElement); else visible.delete(entry.target as HTMLElement); });
      scheduleReveal();
    }, { threshold: 0 });
    scheduleReveal();
    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (Math.abs(width - previousWidth) < 1) return;
      previousWidth = width;
      settle();
      blocks.forEach(splitLines);
      scheduleReveal();
    });
    resizeObserver.observe(article);

    void document.fonts.ready.then(() => {
      if (disposed) return;
      article.querySelectorAll<HTMLElement>(textSelector).forEach(element => {
        if (element.children.length > 0) return;
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
      textReady = true;
      [...blocks.map(block => block.element), ...labels.keys()].forEach(element => observer?.observe(element));
      scheduleReveal();
    });
    const routeObserver = new MutationObserver(scheduleReveal);
    if (main) routeObserver.observe(main, { attributes: true, attributeFilter: ["aria-busy"] });
    const onPreference = () => { if (preference.matches) settle(); scheduleReveal(); };
    // Settle text and pause artwork immediately; requestAnimationFrame stops in a
    // background tab, so waiting for its next callback would be too late.
    const onVisibility = () => {
      if (document.hidden) groups.forEach((group, element) => group.forEach(animation => {
        if (media.has(element)) animation.pause();
        else animation.cancel();
      }));
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
