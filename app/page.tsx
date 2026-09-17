"use client";

import { useState, useEffect, useRef, useId } from "react";
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
  const [soundOn, setSoundOn] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Web Audio Context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    gainNode: GainNode;
    timerId: number | null;
  } | null>(null);

  // Intro animation sequence
  useEffect(() => {
    // Phase 1: Wait with big centered logo for 800ms
    const timer1 = setTimeout(() => {
      setIntroPhase("morphing");
    }, 850);

    // Phase 2: Complete the morph and reveal all elements at ~1900ms
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

  // Web Audio Synthesizer (Ambient Electronic Minimal Track)
  const toggleSound = () => {
    if (soundOn) {
      // Stop sound
      if (audioNodesRef.current) {
        const { gainNode, timerId } = audioNodesRef.current;
        if (timerId) window.clearInterval(timerId);
        gainNode.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1);
        setTimeout(() => {
          audioNodesRef.current = null;
        }, 200);
      }
      setSoundOn(false);
    } else {
      // Start ambient minimal soundscape
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = audioContextRef.current || new AudioCtx();
        audioContextRef.current = ctx;

        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 1.2);
        masterGain.connect(ctx.destination);

        // Ambient chord pad
        const chordFrequencies = [110, 164.81, 196, 261.63]; // A minor 7th voicing
        chordFrequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const oscGain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(450, ctx.currentTime);

          oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
        });

        // Soft rhythmic kick & shaker pulse every 500ms (120 BPM minimal pulse)
        let step = 0;
        const timerId = window.setInterval(() => {
          if (!audioContextRef.current) return;
          const now = audioContextRef.current.currentTime;

          // Kick on downbeats (every 4 steps)
          if (step % 2 === 0) {
            const kickOsc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kickOsc.frequency.setValueAtTime(120, now);
            kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
            kickGain.gain.setValueAtTime(0.35, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            kickOsc.connect(kickGain);
            kickGain.connect(masterGain);
            kickOsc.start(now);
            kickOsc.stop(now + 0.28);
          }

          // Ambient subtle click / percussion
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = "triangle";
          clickOsc.frequency.setValueAtTime(800 + Math.random() * 400, now);
          clickGain.gain.setValueAtTime(0.04, now);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
          clickOsc.connect(clickGain);
          clickGain.connect(masterGain);
          clickOsc.start(now);
          clickOsc.stop(now + 0.06);

          step = (step + 1) % 8;
        }, 500);

        audioNodesRef.current = { gainNode: masterGain, timerId };
        setSoundOn(true);
      } catch (err) {
        console.error("Audio playback error:", err);
        setSoundOn(true); // fall back to visualizer toggle
      }
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioNodesRef.current?.timerId) {
        window.clearInterval(audioNodesRef.current.timerId);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

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
      {/* ======================================================== */}
      {/* 1. MAIN HEADER (Figma #30:333 & #24:6)                   */}
      {/* ======================================================== */}
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
              onClick={() => setActiveSection(item.key)}
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
                onClick={() => {
                  setActiveSection(item.key);
                  setMobileMenuOpen(false);
                }}
                className="text-2xl font-medium text-black hover:opacity-50 transition-opacity"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Figma #30:354 & #30:378)                */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 3. MAIN FOOTER (Figma #30:360 & #24:37)                  */}
      {/* ======================================================== */}
      <footer
        className={`relative z-20 w-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 lg:px-12 pt-4 pb-6 gap-6 md:gap-0 transition-opacity duration-1000 ${
          introPhase === "complete" ? "opacity-100" : "opacity-10 pointer-events-none"
        }`}
      >
        {/* Left: Now Playing Widget */}
        <div className="flex-1 flex items-center justify-center md:justify-start gap-3">
          {/* Equalizer Visualizer Bars (16x16 container) */}
          <div
            onClick={toggleSound}
            title={soundOn ? "Click to pause sound" : "Click to play sound"}
            className="flex items-end justify-between w-4 h-4 gap-[2px] cursor-pointer"
          >
            <span
              className={`w-[2px] bg-black rounded-full transition-all duration-300 ${
                soundOn ? "animate-eq-1" : "h-[5px]"
              }`}
            />
            <span
              className={`w-[2px] bg-black rounded-full transition-all duration-300 ${
                soundOn ? "animate-eq-2" : "h-[12px]"
              }`}
            />
            <span
              className={`w-[2px] bg-black rounded-full transition-all duration-300 ${
                soundOn ? "animate-eq-3" : "h-[7px]"
              }`}
            />
            <span
              className={`w-[2px] bg-black rounded-full transition-all duration-300 ${
                soundOn ? "animate-eq-4" : "h-[14px]"
              }`}
            />
            <span
              className={`w-[2px] bg-black rounded-full transition-all duration-300 ${
                soundOn ? "animate-eq-5" : "h-[9px]"
              }`}
            />
          </div>

          {/* Track Info */}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium leading-[13.75px] text-[#6B7280]">
              Now playing
            </span>
            <span className="text-[12px] font-medium leading-[15px] tracking-[-0.025em] text-black">
              Time To Dance
            </span>
          </div>
        </div>

        {/* Center: Brief Biography Statement */}
        <div className="flex-1 flex justify-center text-center">
          <p className="text-[11.5px] font-medium leading-[15.53px] tracking-[-0.025em] text-black max-w-[340px] whitespace-pre-line">
            Explore and take a look around at what{"\n"}
            I’ve been designing, building, and breaking lately.
          </p>
        </div>

        {/* Right: Sound Switch Indicator */}
        <div className="flex-1 flex items-center justify-center md:justify-end">
          <button
            onClick={toggleSound}
            className="text-[12px] font-medium leading-[16px] tracking-[-0.025em] text-black hover:opacity-50 transition-opacity cursor-pointer focus:outline-none flex items-center gap-1.5"
          >
            {soundOn ? "Sound ON" : "Sound OFF"}
          </button>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 4. MODAL / DRAWER FOR NAVIGATION CONTENT                 */}
      {/* ======================================================== */}
      {activeSection && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveSection(null)}
        >
          <div
            className="bg-white border border-black/10 shadow-2xl rounded-none w-full max-w-xl p-8 max-h-[85vh] overflow-y-auto text-black relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveSection(null)}
              className="absolute top-6 right-6 text-xs font-semibold uppercase tracking-wider text-black hover:opacity-50 p-2 cursor-pointer"
            >
              ✕ Close
            </button>

            {/* Music Section */}
            {activeSection === "music" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Discography</h2>
                <div className="space-y-4 text-sm divide-y divide-black/10">
                  <div className="pt-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-base">Time To Dance</p>
                      <p className="text-gray-500 text-xs">Single • 2026</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!soundOn) toggleSound();
                      }}
                      className="px-3 py-1 bg-black text-white text-xs font-medium hover:bg-black/80 transition-colors"
                    >
                      {soundOn ? "Playing" : "Play"}
                    </button>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-base">Isometric Structures</p>
                      <p className="text-gray-500 text-xs">EP • 2025</p>
                    </div>
                    <span className="text-xs text-gray-400">4 Tracks</span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-base">Berlin Reverberations</p>
                      <p className="text-gray-500 text-xs">Album • 2024</p>
                    </div>
                    <span className="text-xs text-gray-400">12 Tracks</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tour Section */}
            {activeSection === "tour" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Live Performances</h2>
                <div className="space-y-4 text-sm divide-y divide-black/10">
                  {[
                    { date: "OCT 14", venue: "Berghain / Panorama Bar", city: "Berlin, DE", status: "Sold Out" },
                    { date: "NOV 02", venue: "Printworks Redux", city: "London, UK", status: "Tickets" },
                    { date: "NOV 20", venue: "Warehouse Project", city: "Manchester, UK", status: "Tickets" },
                    { date: "DEC 05", venue: "Grelle Forelle", city: "Vienna, AT", status: "Selling Fast" },
                    { date: "JAN 18", venue: "Contact Tokyo", city: "Tokyo, JP", status: "Tickets" },
                  ].map((show, i) => (
                    <div key={i} className="pt-3 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-mono text-gray-500">{show.date}</span>
                        <p className="font-semibold">{show.venue}</p>
                        <p className="text-xs text-gray-500">{show.city}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 border border-black">
                        {show.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === "about" && (
              <div className="space-y-4">
                <h2 className="text-3xl font-medium tracking-tight">About Thvgger</h2>
                <p className="text-sm leading-relaxed text-gray-700">
                  Thvgger is an electronic music producer, sound designer, and creative technologist.
                  Blending architectural isometric aesthetics with raw, hypnotic electronic rhythms,
                  his work spans minimalist techno, ambient soundscapes, and digital art installations.
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  Inspired by Berlin’s club culture, industrial design, and modernist typography,
                  every performance is an exploration of sound, spatial tension, and visual identity.
                </p>
              </div>
            )}

            {/* Journey Section */}
            {activeSection === "journey" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">The Journey</h2>
                <div className="space-y-4 border-l border-black/20 pl-4 text-sm">
                  <div>
                    <span className="font-mono text-xs text-gray-400">2026</span>
                    <p className="font-semibold">New Audio-Visual Live Tour Launch</p>
                    <p className="text-xs text-gray-600">Debut of the isometric stage installation.</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-gray-400">2024</span>
                    <p className="font-semibold">Berlin Reverberations LP</p>
                    <p className="text-xs text-gray-600">Critically acclaimed vinyl release & residency.</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-gray-400">2021</span>
                    <p className="font-semibold">Origins & Hardware Experimentation</p>
                    <p className="text-xs text-gray-600">Analog synthesizer sessions and modular development.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {activeSection === "gallery" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Visual Archive</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center p-4 border border-black/10">
                    <Image
                      src="/images/logo-hero.svg"
                      alt="Isometric Logo"
                      width={160}
                      height={180}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center p-4 border border-black/10">
                    <Image
                      src="/images/header-icon.svg"
                      alt="Cube Monogram"
                      width={120}
                      height={120}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Curated monochrome graphic assets and stage projection visuals.
                </p>
              </div>
            )}

            {/* News Section */}
            {activeSection === "news" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Latest News</h2>
                <div className="space-y-4 text-sm divide-y divide-black/10">
                  <div className="pt-2">
                    <span className="text-xs font-mono text-gray-400">September 2026</span>
                    <p className="font-semibold text-base">“Time To Dance” Official Release</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Now streaming across all major platforms with extended club mix.
                    </p>
                  </div>
                  <div className="pt-3">
                    <span className="text-xs font-mono text-gray-400">August 2026</span>
                    <p className="font-semibold text-base">Autumn European Tour Announced</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Headlining dates in Berlin, London, Manchester, and Vienna.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === "contact" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Contact & Bookings</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Management & Booking</span>
                    <p className="font-mono text-black select-all">booking@thvgger.com</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Press & Inquiries</span>
                    <p className="font-mono text-black select-all">press@thvgger.com</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Studio</span>
                    <p className="text-gray-700">Kreuzberg, Berlin, Germany</p>
                  </div>
                </div>
              </div>
            )}

            {/* Store Section */}
            {activeSection === "store" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-medium tracking-tight">Official Store</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="border border-black/10 p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold">Time To Dance 12&quot; Vinyl</p>
                      <p className="text-xs text-gray-500">Heavyweight 180g limited pressing</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-mono font-medium">€28.00</span>
                      <button className="px-2 py-1 bg-black text-white text-xs">Pre-order</button>
                    </div>
                  </div>
                  <div className="border border-black/10 p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold">Isometric Monogram Tee</p>
                      <p className="text-xs text-gray-500">Heavy organic cotton in black</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-mono font-medium">€45.00</span>
                      <button className="px-2 py-1 bg-black text-white text-xs">Buy</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
