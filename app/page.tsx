"use client";

import { useState, useEffect, useRef } from "react";
import InteractiveCubeLogo from "@/components/InteractiveCubeLogo";
import AnimatedFavicon from "@/components/AnimatedFavicon";
import Header from "@/components/Header";
import CubePatternSection from "@/components/AboutSection";

export default function Home() {
  const [introPhase, setIntroPhase] = useState<"spinning" | "shrinking" | "pushing" | "complete">("spinning");
  const [introCount, setIntroCount] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const [pushDistance, setPushDistance] = useState(240);
  const [soundOn, setSoundOn] = useState(false);

  // Web Audio Context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    gainNode: GainNode;
    timerId: number | null;
  } | null>(null);

  // Measure push distance accurately so the cube sits exactly in the center before push
  const measurePush = () => {
    if (textRef.current) {
      const textW = textRef.current.offsetWidth;
      const gap = window.innerWidth >= 1024 ? 16 : window.innerWidth >= 640 ? 16 : 12;
      setPushDistance((textW + gap) / 2);
    }
  };

  useEffect(() => {
    measurePush();
    window.addEventListener("resize", measurePush);
    return () => window.removeEventListener("resize", measurePush);
  }, []);

  // Intro animation sequence matching user's video:
  // 1. Spinning large in dead center (0 - 650ms)
  // 2. Shrinks smoothly in place in the center (650ms - 1300ms, 650ms duration)
  // 3. "Thvgger" contacts and pushes the cube into center alignment (1300ms - 1950ms)
  // 4. Settled at center, header and footer appear, logo becomes interactive (1950ms+)
  useEffect(() => {
    measurePush();
    const timer1 = setTimeout(() => {
      measurePush();
      setIntroPhase("shrinking");
    }, 650);

    const timer2 = setTimeout(() => {
      setIntroPhase("pushing");
    }, 1300);

    const timer3 = setTimeout(() => {
      setIntroPhase("complete");
    }, 1950);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [introCount]);

  // Lock scrolling while the intro loading animation is running
  useEffect(() => {
    if (introPhase !== "complete") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [introPhase]);

  const [periodicSpin, setPeriodicSpin] = useState(0);

  // Auto-spin both header and hero logos every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPeriodicSpin((prev) => prev + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, [introCount]);

  const replayIntro = () => {
    setIntroPhase("spinning");
    setIntroCount((prev) => prev + 1);
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

  return (
    <div className="relative w-full bg-black text-black select-none overflow-x-clip">
      {/* Dynamic 3D Isometric Favicon */}
      <AnimatedFavicon spinTrigger={introCount + periodicSpin} />

      {/* ======================================================== */}
      {/* 1. HERO VIEWPORT (Header + Hero Lockup + Footer)         */}
      {/* ======================================================== */}
      <div id="hero" className="relative flex flex-col justify-between min-h-screen w-full bg-white text-black overflow-hidden z-10">
        <Header
          introPhase={introPhase}
          periodicSpin={periodicSpin}
          onReplayIntro={replayIntro}
        />

      {/* ======================================================== */}
      {/* 2. HERO SECTION                                          */}
      {/* ======================================================== */}
      <main className="relative flex-1 flex items-center justify-center w-full px-4 py-6">
        {/* Wordmark Lockup: shifted by pushDistance so cube is centered, then pushed into center alignment */}
        <div
          className="flex items-center justify-center"
          style={{
            transform:
              introPhase === "pushing" || introPhase === "complete"
                ? "translateX(0px)"
                : `translateX(${pushDistance}px)`,
            transition:
              introPhase === "pushing"
                ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms"
                : "none",
          }}
        >
          {/* 3D Cube Logo: large during initial spin, shrinks smoothly in center, then pushed into place */}
          <InteractiveCubeLogo
            className={`flex-shrink-0 ${
              introPhase === "spinning"
                ? "w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[360px] lg:h-[360px] pointer-events-none"
                : "w-[44px] h-[50px] sm:w-[62px] sm:h-[70px] md:w-[76px] md:h-[86px] lg:w-[84px] lg:h-[95.34px]"
            }`}
            style={{
              transition: "width 650ms cubic-bezier(0.25, 1, 0.5, 1), height 650ms cubic-bezier(0.25, 1, 0.5, 1)",
            }}
            spinTrigger={introCount + periodicSpin}
          />

          {/* "Thvgger" Typography: enters from offscreen right, pushes cube into place */}
          <div
            ref={textRef}
            className="ml-3 sm:ml-4 lg:ml-[16px] flex-shrink-0"
            style={{
              transform:
                introPhase === "spinning" || introPhase === "shrinking"
                  ? "translateX(100vw)"
                  : "translateX(0px)",
              transition:
                introPhase === "pushing"
                  ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
            }}
          >
            <h1 className="text-[52px] sm:text-[80px] md:text-[104px] lg:text-[128px] font-medium leading-[0.86] tracking-[-0.0559em] text-black whitespace-nowrap select-none">
              Thvgger
            </h1>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. MAIN FOOTER (Figma #30:360 & #24:37)                  */}
      {/* ======================================================== */}
      <footer
        className={`relative z-20 w-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 lg:px-12 pt-4 pb-6 gap-6 md:gap-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          introPhase === "complete"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
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
      </div>

      {/* ======================================================== */}
      {/* 2. MANIFESTO SECTION                                      */}
      {/* ======================================================== */}
      <CubePatternSection id="work" />

      {/* ======================================================== */}
      {/* 3. BLANK SECTION                                          */}
      {/* ======================================================== */}
      <section id="projects" className="relative w-full min-h-screen bg-white" />
    </div>
  );
}
