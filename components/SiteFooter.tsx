import { site } from "@/lib/portfolio";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Designer & developer.</p>
      <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </footer>
  );
}
