// main/app/vault/page.tsx

import type { ComponentProps } from "react";
import { PageHeader } from "@/components/PageHeader";
import { VaultManager } from "@/components/VaultManager";
import { getVaultRecords } from "@/lib/data";

type VaultManagerProps = ComponentProps<typeof VaultManager>;

export default async function VaultPage() {
  const vaultRecords = await getVaultRecords();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Encrypted record space"
        title="Document vault"
        description="Keep copies of the files, notes, and receipts that help you apply faster next time."
      />

      <div className="notice" style={{ marginBottom: 16 }}>
        This vault stores structured records and notes. In a full production
        deployment, encrypted object storage and audit logging should back the
        uploaded files.
      </div>

      <VaultManager
        initialVault={
          vaultRecords as unknown as VaultManagerProps["initialVault"]
        }
      />
    </div>
  );
}