import Image from "next/image";
import ProjectLink from "@/components/ProjectLink";
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
    copy: "Logos, typography, and a family of marks that stays recognisable across different sizes and formats, from a browser tab to a printed piece.",
    href: "/work/studio-space",
    link: "View Studio Space",
  },
  {
    title: "Interface design",
    copy: "Layouts and interactions built around what someone needs to see and do. A product grid, a size picker, and a mobile menu each need a clear next step.",
    href: "/work/foolycooly",
    link: "View FOOLY COOLY",
  },
  {
    title: "Web development",
    copy: "Turning the design into a working website, with responsive layouts, keyboard access, and motion that respects the visitor’s settings. I build the details as well as design them.",
    href: "/work/thvgger#website",
    link: "Explore this website",
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
        <ul className="home-projects" role="list">
          {selectedProjects.map((project) => (
            <li key={project.id}>
              <ProjectLink href={`/work/${project.id}`} title={project.title} className="home-project">
                <div className={`home-project-image ${project.coverTreatment ? `${project.coverTreatment}-cover` : ""}`}>
                  <Image
                    src={project.cover}
                    alt={project.gallery[0].alt}
                    fill
                    sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1200px) 54vw, 628px"
                  />
                </div>
                <div className="home-project-caption">
                  <div><h3>{project.title}</h3><p>{project.kind}</p><p className="project-list-summary">{project.summary}</p></div>
                  <span><ArrowIcon /></span>
                </div>
              </ProjectLink>
            </li>
          ))}
        </ul>
      </section>

      <HomePractice>
        <Image src="/images/about-texture.jpg" alt="" fill sizes="100vw" className="home-practice-texture" aria-hidden="true" />
        <div className="home-practice-inner page-shell">
          <h2 id="home-about-title" className="home-practice-heading">
              {["A", "little", "about", "me."].map((word, index) => (
                <Fragment key={word}>
                  <span className="practice-word-window"><span className="practice-word">{word}</span></span>
                  {index < 3 ? " " : null}
                </Fragment>
              ))}
          </h2>
          <div className="home-practice-content">
            <div className="home-about-copy">
              <p className="home-about-introduction">I’m Thvgger, a designer who builds for the web.</p>
              <p>I like taking an idea from its visual identity to a working website. I pay attention to the shape of a mark, the rhythm of the type, and how a page responds when someone uses it.</p>
              <UnderlineLink href="/about" className="inline-link" arrow="up-right">More about me</UnderlineLink>
            </div>
            <div className="home-capabilities">
              <h3>What I do</h3>
              {capabilities.map((capability, index) => (
                <CapabilityDetail key={capability.title} title={capability.title} initiallyOpen={index === 0}>
                  <p>{capability.copy}</p>
                  <UnderlineLink href={capability.href} className="capability-project" arrow="up-right">{capability.link}</UnderlineLink>
                </CapabilityDetail>
              ))}
            </div>
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
