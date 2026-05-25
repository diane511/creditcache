"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <div className="card strong">
        <h1>Something went wrong</h1>
        <p>{error.message || "Please try again."}</p>
        <button className="btn primary" onClick={() => reset()}>Try again</button>
      </div>
    </div>
  );
}
