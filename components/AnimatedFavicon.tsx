"use client";

import { useEffect, useRef } from "react";
import { Matrix } from "./Logo/math";
import { createCube } from "./Logo/createCube";
import { facePath } from "./Logo/Face";

const BASE_ROTATION_Y = Math.PI / 4;
const BASE_ROTATION_X = Math.asin(Math.tan(Math.PI / 6));
const FAVICON_SCALE = 38;

interface AnimatedFaviconProps {
  spinTrigger?: number;
}

export default function AnimatedFavicon({ spinTrigger = 0 }: AnimatedFaviconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isFirstMount = useRef(true);

  // Render a specific rotation angle to the favicon
  const renderFrame = (angleY: number) => {
    if (typeof window === "undefined") return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      canvasRef.current = canvas;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect system dark mode preference for tab bar contrast
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const transform = Matrix.scale(FAVICON_SCALE)
      .dot(Matrix.rotationY(BASE_ROTATION_Y + angleY))
      .dot(Matrix.rotationX(BASE_ROTATION_X));

    const faces = createCube(transform);
    const pathStr = faces.map(facePath).join(" ");

    ctx.clearRect(0, 0, 64, 64);
    ctx.save();
    ctx.translate(32, 32);
    ctx.fillStyle = isDark ? "#FFFFFF" : "#000000";

    try {
      const path2d = new Path2D(pathStr);
      ctx.fill(path2d);
    } catch {
      // Fallback if Path2D constructor has issues
    }
    ctx.restore();

    // Update favicon <link> element
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  };

  // Render static icon immediately on mount and on theme change
  useEffect(() => {
    renderFrame(0);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => renderFrame(0);
    mediaQuery.addEventListener?.("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleThemeChange);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Animate a 360° rotation whenever spinTrigger increments
  useEffect(() => {
    // Also spin on mount to match initial intro spin
    if (isFirstMount.current) {
      isFirstMount.current = false;
    }

    let startTime: number | null = null;
    const duration = 850; // ms

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // Cubic ease-out curve
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const angle = easeOutCubic(progress) * Math.PI * 2;

      renderFrame(angle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        renderFrame(0);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [spinTrigger]);

  return null;
}
