import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/portfolio";

export default function ProjectsSection() {
  return (
    <section className="work-page page-shell" aria-labelledby="work-title">
      <div className="page-heading">
        <h1 id="work-title">Work</h1>
        <p>Selected design and development work.</p>
      </div>
      <div className="work-grid">
        {projects.map((project, index) => (
          <Link key={project.id} href={`/work/${project.id}`} className="work-entry">
            <div className={`work-image ${project.coverTreatment === "logo" ? "logo-cover" : project.gallery[0].contain ? "image-contained" : ""}`}>
              <Image
                src={project.cover}
                alt={project.gallery[0].alt}
                fill
                sizes="(max-width: 760px) 92vw, (max-width: 1320px) 46vw, 604px"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
            <div className="work-caption">
              <div><h2>{project.title}</h2><p>{project.kind}</p></div>
              <span className="work-arrow" aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
