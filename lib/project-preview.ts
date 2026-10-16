export type ProjectPreviewArrival = { video: HTMLVideoElement; claimed: boolean };

export function releasePreview(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.remove();
}
