"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keeps the server-rendered cover visible until the first video frame is ready. */
export default function ProjectThumbnail({ children, className, hoverReel }: {
  children: ReactNode;
  className: string;
  hoverReel?: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = container.current;
    const link = frame?.closest("a");
    if (!frame || !link || !hoverReel) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let video: HTMLVideoElement | undefined;
    let hovered = false;
    let focused = false;
    let visible = false;
    let navigating = false;
    let failed = false;
    let generation = 0;
    let pendingFrame: number | undefined;

    const hide = () => { delete frame.dataset.playing; };
    const stop = (reset: boolean) => {
      generation += 1;
      hide();
      if (!video) return;
      if (pendingFrame !== undefined) video.cancelVideoFrameCallback?.(pendingFrame);
      pendingFrame = undefined;
      video.pause();
      if (reset && video.readyState >= 1) video.currentTime = 0;
    };
    const fail = () => { failed = true; stop(true); };
    const sync = () => {
      const intended = hovered || focused;
      if (!intended || !visible || document.hidden || motion.matches || !finePointer.matches || navigating || failed) {
        stop(!intended || motion.matches || navigating);
        return;
      }
      if (!video) {
        video = document.createElement("video");
        video.className = "project-hover-reel";
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "none";
        video.setAttribute("aria-hidden", "true");
        video.setAttribute("disablepictureinpicture", "");
        video.tabIndex = -1;
        video.addEventListener("error", fail);
        video.src = hoverReel;
        frame.append(video);
      }
      const current = ++generation;
      const playingVideo = video;
      void playingVideo.play().then(() => {
        if (current !== generation) return;
        const reveal = () => {
          if (current === generation && !playingVideo.paused) frame.dataset.playing = "true";
        };
        // Avoid showing a black decoder surface while the first frame is pending.
        if (playingVideo.requestVideoFrameCallback) pendingFrame = playingVideo.requestVideoFrameCallback(reveal);
        else if (playingVideo.readyState >= 2) reveal();
      }).catch(() => {
        // A leave, tab switch, or interrupted load can cancel play; keep the still.
        if (current === generation) hide();
      });
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovered = true;
      sync();
    };
    const onLeave = () => { hovered = false; sync(); };
    const onFocus = () => { focused = link.matches(":focus-visible"); sync(); };
    const onBlur = () => { focused = false; sync(); };
    const onNavigate = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      stop(true);
      navigating = true;
    };
    const onNavigationEnd = () => {
      navigating = false;
      hovered = link.matches(":hover");
      focused = link.matches(":focus-visible");
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(frame);
    link.addEventListener("pointerenter", onEnter);
    link.addEventListener("pointerleave", onLeave);
    link.addEventListener("focus", onFocus);
    link.addEventListener("blur", onBlur);
    link.addEventListener("click", onNavigate);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("project-navigation-end", onNavigationEnd);
    motion.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      link.removeEventListener("pointerenter", onEnter);
      link.removeEventListener("pointerleave", onLeave);
      link.removeEventListener("focus", onFocus);
      link.removeEventListener("blur", onBlur);
      link.removeEventListener("click", onNavigate);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("project-navigation-end", onNavigationEnd);
      motion.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
      stop(true);
      if (video) {
        video.removeEventListener("error", fail);
        video.removeAttribute("src");
        video.load();
        video.remove();
      }
    };
  }, [hoverReel]);

  return <div ref={container} className={`${className} project-thumbnail`}>{children}</div>;
}
