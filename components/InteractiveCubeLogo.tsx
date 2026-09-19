"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface InteractiveCubeLogoProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

// True isometric viewing angles
const ISO_RX = -35.264; // arctan(1/√2) degrees — tilt
const ISO_RY = 45;      // 45° yaw

// Shortest angular path from `current` to `target` (degrees, any range)
function shortDelta(current: number, target: number): number {
  const raw = target - current;
  return (((raw + 180) % 360) + 360) % 360 - 180;
}

export default function InteractiveCubeLogo({
  className = "",
  onClick,
  title = "Drag to spin",
}: InteractiveCubeLogoProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const cubeRef  = useRef<HTMLDivElement>(null);
  // faceSize in px — measured from the container so it's always correct
  const [faceSize, setFaceSize] = useState(59);

  // ── Measure container and derive face size ──────────────────────────────────
  // isometric projection width  = √2 · face
  // isometric projection height = √(8/3) · face  ≈ 1.633 · face
  // So: face = min(containerW / √2, containerH / √(8/3))
  const measure = (el: Element) => {
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 && height === 0) return;
    const fromW = width  / Math.SQRT2;
    const fromH = height / Math.sqrt(8 / 3);
    setFaceSize(Math.max(1, Math.floor(Math.min(fromW, fromH))));
  };

  useLayoutEffect(() => {
    if (wrapRef.current) measure(wrapRef.current);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure(el));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Drag / inertia / spring-back animation ──────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const cube = cubeRef.current;
    if (!wrap || !cube) return;

    const s = {
      rx: ISO_RX, ry: ISO_RY,
      vx: 0,       vy: 0,
      dragging: false,
      lastX: 0, lastY: 0,
      startX: 0, startY: 0, startT: 0,
      prevT: performance.now(),
      raf: 0,
    };

    const apply = () => {
      cube.style.transform = `rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
    };
    apply();

    const tick = (now: number) => {
      const dt = Math.min((now - s.prevT) / 16.67, 4);
      s.prevT = now;

      if (!s.dragging) {
        if (Math.abs(s.vx) > 0.02 || Math.abs(s.vy) > 0.02) {
          // inertial spin
          s.rx += s.vx * dt;
          s.ry += s.vy * dt;
          const decay = Math.pow(0.92, dt);
          s.vx *= decay;
          s.vy *= decay;
        } else {
          // spring back to canonical isometric angle
          s.vx = 0;
          s.vy = 0;
          const f = 1 - Math.pow(0.93, dt);
          s.rx += shortDelta(s.rx, ISO_RX) * f;
          s.ry += shortDelta(s.ry, ISO_RY) * f;
        }
        apply();
      }

      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = s.startX = e.clientX;
      s.lastY = s.startY = e.clientY;
      s.startT = performance.now();
      s.vx = s.vy = 0;
      wrap.style.cursor = "grabbing";
      wrap.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const sens = 0.55;
      s.ry += dx * sens;
      s.rx -= dy * sens;
      s.vy = dx * sens * 0.85;
      s.vx = -dy * sens * 0.85;
      apply();
    };

    const onUp = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      wrap.style.cursor = "grab";
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      const dist = Math.hypot(e.clientX - s.startX, e.clientY - s.startY);
      if (dist < 5 && performance.now() - s.startT < 300) {
        s.vx = 0.9; s.vy = 1.3;
        onClick?.();
      }
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(s.raf);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, [faceSize, onClick]);

  // ── Geometry ────────────────────────────────────────────────────────────────
  const half = faceSize / 2;

  // Very large perspective → near-orthographic / isometric look
  const perspective = faceSize * 30;

  // Stripe pattern: 3 equal-width black stripes alternating with 3 white gaps.
  // Each black+white pair = faceSize/3 px.  Stripe width = faceSize/6 px.
  // Face stripe directions — chosen so no two adjacent visible faces share the
  // same screen-space stripe direction (verified at every shared edge):
  //
  //   Top/Bottom  (±Y)  → 90°  local:  gradient varies along local X = world X
  //                             stripes run along world Z → NE-SW diagonal on top diamond
  //   Right/Left  (±X)  → 90°  local:  gradient varies along local X = world -Z
  //                             stripes run along world Y → vertical bars on right panel
  //   Front/Back  (±Z)  → 0°   local:  gradient varies along local Y = world Y
  //                             stripes run along world X → horizontal bands on left panel
  //
  // Top and Right both use 90° locally but their local X axes differ:
  //   Top  local X = world X  → stripes along Z (diagonal in screen)
  //   Right local X = world -Z → stripes along Y (vertical in screen)
  // → they look completely different despite same gradient angle.
  //
  // Shared-edge disconnection check (one face constant, other varies at every edge):
  //   Top-Right edge runs along world Z:  top coord = X is constant at x=0.5, right coord = -Z varies ✓
  //   Top-Front edge runs along world X:  top coord = X varies, front coord = Y is constant at y=0.5 ✓
  //   Right-Front edge runs along world Y: right coord = -Z is constant at z=0.5, front coord = Y varies ✓
  const stripeStyle = (angle: number): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    background: `repeating-linear-gradient(${angle}deg, #000 0px, #000 ${faceSize / 6}px, #fff ${faceSize / 6}px, #fff ${faceSize / 3}px)`,
  });

  return (
    <div
      ref={wrapRef}
      className={`relative select-none ${className}`}
      title={title}
      style={{ cursor: "grab", touchAction: "none", overflow: "visible" }}
    >
      {/* Perspective container — centred absolutely within the wrapper */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective,
        perspectiveOrigin: "50% 50%",
      }}>
        {/* The cube — receives the isometric + drag rotation */}
        <div
          ref={cubeRef}
          style={{
            width: faceSize,
            height: faceSize,
            position: "relative",
            transformStyle: "preserve-3d",
            // Rotate around the cube's geometric centre
            transformOrigin: `${half}px ${half}px 0px`,
          }}
        >
          {/* Top face  (±Y) — 90°: gradient varies along local X = world X → stripes along world Z → NE-SW diagonal */}
          <div style={{ ...stripeStyle(90), transform: `rotateX(-90deg) translateZ(${half}px)` }} />
          {/* Bottom face */}
          <div style={{ ...stripeStyle(90), transform: `rotateX(90deg)  translateZ(${half}px)` }} />

          {/* Right face (±X) — 90° vertical stripes */}
          <div style={{ ...stripeStyle(90), transform: `rotateY(90deg)   translateZ(${half}px)` }} />
          {/* Left face */}
          <div style={{ ...stripeStyle(90), transform: `rotateY(-90deg)  translateZ(${half}px)` }} />

          {/* Front face (±Z) — 0° horizontal stripes */}
          <div style={{ ...stripeStyle(0), transform: `translateZ(${half}px)` }} />
          {/* Back face */}
          <div style={{ ...stripeStyle(0), transform: `rotateY(180deg) translateZ(${half}px)` }} />
        </div>
      </div>
    </div>
  );
}
