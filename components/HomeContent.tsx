import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { projects } from "@/lib/portfolio";
import UnderlineLink from "@/components/UnderlineLink";
import Button from "@/components/Button";
import ArrowIcon from "@/components/ArrowIcon";
import HomePractice, { CapabilityDetail } from "@/components/HomePractice";

const selectedProjects = projects.filter(project => project.id === "foolycooly" || project.id === "studio-space");
const capabilities = [
  {
    title: "Visual identity",
    copy: "Marks, typography, and a visual system that holds together. I explore how an identity works across the screen, print, and the small details in between.",
  },
  {
    title: "Interface design",
    copy: "Clear layouts, thoughtful interactions, and a sense of hierarchy. I think about what someone needs to see, understand, and do at each step.",
  },
  {
    title: "Web development",
    copy: "Bringing the design into the browser with responsive layouts and considered motion. Built with attention to keyboard navigation, smaller screens, and how the site feels to use.",
  },
];

export default function HomeContent() {
  return (
    <>
      <section id="selected-work" className="home-selected page-shell" aria-labelledby="selected-work-title" tabIndex={-1}>
        <div className="home-section-heading">
          <h2 id="selected-work-title">Selected work</h2>
          <UnderlineLink href="/work" className="inline-link" arrow="up-right">See all work</UnderlineLink>
        </div>
        <div className="home-projects">
          {selectedProjects.map((project, index) => (
            <Link key={project.id} href={`/work/${project.id}`} className="home-project">
              <div className={`home-project-image ${project.coverTreatment ? `${project.coverTreatment}-cover` : ""}`}>
                <Image
                  src={project.cover}
                  alt={project.gallery[0].alt}
                  fill
                  sizes={index === 0 ? "(max-width: 760px) 92vw, (max-width: 1320px) 52vw, 680px" : "(max-width: 760px) 92vw, (max-width: 1320px) 39vw, 504px"}
                />
              </div>
              <div className="home-project-caption">
                <div><h3>{project.title}</h3><p>{project.kind}</p></div>
                <span><ArrowIcon /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <HomePractice>
        <Image src="/images/about-texture.jpg" alt="" fill sizes="100vw" className="home-practice-texture" aria-hidden="true" />
        <div className="home-practice-inner page-shell">
          <div className="home-about-copy">
            <h2 id="home-about-title">
              {["A", "little", "about", "me"].map((word, index) => (
                <Fragment key={word}>
                  <span className="practice-word-window"><span className="practice-word">{word}</span></span>
                  {index < 3 ? " " : null}
                </Fragment>
              ))}
            </h2>
            <p>I’m Thvgger, a designer and developer. I work across visual identities and the web, connecting how something looks with how it works.</p>
            <p>I like clear typography, useful interactions, and leaving enough space for an idea to breathe.</p>
            <UnderlineLink href="/about" className="inline-link" arrow="up-right">More about me</UnderlineLink>
          </div>
          <div className="home-capabilities">
            <h3>What I do</h3>
            {capabilities.map((capability, index) => (
              <CapabilityDetail key={capability.title} title={capability.title} initiallyOpen={index === 0}>
                {capability.copy}
              </CapabilityDetail>
            ))}
          </div>
        </div>
      </HomePractice>

      <section className="home-contact page-shell" aria-labelledby="home-contact-title">
        <div>
          <h2 id="home-contact-title">Have something<br />in mind?</h2>
          <p>Tell me what you’re working on.</p>
        </div>
        <Button href="/contact" className="home-contact-button">Let’s talk</Button>
      </section>
    </>
  );
}
