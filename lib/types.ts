export type OpportunityCategory = "Grant" | "Scholarship" | "Aid" | "Promotion" | "Resource";

export interface Opportunity {
  slug: string;
  title: string;
  category: OpportunityCategory;
  amount: string;
  deadline: string;
  region: string;
  source: string;
  sourceLabel: string;
  verified: boolean;
  lastChecked: string;
  featured?: boolean;
  summary: string;
  tags: string[];
  eligibility: string[];
  documents: string[];
  ctaText: string;
}

export interface ApplicationRecord {
  id: string;
  opportunitySlug: string;
  opportunityTitle: string;
  applicantName: string;
  email: string;
  status: "Draft" | "Submitted" | "Under Review" | "Needs Info" | "Awarded" | "Closed";
  deadline: string;
  createdAt: string;
  notes?: string;
}

export interface ScamReport {
  id: string;
  topic: string;
  channel: string;
  description: string;
  status: "New" | "Reviewing" | "Resolved";
  createdAt: string;
}

export interface VaultRecord {
  id: string;
  label: string;
  type: string;
  dateAdded: string;
  notes: string;
}
