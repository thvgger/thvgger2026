import type { Metadata } from "next";
import ProjectsSection from "@/components/ProjectsSection";

export const metadata: Metadata = { title: "Work", description: "Explore Thvgger’s personal identity, print studies, and website design." };

export default function WorkPage() {
  return <ProjectsSection />;
}
