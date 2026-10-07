import { site } from "@/lib/portfolio";
import UnderlineLink from "@/components/UnderlineLink";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Designer & developer.</p>
      <UnderlineLink href={site.github} external>GitHub</UnderlineLink>
    </footer>
  );
}
