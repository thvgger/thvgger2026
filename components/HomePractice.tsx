"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

export default function HomePractice({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);

  useGSAP((_, contextSafe) => {
    const element = section.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let entrance: gsap.core.Timeline | undefined;
    let disposed = false;
    const prepare = contextSafe!(() => {
      // Restored scroll positions should never hide content already being read.
      if (entrance || preference.matches || element.getBoundingClientRect().top < window.innerHeight * .78) return;
      entrance = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: element, start: "clamp(top 78%)", once: true },
      })
        .from(".practice-word", { yPercent: 110, duration: .8, stagger: .065, clearProps: "transform" })
        .from(".home-about-copy > *", { y: 18, autoAlpha: 0, duration: .65, stagger: .1, clearProps: "transform,opacity,visibility" }, .18);
    });
    const onPreference = () => {
      if (preference.matches) {
        entrance?.progress(1).pause();
        entrance?.scrollTrigger?.kill();
      } else prepare();
    };
    prepare();
    preference.addEventListener("change", onPreference);
    void document.fonts.ready.then(() => { if (!disposed) entrance?.scrollTrigger?.refresh(); });
    return () => {
      disposed = true;
      preference.removeEventListener("change", onPreference);
    };
  }, { scope: section });

  return <section id="a-little-about-me" ref={section} className="home-practice" aria-labelledby="home-about-title">{children}</section>;
}

export function CapabilityDetail({ title, children, initiallyOpen = false }: {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const detail = useRef<HTMLDetailsElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const targetOpen = useRef(initiallyOpen);

  const { contextSafe } = useGSAP(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (animation.current) animation.current.progress(1);
    };
    const onPreference = () => { if (preference.matches) settle(); };
    preference.addEventListener("change", onPreference);
    window.addEventListener("resize", settle);
    return () => {
      animation.current?.kill();
      preference.removeEventListener("change", onPreference);
      window.removeEventListener("resize", settle);
    };
  }, { scope: detail });

  function toggle(event: MouseEvent<HTMLElement>) {
    contextSafe(() => {
      const element = detail.current;
      const body = content.current;
      if (!element || !body) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animation.current?.kill();
        animation.current = null;
        element.style.height = "";
        element.style.overflow = "";
        delete element.dataset.expanded;
        targetOpen.current = !element.open;
        return;
      }

      event.preventDefault();
      const start = element.getBoundingClientRect().height;
      const opening = animation.current ? !targetOpen.current : !element.open;
      targetOpen.current = opening;
      animation.current?.kill();
      element.style.height = `${start}px`;
      element.style.overflow = "hidden";
      if (opening) element.open = true;
      element.dataset.expanded = String(opening);
      const summary = element.querySelector("summary")!;
      const end = summary.getBoundingClientRect().height + (opening ? body.scrollHeight : 0) + 1;
      animation.current = gsap.to(element, {
        height: end,
        duration: .36,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          element.open = opening;
          element.style.height = "";
          element.style.overflow = "";
          delete element.dataset.expanded;
          animation.current = null;
        },
      });
    })();
  }

  return (
    <details ref={detail} className="capability-detail" open={initiallyOpen}>
      <summary onClick={toggle}>{title}<span className="capability-toggle" aria-hidden="true">+</span></summary>
      <div ref={content} className="capability-body">{children}</div>
    </details>
  );
}
