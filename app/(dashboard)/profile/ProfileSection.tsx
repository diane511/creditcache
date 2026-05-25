import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionTitle } from "../dashboard/dashboard-ui";

type SnapshotTone = "primary" | "good" | "warn";

type HistorySnapshot = {
  title: string;
  meta: string;
  tone: SnapshotTone;
};

type ApplicationSnapshot = {
  opportunityTitle: string;
  applicantName: string;
  status: string;
  deadline: string;
};

type Stat = {
  label: string;
  value: string;
};

type DetailIconKey =
  | "name"
  | "occupation"
  | "dob"
  | "email"
  | "phone"
  | "location"
  | "website"
  | "portfolio"
  | "linkedin"
  | "offer"
  | "budget"
  | "availability";

type TitleIconKey =
  | "details"
  | "links"
  | "offers"
  | "work"
  | "pending"
  | "payment"
  | "history"
  | "applications";

type DetailItem = {
  value: string;
  icon: DetailIconKey;
  href?: string;
};

type PendingItem = {
  label: string;
  status: string;
  note: string;
};

export type ProfileData = {
  displayName: string;
  username: string;
  verified: boolean;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  stats: Stat[];
  personalDetails: DetailItem[];
  linksDetails: DetailItem[];
  offersDetails: DetailItem[];
  workDetails: DetailItem[];
  pendingItems: PendingItem[];
  paymentMethodLabel: string;
  paymentMethodStatus: string;
  historySnapshots: HistorySnapshot[];
  applicationSnapshots: ApplicationSnapshot[];
};

type ProfileSectionProps = {
  profile?: ProfileData | null;
};

function TitleIcon({ kind }: { kind: TitleIconKey }) {
  const className = "h-5 w-5 text-zinc-950 dark:text-white";

  switch (kind) {
    case "details":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4 20a8 8 0 0 1 16 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "links":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M10 14a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 10a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "offers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 12l-8 8-8-8V4h8l8 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case "work":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M9 6.5V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "pending":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" />
        </svg>
      );
    case "payment":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "history":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 8v5l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 12a8 8 0 1 0 2.3-5.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5 4v3h3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "applications":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 13h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function DetailIcon({ kind }: { kind: DetailIconKey }) {
  const className = "h-5 w-5 text-zinc-950 dark:text-white";

  switch (kind) {
    case "name":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4 20a8 8 0 0 1 16 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "occupation":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M9 6.5V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "dob":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M8 3.5v4M16 3.5v4M4 9h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="m5.5 7.5 6.5 5 6.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M8.5 4.5h2.2c.7 0 1.3.4 1.5 1.1l.8 2.3c.2.6 0 1.3-.5 1.7l-1.5 1.2a13.3 13.3 0 0 0 4.2 4.2l1.2-1.5c.4-.5 1.1-.7 1.7-.5l2.3.8c.7.2 1.1.8 1.1 1.5v2.2c0 1.1-.9 2-2 2C10.6 21 3 13.4 3 4.5c0-1.1.9-2 2-2h3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2" fill="currentColor" />
        </svg>
      );
    case "website":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12 3.5c2.2 2 3.5 4.8 3.5 8.5S14.2 18 12 20.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 3.5c-2.2 2-3.5 4.8-3.5 8.5S9.8 18 12 20.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "portfolio":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="7" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10v6M8 7.5v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12 16v-3a2 2 0 0 1 4 0v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "offer":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 12l-8 8-8-8V4h8l8 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case "budget":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M5 8.5A3.5 3.5 0 0 1 8.5 5h7A3.5 3.5 0 0 1 19 8.5v7A3.5 3.5 0 0 1 15.5 19h-7A3.5 3.5 0 0 1 5 15.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "availability":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 4v8l5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    default:
      return null;
  }
}

function ProfilePhoto({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 96 96" className="h-full w-full" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <rect width="96" height="96" rx="48" fill="url(#avatarGrad)" />
          <circle cx="48" cy="39" r="16" fill="currentColor" fillOpacity="0.25" />
          <path
            d="M20 82c5.9-13.1 16.7-20 28-20s22.1 6.9 28 20"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

function CoverPhoto({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 shadow-sm dark:border-white/10">
      <div className="aspect-[3/1] min-h-44 w-full sm:aspect-[5/2] lg:aspect-[16/5]">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <svg
            viewBox="0 0 1600 500"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={alt}
          >
            <rect width="1600" height="500" fill="#171717" />
          </svg>
        )}
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: Stat) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-lg font-bold text-zinc-950 dark:text-white">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
  action,
}: {
  icon: TitleIconKey;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10"
            aria-hidden="true"
          >
            <TitleIcon kind={icon} />
          </span>
          <h4 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
            {title}
          </h4>
        </div>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function DetailRow({ item }: { item: DetailItem }) {
  const row = (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10"
        aria-hidden="true"
      >
        <DetailIcon kind={item.icon} />
      </span>
      <div className="min-w-0 text-sm font-medium text-zinc-950 dark:text-white">{item.value}</div>
    </div>
  );

  if (!item.href) return <div>{row}</div>;

  const isExternal = /^https?:\/\//i.test(item.href);

  if (isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="block">
        {row}
      </a>
    );
  }

  return (
    <Link href={item.href} className="block">
      {row}
    </Link>
  );
}

function BareGroup({
  title,
  icon,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  icon: TitleIconKey;
  description: string;
  items: readonly DetailItem[];
  emptyMessage: string;
}) {
  return (
    <section className="pl-2 sm:pl-0">
      <SectionHeading icon={icon} title={title} description={description} />
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => <DetailRow key={`${title}-${item.value}`} item={item} />)
        ) : (
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M20 7L10.5 16.5 4 10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified
    </span>
  );
}

