"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import type { AdminUser } from "@/lib/admin-data";

type Props = {
  users: AdminUser[];
};

export function AdminUsersSection({ users }: Props) {
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      return [user.id, user.name, user.email, user.role, user.joinedAt]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [users, userSearch]);

  return (
    <section className="rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
      <div className="flex flex-col gap-3 border-b border-black/5 p-6 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Registered users
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search and review every account on the platform.
          </p>
        </div>
        <Badge tone="primary">{users.length}</Badge>
      </div>

      <div className="px-6 pt-5">
        <input
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full border-b border-black/10 bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
          placeholder="Search users by name, email, role, or ID"
        />
      </div>

      <div className="mt-5 divide-y divide-black/5 dark:divide-white/10">
        <div className="grid grid-cols-12 gap-3 bg-zinc-50 px-6 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Verified</div>
          <div className="col-span-2">Applications</div>
          <div className="col-span-2">Joined</div>
        </div>

        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="grid grid-cols-12 gap-3 px-6 py-4 text-sm transition hover:bg-zinc-50/70 dark:hover:bg-white/5"
            >
              <div className="col-span-12 lg:col-span-4">
                <div className="font-medium text-zinc-950 dark:text-white">
                  {user.name}
                </div>
                <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </div>
              </div>

              <div className="col-span-6 lg:col-span-2">
                <Badge>{user.role}</Badge>
              </div>

              <div className="col-span-6 lg:col-span-2">
                <Badge tone={user.verified ? "good" : "warn"}>
                  {user.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="col-span-6 lg:col-span-2 text-zinc-700 dark:text-zinc-300">
                {user.applications}
              </div>

              <div className="col-span-6 lg:col-span-2 text-zinc-700 dark:text-zinc-300">
                {user.joinedAt}
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
            No users match “{userSearch}”.
          </div>
        )}
      </div>
    </section>
  );
}