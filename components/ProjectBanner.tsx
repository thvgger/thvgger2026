"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/lib/gsap";
import { releasePreview, type ProjectPreviewArrival } from "@/lib/project-preview";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectBanner({ title, kind, preview, poster, treatment = "" }: {
  title: string;
  kind: string;
  preview?: string;
  poster: string;
  treatment?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement | null>(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(true);

  useGSAP((_, contextSafe) => {
    const element = root.current;
    const media = host.current;
    if (!element || !media) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const main = document.getElementById("main");
    let visible = true;
    let disposed = false;
    let timeline: gsap.core.Timeline | undefined;
    let frame: number | undefined;
    let readyFrame: number | undefined;
    let entryFrame: number | undefined;
    let initialised = false;
    let manualPlayback = false;

    const syncPlayback = () => {
      const video = player.current;
      if (!video) return;
      if (document.hidden || !visible || (preference.matches && !manualPlayback) || userPaused.current) video.pause();
      else void video.play().catch(() => { if (!disposed && player.current === video) setPaused(true); });
    };
    const onPlay = () => { setPaused(false); };
    const onPause = () => { setPaused(true); };
    const onError = () => { delete media.dataset.playing; setPaused(true); };
    const attach = (video: HTMLVideoElement) => {
      if (player.current && player.current !== video) detach();
      player.current = video;
      setPaused(video.paused);
      video.className = "project-banner-video";
      video.removeAttribute("style");
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.tabIndex = -1;
      video.setAttribute("aria-hidden", "true");
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onPause);
      video.addEventListener("error", onError);
      media.append(video);
      const ready = () => { if (!disposed && player.current === video) media.dataset.playing = "true"; };
      if (video.readyState >= 2) ready();
      else if (video.requestVideoFrameCallback) readyFrame = video.requestVideoFrameCallback(ready);
      video.addEventListener("loadeddata", ready, { once: true });
      syncPlayback();
    };
    function detach() {
      const video = player.current;
      if (!video) return;
      if (readyFrame !== undefined) video.cancelVideoFrameCallback?.(readyFrame);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      releasePreview(video);
      player.current = null;
      delete media!.dataset.playing;
    }
    const ensureVideo = () => {
      if (player.current || !preview || main?.getAttribute("aria-busy") === "true" || (preference.matches && !manualPlayback)) return;
      const video = document.createElement("video");
      video.preload = "auto";
      video.src = preview;
      attach(video);
    };
    const onTogglePlayback = () => {
      if (player.current && !player.current.paused) userPaused.current = true;
      else { userPaused.current = false; manualPlayback = true; ensureVideo(); }
      syncPlayback();
    };
    const onArrival = (event: Event) => {
      const arrival = (event as CustomEvent<ProjectPreviewArrival>).detail;
      attach(arrival.video);
      arrival.claimed = true;
    };
    media.addEventListener("project-preview-arrive", onArrival);
    media.addEventListener("project-preview-toggle", onTogglePlayback);

    const prepareScroll = contextSafe!(() => {
      timeline?.revert();
      delete element.dataset.expanded;
      if (preference.matches) {
        delete element.dataset.scrollReady;
        return;
      }
      element.dataset.scrollReady = "true";
      const compactTitle = element.querySelector<HTMLElement>(".project-banner-compact-title")!;
      const shade = element.querySelector<HTMLElement>(".project-banner-shade")!;
      const travel = Math.round(element.offsetHeight * .287);
      element.style.setProperty("--banner-travel", `${travel}px`);
      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: element, start: "top top", end: "bottom top", scrub: .3,
          onUpdate: self => { element.dataset.expanded = String(self.progress < .08); },
        },
      })
        .fromTo(media, { scale: 1.2 }, { scale: 1, duration: 1 }, 0)
        .fromTo(shade, { opacity: .08 }, { opacity: 0, duration: 1 }, 0)
        .fromTo(compactTitle, { y: 0, autoAlpha: 1 }, { y: -16, autoAlpha: 0, duration: .2 }, 0);

      if (!initialised) {
        initialised = true;
        // The full-height video sits behind the page. Enter slightly down the
        // document so its lower edge meets the large title, as on the reference.
        if (!window.location.hash && window.scrollY < travel + 2) {
          window.scrollTo({ top: travel, behavior: "instant" });
          entryFrame = requestAnimationFrame(() => {
            if (!disposed && window.scrollY < travel + 2) {
              window.scrollTo({ top: travel, behavior: "instant" });
              ScrollTrigger.update();
            }
          });
        }
      }
      ScrollTrigger.update();
      timeline.scrollTrigger?.getTween()?.progress(1);
    });
    prepareScroll();
    const enterBanner = () => {
      if (preference.matches) return;
      const travel = parseFloat(element.style.getPropertyValue("--banner-travel"));
      window.scrollTo({ top: travel, behavior: "instant" });
      ScrollTrigger.update();
      timeline?.scrollTrigger?.getTween()?.progress(1);
    };
    media.addEventListener("project-banner-enter", enterBanner);
    ensureVideo();
    const routeObserver = new MutationObserver(ensureVideo);
    if (main) routeObserver.observe(main, { attributes: true, attributeFilter: ["aria-busy"] });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); });
    observer.observe(media);
    const onPreference = () => { manualPlayback = false; prepareScroll(); ensureVideo(); syncPlayback(); };
    const onResize = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (entryFrame !== undefined) cancelAnimationFrame(entryFrame);
      frame = requestAnimationFrame(() => { frame = undefined; prepareScroll(); });
    };
    window.addEventListener("resize", onResize);
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", syncPlayback);
    void document.fonts.ready.then(() => { if (!disposed) onResize(); });
    return () => {
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (entryFrame !== undefined) cancelAnimationFrame(entryFrame);
      detach();
      observer.disconnect();
      routeObserver.disconnect();
      media.removeEventListener("project-preview-arrive", onArrival);
      media.removeEventListener("project-preview-toggle", onTogglePlayback);
      media.removeEventListener("project-banner-enter", enterBanner);
      window.removeEventListener("resize", onResize);
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", syncPlayback);
      delete element.dataset.scrollReady;
    };
  }, { scope: root });

  return (
    <section ref={root} className="project-banner-track" aria-labelledby="project-title">
      <div className="project-banner-stage">
        <div ref={host} className={`project-banner-media ${treatment}`} data-project-preview={preview}>
          <Image src={poster} alt="" fill sizes="100vw" preload className="project-banner-poster" />
        </div>
        <div className="project-banner-shade" aria-hidden="true" />
      </div>
      <div className="project-banner-compact-title" aria-hidden="true"><span>{title}</span><span>{kind}</span></div>
      <div className="project-banner-controls">
        <button className="project-banner-expand" onClick={() => {
          const element = root.current;
          if (!element) return;
          const expanded = element.dataset.expanded === "true";
          const travel = parseFloat(element.style.getPropertyValue("--banner-travel")) || 0;
          window.scrollTo({ top: expanded ? travel : 0, behavior: "smooth" });
        }}><span className="expand-label">View fullscreen</span><span className="collapse-label">Return to banner</span></button>
        {preview && <button onClick={() => host.current?.dispatchEvent(new Event("project-preview-toggle"))}>{paused ? "Play video" : "Pause video"}</button>}
      </div>
    </section>
  );
}
