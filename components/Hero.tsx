import InteractiveCubeLogo from "@/components/InteractiveCubeLogo";

export default function Hero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-wordmark">
        <InteractiveCubeLogo className="hero-mark" title="Thvgger cube. Drag to rotate, or press Enter to spin." />
        <h1 id="home-title">Thvgger</h1>
      </div>
      <p className="hero-introduction">I design identities and build websites.</p>
      <a href="#selected-work" className="home-scroll-link">Scroll to explore <span aria-hidden="true">↓</span></a>
    </section>
  );
}
