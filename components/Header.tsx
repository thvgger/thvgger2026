"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogoStatic } from "@/components/InteractiveCubeLogo";
import UnderlineLink from "@/components/UnderlineLink";
import RollingText from "@/components/RollingText";

const links = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Playground", href: "/playground" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const element = header.current;
    if (!element) return;

    // Clamp Safari's overscroll so rubber-banding cannot reverse the direction.
    const scrollPosition = () => Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
    let checkpoint = scrollPosition();
    let frame = 0;
    element.dataset.navigation = "visible";

    function reveal() {
      if (element!.dataset.navigation !== "visible") element!.dataset.navigation = "visible";
      checkpoint = scrollPosition();
    }

    function update() {
      frame = 0;
      const position = scrollPosition();
      if (position <= 32 || menu.current?.open || element!.querySelector(":focus-visible")) {
        reveal();
        return;
      }

      const distance = position - checkpoint;
      if (Math.abs(distance) < 8) return;
      checkpoint = position;
      const navigation = distance > 0 && position > element!.offsetHeight ? "hidden" : "visible";
      if (element!.dataset.navigation !== navigation) element!.dataset.navigation = navigation;
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", reveal);
    element.addEventListener("focusin", reveal);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", reveal);
      element.removeEventListener("focusin", reveal);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header ref={header} className="site-header">
      <Link href="/" className="home-link" aria-label="Thvgger home">
        <LogoStatic className="header-mark" title="Thvgger" />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(link => (
          <UnderlineLink key={link.href} href={link.href} className="nav-link" aria-current={isCurrent(link.href) ? "page" : undefined}>
            {link.label}
          </UnderlineLink>
        ))}
      </nav>
      <button className="menu-trigger" onClick={() => menu.current?.showModal()} aria-haspopup="dialog" aria-controls="mobile-menu">
        <RollingText text="Menu" />
      </button>
      <dialog ref={menu} id="mobile-menu" className="mobile-menu" aria-label="Navigation">
        <div className="menu-top">
          <UnderlineLink href="/" onClick={() => menu.current?.close()}>Thvgger</UnderlineLink>
          <button className="plain-button kinetic-control" onClick={() => menu.current?.close()} autoFocus><RollingText text="Close" /></button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map(link => (
            <UnderlineLink key={link.href} href={link.href} onClick={() => menu.current?.close()} aria-current={isCurrent(link.href) ? "page" : undefined}>
              {link.label}
            </UnderlineLink>
          ))}
        </nav>
      </dialog>
    </header>
  );
}
