import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Thvgger about design, development, or a collaboration." };

export default function ContactPage() {
  return <ContactSection />;
}
