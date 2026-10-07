"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
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
  const menu = useRef<HTMLDialogElement>(null);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
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
