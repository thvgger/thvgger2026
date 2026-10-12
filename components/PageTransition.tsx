"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogoStatic } from "@/components/InteractiveCubeLogo";
import type { ProjectTransitionSource, createProjectTransition } from "@/lib/project-transition";

const NavigationContext = createContext<(href: string, label: string, project?: ProjectTransitionSource) => boolean>(() => false);
const ease = "cubic-bezier(.76, 0, .24, 1)";

export const usePageTransition = () => useContext(NavigationContext);

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const projectOverlay = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const animations = useRef<Animation[]>([]);
  const pending = useRef<{ href: string; resolve: () => void } | null>(null);
  const restore = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (pending.current?.href === pathname) pending.current.resolve();
  }, [pathname]);

  useEffect(() => {
    mounted.current = true;
    const finishMotion = () => animations.current.forEach(animation => {
      if (animation.playState !== "finished") animation.finish();
    });
    const onVisibility = () => { if (document.hidden) finishMotion(); };
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (preference.matches) finishMotion(); };
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    return () => {
      mounted.current = false;
      pending.current?.resolve();
      animations.current.forEach(animation => animation.cancel());
      restore.current?.();
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onPreference);
    };
  }, []);

  const navigate = useCallback((href: string, title: string, project?: ProjectTransitionSource) => {
    if (busy.current) return true;
    if (href === pathname || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return false;
    const panel = project ? projectOverlay.current : overlay.current;
    const heading = label.current;
    if (!panel || !heading) return false;

    busy.current = true;
    const started = performance.now();
    const keyboard = document.activeElement?.matches(":focus-visible") ?? false;
    const main = document.getElementById("main");
    const regions = [...document.querySelectorAll<HTMLElement>(".site-header, .site-main, .site-footer")];
    const previousInert = regions.map(region => region.inert);
    const previousOverflow = document.documentElement.style.overflow;
    const previousBusy = main?.getAttribute("aria-busy");
    document.documentElement.style.overflow = "hidden";
    regions.forEach(region => { region.inert = true; });
    main?.setAttribute("aria-busy", "true");
    panel.dataset.active = "true";
    restore.current = () => {
      document.documentElement.style.overflow = previousOverflow;
      regions.forEach((region, index) => { region.inert = previousInert[index]; });
      if (previousBusy == null) main?.removeAttribute("aria-busy");
      else main?.setAttribute("aria-busy", previousBusy);
      delete panel.dataset.active;
    };

    // This decorative label is owned by the animation, without duplicating page headings.
    const letters = Array.from(project ? "" : title).map(character => {
      const clip = document.createElement("span");
      clip.className = "page-transition-clip";
      const letter = document.createElement("span");
      letter.className = "page-transition-letter";
      letter.textContent = character;
      clip.append(letter);
      return clip;
    });
    heading.replaceChildren(...letters);
    const bars = [...panel.querySelectorAll<HTMLElement>(".page-transition-bar")];
    const glyphs = [...heading.querySelectorAll<HTMLElement>(".page-transition-letter")];
    const identity = panel.querySelector<HTMLElement>(".page-transition-identity")!;
    const rule = panel.querySelector<HTMLElement>(".page-transition-rule")!;
    const animate = (element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const skip = document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animation = element.animate(frames, { easing: ease, fill: "both", ...options, ...(skip ? { duration: 0, delay: 0 } : {}) });
      animations.current.push(animation);
      return animation;
    };
    const finished = (animation: Animation) => animation.finished.catch(() => {});
    void (async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let projectScene: ReturnType<typeof createProjectTransition> | undefined;
      try {
        router.prefetch(href);
        let titleEntrance: Animation[] = [];
        if (project) {
          const { createProjectTransition } = await import("@/lib/project-transition");
          if (!mounted.current) return;
          projectScene = createProjectTransition(panel, title, project, animate);
          await projectScene.cover();
        } else {
          const cover = bars.map((bar, index) => animate(bar, [
            { transform: "translateY(101%)" }, { transform: "translateY(0)" },
          ], { duration: 360, delay: index * 35 }));
          titleEntrance = glyphs.map((glyph, index) => animate(glyph, [
            { transform: "translateY(110%)" }, { transform: "translateY(0)" },
          ], { duration: 420, delay: 140 + index * 16 }));
          animate(identity, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 240 });
          animate(rule, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 440, delay: 200 });
          await finished(cover[cover.length - 1]);
        }
        if (!mounted.current) return;

        const committed = new Promise<void>(resolve => {
          pending.current = { href, resolve };
          // Release the screen even if a route fails or takes unusually long to load.
          timeout = setTimeout(resolve, 6000);
        });
        router.push(href);
        await committed;
        clearTimeout(timeout);
        if (!mounted.current) return;
        if (projectScene) {
          await projectScene.reveal();
        } else {
          await Promise.all(titleEntrance.map(finished));
          await new Promise(resolve => setTimeout(resolve, Math.max(0, 660 - (performance.now() - started))));
          if (!mounted.current) return;

          // Keep the destination name settled until the entire curtain clears.
          animate(identity, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
          animate(rule, [{ transform: "scaleX(1)", transformOrigin: "right" }, { transform: "scaleX(0)", transformOrigin: "right" }], { duration: 260 });
          const reveal = bars.map((bar, index) => animate(bar, [
            { transform: "translateY(0)" }, { transform: "translateY(-101%)" },
          ], { duration: 440, delay: 60 + index * 30 }));
          await finished(reveal[reveal.length - 1]);
        }
      } catch {
        if (mounted.current && window.location.pathname !== href) router.push(href);
      } finally {
        clearTimeout(timeout);
        projectScene?.cleanup();
        restore.current?.();
        restore.current = null;
        animations.current.forEach(animation => animation.cancel());
        animations.current = [];
        pending.current = null;
        busy.current = false;
        if (mounted.current && keyboard) main?.focus({ preventScroll: true });
      }
    })();
    return true;
  }, [pathname, router]);

  return (
    <NavigationContext.Provider value={navigate}>
      {children}
      <div ref={overlay} className="page-transition" aria-hidden="true">
        <div className="page-transition-bars">{Array.from({ length: 5 }, (_, index) => <div key={index} className="page-transition-bar" />)}</div>
        <div className="page-transition-identity"><LogoStatic className="page-transition-mark" /><span>Thvgger</span></div>
        <div className="page-transition-caption"><div ref={label} className="page-transition-label" /><div className="page-transition-rule" /></div>
      </div>
      <div ref={projectOverlay} className="project-transition" aria-hidden="true" />
    </NavigationContext.Provider>
  );
}
