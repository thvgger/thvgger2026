import type { Metadata } from "next";
import Image from "next/image";
import UnderlineLink from "@/components/UnderlineLink";
import { notFound } from "next/navigation";
import { projects } from "@/lib/portfolio";
import LogoCaseStudy from "@/components/LogoCaseStudy";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(project => project.id === slug);
  if (!project) notFound();
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projectIndex = projects.findIndex(project => project.id === slug);
  if (projectIndex === -1) notFound();
  const project = projects[projectIndex];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <article className="project-page page-shell">
      <UnderlineLink href="/work" className="back-link" arrow="left">All work</UnderlineLink>
      <div className="project-heading">
        <div><p className="project-kind">{project.kind}</p><h1>{project.title}</h1></div>
        <p className="project-summary">{project.summary}</p>
      </div>
      {project.presentation === "logo-guide" ? (
        <LogoCaseStudy project={project} />
      ) : (
        <>
          <div className={`project-cover ${project.gallery[0].contain ? "image-contained" : ""}`}>
            <Image src={project.cover} alt={project.gallery[0].alt} fill loading="eager" sizes="(max-width: 1320px) 94vw, 1240px" />
          </div>
          <div className="project-notes">
            <dl className="project-facts">
              <div><dt>Role</dt><dd>{project.role}</dd></div>
              <div><dt>Focus</dt><dd>{project.tools}</dd></div>
            </dl>
            <div className="project-story">
              {project.details.map(detail => <section key={detail.heading}><h2>{detail.heading}</h2><p>{detail.copy}</p></section>)}
            </div>
          </div>
          <div className="project-gallery">
            {project.gallery.slice(1).map(image => (
              <figure key={image.src}>
                <div className={`gallery-image ${image.contain ? "image-contained" : ""}`}>
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1320px) 94vw, 1240px" />
                </div>
                <figcaption>{image.alt}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      <div className="project-bottom-links">
        <UnderlineLink href="/work">All work</UnderlineLink>
        <UnderlineLink href={`/work/${nextProject.id}`} arrow="up-right">{`Next: ${nextProject.title}`}</UnderlineLink>
      </div>
    </article>
  );
}
