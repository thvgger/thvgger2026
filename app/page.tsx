"use client";

import { useState } from "react";
import Image from "next/image";

type SectionKey =
  | "music"
  | "tour"
  | "about"
  | "journey"
  | "gallery"
  | "news"
  | "contact"
  | "store"
  | null;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; key: SectionKey }[] = [
    { label: "Music", key: "music" },
    { label: "Tour", key: "tour" },
    { label: "About", key: "about" },
    { label: "Journey", key: "journey" },
    { label: "Gallery", key: "gallery" },
    { label: "News", key: "news" },
    { label: "Contact", key: "contact" },
    { label: "Store", key: "store" },
  ];

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-white text-black overflow-hidden select-none">
      {/* 1. MAIN HEADER (Figma #30:333 & #24:6) */}
      <header className="relative z-20 w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-6 pb-4">
        {/* Top-Left Monogram Logo (74x74 in Figma) */}
        <div className="group flex items-center gap-2 cursor-pointer">
          <div className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] lg:w-[74px] lg:h-[74px] transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/header-icon.svg"
              alt="Thvgger Logo"
              width={74}
              height={74}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-[36px]">
          {navLinks.map((item) => (
            <button
              key={item.key}
              className="text-[12px] font-semibold tracking-[-0.01em] text-black hover:opacity-50 transition-opacity cursor-pointer focus:outline-none"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[12px] font-semibold tracking-wider uppercase px-2 py-1 border border-black/20 rounded"
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
            className="absolute top-6 right-6 text-sm font-semibold p-2"
          >
            ✕ Close
          </button>
          <nav className="flex flex-col items-center gap-6 text-center">
            {navLinks.map((item) => (
              <button
                key={item.key}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-medium text-black hover:opacity-50 transition-opacity"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Hero Placeholder */}
      <main className="relative flex-1 flex items-center justify-center w-full px-4 py-6">
        <h1 className="text-5xl sm:text-7xl font-medium tracking-tight">Thvgger</h1>
      </main>

      {/* Footer Placeholder */}
      <footer className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-4 pb-6 text-xs text-gray-500">
        <span>Now playing</span>
        <span>Sound OFF</span>
      </footer>
    </div>
  );
}
