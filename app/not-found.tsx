import UnderlineLink from "@/components/UnderlineLink";

export default function NotFound() {
  return (
    <section className="placeholder-page page-shell">
      <h1>Page not found.</h1>
      <p>This page may have moved.</p>
      <UnderlineLink href="/" className="inline-link" arrow="up-right">Back home</UnderlineLink>
    </section>
  );
}
