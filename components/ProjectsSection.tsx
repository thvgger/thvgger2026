import Image from "next/image";
import ProjectLink from "@/components/ProjectLink";
import { projects } from "@/lib/portfolio";
import ArrowIcon from "@/components/ArrowIcon";

export default function ProjectsSection() {
  return (
    <section className="work-page page-shell" aria-labelledby="work-title">
      <div className="page-heading">
        <h1 id="work-title">Work</h1>
        <p>Selected design and development work.</p>
      </div>
      <ul className="work-list" role="list">
        {projects.map((project, index) => (
          <li key={project.id}>
            <ProjectLink href={`/work/${project.id}`} title={project.title} className="work-entry">
              <div className={`work-image ${project.coverTreatment ? `${project.coverTreatment}-cover` : project.gallery[0].contain ? "image-contained" : ""}`}>
                <Image
                  src={project.cover}
                  alt={project.gallery[0].alt}
                  fill
                  sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1200px) 54vw, 628px"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="work-caption">
                <div><h2>{project.title}</h2><p>{project.kind}</p><p className="project-list-summary">{project.summary}</p></div>
                <ArrowIcon className="work-arrow" />
              </div>
            </ProjectLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
