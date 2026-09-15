"use client";

import { useState, useEffect } from "react";
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
  const [introPhase, setIntroPhase] = useState<"initial" | "morphing" | "complete">("initial");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIntroPhase("morphing");
    }, 850);

    const timer2 = setTimeout(() => {
      setIntroPhase("complete");
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const replayIntro = () => {
    setIntroPhase("initial");
    setTimeout(() => {
      setIntroPhase("morphing");
    }, 850);
    setTimeout(() => {
      setIntroPhase("complete");
    }, 1900);
  };

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
      <header
        className={`relative z-20 w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-6 pb-4 transition-opacity duration-1000 ${
          introPhase === "complete" ? "opacity-100" : "opacity-10 pointer-events-none"
        }`}
      >
        {/* Top-Left Monogram Logo (74x74 in Figma) */}
        <button
          onClick={replayIntro}
          title="Replay intro animation"
          className="group flex items-center gap-2 cursor-pointer focus:outline-none"
        >
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
        </button>

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

      {/* 2. HERO SECTION (Figma #30:354 & #30:378) */}
      <main className="relative flex-1 flex items-center justify-center w-full px-4 py-6">
        {/* Animated Hero State: Big Centered Logo overlay during intro */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            introPhase === "initial"
              ? "opacity-100 scale-100"
              : introPhase === "morphing"
              ? "opacity-0 scale-50 -translate-x-24"
              : "opacity-0 pointer-events-none hidden"
          }`}
        >
          <div className="w-[280px] h-[318px] sm:w-[340px] sm:h-[386px] md:w-[400px] md:h-[454px]">
            <Image
              src="/images/logo-hero.svg"
              alt="Thvgger Centered Mark"
              width={400}
              height={454}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Wordmark Container ("Huge Centered Wordmark with Embedded Monochrome Image") */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 lg:gap-[10px] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            introPhase === "complete"
              ? "opacity-100 translate-y-0 scale-100"
              : introPhase === "morphing"
              ? "opacity-80 translate-y-2 scale-95"
              : "opacity-0 translate-y-6 scale-90"
          }`}
        >
          {/* Isometric Logo embedded in the wordmark (84x95.34 in Figma) */}
          <div
            onClick={replayIntro}
            title="Click to replay intro"
            className="cursor-pointer w-[44px] h-[50px] sm:w-[62px] sm:h-[70px] md:w-[76px] md:h-[86px] lg:w-[84px] lg:h-[95.34px] flex-shrink-0 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/images/logo-static.svg"
              alt="Thvgger Logo"
              width={84}
              height={96}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* "Thvgger" Typography (Inter Medium 128px, -0.0559em tracking, 110px line-height) */}
          <h1 className="text-[52px] sm:text-[80px] md:text-[104px] lg:text-[128px] font-medium leading-[0.86] tracking-[-0.0559em] text-black">
            Thvgger
          </h1>
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-4 pb-6 text-xs text-gray-500">
        <span>Now playing</span>
        <span>Sound OFF</span>
      </footer>
    </div>
  );
}
