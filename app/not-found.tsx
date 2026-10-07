import Link from "next/link";

export default function NotFound() {
  return (
    <section className="placeholder-page page-shell">
      <h1>Page not found.</h1>
      <p>This page may have moved.</p>
      <Link href="/" className="inline-link">Back home <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
