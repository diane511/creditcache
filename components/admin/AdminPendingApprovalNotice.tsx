// components/admin/AdminPendingApprovalNotice.tsx
"use client";

import React from "react";

type Props = {
  email?: string;
  onStartChat?: () => void;
  onBack?: () => void;
};

export function AdminPendingApprovalNotice({
  email,
  onStartChat,
  onBack,
}: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <h2 className="text-lg font-semibold">Account verified</h2>

      <p className="mt-2 text-sm leading-6">
        Your email has been verified, but your admin account is still waiting for super admin approval.
        Please hold on until approved or check back later.
      </p>

      {email ? (
        <p className="mt-2 text-sm">
          Signed in as <span className="font-medium">{email}</span>.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {onStartChat ? (
          <button
            type="button"
            onClick={onStartChat}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Start a new chat with super admin
          </button>
        ) : null}

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            Go back
          </button>
        ) : null}
      </div>
    </div>
  );
}