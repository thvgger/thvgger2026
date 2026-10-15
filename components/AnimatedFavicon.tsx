"use client";

import { useEffect } from "react";
import { Matrix } from "@/components/Logo/math";
import { createCube } from "@/components/Logo/createCube";
import { facePath } from "@/components/Logo/Face";

const rotationY = Math.PI / 4;
const rotationX = Math.asin(Math.tan(Math.PI / 6));
const duration = 850;
const frameInterval = 1000 / 24;

export default function AnimatedFavicon({ spinTrigger = 0 }: { spinTrigger?: number }) {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    if (!context || typeof Path2D === "undefined") return;

    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.sizes = "64x64";
    icon.dataset.animatedFavicon = "true";
    let frame = 0;

    function draw(angle: number) {
      const transform = Matrix.scale(38)
        .dot(Matrix.rotationY(rotationY + angle))
        .dot(Matrix.rotationX(rotationX));
      const path = createCube(transform).map(facePath).join(" ");
      context!.clearRect(0, 0, 64, 64);
      context!.save();
      context!.translate(32, 32);
      context!.fillStyle = dark.matches ? "#fff" : "#000";
      context!.fill(new Path2D(path));
      context!.restore();
      icon.href = canvas.toDataURL("image/png");
    }

    function settle() {
      cancelAnimationFrame(frame);
      frame = 0;
      draw(0);
    }

    draw(0);
    document.head.append(icon);

    // Keep the runtime icon after Next.js's static fallback icons on navigation.
    const observer = new MutationObserver(() => {
      const icons = document.head.querySelectorAll('link[rel~="icon"]');
      if (icons[icons.length - 1] !== icon) document.head.append(icon);
    });
    observer.observe(document.head, { childList: true });

    if (!reducedMotion.matches && !document.hidden) {
      let started: number | undefined;
      let lastDrawn = -Infinity;
      function spin(timestamp: number) {
        started ??= timestamp;
        const progress = Math.min(1, (timestamp - started) / duration);
        if (progress === 1) {
          settle();
          return;
        }
        if (timestamp - lastDrawn >= frameInterval) {
          draw((1 - (1 - progress) ** 3) * Math.PI * 2);
          lastDrawn = timestamp;
        }
        frame = requestAnimationFrame(spin);
      }
      frame = requestAnimationFrame(spin);
    }

    const onVisibility = () => { if (document.hidden) settle(); };
    dark.addEventListener("change", settle);
    reducedMotion.addEventListener("change", settle);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dark.removeEventListener("change", settle);
      reducedMotion.removeEventListener("change", settle);
      document.removeEventListener("visibilitychange", onVisibility);
      icon.remove();
    };
  }, [spinTrigger]);

  return null;
}
