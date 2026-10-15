import Image from "next/image";
import UnderlineLink from "@/components/UnderlineLink";
import type { Project } from "@/lib/portfolio";

export default function PersonalCaseStudy({ project }: { project: Project }) {
  return (
    <div className="personal-study">
      <div className="project-cover">
        <Image src={project.cover} alt={project.gallery[0].alt} fill loading="eager" sizes="(max-width: 1320px) 94vw, 1240px" />
      </div>

      <div className="identity-introduction">
        <dl className="project-facts">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Focus</dt><dd>{project.tools}</dd></div>
          <div><dt>Project</dt><dd>Personal identity & studies</dd></div>
        </dl>
        <div className="identity-intro-copy">
          <h2>A signature across print and the web.</h2>
          <p>The goal was to give my work a consistent identity across a website, a small mark, and a printed piece. The striped cube is the common element; scale, layout, and movement change around it.</p>
          <p>These studies bring the variations together, from the original logo geometry to the interactive website and stationery.</p>
        </div>
      </div>

      <nav className="identity-contents" aria-label="Explore the Thvgger project">
        <span>Explore the project</span>
        <div>{project.details.map(chapter => <UnderlineLink key={chapter.id} href={`#${chapter.id}`}>{chapter.label}</UnderlineLink>)}</div>
      </nav>

      {project.details.map(chapter => (
        <section key={chapter.id} id={chapter.id} className="identity-chapter" aria-labelledby={`${chapter.id}-title`}>
          <div className="identity-chapter-heading">
            <h2 id={`${chapter.id}-title`}>{chapter.heading}</h2>
            <p>{chapter.copy}</p>
          </div>
          {chapter.id === "website" && project.video ? (
            <figure className="personal-video">
              <video controls muted playsInline preload="none" poster={project.video.poster}
                width={project.video.width} height={project.video.height}
                aria-label={project.video.title} aria-describedby="project-video-caption">
                <source src={project.video.src} type="video/mp4" />
                <a href={project.video.src}>Watch the homepage intro video</a>
              </video>
              <figcaption id="project-video-caption">{project.video.caption}</figcaption>
            </figure>
          ) : null}
          <div className={`personal-gallery${chapter.id === "website" ? " personal-gallery--wide" : ""}`}>
            {project.gallery.filter(image => image.chapter === chapter.id).map(image => (
              <figure key={image.src}>
                <div className={`gallery-image${image.contain ? " image-contained" : ""}${image.background === "dark" ? " gallery-image--dark" : ""}`}>
                  <Image src={image.src} alt={image.alt} fill
                    sizes={chapter.id === "website" ? "(max-width: 1320px) 94vw, 1240px" : "(max-width: 760px) calc(100vw - 48px), (max-width: 1320px) 46vw, 604px"} />
                </div>
                <figcaption>{image.caption ?? image.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
