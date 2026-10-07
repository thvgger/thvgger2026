"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HeroIntro({ children }: { children: ReactNode }) {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = hero.current;
    if (!element) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fallback = setTimeout(finish, 2600);

    function detach() {
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("scroll", finish);
      window.removeEventListener("resize", finish);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      preference.removeEventListener("change", finish);
      element?.removeEventListener("animationend", onAnimationEnd);
      clearTimeout(fallback);
    }

    function finish() {
      if (element) element.dataset.intro = "complete";
      detach();
    }

    function onVisibilityChange() {
      if (document.hidden) finish();
    }

    function onAnimationEnd(event: AnimationEvent) {
      if (event.target instanceof Element && event.target.classList.contains("home-scroll-link")) finish();
    }

    if (preference.matches || window.scrollY > 24 || window.location.hash || document.hidden) {
      finish();
      return detach;
    }

    // CSS owns the choreography. Input simply settles it, without intercepting
    // wheel, touch, keyboard, or navigation and without changing document flow.
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchstart", finish, { passive: true });
    window.addEventListener("pointerdown", finish, { passive: true });
    window.addEventListener("keydown", finish);
    window.addEventListener("scroll", finish, { passive: true });
    window.addEventListener("resize", finish);
    document.addEventListener("visibilitychange", onVisibilityChange);
    preference.addEventListener("change", finish);
    element.addEventListener("animationend", onAnimationEnd);

    return detach;
  }, []);

  return <section ref={hero} className="home-hero" aria-labelledby="home-title">{children}</section>;
}
