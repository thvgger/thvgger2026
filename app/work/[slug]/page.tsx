import type { Metadata } from "next";
import UnderlineLink from "@/components/UnderlineLink";
import { notFound } from "next/navigation";
import { projects } from "@/lib/portfolio";
import LogoCaseStudy from "@/components/LogoCaseStudy";
import StorefrontCaseStudy from "@/components/StorefrontCaseStudy";
import CaseStudyMotion from "@/components/CaseStudyMotion";
import PersonalCaseStudy from "@/components/PersonalCaseStudy";
import NextProject from "@/components/NextProject";
import ProjectBanner from "@/components/ProjectBanner";

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
    <div className="project-detail" key={project.id}>
      <ProjectBanner title={project.title} preview={project.hoverReel} poster={project.cover} treatment={project.coverTreatment ? `${project.coverTreatment}-cover` : ""} />
      <CaseStudyMotion>
        <UnderlineLink href="/work" className="back-link" arrow="left">All work</UnderlineLink>
        <div className="project-heading">
          <p className="project-kind">{project.kind}</p>
          <p className="project-summary">{project.summary}</p>
        </div>
        {project.presentation === "logo-guide" ? (
          <LogoCaseStudy project={project} />
        ) : project.presentation === "storefront-study" ? (
          <StorefrontCaseStudy project={project} />
        ) : (
          <PersonalCaseStudy project={project} />
        )}
        <NextProject project={nextProject} />
      </CaseStudyMotion>
    </div>
  );
}
