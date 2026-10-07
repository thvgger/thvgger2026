"use client";

import { useState } from "react";
import { site } from "@/lib/portfolio";

export default function ContactSection() {
  const [copyState, setCopyState] = useState("Copy email");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopyState("Email copied");
    } catch {
      setCopyState("Select the address to copy");
    }
  }

  return (
    <section className="contact-page page-shell" aria-labelledby="contact-title">
      <h1 id="contact-title">Let’s talk.</h1>
      <p className="contact-introduction">For a project, a collaboration, or just a hello.</p>
      <a href={`mailto:${site.email}`} className="contact-email">{site.email}</a>
      <button className="plain-button copy-email" onClick={copyEmail} aria-live="polite">{copyState}</button>
    </section>
  );
}
