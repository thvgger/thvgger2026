"use client";

import { useState, useEffect, useRef } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    gainNode: GainNode;
    timerId: number | null;
  } | null>(null);

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

  const toggleSound = () => {
    if (soundOn) {
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

        const chordFrequencies = [110, 164.81, 196, 261.63];
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

        let step = 0;
        const timerId = window.setInterval(() => {
          if (!audioContextRef.current) return;
          const now = audioContextRef.current.currentTime;

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
        setSoundOn(true);
      }
    }
  };

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
      {/* 1. MAIN HEADER (Figma #30:333 & #24:6) */}
      <header
        className={`relative z-20 w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-6 pb-4 transition-opacity duration-1000 ${
          introPhase === "complete" ? "opacity-100" : "opacity-10 pointer-events-none"
        }`}
      >
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

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[12px] font-semibold tracking-wider uppercase px-2 py-1 border border-black/20 rounded"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

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

        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 lg:gap-[10px] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            introPhase === "complete"
              ? "opacity-100 translate-y-0 scale-100"
              : introPhase === "morphing"
              ? "opacity-80 translate-y-2 scale-95"
              : "opacity-0 translate-y-6 scale-90"
          }`}
        >
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

          <h1 className="text-[52px] sm:text-[80px] md:text-[104px] lg:text-[128px] font-medium leading-[0.86] tracking-[-0.0559em] text-black">
            Thvgger
          </h1>
        </div>
      </main>

      {/* 3. MAIN FOOTER (Figma #30:360 & #24:37) */}
      <footer
        className={`relative z-20 w-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 lg:px-12 pt-4 pb-6 gap-6 md:gap-0 transition-opacity duration-1000 ${
          introPhase === "complete" ? "opacity-100" : "opacity-10 pointer-events-none"
        }`}
      >
        <div className="flex-1 flex items-center justify-center md:justify-start gap-3">
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

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium leading-[13.75px] text-[#6B7280]">
              Now playing
            </span>
            <span className="text-[12px] font-medium leading-[15px] tracking-[-0.025em] text-black">
              Time To Dance
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-center text-center">
          <p className="text-[11.5px] font-medium leading-[15.53px] tracking-[-0.025em] text-black max-w-[340px] whitespace-pre-line">
            Explore and take a look around at what{"\n"}
            I’ve been designing, building, and breaking lately.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center md:justify-end">
          <button
            onClick={toggleSound}
            className="text-[12px] font-medium leading-[16px] tracking-[-0.025em] text-black hover:opacity-50 transition-opacity cursor-pointer focus:outline-none flex items-center gap-1.5"
          >
            {soundOn ? "Sound ON" : "Sound OFF"}
          </button>
        </div>
      </footer>
    </div>
  );
}
