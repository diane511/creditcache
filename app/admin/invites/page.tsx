import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { AdminInviteLinkPanel } from "@/components/admin/AdminInviteLinkPanel";

type AdminSignupLinkView = {
  id: string;
  token: string;
  label: string | null;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  signupUrl: string;
};

async function getBaseOrigin() {
  const h = await headers();
  const host = h.get("host");
  const protocol = h.get("x-forwarded-proto") || "https";

  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function AdminInvitesPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/auth/signin?next=/admin/invites");
  }

  if (!isAdminRole(sessionUser.role)) {
    redirect("/dashboard");
  }

  const baseOrigin = await getBaseOrigin();

  const rawInviteLinks = await prisma.adminSignupLink.findMany({
    where: { createdById: sessionUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      label: true,
      active: true,
      maxUses: true,
      usedCount: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  });

  const inviteLinks: AdminSignupLinkView[] = rawInviteLinks.map((link) => ({
    id: link.id,
    token: link.token,
    label: link.label,
    active: link.active,
    maxUses: link.maxUses,
    usedCount: link.usedCount,
    lastUsedAt: link.lastUsedAt ? link.lastUsedAt.toISOString() : null,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    createdById: link.createdById,
    signupUrl: new URL(
      `/auth/signup?invite=${encodeURIComponent(link.token)}`,
      baseOrigin,
    ).toString(),
  }));

  return (
    <div className="min-h-screen bg-[#f7f3ec] px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back to admin
          </Link>

          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Invite workspace
          </span>
        </div>

        <AdminInviteLinkPanel initialLinks={inviteLinks} />
      </div>
    </div>
  );
}