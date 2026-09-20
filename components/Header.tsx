"use client";

import React, { useState } from "react";
import InteractiveCubeLogo from "@/components/InteractiveCubeLogo";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const NAV_LINKS: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Playground", href: "#playground" },
  { label: "Contact", href: "#contact" },
];

export interface HeaderProps {
  introPhase: "spinning" | "shrinking" | "pushing" | "complete";
  periodicSpin?: number;
  onReplayIntro?: () => void;
  links?: NavItem[];
  className?: string;
}

export default function Header({
  introPhase,
  periodicSpin = 0,
  onReplayIntro,
  links = NAV_LINKS,
  className = "",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={`relative z-20 w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 py-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          introPhase === "complete"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        } ${className}`.trim()}
      >
        {/* Top-Left Interactive 3D Cube Logo */}
        <InteractiveCubeLogo
          className="w-[25px] h-[25px] sm:w-[29px] sm:h-[29px] lg:w-[33px] lg:h-[33px] flex-shrink-0 cursor-pointer"
          onClick={onReplayIntro}
          spinTrigger={periodicSpin}
          title="Click to replay intro or spin 3D cube"
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-[36px]">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="group relative inline-flex items-center gap-1 py-1 text-[12px] font-semibold tracking-[-0.01em] text-black cursor-pointer focus:outline-none"
            >
              {/* Text with micro-lift on hover */}
              <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[1.5px]">
                {item.label}
              </span>

              {/* External link indicator with diagonal glide */}
              {item.external && (
                <span
                  aria-hidden="true"
                  className="inline-block text-[10px] opacity-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  ↗
                </span>
              )}

              {/* Smooth expanding underline */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black scale-x-0 origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[12px] font-semibold tracking-wider uppercase px-2.5 py-1 border border-black/20 rounded cursor-pointer transition-all duration-200 hover:border-black hover:bg-black hover:text-white active:scale-95"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-sm font-semibold p-2 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-90"
            aria-label="Close menu"
          >
            ✕ Close
          </button>
          <nav className="flex flex-col items-center gap-6 text-center">
            {links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="group relative inline-flex items-center gap-2 text-2xl font-medium text-black cursor-pointer"
              >
                <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  {item.label}
                </span>
                {item.external && (
                  <span
                    aria-hidden="true"
                    className="text-base opacity-40 transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-1"
                  >
                    ↗
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 w-full h-[2px] bg-black scale-x-0 origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
