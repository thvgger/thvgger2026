import InteractiveCubeLogo from "@/components/InteractiveCubeLogo";
import HeroIntro from "@/components/HeroIntro";
import UnderlineLink from "@/components/UnderlineLink";

export default function Hero() {
  return (
    <HeroIntro>
      <div className="home-wordmark">
        <div className="hero-mark-stage">
          <InteractiveCubeLogo className="hero-mark" idleSpin aria-describedby="hero-cube-hint" title="Thvgger cube. Drag to rotate, or press Enter to spin." />
          <span id="hero-cube-hint" className="hero-cube-hint">Drag to rotate</span>
        </div>
        <div className="hero-name-window"><h1 id="home-title">Thvgger</h1></div>
      </div>
      <p className="hero-introduction">I design identities and build websites.</p>
      <UnderlineLink href="#selected-work" className="home-scroll-link" arrow="down">Scroll to explore</UnderlineLink>
    </HeroIntro>
  );
}