function ApplyButton() {
  return (
    <Link
      href="#applications"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Apply
    </Link>
  );
}

function VaultButton() {
  return (
    <Link
      href="#vault"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Vault
    </Link>
  );
}

function EmptyCard({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
      No {title.toLowerCase()} yet.
    </div>
  );
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  if (!profile) {
    return null;
  }

  return (
    <section
      id="profile"
      className="grid gap-0 divide-y divide-zinc-200 dark:divide-white/10 lg:grid-cols-2 lg:divide-y-0 lg:divide-x"
    >
      <div className="px-4 py-6 sm:px-6">
        <div className="relative">
          <CoverPhoto src={profile.coverUrl} alt={`${profile.displayName} cover photo`} />

          <div className="absolute bottom-0 left-3 z-10 translate-y-1/2 sm:left-6">
            <ProfilePhoto src={profile.avatarUrl} alt={`${profile.displayName} profile photo`} />
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 pl-2 sm:pl-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {profile.displayName}
                </h3>
                {profile.verified ? <VerifiedBadge /> : null}
              </div>

              <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                @{profile.username}
              </p>

              {profile.bio ? (
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {profile.bio}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex w-full flex-nowrap items-center justify-between gap-2 overflow-x-auto border-y border-zinc-200 py-4 dark:border-white/10">
            {profile.stats.map((stat) => (
              <div key={stat.label} className="min-w-[72px] flex-1">
                <ProfileStat {...stat} />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            <div className="pl-2 sm:pl-0">
              <div className="mb-4 flex justify-center gap-3">
                <ApplyButton />
                <VaultButton />
              </div>
            </div>

            <BareGroup
              title="Personal details"
              icon="details"
              description="Your core account info, shown with icons instead of text labels."
              items={profile.personalDetails}
              emptyMessage="Personal details are not available."
            />
            <hr className="border-zinc-200 dark:border-white/10" />

            <BareGroup
              title="Links"
              icon="links"
              description="Where people can find your public presence."
              items={profile.linksDetails}
              emptyMessage="No public links have been added."
            />
            <hr className="border-zinc-200 dark:border-white/10" />

            <BareGroup
              title="Offers"
              icon="offers"
              description="A quick view of what is open for you right now."
              items={profile.offersDetails}
              emptyMessage="No active offers right now."
            />
            <hr className="border-zinc-200 dark:border-white/10" />

            <BareGroup
              title="Work"
              icon="work"
              description="Your occupation and work-related details."
              items={profile.workDetails}
              emptyMessage="Work details are not available."
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#settings"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Edit profile
            </Link>
            <Link
              href="#security"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              Security settings
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        <SectionTitle
          title="Pending items"
          description="Only the steps that still need attention are shown here."
          action={
            <span className="inline-flex">
              <Badge tone="warn">{profile.pendingItems.length} pending</Badge>
            </span>
          }
        />

        <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          {profile.pendingItems.length > 0 ? (
            <ul className="space-y-3">
              {profile.pendingItems.map((item) => (
                <li
                  key={item.label}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-zinc-950/40"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white"
                      aria-hidden="true"
                    >
                      !
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {item.label}
                        </div>
                        <Badge tone="warn">{item.status}</Badge>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {item.note}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard title="pending items" />
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/5">
          <SectionHeading
            icon="payment"
            title="Payment method"
            description={profile.paymentMethodLabel}
            action={<Badge tone="good">{profile.paymentMethodStatus}</Badge>}
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="#payments"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Open payments
            </Link>
            <Link
              href="#security"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              Review security
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <SectionHeading
              icon="history"
              title="History snapshot"
              description="Recent activity at a glance."
              action={
                <Link
                  href="#history"
                  className="text-sm font-medium text-zinc-950 underline underline-offset-4 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  View full
                </Link>
              }
            />

            <div className="mt-4 space-y-3">
              {profile.historySnapshots.length > 0 ? (
                profile.historySnapshots.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-zinc-950/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {item.meta}
                        </div>
                      </div>
                      <Badge tone={item.tone}>New</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyCard title="history snapshots" />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <SectionHeading
              icon="applications"
              title="Applications snapshot"
              description="Active items waiting on action."
              action={
                <Link
                  href="#applications"
                  className="text-sm font-medium text-zinc-950 underline underline-offset-4 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  View full
                </Link>
              }
            />

            <div className="mt-4 space-y-3">
              {profile.applicationSnapshots.length > 0 ? (
                profile.applicationSnapshots.map((item) => (
                  <div
                    key={`${item.opportunityTitle}-${item.deadline}`}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-zinc-950/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {item.opportunityTitle}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {item.applicantName}
                        </div>
                      </div>
                      <Badge tone="warn">{item.status}</Badge>
                    </div>

                    <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                      Due {item.deadline}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyCard title="application snapshots" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}