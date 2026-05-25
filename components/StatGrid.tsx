import { ReactNode } from "react";

export function StatGrid({ items }: { items: { label: string; value: string; hint?: string; icon?: ReactNode }[] }) {
  return (
    <div className="grid-4">
      {items.map((item) => (
        <div key={item.label} className="card strong">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="small">{item.label}</div>
              <strong style={{ fontSize: "1.8rem", display: "block", marginTop: 6 }}>{item.value}</strong>
            </div>
            {item.icon ? <div className="pill primary">{item.icon}</div> : null}
          </div>
          {item.hint ? <p style={{ marginBottom: 0 }}>{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
