"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { usePageTransition } from "@/components/PageTransition";
import type { RipplePoint } from "@/lib/project-ripple";

export default function ProjectLink({ href, title, className, children }: { href: string; title: string; className: string; children: ReactNode }) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const point = useRef<RipplePoint | undefined>(undefined);
  const transitionTo = usePageTransition();
  const preload = () => { void import("@/lib/project-transition").catch(() => {}); };

  return (
    <Link ref={anchor} href={href} className={className} onPointerEnter={preload} onFocus={preload}
      onClick={event => { point.current = event.detail ? { x: event.clientX, y: event.clientY } : undefined; }}
      onNavigate={event => {
        const source = anchor.current?.querySelector<HTMLElement>(".work-image, .home-project-image");
        if (source && transitionTo(href, title, { source, point: point.current })) event.preventDefault();
      }}>
      {children}
    </Link>
  );
}
