import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="about-page page-shell" aria-labelledby="about-title">
      <div className="about-heading"><h1 id="about-title">Design &<br />development.</h1></div>
      <div className="about-copy">
        <p className="about-introduction">I’m Thvgger, a designer and developer working across visual identity and the web.</p>
        <p>I care about clear ideas, considered details, and how an interface feels to use. My work connects the visual side of a project with the way it’s built.</p>
        <p>This portfolio brings together my personal identity, print explorations, and development work.</p>
        <Link href="/contact" className="inline-link">Get in touch <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
