import { projectRipple, type RipplePoint } from "@/lib/project-ripple";

export type ProjectTransitionSource = { source: HTMLElement; point?: RipplePoint };
type Animate = (element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => Animation;
const finished = (animation: Animation) => animation.finished.catch(() => {});

export function createProjectTransition(panel: HTMLElement, title: string, { source, point }: ProjectTransitionSource, animate: Animate) {
  const rect = source.getBoundingClientRect();
  const backdrop = document.createElement("div");
  backdrop.className = "project-transition-curtain";
  const lockup = document.createElement("div");
  lockup.className = "project-transition-lockup";
  const slot = document.createElement("div");
  slot.className = "project-transition-slot";
  slot.style.aspectRatio = `${rect.width} / ${rect.height}`;
  const heading = document.createElement("div");
  heading.className = "project-transition-title";
  const words = title.split(" ").map(word => {
    const clip = document.createElement("span");
    clip.className = "project-transition-word-clip";
    const inner = document.createElement("span");
    inner.className = "project-transition-word";
    inner.textContent = word;
    clip.append(inner);
    return clip;
  });
  heading.append(...words);
  lockup.append(slot, heading);
  const media = document.createElement("div");
  media.className = "project-transition-media";
  media.style.width = `${rect.width}px`;
  media.style.height = `${rect.height}px`;
  media.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.removeAttribute("data-playing");
  clone.querySelectorAll("video").forEach(video => video.remove());
  Object.assign(clone.style, { width: "100%", height: "100%", margin: "0", visibility: "visible" });
  const originalImage = source.querySelector<HTMLImageElement>("img");
  const clonedImage = clone.querySelector<HTMLImageElement>("img");
  if (originalImage && clonedImage) {
    clonedImage.src = originalImage.currentSrc || originalImage.src;
    clonedImage.removeAttribute("srcset");
    clonedImage.removeAttribute("sizes");
    clonedImage.style.transform = getComputedStyle(originalImage).transform;
    clonedImage.style.transition = "none";
    clonedImage.loading = "eager";
  }
  media.append(clone);
  const signature = document.createElement("div");
  signature.className = "project-transition-signature";
  const mark = document.querySelector(".header-mark")?.cloneNode(true) as SVGElement | undefined;
  if (mark) {
    mark.removeAttribute("id");
    mark.querySelectorAll("defs, title").forEach(element => element.remove());
    mark.querySelectorAll("[filter]").forEach(element => element.removeAttribute("filter"));
    signature.append(mark);
  }
  const name = document.createElement("span");
  name.textContent = "Thvgger";
  signature.append(name);
  panel.replaceChildren(backdrop, lockup, media, signature);
  const visibility = source.style.visibility;
  source.style.visibility = "hidden";
  const target = slot.getBoundingClientRect();
  const scale = target.width / rect.width;

  return {
    async cover() {
      if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) await projectRipple(clone, source, point);
      if (!panel.isConnected) return;
      const cover = animate(backdrop, [
        { transform: "translateY(115%)" }, { transform: "translateY(0)" },
      ], { duration: 520, easing: "cubic-bezier(.22, 1, .36, 1)" });
      const move = animate(media, [
        { transform: `translate(${rect.left}px, ${rect.top}px) scale(1)` },
        { transform: `translate(${target.left}px, ${target.top}px) scale(${scale})` },
      ], { duration: 720, easing: "cubic-bezier(.16, 1, .3, 1)" });
      if (clonedImage) animate(clonedImage, [
        { transform: clonedImage.style.transform }, { transform: "scale(1)" },
      ], { duration: 600, easing: "cubic-bezier(.16, 1, .3, 1)" });
      const titles = words.map((word, index) => animate(word.firstElementChild as HTMLElement, [
        { transform: "translateY(110%)" }, { transform: "translateY(0)" },
      ], { duration: 380, delay: 330 + index * 35 }));
      animate(signature, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 340 });
      await Promise.all([cover, move, ...titles].map(finished));
    },
    async reveal() {
      await new Promise(resolve => setTimeout(resolve, document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180));
      if (!panel.isConnected) return;
      animate(media, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
      animate(signature, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
      const reveal = animate(backdrop, [
        { transform: "translateY(0)" }, { transform: "translateY(-115%)" },
      ], { duration: 540, delay: 100 });
      await finished(reveal);
    },
    cleanup() {
      source.style.visibility = visibility;
      panel.replaceChildren();
      window.dispatchEvent(new Event("project-navigation-end"));
    },
  };
}
