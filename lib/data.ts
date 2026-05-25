import type { ApplicationRecord, Opportunity, ScamReport, VaultRecord } from "@/main/lib/types";

export const opportunities: Opportunity[] = [
  {
    slug: "community-growth-grant",
    title: "Community Growth Grant",
    category: "Grant",
    amount: "$2,500–$10,000",
    deadline: "Rolling monthly review",
    region: "U.S. and select territories",
    source: "communitygrowth.example.org",
    sourceLabel: "Verified nonprofit source",
    verified: true,
    lastChecked: "2026-05-20",
    featured: true,
    summary: "Project-based microgrants for community programs, neighborhood initiatives, and local impact pilots.",
    tags: ["Community", "Nonprofit", "Project-based"],
    eligibility: [
      "Community organizations and registered nonprofits",
      "Clear use of funds and impact plan",
      "Ability to show recent activity or community partnership"
    ],
    documents: ["Organization summary", "Budget outline", "Impact statement"],
    ctaText: "Review funding"
  },
  {
    slug: "student-success-scholarship",
    title: "Student Success Scholarship",
    category: "Scholarship",
    amount: "$1,000",
    deadline: "June 18, 2026",
    region: "North America",
    source: "studentsuccess.example.edu",
    sourceLabel: "Verified education partner",
    verified: true,
    lastChecked: "2026-05-21",
    featured: true,
    summary: "A merit-and-need scholarship supporting students with a strong academic plan and community focus.",
    tags: ["Students", "Education", "Merit + need"],
    eligibility: [
      "Enrolled or admitted student",
      "Minimum GPA guidance on source page",
      "Short essay and transcript copy"
    ],
    documents: ["Transcript", "Essay", "Enrollment proof"],
    ctaText: "Start application"
  },
  {
    slug: "family-stability-aid",
    title: "Family Stability Aid",
    category: "Aid",
    amount: "Up to $750",
    deadline: "Open now",
    region: "Selected metropolitan areas",
    source: "familyaid.example.com",
    sourceLabel: "Verified support program",
    verified: true,
    lastChecked: "2026-05-18",
    summary: "Emergency support for rent, utilities, or transportation when a household faces short-term hardship.",
    tags: ["Household", "Emergency", "Bills"],
    eligibility: [
      "Household meets income guidance",
      "Proof of need or hardship note",
      "Valid local mailing address"
    ],
    documents: ["ID", "Proof of income", "Utility or rent notice"],
    ctaText: "Check eligibility"
  },
  {
    slug: "creator-launch-fund",
    title: "Creator Launch Fund",
    category: "Promotion",
    amount: "Prize pool varies",
    deadline: "Campaign ends July 1, 2026",
    region: "Global where permitted",
    source: "launchpartner.example.com",
    sourceLabel: "Verified promotional partner",
    verified: true,
    lastChecked: "2026-05-21",
    summary: "A transparent promotional campaign with rules, entry limits, and prize disclosures clearly posted.",
    tags: ["Creators", "Promotion", "Rules disclosed"],
    eligibility: [
      "Age and location requirements vary by region",
      "Complete a valid entry submission",
      "Must accept campaign terms"
    ],
    documents: ["Entry confirmation", "Identity check if selected", "Campaign terms"],
    ctaText: "View official rules"
  },
  {
    slug: "small-business-recovery-grant",
    title: "Small Business Recovery Grant",
    category: "Grant",
    amount: "$5,000–$25,000",
    deadline: "August 12, 2026",
    region: "U.S. small businesses",
    source: "businessrecovery.example.org",
    sourceLabel: "Verified small-business source",
    verified: true,
    lastChecked: "2026-05-22",
    featured: true,
    summary: "Recovery and expansion support for small businesses rebuilding inventory, technology, or operations.",
    tags: ["Business", "Recovery", "Operations"],
    eligibility: [
      "Small business owner or operator",
      "Provide business summary and use of funds",
      "Tax and registration details may be requested"
    ],
    documents: ["Business registration", "Tax ID", "Budget plan"],
    ctaText: "See requirements"
  },
  {
    slug: "nonprofit-microgrant",
    title: "Nonprofit Microgrant Series",
    category: "Grant",
    amount: "$500–$3,000",
    deadline: "First Tuesday each month",
    region: "Local and regional applicants",
    source: "microgrant.example.foundation",
    sourceLabel: "Verified foundation partner",
    verified: true,
    lastChecked: "2026-05-19",
    summary: "Fast-turnaround microgrants for small nonprofits, pilot programs, and community events.",
    tags: ["Nonprofit", "Microgrant", "Fast review"],
    eligibility: [
      "Mission aligned nonprofit or fiscal sponsor",
      "One-page project summary",
      "Simple outcome plan"
    ],
    documents: ["Project summary", "Budget", "IRS or registry proof"],
    ctaText: "Apply quickly"
  },
  {
    slug: "immigrant-support-fund",
    title: "Immigrant Support Fund",
    category: "Aid",
    amount: "Varies by case",
    deadline: "Open all year",
    region: "Metro service regions",
    source: "supportnetwork.example.org",
    sourceLabel: "Verified community source",
    verified: true,
    lastChecked: "2026-05-20",
    summary: "Language-accessible support for fees, emergency needs, and service navigation.",
    tags: ["Immigrant", "Language access", "Navigation"],
    eligibility: [
      "Household or individual service need",
      "Proof of local residency or service area",
      "Program-specific eligibility may vary"
    ],
    documents: ["ID", "Address proof", "Need statement"],
    ctaText: "Learn more"
  },
  {
    slug: "women-in-tech-scholarship",
    title: "Women in Tech Scholarship",
    category: "Scholarship",
    amount: "$3,500",
    deadline: "September 3, 2026",
    region: "Global remote applicants",
    source: "womenintech.example.edu",
    sourceLabel: "Verified education partner",
    verified: true,
    lastChecked: "2026-05-21",
    summary: "Supports women and gender-diverse learners preparing for careers in software, data, or cybersecurity.",
    tags: ["Tech", "Women", "Career growth"],
    eligibility: [
      "Study or work track in a tech field",
      "Short application essay",
      "Portfolio or project examples encouraged"
    ],
    documents: ["Essay", "Resume", "Project samples"],
    ctaText: "Check deadlines"
  },
  {
    slug: "veteran-small-business-relief",
    title: "Veteran Small Business Relief",
    category: "Grant",
    amount: "$1,500–$7,500",
    deadline: "Rolling",
    region: "U.S. veteran-owned businesses",
    source: "veteranrelief.example.org",
    sourceLabel: "Verified veteran partner",
    verified: true,
    lastChecked: "2026-05-18",
    summary: "Relief support for veteran-owned businesses facing equipment, licensing, or operational expenses.",
    tags: ["Veteran-owned", "Business", "Relief"],
    eligibility: [
      "Veteran ownership verification",
      "Business operating details",
      "Explanation of intended use"
    ],
    documents: ["DD214 or equivalent", "Business docs", "Budget"],
    ctaText: "Open opportunity"
  },
  {
    slug: "rural-innovation-award",
    title: "Rural Innovation Award",
    category: "Grant",
    amount: "$10,000",
    deadline: "July 22, 2026",
    region: "Rural communities",
    source: "ruralinnovation.example.net",
    sourceLabel: "Verified innovation program",
    verified: true,
    lastChecked: "2026-05-22",
    summary: "Recognizes rural projects that improve access, sustainability, or digital inclusion.",
    tags: ["Rural", "Innovation", "Infrastructure"],
    eligibility: [
      "Applicant lives or operates in a rural area",
      "Project includes measurable community benefit",
      "Timeline and simple budget required"
    ],
    documents: ["Project outline", "Budget", "Community reference"],
    ctaText: "See application"
  },
  {
    slug: "emergency-household-support",
    title: "Emergency Household Support",
    category: "Aid",
    amount: "Up to $300",
    deadline: "Open now",
    region: "Local community region",
    source: "carebridge.example.org",
    sourceLabel: "Verified community aid source",
    verified: true,
    lastChecked: "2026-05-19",
    summary: "Small emergency support for urgent household needs when a family has a temporary gap in resources.",
    tags: ["Emergency", "Household", "Urgent"],
    eligibility: [
      "Documented short-term need",
      "Local service area",
      "May require follow-up by caseworker"
    ],
    documents: ["ID", "Need note", "Address verification"],
    ctaText: "Review support"
  }
];

