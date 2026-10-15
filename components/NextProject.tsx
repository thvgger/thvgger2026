import Image from "next/image";
import ArrowIcon from "@/components/ArrowIcon";
import ProjectLink from "@/components/ProjectLink";
import UnderlineLink from "@/components/UnderlineLink";
import type { Project } from "@/lib/portfolio";

export default function NextProject({ project }: { project: Project }) {
  const treatment = project.coverTreatment ? `${project.coverTreatment}-cover` : project.gallery[0].contain ? "image-contained" : "";

  return (
    <nav className="project-navigation" aria-label="More projects">
      <div className="project-navigation-heading"><span>Next project</span><UnderlineLink href="/work">All work</UnderlineLink></div>
      <ProjectLink href={`/work/${project.id}`} title={project.title} className="next-project">
        <div className={`work-image ${treatment}`}>
          <Image src={project.cover} alt="" fill sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1320px) 46vw, 604px" />
        </div>
        <div className="next-project-caption">
          <div><h2>{project.title}</h2><p>{project.kind}</p></div>
          <ArrowIcon className="next-project-arrow" />
        </div>
      </ProjectLink>
    </nav>
  );
}
