import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="card strong">
        <h1>Page not found</h1>
        <p>The opportunity, application, or page you requested is not available.</p>
        <div className="hero-cta">
          <Link href="/" className="btn primary">Go home</Link>
          <Link href="/opportunities" className="btn ghost">Browse opportunities</Link>
        </div>
      </div>
    </div>
  );
}