export const applications: ApplicationRecord[] = [
  {
    id: "app_1001",
    opportunitySlug: "small-business-recovery-grant",
    opportunityTitle: "Small Business Recovery Grant",
    applicantName: "Aster Studio LLC",
    email: "hello@asterstudio.example",
    status: "Under Review",
    deadline: "2026-08-12",
    createdAt: "2026-05-12T14:35:00Z",
    notes: "Waiting for tax documents and a short project budget."
  },
  {
    id: "app_1002",
    opportunitySlug: "student-success-scholarship",
    opportunityTitle: "Student Success Scholarship",
    applicantName: "J. Rivera",
    email: "j.rivera@example.edu",
    status: "Needs Info",
    deadline: "2026-06-18",
    createdAt: "2026-05-17T10:12:00Z",
    notes: "Transcript upload still pending."
  }
];

export const scamReports: ScamReport[] = [
  {
    id: "scam_2001",
    topic: "Urgent fee request",
    channel: "SMS",
    description: "A text claimed a grant was approved but required a payment card to release funds.",
    status: "Reviewing",
    createdAt: "2026-05-20T11:20:00Z"
  },
  {
    id: "scam_2002",
    topic: "Fake social media page",
    channel: "Instagram DM",
    description: "Impersonation account asked for bank login details to 'verify eligibility'.",
    status: "Resolved",
    createdAt: "2026-05-18T16:40:00Z"
  }
];

