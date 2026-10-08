"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

export default function HomePractice({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        element.dataset.arrived = "true";
        observer.disconnect();
      }
    }, { threshold: .15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section id="a-little-about-me" ref={section} className="home-practice" aria-labelledby="home-about-title">{children}</section>;
}

export function CapabilityDetail({ title, children, initiallyOpen = false }: {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const detail = useRef<HTMLDetailsElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const targetOpen = useRef(initiallyOpen);

  useEffect(() => () => animation.current?.cancel(), []);

  function toggle(event: MouseEvent<HTMLElement>) {
    const element = detail.current;
    const body = content.current;
    if (!element || !body) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation.current?.cancel();
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
    animation.current?.cancel();
    element.style.height = `${start}px`;
    element.style.overflow = "hidden";
    if (opening) element.open = true;
    element.dataset.expanded = String(opening);
    const summary = element.querySelector("summary")!;
    const end = summary.getBoundingClientRect().height + (opening ? body.scrollHeight : 0) + 1;
    const transition = element.animate({ height: [`${start}px`, `${end}px`] }, {
      duration: 300,
      easing: "cubic-bezier(.22, 1, .36, 1)",
    });
    animation.current = transition;
    transition.onfinish = () => {
      element.open = opening;
      element.style.height = "";
      element.style.overflow = "";
      delete element.dataset.expanded;
      animation.current = null;
    };
  }

  return (
    <details ref={detail} className="capability-detail" open={initiallyOpen}>
      <summary onClick={toggle}>{title}<span className="capability-toggle" aria-hidden="true">+</span></summary>
      <div ref={content} className="capability-body"><p>{children}</p></div>
    </details>
  );
}
