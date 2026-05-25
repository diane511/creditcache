export default function Loading() {
  return (
    <div className="page-shell">
      <div className="card" style={{ padding: 28 }}>
        <div className="small">Loading Credit Cache…</div>
        <div style={{ marginTop: 14, height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ marginTop: 10, height: 12, width: "72%", borderRadius: 999, background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}
