"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function HeroIntro({ children }: { children: ReactNode }) {
  const hero = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = hero.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    element.dataset.motion = "gsap";
    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out" },
      onComplete: () => { element.dataset.intro = "complete"; },
    });

    function finish() {
      timeline.progress(1).pause();
      element!.dataset.intro = "complete";
    }
    const onVisibility = () => { if (document.hidden) finish(); };

    if (preference.matches || window.scrollY > 24 || window.location.hash || document.hidden) {
      finish();
    } else {
      const stage = element.querySelector<HTMLElement>(".hero-mark-stage")!;
      const wordmark = element.querySelector<HTMLElement>(".home-wordmark")!;
      const scale = parseFloat(getComputedStyle(element).getPropertyValue("--intro-scale")) || 3;
      timeline
        .fromTo(stage, { scale }, { scale: 1, duration: .62 }, .4)
        .fromTo(wordmark, { x: (wordmark.offsetWidth - stage.offsetWidth) / 2 }, { x: 0, duration: .66 }, .88)
        .fromTo(".hero-name-window h1", { xPercent: 104 }, { xPercent: 0, duration: .66 }, .88)
        .fromTo(".hero-introduction", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .4 }, 1.3)
        .fromTo(".home-scroll-link", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .4 }, 1.46)
        .play();
    }

    const inputs = ["wheel", "touchstart", "pointerdown", "keydown", "scroll", "resize"] as const;
    inputs.forEach(type => window.addEventListener(type, finish, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", finish);
    return () => {
      inputs.forEach(type => window.removeEventListener(type, finish));
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", finish);
      delete element.dataset.motion;
      delete element.dataset.intro;
    };
  }, { scope: hero });

  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;
    const revealTimer = setTimeout(() => {
      element.dataset.cubeHint = "visible";
      dismissTimer = setTimeout(dismiss, 4000);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1900);

    function dismiss() {
      clearTimeout(revealTimer);
      clearTimeout(dismissTimer);
      element!.dataset.cubeHint = "dismissed";
    }
    function onInteraction(event: Event) {
      if (event.target instanceof Element && event.target.closest(".hero-mark")) dismiss();
    }
    element.addEventListener("pointerdown", onInteraction);
    element.addEventListener("keydown", onInteraction);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(dismissTimer);
      element.removeEventListener("pointerdown", onInteraction);
      element.removeEventListener("keydown", onInteraction);
    };
  }, []);

  return <section ref={hero} className="home-hero" aria-labelledby="home-title">{children}</section>;
}
