import InteractiveCubeLogo from "@/components/InteractiveCubeLogo";
import HeroIntro from "@/components/HeroIntro";
import UnderlineLink from "@/components/UnderlineLink";

export default function Hero() {
  return (
    <HeroIntro>
      <div className="home-wordmark">
        <div className="hero-mark-stage"><InteractiveCubeLogo className="hero-mark" title="Thvgger cube. Drag to rotate, or press Enter to spin." /></div>
        <div className="hero-name-window"><h1 id="home-title">Thvgger</h1></div>
      </div>
      <p className="hero-introduction">I design identities and build websites.</p>
      <UnderlineLink href="#selected-work" className="home-scroll-link" arrow="down">Scroll to explore</UnderlineLink>
    </HeroIntro>
  );
}
