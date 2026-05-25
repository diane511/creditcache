import { PageHeader } from "@/components/PageHeader";
import { VaultManager } from "@/components/VaultManager";
import { vaultRecords } from "@/lib/data";

export default function VaultPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Encrypted record space"
        title="Document vault"
        description="Keep copies of the files, notes, and receipts that help you apply faster next time."
      />
      <div className="notice" style={{ marginBottom: 16 }}>
        This vault stores structured records and notes. In a full production deployment, encrypted object storage and audit logging should back the uploaded files.
      </div>
      <VaultManager initialVault={vaultRecords} />
    </div>
  );
}
