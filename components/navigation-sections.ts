export type SectionLink = {
  label: string;
  href: string;
};

export const adminPageSections = [
  { label: "Overview", href: "#overview" },
  { label: "Metrics", href: "#metrics" },
  { label: "Publish", href: "#publish" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Guidance", href: "#guidance" },
  { label: "Users", href: "#users" },
  { label: "Winners", href: "#winner" },
  { label: "Queue", href: "#queue" },
] as const satisfies readonly SectionLink[];

export const dashboardPageSections = [
  { label: "Profile", href: "#profile" },
  { label: "Payments", href: "#payments" },
  { label: "History", href: "#history" },
  { label: "Security", href: "#security" },
  { label: "Settings", href: "#settings" },
  { label: "Applications", href: "#applications" },
  { label: "Actions", href: "#actions" },
] as const satisfies readonly SectionLink[];