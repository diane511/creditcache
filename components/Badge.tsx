"use client";

import { ReactNode } from "react";

type Tone = "good" | "warn" | "danger" | "primary" | "default";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`pill ${tone !== "default" ? tone : ""}`.trim()}>{children}</span>;
}