export const vaultRecords: VaultRecord[] = [
  {
    id: "doc_3001",
    label: "2026 tax return summary",
    type: "Tax",
    dateAdded: "2026-04-20",
    notes: "Used for income-based applications."
  },
  {
    id: "doc_3002",
    label: "Business registration certificate",
    type: "Business",
    dateAdded: "2026-05-14",
    notes: "Current and in good standing."
  },
  {
    id: "doc_3003",
    label: "Scholarship essay draft",
    type: "Education",
    dateAdded: "2026-05-19",
    notes: "Final version ready for review."
  }
];

export const blogPosts = [
  {
    slug: "how-to-spot-fake-grants",
    title: "How to Spot Fake Grant Offers",
    category: "Safety",
    excerpt: "A quick guide to the red flags that matter most: upfront fees, urgency pressure, and impersonation.",
    readTime: "6 min"
  },
  {
    slug: "organize-your-documents",
    title: "Organize Your Documents Before You Apply",
    category: "Workflow",
    excerpt: "Build a simple vault so you can move faster when a real opportunity opens.",
    readTime: "4 min"
  },
  {
    slug: "what-to-know-about-promotions",
    title: "What to Know Before Entering a Promotional Campaign",
    category: "Promotions",
    excerpt: "Eligibility, location rules, odds, and the importance of official terms.",
    readTime: "5 min"
  },
  {
    slug: "getting-ready-for-scholarships",
    title: "Getting Ready for Scholarship Season",
    category: "Education",
    excerpt: "A practical checklist for essays, transcripts, and recommendations.",
    readTime: "7 min"
  }
];

export const resourceCards = [
  {
    title: "Verification checklist",
    body: "Always confirm the source, official rules, deadlines, and contact details before applying.",
    tone: "good"
  },
  {
    title: "Recovery support",
    body: "If you paid a suspect fee or shared sensitive data, document everything and seek consumer protection guidance.",
    tone: "warn"
  },
  {
    title: "Application workflow",
    body: "Save the listing, prepare documents, submit, track follow-ups, and archive your outcome.",
    tone: "primary"
  }
];

export const partnerPackages = [
  {
    name: "Starter",
    price: "$149/mo",
    details: ["Verified listing", "Basic analytics", "Monthly reporting"]
  },
  {
    name: "Featured",
    price: "$399/mo",
    details: ["Featured placement", "Priority review", "Audience insights"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    details: ["API access", "White-label setup", "Dedicated support"]
  }
];

export const adminQueues = [
  { label: "New opportunity submissions", count: 14, status: "Needs review" },
  { label: "Scam reports pending triage", count: 6, status: "High priority" },
  { label: "Partner verification checks", count: 9, status: "In progress" },
  { label: "Duplicate listing review", count: 3, status: "Monitor" }
];

export const dashboardStats = [
  { label: "Verified opportunities", value: "1,204" },
  { label: "Active applications", value: "27" },
  { label: "Risk alerts blocked", value: "184" },
  { label: "Partner listings", value: "86" }
];

export const getOpportunityBySlug = (slug: string) => opportunities.find((item) => item.slug === slug);
export const relatedOpportunities = (slug: string) =>
  opportunities.filter((item) => item.slug !== slug).slice(0, 3);

export const statusStyles: Record<string, "good" | "warn" | "danger" | "primary"> = {
  "Awarded": "good",
  "Under Review": "warn",
  "Needs Info": "danger",
  "Submitted": "primary",
  "Reviewing": "warn",
  "Resolved": "good",
  "New": "primary",
  "Draft": "warn",
  "Closed": "danger"
};
