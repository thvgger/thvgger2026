import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";

export const metadata: Metadata = { title: "About", description: "Meet Thvgger, a designer and developer working across visual identity and the web." };

export default function AboutPage() {
  return <AboutSection />;
}
